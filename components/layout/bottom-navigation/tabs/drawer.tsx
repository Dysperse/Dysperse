import BottomSheet from "@/ui/BottomSheet";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { BottomSheetFlatList, BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { cloneElement, memo, useCallback, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import useSWR from "swr";
import { Tab } from "./tab";

const styles = StyleSheet.create({
  helperText: {
    justifyContent: "center",
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 15,
  },
  list: { marginTop: 15 },
  header: {
    gap: 10,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerText: { fontSize: 20, flex: 1 },
  contentContainer: { gap: 10 },
  tabContainer: {
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 20,
  },
});

export const TabDrawer = memo(function TabDrawer({ children }: any) {
  const ref = useRef<BottomSheetModal>(null);
  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);
  const trigger = cloneElement(children, { onPress: handleOpen });
  const { data, error } = useSWR(["user/tabs"]);

  const FlatListComponent =
    Platform.OS === "web" ? FlatList : BottomSheetFlatList;

  return (
    <>
      {trigger}
      <BottomSheet
        sheetRef={ref}
        onClose={handleClose}
        snapPoints={["50%", "90%"]}
      >
        <View style={styles.header}>
          <IconButton onPress={handleClose} variant="filled">
            <Icon>expand_more</Icon>
          </IconButton>
          <Text style={styles.headerText} weight={700}>
            Tabs
          </Text>
          <IconButton variant="filled" onPress={() => router.push("/open")}>
            <Icon>add</Icon>
          </IconButton>
        </View>
        {data ? (
          <FlatListComponent
            style={styles.list}
            ListFooterComponent={
              <View>
                {data.length !== 0 && (
                  <View style={styles.helperText}>
                    <Icon>info</Icon>
                    <Text>Tabs are synced between devices</Text>
                  </View>
                )}
              </View>
            }
            ListEmptyComponent={
              <View style={styles.helperText}>
                <Icon>info</Icon>
                <Text>You don't have any tabs. Tap "+" to create one.</Text>
              </View>
            }
            data={data}
            contentContainerStyle={styles.contentContainer}
            renderItem={
              (({ item }) => (
                <View style={styles.tabContainer}>
                  <Tab tab={item} isList handleClose={handleClose} />
                </View>
              )) as any
            }
            keyExtractor={(item: any) => item.id}
          />
        ) : error ? (
          <ErrorAlert />
        ) : (
          <Spinner />
        )}
      </BottomSheet>
    </>
  );
});
