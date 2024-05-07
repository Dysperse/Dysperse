import LabelPicker from "@/components/labels/picker";
import { useSession } from "@/context/AuthProvider";
import { useSelectionContext } from "@/context/SelectionContext";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { addHslAlpha, useColor, useDarkMode } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";
import { Portal } from "@gorhom/portal";
import { BlurView } from "expo-blur";
import { useCallback, useState } from "react";
import { TextStyle, View, ViewStyle, useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { useSWRConfig } from "swr";

export function SelectionNavbar() {
  const { mutate } = useSWRConfig();
  const { session } = useSession();
  const { width } = useWindowDimensions();
  const { selection, setSelection } = useSelectionContext();
  const blue = useColor("blue");
  const breakpoints = useResponsiveBreakpoints();

  const barWidth = breakpoints.md ? 440 : width;
  const clearSelection = useCallback(() => setSelection([]), [setSelection]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = useCallback(
    async (t, shouldClear = false) => {
      try {
        setIsLoading(true);
        await sendApiRequest(
          session,
          "PUT",
          "space/entity",
          {},
          {
            body: JSON.stringify({ id: selection, ...t }),
          }
        );
        await mutate(() => true);
        if (shouldClear) clearSelection();
      } catch (e) {
        Toast.show({ type: "error" });
      } finally {
        setIsLoading(false);
      }
    },
    [selection, clearSelection, mutate, session]
  );

  useHotkeys("Escape", clearSelection, {
    enabled: selection.length > 0,
  });
  const isDark = useDarkMode();

  const [pinned, setPinned] = useState(true);

  const itemStyle: ViewStyle = breakpoints.md
    ? undefined
    : {
        alignItems: "center",
        width: 90,
        gap: 5,
      };

  const textStyle: TextStyle = {
    color: blue[11],
    fontSize: 12,
    textAlign: "center",
    fontFamily: "body_800",
  };

  const marginStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withSpring(
          selection.length > 0 ? 0 : breakpoints.md ? -84 : 140,
          {
            damping: 100,
            stiffness: 400,
          }
        ),
      },
    ],
  }));

  return selection.length > 0 ? (
    <Portal>
      <ColorThemeProvider theme={blue}>
        <Animated.View
          style={[
            marginStyle,
            {
              zIndex: 999999,
              height: breakpoints.md ? 64 : 140,
              overflow: "hidden",
              borderRadius: 25,
              width: barWidth,
              position: "absolute",
              top: 0,
              left: (width - barWidth) / 2,
              marginTop: breakpoints.md ? 20 : 0,
            },
            !breakpoints.md && {
              bottom: 0,
              left: 0,
              top: "auto",
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            },
          ]}
        >
          <BlurView
            intensity={40}
            tint={isDark ? "dark" : "prominent"}
            style={{ height: breakpoints.md ? 64 : 140 }}
          >
            <View
              style={[
                {
                  backgroundColor: addHslAlpha(blue[4], 0.5),
                  flexDirection: "row",
                  gap: 10,
                  paddingHorizontal: 10,
                  paddingRight: 15,
                  height: "100%",
                  alignItems: "center",
                },
                !breakpoints.md && {
                  height: 140,
                  paddingTop: 10,
                  gap: 0,
                  flexDirection: "column",
                  paddingHorizontal: 0,
                  paddingRight: 0,
                  alignItems: "flex-start",
                  justifyContent: "center",
                },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <IconButton icon="close" size={45} onPress={clearSelection} />
                <View style={{ flexGrow: 1, marginLeft: 5 }}>
                  <Text weight={900} style={{ fontSize: 20 }}>
                    {selection.length} selected
                  </Text>
                  {isLoading && (
                    <Text style={{ opacity: 0.6, fontSize: 12 }}>
                      Processing...
                    </Text>
                  )}
                </View>
              </View>
              <ScrollView
                style={{
                  flexDirection: "row",
                  width: "100%",
                }}
                contentContainerStyle={{
                  justifyContent: "flex-end",
                  flex: 1,
                }}
                showsHorizontalScrollIndicator={false}
                horizontal
              >
                <View style={itemStyle}>
                  <IconButton
                    variant={breakpoints.md ? "text" : "outlined"}
                    disabled={isLoading}
                    onPress={() => {
                      setPinned((t) => !t);
                      handleSelect({ pinned });
                    }}
                    icon={<Icon filled={pinned}>push_pin</Icon>}
                    size={45}
                  />
                  {!breakpoints.md && (
                    <Text style={textStyle}>{pinned ? "Unpin" : "Pin"}</Text>
                  )}
                </View>
                <View style={itemStyle}>
                  <LabelPicker
                    setLabel={(e: any) => handleSelect({ labelId: e.id })}
                    autoFocus
                  >
                    <IconButton
                      variant={breakpoints.md ? "text" : "outlined"}
                      disabled={isLoading}
                      icon="new_label"
                      size={45}
                    />
                  </LabelPicker>
                  {!breakpoints.md && <Text style={textStyle}>Label</Text>}
                </View>
                <View style={itemStyle}>
                  <IconButton
                    variant={breakpoints.md ? "text" : "outlined"}
                    disabled={isLoading}
                    icon="today"
                    size={45}
                  />
                  {!breakpoints.md && <Text style={textStyle}>Schedule</Text>}
                </View>
                <View style={itemStyle}>
                  <ConfirmationModal
                    onSuccess={() => handleSelect({ trash: true }, true)}
                    title={`Move ${selection.length} item${
                      selection.length === 1 ? "" : "s"
                    } to trash?`}
                    height={400}
                    skipLoading
                    secondary="You can undo this later"
                  >
                    <IconButton
                      variant={breakpoints.md ? "text" : "outlined"}
                      disabled={isLoading}
                      icon="delete"
                      size={45}
                    />
                  </ConfirmationModal>
                  {!breakpoints.md && <Text style={textStyle}>Delete</Text>}
                </View>
              </ScrollView>
            </View>
          </BlurView>
        </Animated.View>
      </ColorThemeProvider>
    </Portal>
  ) : null;
}
