import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import BottomSheet from "@/ui/BottomSheet";
import ErrorAlert from "@/ui/Error";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { cloneElement, useCallback, useRef, useState } from "react";
import { ActivityIndicator, View, useWindowDimensions } from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { TaskDrawerContent } from "./content";
import { TaskDrawerContext } from "./context";
import Spinner from "@/ui/Spinner";

export function TaskDrawer({ mutateList, children, id }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<BottomSheetModal>(null);
  const theme = useColorTheme();
  const { sessionToken } = useUser();

  // Fetch data
  const { data, mutate, error } = useSWR(
    open ? ["space/entity", { id }] : null
  );

  // callbacks
  const handleOpen = useCallback(() => {
    ref.current?.present();
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    ref.current?.close();
    mutateList(data);
  }, [mutateList, data]);

  const trigger = cloneElement(children, { onPress: handleOpen });
  const { width } = useWindowDimensions();

  const updateTask = useCallback(
    async (key, value, sendRequest = true) => {
      const oldData = data;
      const newData = {
        ...data,
        [key]: value,
      };
      mutate(newData, {
        revalidate: false,
        populateCache: newData,
      });
      if (!sendRequest) return;
      await sendApiRequest(sessionToken, "PUT", "space/entity", {
        id,
        [key]: value,
      }).catch((e) => {
        mutate(oldData, false);
        Toast.show({
          type: "error",
          text1: "Something went wrong. Please try again later.",
        });
      });
    },
    [data, mutate, id, sessionToken]
  );

  return (
    <>
      {trigger}
      <BottomSheet
        sheetRef={ref}
        snapPoints={error ? ["50%"] : width > 600 ? [500] : ["65%", "90%"]}
        onClose={handleClose}
        style={{
          maxWidth: 500,
          margin: "auto",
        }}
      >
        {data ? (
          <TaskDrawerContext.Provider
            value={{
              task: data,
              updateTask,
            }}
          >
            <TaskDrawerContent handleClose={handleClose} />
          </TaskDrawerContext.Provider>
        ) : error ? (
          <View style={{ padding: 20 }}>
            <ErrorAlert />
          </View>
        ) : (
          <View
            style={{
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Spinner />
          </View>
        )}
      </BottomSheet>
    </>
  );
}
