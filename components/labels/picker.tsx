import { CreateLabelModal } from "@/components/labels/createModal";
import { useLabelColors } from "@/components/labels/useLabelColors";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import ListItemText from "@/ui/ListItemText";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetFlatList, BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { cloneElement, useCallback, useRef } from "react";
import { ActivityIndicator, Keyboard, Pressable, View } from "react-native";
import useSWR from "swr";
import { labelPickerStyles } from "./labelPickerStyles";

export function LabelPicker({
  children,
  label,
  setLabel,
  onClose,
  autoFocus = true,
}) {
  const ref = useRef<BottomSheetModal>(null);
  // callbacks
  const searchRef = useRef(null);
  const handleOpen = useCallback(() => {
    ref.current?.present();
  }, []);
  const handleClose = useCallback(() => {
    ref.current?.close();
    onClose();
  }, [onClose]);

  const trigger = cloneElement(children, { onPress: handleOpen });

  const theme = useColorTheme();
  const colors = useLabelColors();

  const { data, mutate, error } = useSWR(["space/labels"]);

  return (
    <>
      {trigger}
      <BottomSheet sheetRef={ref} onClose={handleClose} snapPoints={["60%"]}>
        <View style={{ padding: 15 }}>
          <View
            style={[
              labelPickerStyles.searchBox,
              {
                backgroundColor: theme[3],
              },
            ]}
          >
            <IconButton onPress={handleClose}>
              <Icon>arrow_back_ios_new</Icon>
            </IconButton>
            <TextField
              enterKeyHint="search"
              bottomSheet
              style={{
                backgroundColor: theme[3],
                paddingHorizontal: 15,
                paddingVertical: 7,
                borderRadius: 99,
                flex: 1,
              }}
              inputRef={searchRef}
              autoFocus={autoFocus}
              placeholder="Search..."
            />
            <CreateLabelModal
              mutate={mutate}
              onClose={() => searchRef.current.focus()}
            >
              <IconButton style={{ marginRight: 10 }}>
                <Icon>add_circle</Icon>
              </IconButton>
            </CreateLabelModal>
          </View>
          <View
            style={{
              height: "100%",
              justifyContent: "center",
            }}
          >
            {data ? (
              <BottomSheetFlatList
                data={data}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 100 }}
                ListEmptyComponent={
                  <View
                    style={{
                      height: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                      paddingBottom: 70,
                      paddingHorizontal: 20,
                      gap: 5,
                    }}
                  >
                    <Emoji emoji="1f62d" size={50} />
                    <Text heading style={{ fontSize: 35, marginTop: 10 }}>
                      No labels
                    </Text>
                    <Text style={{ opacity: 0.6, textAlign: "center" }}>
                      Labels are a great way to{"\n"} group things together
                    </Text>
                    <CreateLabelModal mutate={mutate}>
                      <Button>
                        <Icon>add</Icon>
                        <ButtonText>Create one</ButtonText>
                      </Button>
                    </CreateLabelModal>
                  </View>
                }
                renderItem={({ item }: any) => (
                  <Pressable
                    onPress={() => {
                      setLabel(item);
                      setTimeout(handleClose, 200);
                    }}
                    style={({ pressed, hovered }: any) => [
                      labelPickerStyles.labelOption,
                      {
                        backgroundColor:
                          theme[
                            (pressed ? 4 : hovered ? 3 : 2) +
                              (label == item.id ? 1 : 0)
                          ],
                      },
                    ]}
                  >
                    <View
                      style={[
                        labelPickerStyles.labelDot,
                        {
                          backgroundColor: colors[item.color][4],
                        },
                      ]}
                    >
                      <Emoji emoji={item.emoji} size={20} />
                    </View>
                    <ListItemText
                      primary={item.name}
                      secondary={`${item._count.entities} item${
                        item._count.entities !== 1 ? "s" : ""
                      }`}
                    />
                    {label == item.id && <Icon>check</Icon>}
                  </Pressable>
                )}
              />
            ) : error ? (
              <ErrorAlert />
            ) : (
              <ActivityIndicator />
            )}
          </View>
        </View>
      </BottomSheet>
    </>
  );
}
