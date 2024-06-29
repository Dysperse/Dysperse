import LabelPicker from "@/components/labels/picker";
import { useSession } from "@/context/AuthProvider";
import { useSelectionContext } from "@/context/SelectionContext";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text, { getFontName } from "@/ui/Text";
import { addHslAlpha, useColor, useDarkMode } from "@/ui/color";
import { ColorThemeProvider } from "@/ui/color/theme-provider";
import { BlurView } from "expo-blur";
import { memo, useCallback, useMemo, useState } from "react";
import { TextStyle, View, ViewStyle, useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { mutate } from "swr";
import TaskDatePicker from "../task/create/TaskDatePicker";

function NavbarHeader({ isLoading }) {
  const { selection, setSelection } = useSelectionContext();
  const clearSelection = useCallback(() => setSelection([]), [setSelection]);

  return (
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
          <Text style={{ opacity: 0.6, fontSize: 12 }}>Processing...</Text>
        )}
      </View>
    </View>
  );
}

const PinButton = ({ textStyle, itemStyle, handleSelect }) => {
  const [pinned, setPinned] = useState(true);
  const { isLoading } = useSelectionContext();
  const breakpoints = useResponsiveBreakpoints();

  return (
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
  );
};

function Actions({ setIsLoading }) {
  const { session } = useSession();
  const { selection } = useSelectionContext();
  const breakpoints = useResponsiveBreakpoints();
  const { setSelection } = useSelectionContext();
  const { isLoading } = useSelectionContext();
  const blue = useColor("blue");

  const itemStyle: ViewStyle = useMemo(
    () =>
      breakpoints.md
        ? undefined
        : {
            alignItems: "center",
            width: 90,
            gap: 5,
          },
    [breakpoints]
  );

  const textStyle: TextStyle = useMemo(
    () => ({
      color: blue[11],
      fontSize: 12,
      textAlign: "center",
      fontFamily: getFontName("jost", 800),
    }),
    [blue]
  );

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
        if (shouldClear) setSelection([]);
      } catch (e) {
        console.log(e);
        Toast.show({ type: "error" });
      } finally {
        setIsLoading(false);
      }
    },
    [selection, setSelection, session, setIsLoading]
  );

  return (
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
      <PinButton
        handleSelect={handleSelect}
        itemStyle={itemStyle}
        textStyle={textStyle}
      />
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
        <TaskDatePicker
          title="Select a date"
          setValue={(_, value) => handleSelect({ due: value })}
          dueDateOnly
          watch={(inputName) => {
            return {
              date: null,
              dateOnly: true,
              recurrenceRule: null,
              end: null,
            }[inputName];
          }}
        >
          <IconButton
            variant={breakpoints.md ? "text" : "outlined"}
            disabled={isLoading}
            icon="today"
            size={45}
          />
        </TaskDatePicker>
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
  );
}

const SelectionNavbar = memo(function SelectionNavbar() {
  const isDark = useDarkMode();
  const blue = useColor("blue");
  const { width } = useWindowDimensions();
  const { selection } = useSelectionContext();
  const breakpoints = useResponsiveBreakpoints();

  const [isLoading, setIsLoading] = useState(false);

  const barWidth = useMemo(
    () => (breakpoints.md ? 440 : width),
    [breakpoints, width]
  );

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
    <ColorThemeProvider theme={blue}>
      <Animated.View
        style={[
          marginStyle,
          {
            zIndex: 1,
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
          experimentalBlurMethod="dimezisBlurView"
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
            <NavbarHeader isLoading={isLoading} />
            <Actions setIsLoading={setIsLoading} />
          </View>
        </BlurView>
      </Animated.View>
    </ColorThemeProvider>
  ) : null;
});

export default SelectionNavbar;
