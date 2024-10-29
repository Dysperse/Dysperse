import { COLLECTION_VIEWS } from "@/components/layout/command-palette/list";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Modal from "@/ui/Modal";
import Text from "@/ui/Text";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { router, useGlobalSearchParams } from "expo-router";
import { memo, useEffect, useRef } from "react";
import { Platform, Pressable, View } from "react-native";
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

  // Convert grouped object to array of arrays
  const options = Object.entries(groupedViews)
    .map(([_type, views]) => [
      {
        renderer: () => (
          <Text variant="eyebrow" style={{ padding: 10, paddingBottom: 3 }}>
            {capitalizeFirstLetter(_type)}
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
          document.activeElement?.tagName !== "TEXTAREA"
        ) {
          const now = Date.now();
          if (now - lastPress.current < 500) ref.current?.present();
          lastPress.current = now;
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, []);

  return (
    <>
      <Pressable
        onPress={() => ref.current?.present()}
        android_ripple={{ color: theme[5] }}
        style={() => ({
          maxWidth: breakpoints.md ? 240 : "100%",
          flexDirection: "row",
          alignItems: "center",
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
                borderRadius: 999,
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
      </Pressable>

      <Modal
        transformCenter
        animation={breakpoints.md ? "SCALE" : "SLIDE"}
        sheetRef={ref}
        maxWidth={400}
        innerStyles={{ backgroundColor: "transparent" }}
      >
        <BlurView style={{ flex: 1 }}>
          <BottomSheetScrollView
            style={{
              padding: 10,
              flex: 1,
              backgroundColor: addHslAlpha(theme[2], 0.7),
            }}
            showsHorizontalScrollIndicator={false}
          >
            <Text
              style={{
                textAlign: "center",
                fontFamily: "serifText800",
                fontSize: 30,
                marginVertical: 20,
              }}
            >
              Select a view
            </Text>
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

