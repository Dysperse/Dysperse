import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import BottomSheet from "@/ui/BottomSheet";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { cloneElement, useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { Tab } from "./tab";
import useSWR from "swr";
import { TouchableOpacity } from "react-native-gesture-handler";

const styles = StyleSheet.create({
  helperText: {
    justifyContent: "center",
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 15,
  },
});
function TabListTab({
  disabled,
  drag,
  item,
  handleClose,
  isActive,
  isEdit = false,
}) {
  return (
    <Pressable
      disabled={disabled}
      style={{
        flexDirection: "row",
        paddingLeft: 15,
        ...(isActive && { backgroundColor: "#eee", borderRadius: 20 }),
      }}
    >
      {isEdit && (
        <IconButton onLongPress={drag}>
          <Icon>drag_handle</Icon>
        </IconButton>
      )}
      <Tab
        tab={item}
        disabled={isEdit}
        isList
        handleClose={handleClose}
        onLongPress={drag}
      />
    </Pressable>
  );
}

export const TabDrawer = ({ children }) => {
  const { sessionToken, session, mutate } = useUser();

  const { data, error } = useSWR(["user/tabs"]);

  const ref = useRef<BottomSheetModal>(null);
  const [editMode, setEditMode] = useState(false);

  // callbacks
  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);
  const trigger = cloneElement(children, { onPress: handleOpen });

  const FlatListComponent = editMode ? DraggableFlatList : FlatList;

  return (
    <>
      {trigger}
      <BottomSheet
        sheetRef={ref}
        onClose={handleClose}
        snapPoints={session?.user?.tabs?.length === 0 ? ["20"] : ["60%"]}
      >
        <View
          style={{
            gap: 10,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <IconButton onPress={handleClose} variant="filled">
            <Icon>expand_more</Icon>
          </IconButton>
          <Text style={{ fontSize: 20, flex: 1 }} weight={700}>
            Tabs
          </Text>
          <IconButton onPress={() => setEditMode(!editMode)}>
            <Icon>{editMode ? "check" : "edit"}</Icon>
          </IconButton>
          {!editMode && (
            <IconButton variant="filled" onPress={() => router.push("/open")}>
              <Icon>add</Icon>
            </IconButton>
          )}
        </View>
        {data ? (
          <FlatListComponent
            style={{ marginTop: 15 }}
            onDragEnd={({ data }) => {
              const newData = data.map((item, index) => ({
                id: item.id,
                order: index,
              }));
              sendApiRequest(sessionToken, "PUT", "user/tabs/order", {
                tabs: JSON.stringify(newData),
              }).then(() => mutate());
            }}
            ListFooterComponent={
              editMode ? (
                () => (
                  <View>
                    {data.length !== 0 && (
                      <View style={styles.helperText}>
                        <Icon>info</Icon>
                        <Text style={{ opacity: 0.6 }}>
                          Tabs are synced between devices
                        </Text>
                      </View>
                    )}
                  </View>
                )
              ) : (
                <View>
                  {data.length !== 0 && (
                    <View style={styles.helperText}>
                      <Icon>info</Icon>
                      <Text style={{ opacity: 0.6 }}>
                        Tabs are synced between devices
                      </Text>
                    </View>
                  )}
                </View>
              )
            }
            ListEmptyComponent={
              <View
                style={{
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 15,
                  alignItems: "center",
                  paddingHorizontal: 30,
                }}
              >
                <Icon>info</Icon>
                <Text style={{ opacity: 0.6 }}>
                  You don't have any tabs. Tap "+" to create one.
                </Text>
              </View>
            }
            data={data}
            renderItem={
              (editMode
                ? ({ item, drag, isActive }) => (
                    <ScaleDecorator activeScale={0.95}>
                      <TabListTab
                        item={item}
                        disabled={false}
                        drag={drag}
                        handleClose={handleClose}
                        isActive={isActive}
                        isEdit
                      />
                    </ScaleDecorator>
                  )
                : ({ item }) => (
                    <TabListTab
                      item={item}
                      disabled={false}
                      drag={() => {}}
                      handleClose={handleClose}
                      isActive={false}
                    />
                  )) as any
            }
            keyExtractor={(item: any) => item.id}
          />
        ) : (
          <ActivityIndicator />
        )}
      </BottomSheet>
    </>
  );
};
