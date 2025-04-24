import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import {
  createContext,
  React,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";
import SpotlightSearch from "react-native-spotlight-search";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { paletteItems } from "../layout/command-palette/list";
import { createTab } from "../layout/openTab";
import { useSidebarContext } from "../layout/sidebar/context";
import CommandPalette from "./palette";
interface CommandPaletteContext {
  handleOpen: (defaultFilter?: string) => void;
  handleClose: () => void;
  sheetRef: React.MutableRefObject<BottomSheetModal>;
  defaultFilter: string;
}

export const CommandPaletteContext = createContext<CommandPaletteContext>(null);
export const useCommandPaletteContext = () => useContext(CommandPaletteContext);

const emojiToBase64 = async (emoji) => {
  const url = `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${emoji.toLowerCase()}.png`;

  try {
    const response = await fetch(url);
    const blob = await response.blob();

    const reader = new FileReader();
    return await new Promise((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error("Error fetching emoji image:", err);
    return null;
  }
};

function IOSSpotlightSearch() {
  const { data: collections } = useSWR(["space/collections"]);
  const { data: labels } = useSWR(["space/labels"]);
  const { data: sharedCollections } = useSWR(["user/collectionAccess"]);
  const { sidebarRef } = useSidebarContext();
  const { sessionToken } = useUser();

  const sections = paletteItems(collections, sharedCollections, labels);

  useEffect(() => {
    const indexSpotlight = async () => {
      if (!collections || !sharedCollections || !labels) return;

      try {
        const items = await Promise.all(
          sections
            .filter((t) => t.title !== "Other")
            .filter((t) => t.title)
            .flatMap((section) => {
              const domain = section.title.toUpperCase().replaceAll(" ", "_");
              return section.items.map(async (item) => {
                const emoji = item.emoji
                  ? await emojiToBase64(item.emoji).then((t) =>
                      t.replace("data:image/png;base64,", "")
                    )
                  : undefined;

                return {
                  domain,
                  title: item.label,
                  contentDescription: `${section.title}`,
                  uniqueIdentifier: `<${domain}:${item.key}>`,
                  thumbnailData: emoji,
                  keywords: ["Dysperse", section.title],
                };
              });
            })
        );
        SpotlightSearch.indexItems(items);
        console.log("Indexed to iOS Spotlight!");
      } catch (error) {
        console.error("Error indexing items! ", error);
      }
    };

    indexSpotlight();
  }, [collections, sharedCollections, labels, sections]);

  const lastSearch = useRef<string | null>(null);

  const handleSpotlightTap = (uniqueIdentifier: string) => {
    if (!uniqueIdentifier || lastSearch.current === uniqueIdentifier) return;
    lastSearch.current = uniqueIdentifier;

    const match = uniqueIdentifier.match(/<([^:]+):([^>]+)>/);
    if (!match) return;

    const [, domain, key] = match;

    sidebarRef.current?.closeDrawer();

    // Find the section that matches the domain
    if (domain === "LABELS") {
      router.push(`/everything/labels/${key}`);
    } else {
      const section = sections
        .filter((t) => t.title)
        .find(
          (section) =>
            section.title.toUpperCase().replaceAll(" ", "_") === domain
        );
      if (!section) Toast.show({ type: "error", text1: "Item not found" });
      const item = section.items.find((item) => item.key === key);
      if (!item) Toast.show({ type: "error", text1: "Item not found" });

      createTab(sessionToken, item);
    }
  };

  useEffect(() => {
    // Handle initial launch via Spotlight
    SpotlightSearch.getInitialSearchItem().then((uniqueIdentifier) => {
      handleSpotlightTap(uniqueIdentifier);
    });

    // Listen for live Spotlight taps
    const spotlightListener = SpotlightSearch.searchItemTapped(
      (uniqueIdentifier) => {
        handleSpotlightTap(uniqueIdentifier);
      }
    );

    return () => {
      spotlightListener.remove();
    };
  }, []);

  return null;
}

export const CommandPaletteProvider = ({ children }) => {
  const breakpoints = useResponsiveBreakpoints();
  const sheetRef = useRef<BottomSheetModal>(null);
  const [defaultFilter, setDefaultFilter] = useState<string | null>(null);

  const handleOpen = useCallback(
    (filter?: string) => {
      if (typeof filter === "string") setDefaultFilter(filter);
      if (breakpoints.md) sheetRef.current?.present();
      else router.push("/open");
    },
    [breakpoints, setDefaultFilter]
  );

  const handleClose = useCallback(() => {
    if (defaultFilter) setDefaultFilter(null);
    if (breakpoints.md) sheetRef.current?.close();
    else router.back();
  }, [breakpoints, setDefaultFilter, defaultFilter]);

  const value = useMemo(
    () => ({ handleOpen, handleClose, sheetRef, defaultFilter }),
    [handleOpen, handleClose, sheetRef, defaultFilter]
  );
  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPalette />
      {Platform.OS === "ios" && <IOSSpotlightSearch />}
    </CommandPaletteContext.Provider>
  );
};

