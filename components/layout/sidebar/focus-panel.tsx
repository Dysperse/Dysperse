import { RenderWidget } from "@/app/(app)/home";
import { useFocusPanelContext } from "@/components/focus-panel/context";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import Modal from "@/ui/Modal";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ImpactFeedbackStyle, impactAsync } from "expo-haptics";
import {
  default as React,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Freeze } from "react-freeze";
import { Platform, View } from "react-native";
import Animated, { FlipInXUp, FlipOutXDown } from "react-native-reanimated";

const FocusPanel = memo(() => {
  const theme = useColorTheme();
  const { widgets, focusPanelFreezerRef, activeStateRef } =
    useFocusPanelContext();
  const sheetRef = useRef(null);
  const [activeWidget, setActiveWidget] = useState(activeStateRef.current);
  const breakpoints = useResponsiveBreakpoints();

  const pinnedWidgets = widgets.filter((i) => i.pinned);
  const pinnedWidget = pinnedWidgets[activeWidget];

  const [frozen, setFrozen] = useState(Platform.OS === "web");

  useImperativeHandle(focusPanelFreezerRef, () => ({
    freeze: () => setFrozen(true),
    thaw: () => setFrozen(false),
  }));

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
    impactAsync(ImpactFeedbackStyle.Light);
    setActiveWidget((prev) => {
      const t = (prev + 1) % pinnedWidgets.length;
      activeStateRef.current = t;
      AsyncStorage.setItem("activeWidget", t.toString());
      return t;
    });
  };

  return (
    pinnedWidget && (
      <Freeze
        freeze={frozen && !breakpoints.md}
        placeholder={
          <View
            style={{
              height: 50,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: theme[3],
              borderRadius: 20,
              padding: 10,
              flexDirection: "row",
              marginBottom: Platform.OS === "web" ? 10 : 8,
              marginHorizontal: 10,
            }}
          />
        }
      >
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
          <Animated.View
            key={activeWidget}
            entering={FlipInXUp}
            exiting={FlipOutXDown}
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
          </Animated.View>
        </Button>
      </Freeze>
    )
  );
});

export default FocusPanel;
