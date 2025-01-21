import { COLLECTION_VIEWS } from "@/components/layout/command-palette/list";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import { addHslAlpha, useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Modal from "@/ui/Modal";
import Text from "@/ui/Text";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { router, useGlobalSearchParams } from "expo-router";
import { memo, useEffect, useRef } from "react";
import { Platform, View } from "react-native";
import Toast from "react-native-toast-message";
import { groupedViews } from ".";
import { useCollectionContext } from "../context";
import { NavbarEyebrow } from "./NavbarEyebrow";
import { NavbarIcon } from "./NavbarIcon";
import { NavbarTitle } from "./NavbarTitle";

export const ViewPicker = memo(({ isLoading }: { isLoading: any }) => {
  const theme = useColorTheme();
  const { data, type } = useCollectionContext();
  const { id } = useGlobalSearchParams();
  const breakpoints = useResponsiveBreakpoints();
  const ref = useRef(null);
  const isAll = id === "all";
  const isDark = useDarkMode();

  // Convert grouped object to array of arrays
  const options = Object.entries(groupedViews)
    .map(([_type, views]) => [
      {
        renderer: () => (
          <Text variant="eyebrow" style={{ padding: 10, paddingBottom: 3 }}>
            {_type === "Other"
              ? "Other"
              : `By ${_type.replaceAll("Based", "")}`}
          </Text>
        ),
      },
      ...views.map((e) => ({
        icon: COLLECTION_VIEWS[e].icon,
        text: capitalizeFirstLetter(e),
        secondary: COLLECTION_VIEWS[e].description,
        callback: () => router.setParams({ type: e }),
        selected: e === type,
      })),
    ])
    .flat();

  const lastPress = useRef(0);

  useEffect(() => {
    if (Platform.OS === "web") {
      const handleKeyDown = (e) => {
        if (
          e.key === "Shift" &&
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA" &&
          !(Platform.OS === "web" && document.activeElement?.isContentEditable)
        ) {
          const now = Date.now();
          if (now - lastPress.current < 500) ref.current?.present();
          lastPress.current = now;
        }
      };
      window.addEventListener("keyup", handleKeyDown);
      return () => {
        window.removeEventListener("keyup", handleKeyDown);
      };
    }
  }, []);

  return (
    <>
      <Button
        onPress={() => {
          ref.current?.present();
          if (Platform.OS === "web" && breakpoints.md) {
            const t = localStorage.getItem("shiftShiftTip");
            if (t !== "true") {
              Toast.show({
                type: "info",
                text1: "Pro tip",
                text2: "Press shift twice to open this dialog!",
              });
              localStorage.setItem("shiftShiftTip", "true");
            }
          }
        }}
        android_ripple={{ color: theme[5] }}
        containerStyle={{
          padding: 0,
          transformOrigin: breakpoints.md ? "left bottom" : undefined,
          maxWidth: breakpoints.md ? 240 : "100%",
          borderRadius: 10,
        }}
        style={() => ({
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 13,
          paddingLeft: 10,
          minWidth: 0,
        })}
      >
        {data?.emoji && (
          <NavbarIcon isAll={isAll} emoji={data.emoji} isLoading={isLoading} />
        )}
        <View style={{ minWidth: 0, flexShrink: 1 }}>
          <NavbarEyebrow name={type} />
          {isLoading ? (
            <View
              style={{
                width: 60,
                height: 17,
                borderRadius: 20,
                backgroundColor: theme[4],
              }}
            />
          ) : (
            <NavbarTitle name={data.name || "All tasks"} />
          )}
        </View>
        <Icon size={30} style={{ marginLeft: -5 }}>
          expand_more
        </Icon>
      </Button>

      <Modal
        transformCenter
        animation={breakpoints.md ? "SCALE" : "SLIDE"}
        sheetRef={ref}
        maxWidth={400}
        innerStyles={{
          backgroundColor: "transparent",
          justifyContent: "center",
        }}
        maxBackdropOpacity={0.05}
      >
        <BlurView
          tint={!isDark ? "extraLight" : "dark"}
          style={{
            borderRadius: 25,
            maxHeight: "100%",
            overflow: "hidden",
          }}
        >
          <BottomSheetScrollView
            bounces={false}
            style={{
              height: "auto",
              padding: 10,
              backgroundColor: addHslAlpha(
                theme[2],
                Platform.OS === "android" ? 1 : 0.7
              ),
            }}
            showsHorizontalScrollIndicator={false}
          >
            <View
              style={{
                alignItems: "center",
                flexDirection: "row",
                paddingHorizontal: 10,
                marginVertical: 10,
                marginBottom: 15,
              }}
            >
              <Text
                style={{
                  fontFamily: "serifText700",
                  fontSize: 25,
                  color: theme[11],
                }}
              >
                Select a view
              </Text>
              <IconButton
                variant="filled"
                icon="close"
                style={{ marginLeft: "auto" }}
                backgroundColors={{
                  default: addHslAlpha(theme[8], 0.1),
                  hovered: addHslAlpha(theme[8], 0.2),
                  pressed: addHslAlpha(theme[8], 0.3),
                }}
                onPress={() => ref.current?.forceClose()}
              />
            </View>
            <View style={{ gap: 1 }}>
              {options.map((r, i) =>
                r.renderer ? (
                  r.renderer()
                ) : (
                  <ListItemButton
                    key={i}
                    onPress={() => {
                      r.callback();
                      ref.current?.forceClose();
                    }}
                    backgroundColors={{
                      default: addHslAlpha(theme[8], r.selected ? 0.2 : 0),
                      hover: addHslAlpha(theme[8], 0.3),
                      active: addHslAlpha(theme[8], 0.4),
                    }}
                  >
                    <Icon>{r.icon}</Icon>
                    <ListItemText
                      primaryProps={{ style: { color: theme[11] } }}
                      secondaryProps={{
                        style: { color: theme[11], opacity: 0.6 },
                      }}
                      primary={r.text}
                      secondary={r.selected && r.secondary}
                    />
                  </ListItemButton>
                )
              )}
            </View>
          </BottomSheetScrollView>
        </BlurView>
      </Modal>
    </>
  );
});

