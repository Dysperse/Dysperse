import { useSession } from "@/context/AuthProvider";
import * as FileSystem from "expo-file-system";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AppState, InteractionManager, Platform } from "react-native";
import "react-native-gesture-handler";
import { SWRConfig } from "swr";
import { useDebouncedCallback } from "use-debounce";

function localStorageProvider() {
  // When initializing, we restore the data from `localStorage` into a map.
  const map = new Map(JSON.parse(localStorage.getItem("app-cache") || "[]"));

  const save = () => {
    if ((window as any).disableSaveData) return;
    const appCache = JSON.stringify(Array.from(map.entries()));
    localStorage.setItem("app-cache", appCache);
  };

  // Before unloading the app, we write back all the data into `localStorage`.
  window.addEventListener("beforeunload", save);
  window.addEventListener("visibilitychange", save);

  // We still use the map for write & read for performance.
  return map;
}

async function fileSystemProvider(cacheData) {
  InteractionManager.runAfterInteractions(async () => {
    const cacheDir = FileSystem.cacheDirectory + "dysperse-cache/";
    const file = `${cacheDir}cache.json`;

    async function ensureDirExists() {
      const dirInfo = await FileSystem.getInfoAsync(cacheDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
      }
    }

    const map = cacheData || new Map();

    if (map.size === 0) {
      return;
    }

    await ensureDirExists();
    await FileSystem.writeAsStringAsync(
      file,
      JSON.stringify(Array.from(map.entries()))
    );
  });
}

export function SWRWrapper({ children }) {
  const { session } = useSession();
  const cacheData = useRef(null);
  const [cacheLoaded, setCacheLoaded] = useState(Platform.OS === "web");

  const saveCache = useDebouncedCallback(
    // function
    () => {
      if (Platform.OS !== "web") fileSystemProvider(cacheData.current);
    },
    // delay in ms
    10000
  );

  useEffect(() => {
    const save = () => fileSystemProvider(cacheData.current);
    save();
    const subscription = AppState.addEventListener("change", save);

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") return;
    (async () => {
      if (cacheLoaded) return;
      const cacheDir = FileSystem.cacheDirectory + "dysperse-cache/";
      const file = `${cacheDir}cache.json`;
      const fileInfo = await FileSystem.getInfoAsync(file);
      if (fileInfo.exists) {
        const data = await FileSystem.readAsStringAsync(file);
        const entries = JSON.parse(data);
        cacheData.current = new Map(entries);
      } else {
        cacheData.current = new Map();
      }
      if (!cacheLoaded) setCacheLoaded(true);
    })();
  }, [cacheData, cacheLoaded]);

  const contextValue = useMemo(
    () => ({
      fetcher: async ([
        resource,
        params,
        host = process.env.EXPO_PUBLIC_API_URL,
        init = {},
      ]) => {
        const url = `${host}/${resource}?${new URLSearchParams(
          params
        ).toString()}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${session}` },
          ...init,
        });
        return await res.json();
      },

      provider:
        Platform.OS === "web" ? localStorageProvider : () => cacheData.current,
      isVisible: () => true,
      onSuccess: saveCache,
      initFocus(callback) {
        let appState = AppState.currentState;

        const onAppStateChange = (nextAppState) => {
          if (
            appState.match(/inactive|background/) &&
            nextAppState === "active"
          ) {
            callback();
          }
          appState = nextAppState;
        };

        const subscription = AppState.addEventListener(
          "change",
          onAppStateChange
        );

        return () => {
          subscription.remove();
        };
      },
    }),
    [saveCache, session]
  );

  return cacheLoaded ? (
    <SWRConfig value={contextValue}>{children}</SWRConfig>
  ) : null;
}

