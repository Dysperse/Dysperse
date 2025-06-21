import { RenderWidget } from "@/app/(app)/home";
import { useFocusPanelContext } from "@/components/focus-panel/context";
import { Button } from "@/ui/Button";
import IconButton from "@/ui/IconButton";
import Modal from "@/ui/Modal";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ImpactFeedbackStyle, impactAsync } from "expo-haptics";
import { default as React, memo, useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";

const FocusPanel = memo(() => {
  const theme = useColorTheme();
  const { widgets, activeStateRef } = useFocusPanelContext();
  const sheetRef = useRef(null);
  const [activeWidget, setActiveWidget] = useState(activeStateRef.current);

  const pinnedWidgets = widgets.filter((i) => i.pinned);
  const pinnedWidget = pinnedWidgets[activeWidget];

  useEffect(() => {
    const loadActiveWidget = async () => {
      const savedActiveWidget = await AsyncStorage.getItem("activeWidget");
      if (savedActiveWidget !== null) {
        activeStateRef.current = parseInt(savedActiveWidget, 10);
        setActiveWidget(parseInt(savedActiveWidget, 10));
      }
    };
    loadActiveWidget();
  }, []);

  const changeActiveWidget = async () => {
    if (Platform.OS !== "web") impactAsync(ImpactFeedbackStyle.Light);
    setActiveWidget((prev) => {
      const t = (prev + 1) % pinnedWidgets.length;
      activeStateRef.current = t;
      AsyncStorage.setItem("activeWidget", t.toString());
      return t;
    });
  };

  return (
    pinnedWidget && (
      <>
        <Modal
          animation="SLIDE"
          onClose={() => sheetRef.current?.close?.()}
          sheetRef={sheetRef}
          snapPoints={["80%"]}
        >
          <BottomSheetScrollView
            contentContainerStyle={{
              padding: 20,
              gap: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "serifText700",
                  fontSize: 25,
                  marginBottom: -10,
                  color: theme[11],
                }}
              >
                Pinned
              </Text>
              <IconButton
                icon="close"
                variant="filled"
                onPress={() => sheetRef.current?.close?.()}
              />
            </View>
            {pinnedWidgets.map((w) => (
              <RenderWidget widget={w} key={w.id} />
            ))}
          </BottomSheetScrollView>
        </Modal>
        <Button
          containerStyle={{
            marginBottom: Platform.OS === "web" ? 10 : 6,
            paddingVertical: 0,
            borderRadius: 0,
            flex: 1,
            ...(Platform.OS === "web" &&
              ({ WebkitAppRegion: "no-drag" } as any)),
          }}
          style={{
            flex: 1,
            borderRadius: 0,
            width: "100%",
            flexDirection: "column",
            alignItems: "stretch",
            gap: 0,
            paddingVertical: 0,
            paddingHorizontal: 10,
          }}
          height={60}
          onLongPress={() => {
            sheetRef.current?.present();
            impactAsync(ImpactFeedbackStyle.Medium);
          }}
          onContextMenu={() => sheetRef.current?.present()}
          onPress={changeActiveWidget}
        >
          <View
            style={{
              backgroundColor:
                pinnedWidgets.length > 1 ? theme[4] : "transparent",
              height: 50,
              marginBottom: -45,
              zIndex: -9,
              marginHorizontal: 13,
              borderRadius: 15,
            }}
          />
          <View
            key={activeWidget}
            style={{
              borderRadius: 20,
              padding: 10,
              paddingHorizontal: 20,
              backgroundColor: theme[3],
              alignItems: "center",
              height: 50,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <RenderWidget small widget={pinnedWidget} />
          </View>
        </Button>
      </>
    )
  );
});

export default FocusPanel;

