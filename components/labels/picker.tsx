import { CreateLabelModal } from "@/components/labels/createModal";
import { useLabelColors } from "@/components/labels/useLabelColors";
import BottomSheet, { DBottomSheetProps } from "@/ui/BottomSheet";
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
import React, { cloneElement, useCallback, useRef, useState } from "react";
import { ActivityIndicator, Platform, Pressable, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import useSWR from "swr";
import { labelPickerStyles } from "./labelPickerStyles";

export function LabelPicker({
  children,
  label,
  setLabel,
  onClose,
  autoFocus = true,
  multiple = false,
  hideBack = false,
  triggerProp = "onPress",
  sheetProps = {},
}: {
  children: React.ReactElement;
  label: string | string[];
  setLabel: (label: string | string[]) => void;
  onClose: any;
  autoFocus?: boolean;
  multiple?: boolean;
  hideBack?: boolean;
  triggerProp?: string;
  sheetProps?: Partial<DBottomSheetProps>;
}) {
  const ref = useRef<BottomSheetModal>(null);
  const [query, setQuery] = useState("");
  // callbacks
  const searchRef = useRef(null);
  const handleOpen = useCallback(() => {
    // Keyboard.dismiss();
    ref.current?.present();
  }, []);
  const handleClose = useCallback(() => {
    ref.current?.close();
    onClose();
  }, [onClose]);

  const trigger = cloneElement(children, { [triggerProp]: handleOpen });

  const theme = useColorTheme();
  const colors = useLabelColors();

  const { data, mutate, error } = useSWR(["space/labels"]);

  const FlatListComponent =
    Platform.OS === "web" ? FlatList : BottomSheetFlatList;

  return (
    <>
      {trigger}
      <BottomSheet
        sheetRef={ref}
        onClose={handleClose}
        snapPoints={["80%"]}
        {...sheetProps}
      >
        <View style={{ padding: 15, height: "100%", paddingBottom: 0 }}>
          {multiple && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 10,
                marginBottom: 10,
              }}
            >
              <Text heading style={{ fontSize: 40, textAlign: "center" }}>
                Select labels
              </Text>
              <Button
                onPress={handleClose}
                style={{ marginLeft: "auto" }}
                disabled={label.length === 0}
              >
                <ButtonText>Done</ButtonText>
              </Button>
            </View>
          )}
          <View
            style={[
              labelPickerStyles.searchBox,
              {
                backgroundColor: theme[3],
                borderColor: theme[7],
              },
            ]}
          >
            {!hideBack && (
              <IconButton onPress={handleClose}>
                <Icon>arrow_back_ios_new</Icon>
              </IconButton>
            )}
            <TextField
              enterKeyHint="search"
              value={query}
              onChangeText={setQuery}
              bottomSheet
              style={{
                backgroundColor: theme[3],
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 99,
                flex: 1,
                fontSize: 20,
              }}
              inputRef={searchRef}
              autoFocus={autoFocus}
              placeholder="Search..."
            />
            <CreateLabelModal
              mutate={mutate}
              onClose={() => searchRef.current.focus()}
            >
              <IconButton style={{ marginRight: 20 }} size={30}>
                <Icon>add_circle</Icon>
              </IconButton>
            </CreateLabelModal>
          </View>
          {data ? (
            <FlatListComponent
              data={data.filter((label) =>
                label.name.toLowerCase().includes(query.toLowerCase())
              )}
              keyboardShouldPersistTaps="handled"
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 100, gap: 10 }}
              ListEmptyComponent={
                <View
                  style={{
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingVertical: 70,
                    paddingHorizontal: 20,
                    gap: 5,
                  }}
                >
                  <Emoji emoji={query ? "1f914" : "1f62d"} size={50} />
                  <Text heading style={{ fontSize: 35, marginTop: 10 }}>
                    {query ? "No labels found" : "No labels yet"}
                  </Text>
                  <Text style={{ opacity: 0.6, textAlign: "center" }}>
                    {query
                      ? "Try searching for something else"
                      : "Labels are a great way to \n group things together"}
                  </Text>
                  {query === "" && (
                    <CreateLabelModal mutate={mutate}>
                      <Button>
                        <Icon>add</Icon>
                        <ButtonText>Create one</ButtonText>
                      </Button>
                    </CreateLabelModal>
                  )}
                </View>
              }
              renderItem={({ item }: any) => (
                <Pressable
                  onPress={() => {
                    if (multiple) {
                      if (label.includes(item.id)) {
                        setLabel(label.filter((id) => id !== item.id));
                      } else {
                        setLabel([...label, item.id]);
                      }
                    } else {
                      setLabel(item);
                      setTimeout(handleClose, 200);
                    }
                  }}
                  style={({ pressed, hovered }: any) => [
                    labelPickerStyles.labelOption,
                    {
                      backgroundColor:
                        theme[
                          (pressed ? 4 : hovered ? 3 : 2) +
                            ((multiple && label.includes(item.id)) ||
                            (!multiple && label == item.id)
                              ? 1
                              : 0)
                        ],
                    },
                  ]}
                >
                  <View
                    style={[
                      labelPickerStyles.labelDot,
                      {
                        backgroundColor: colors[item.color][5],
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
                  {(label == item.id || multiple) && (
                    <Icon
                      filled={multiple && label.includes(item.id)}
                      size={30}
                    >
                      {label == item.id || (multiple && label.includes(item.id))
                        ? "check_circle"
                        : "circle"}
                    </Icon>
                  )}
                </Pressable>
              )}
            />
          ) : error ? (
            <ErrorAlert />
          ) : (
            <ActivityIndicator />
          )}
        </View>
      </BottomSheet>
    </>
  );
}
