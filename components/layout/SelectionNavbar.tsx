import { useSession } from "@/context/AuthProvider";
import { useBadgingService } from "@/context/BadgingProvider";
import { useSelectionContext } from "@/context/SelectionContext";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import Text, { getFontName } from "@/ui/Text";
import { useColor } from "@/ui/color";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useCallback, useMemo, useState } from "react";
import { TextStyle, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useSWRConfig } from "swr";

function NavbarHeader({ isLoading, setIsLoading }) {
  const { selection, setSelection } = useSelectionContext();
  const blue = useColor("blue");
  const clearSelection = useCallback(() => setSelection([]), [setSelection]);

  return (
    <>
      <Button
        text="Cancel"
        containerStyle={{ width: 80, opacity: isLoading ? 0 : 1 }}
        onPress={clearSelection}
        textStyle={{ textAlign: "left", marginRight: "auto", color: blue[11] }}
      />
      {isLoading ? (
        <Spinner color={blue[11]} />
      ) : (
        <Text
          style={{ color: blue[11], fontFamily: "serifText700", fontSize: 25 }}
        >
          {selection.length} selected
        </Text>
      )}
      <Actions isLoading={isLoading} setIsLoading={setIsLoading} />
    </>
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

function Actions({ isLoading, setIsLoading }) {
  const { session } = useSession();
  const { selection } = useSelectionContext();
  const breakpoints = useResponsiveBreakpoints();
  const { setSelection } = useSelectionContext();
  const blue = useColor("blue");
  const { mutate } = useSWRConfig();

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
  const badgingService = useBadgingService();

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
        badgingService.current.mutate();
        await mutate(() => true);
        if (shouldClear) setSelection([]);
      } catch (e) {
        console.log(e);
        Toast.show({ type: "error" });
      } finally {
        setIsLoading(false);
      }
    },
    [selection, setSelection, session, setIsLoading, mutate]
  );

  const trigger = (
    <Button
      text={selection.length > 1 ? "Edit" : "Reorder"}
      containerStyle={{ width: 80, opacity: isLoading ? 0 : 1 }}
      textStyle={{
        textAlign: "right",
        marginLeft: "auto",
        color: blue[11],
      }}
      onPress={() => {
        if (selection.length === 1) {
          Toast.show({ type: "info", text1: "Coming soon" });
        }
      }}
    />
  );

  return (
    <View style={{ flexDirection: "row" }}>
      {selection.length === 1 ? (
        trigger
      ) : (
        <MenuPopover
          closeOnSelect
          trigger={trigger}
          menuProps={{ rendererProps: { placement: "bottom" } }}
          options={[
            {
              text: "Pin",
              icon: "push_pin",
              callback: () => handleSelect({ pinned: true }),
            },
            {
              text: "Unpin",
              icon: "push_pin",
              callback: () => handleSelect({ pinned: false }),
            },
          ]}
        />
      )}
    </View>
  );
}

const SelectionNavbar = memo(function SelectionNavbar() {
  const blue = useColor("blue");
  const { selection } = useSelectionContext();
  const breakpoints = useResponsiveBreakpoints();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(false);

  const height = 71 + insets.top;

  const marginStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withSpring(selection.length > 0 ? 0 : -(84 + insets.top), {
          damping: 100,
          stiffness: 400,
        }),
      },
    ],
  }));

  return (
    <Animated.View
      style={[
        marginStyle,
        {
          zIndex: 999999,
          height: breakpoints.md ? 64 : height,
          overflow: "hidden",
          width: "100%",
          position: "absolute",
          top: 0,
          left: 0,
        },
        !breakpoints.md && {
          paddingBottom: 10,
        },
      ]}
    >
      <LinearGradient
        colors={[blue[3], blue[5]]}
        style={[
          {
            flexDirection: "row",
            gap: 10,
            paddingHorizontal: 10,
            paddingRight: 15,
            height: "100%",
            alignItems: "center",
            paddingTop: insets.top,
            justifyContent: "space-between",
          },
        ]}
      >
        <NavbarHeader isLoading={isLoading} setIsLoading={setIsLoading} />
      </LinearGradient>
    </Animated.View>
  );
});

export default SelectionNavbar;

