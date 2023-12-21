import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import BottomSheet from "@/ui/BottomSheet";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { cloneElement, useCallback, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { Tab } from "./tab";
import useSWR from "swr";

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
      className="pl-4 flex-row items-center"
      disabled={disabled}
      style={{
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
    <View>
      {trigger}
      <BottomSheet
        sheetRef={ref}
        onClose={handleClose}
        snapPoints={session?.user?.tabs?.length === 0 ? ["20"] : ["50%", "80%"]}
      >
        <View className="flex-row items-center px-5 mb-2" style={{ gap: 10 }}>
          <IconButton onPress={handleClose} variant="filled">
            <Icon>expand_more</Icon>
          </IconButton>
          <Text
            textClassName="py-3 text-2xl flex-1"
            style={{ fontFamily: "body_700" }}
          >
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
        <Text>{JSON.stringify(data)}</Text>
        {data ? (
          <FlatListComponent
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
                      <View className="flex-row items-center p-4 opacity-50 justify-center pb-8">
                        <Icon>info</Icon>
                        <Text textClassName="ml-2">
                          Tabs are synced between devices
                        </Text>
                      </View>
                    )}
                  </View>
                )
              ) : (
                <View>
                  {data.length !== 0 && (
                    <View className="flex-row items-center p-4 opacity-50 justify-center pb-8">
                      <Icon>info</Icon>
                      <Text textClassName="ml-2">
                        Tabs are synced between devices
                      </Text>
                    </View>
                  )}
                </View>
              )
            }
            ListEmptyComponent={
              <View className="flex-row items-center p-4 opacity-50 justify-center pb-8">
                <Icon>info</Icon>
                <Text textClassName="ml-2">
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
    </View>
  );
};
