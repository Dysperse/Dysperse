import { useSession } from "@/context/AuthProvider";
import { useBadgingService } from "@/context/BadgingProvider";
import { useSelectionContext } from "@/context/SelectionContext";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import DropdownMenu from "@/ui/DropdownMenu";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { showErrorToast } from "@/utils/errorToast";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { memo, useCallback, useRef, useState } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import { useSWRConfig } from "swr";
import { TaskDateModal } from "../task/drawer/date-modal";
import { COLLECTION_VIEWS } from "./command-palette/list";

function NavbarHeader({ isLoading, setIsLoading }) {
  const { selection, setSelection, setReorderMode, reorderMode } =
    useSelectionContext();
  const blue = useColor("blue");
  const clearSelection = useCallback(() => {
    setSelection([]);
    setReorderMode(false);
  }, [setSelection, setReorderMode]);

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
          style={{
            color: blue[11],
            fontFamily: "serifText700",
            fontSize: reorderMode ? 18 : 25,
          }}
        >
          {reorderMode ? "Drag to reorder" : `${selection.length} selected`}
        </Text>
      )}
      <Actions isLoading={isLoading} setIsLoading={setIsLoading} />
    </>
  );
}

function Actions({ isLoading, setIsLoading }) {
  const { session } = useSession();
  const { selection } = useSelectionContext();
  const { setSelection } = useSelectionContext();
  const blue = useColor("blue");
  const { mutate } = useSWRConfig();
  const dateModal = useRef(null);

  const badgingService = useBadgingService();
  const { reorderMode, setReorderMode } = useSelectionContext();
  const { type } = useLocalSearchParams();

  const handleSelect = useCallback(
    async (t) => {
      try {
        setIsLoading(true);
        await sendApiRequest(
          session,
          "PUT",
          "space/entity",
          {},
          {
            body: JSON.stringify({ id: selection.map((x) => x.id), ...t }),
          }
        );
        badgingService.current.mutate();
        await mutate(() => true);
        setSelection([]);
      } catch (e) {
        showErrorToast();
      } finally {
        setIsLoading(false);
      }
    },
    [selection, setSelection, session, setIsLoading, mutate, badgingService]
  );

  const trigger = (
    <Button
      text={selection.length > 1 ? "Edit" : "Reorder"}
      containerStyle={{ width: 80, opacity: isLoading || reorderMode ? 0 : 1 }}
      textStyle={{
        textAlign: "right",
        marginLeft: "auto",
        color: blue[11],
      }}
      onPress={() => {
        if (selection.length === 1) {
          toast.info("Coming soon!");
        }
        if (!reorderMode) return;
        if (process.env.NODE_ENV === "development") {
          if (COLLECTION_VIEWS[type as string].type !== "Category Based") {
            toast.info(
              "For now, you can only reorder tasks in category-based views"
            );
            setReorderMode((t) => !t);
          } else toast.info("Coming soon!");
        }
      }}
    />
  );

  return (
    <View style={{ flexDirection: "row" }}>
      <TaskDateModal
        updateTask={(s) => {
          handleSelect(s);
        }}
        task={{}}
        ref={dateModal}
      />
      {selection.length === 1 ? (
        trigger
      ) : (
        <DropdownMenu
          closeOnSelect
          horizontalPlacement="right"
          options={[
            {
              text: "Unpin",
              icon: "push_pin",
              onPress: () => handleSelect({ pinned: false }),
            },
            {
              text: "Reschedule",
              icon: "calendar_today",
              onPress: () => dateModal.current.open(),
            },
            {
              text: "Delete",
              icon: "delete",
              onPress: () => handleSelect({ trash: true }),
            },
          ]}
        >
          {trigger}
        </DropdownMenu>
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
          damping: 125,
          stiffness: 1500,
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
            paddingTop: breakpoints.md ? undefined : insets.top,
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

