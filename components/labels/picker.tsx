import { CreateLabelModal } from "@/components/labels/createModal";
import { useLabelColors } from "@/components/labels/useLabelColors";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { cloneElement, useCallback, useRef } from "react";
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
}) {
  const ref = useRef<BottomSheetModal>(null);
  // callbacks
  const handleOpen = useCallback(() => ref.current?.present(), []);
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
      <BottomSheet
        sheetRef={ref}
        stackBehavior="push"
        onClose={handleClose}
        snapPoints={["65%"]}
      >
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
              bottomSheet
              style={{
                backgroundColor: theme[3],
                paddingHorizontal: 15,
                paddingVertical: 7,
                borderRadius: 99,
                flex: 1,
              }}
              placeholder="Search..."
              autoFocus={Platform.OS !== "web" && autoFocus}
            />
            <CreateLabelModal mutate={mutate}>
              <IconButton style={{ marginRight: 10 }}>
                <Icon>add</Icon>
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
              <FlatList
                data={data}
                contentContainerStyle={{ flex: 1 }}
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
                      handleClose();
                    }}
                    style={({ pressed, hovered }: any) => [
                      labelPickerStyles.labelOption,
                      {
                        backgroundColor: theme[pressed ? 4 : hovered ? 3 : 1],
                      },
                    ]}
                  >
                    <View
                      style={[
                        labelPickerStyles.labelDot,
                        {
                          backgroundColor: colors[item.color][9],
                        },
                      ]}
                    />
                    <View>
                      <Text weight={700}>{item.name}</Text>
                      <Text style={labelPickerStyles.labelSubHeading}>
                        {item._count.entities} item
                        {item._count.entities !== 1 && "s"}
                      </Text>
                    </View>
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
