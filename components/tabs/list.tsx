import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { BottomSheetBackHandler } from "@/ui/BottomSheet/BottomSheetBackHandler";
import { BottomSheetBackdropComponent } from "@/ui/BottomSheet/BottomSheetBackdropComponent";
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

function TabListTab({
  disabled,
  drag,
  item,
  handleDelete,
  handleClose,
  isActive,
  isEdit = false,
}) {
  const [loading, setLoading] = useState(false);

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
      {!isEdit && (
        <IconButton
          buttonStyle={{ marginRight: 10 }}
          onPress={async () => {
            setLoading(true);
            await handleDelete(item.id);
            setLoading(false);
          }}
        >
          {loading ? <ActivityIndicator /> : <Icon>remove_circle</Icon>}
        </IconButton>
      )}
    </Pressable>
  );
}

export const TabDrawer = ({ children }) => {
  const { sessionToken, session, mutate } = useUser();
  const ref = useRef<BottomSheetModal>(null);
  const [editMode, setEditMode] = useState(false);

  // callbacks
  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);
  const trigger = cloneElement(children, { onPress: handleOpen });

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await sendApiRequest(sessionToken, "DELETE", "user/tabs", {
          id,
        });
        await mutate();
      } catch (err) {
        alert("Something went wrong. Please try again later.");
        console.log(err);
      }
    },
    [session]
  );

  const FlatListComponent = editMode ? DraggableFlatList : FlatList;

  return (
    <View>
      {trigger}
      <BottomSheetModal
        ref={ref}
        snapPoints={session?.user?.tabs?.length === 0 ? ["20"] : ["50%", "80%"]}
        backdropComponent={BottomSheetBackdropComponent}
      >
        <BottomSheetBackHandler handleClose={handleClose} />
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
        {session ? (
          <FlatListComponent
            onDragEnd={({ data }) => {
              const newData = data.map((item, index) => ({
                id: item.id,
                order: index,
              }));
              console.log(newData);

              sendApiRequest(sessionToken, "PUT", "user/tabs/order", {
                tabs: JSON.stringify(newData),
              }).then(() => mutate());
            }}
            ListFooterComponent={
              editMode ? (
                () => (
                  <View>
                    {session.user.tabs.length !== 0 && (
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
                  {session.user.tabs.length !== 0 && (
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
            data={session.user.tabs}
            renderItem={
              (editMode
                ? ({ item, drag, isActive }) => (
                    <ScaleDecorator activeScale={0.95}>
                      <TabListTab
                        item={item}
                        disabled={false}
                        drag={drag}
                        handleDelete={handleDelete}
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
                      handleDelete={handleDelete}
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
      </BottomSheetModal>
    </View>
  );
};
