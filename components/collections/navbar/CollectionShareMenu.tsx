import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import BottomSheet from "@/ui/BottomSheet";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useLocalSearchParams } from "expo-router";
import { memo, useCallback, useRef } from "react";
import { Pressable, View } from "react-native";
import { styles } from ".";

export const CollectionShareMenu = memo(function CollectionShareMenu() {
  const ref = useRef<BottomSheetModal>(null);
  const { id } = useLocalSearchParams();
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();

  const handleOpen = useCallback(() => ref.current?.present(), []);
  const handleClose = useCallback(() => ref.current?.close(), []);

  return (
    <>
      {breakpoints.md ? (
        <Pressable
          onPress={handleOpen}
          style={({ pressed, hovered }: any) => [
            styles.navbarIconButton,
            {
              backgroundColor: theme[pressed ? 11 : hovered ? 10 : 9],
              width: breakpoints.md ? 120 : 50,
              gap: 15,
            },
            id === "all" && {
              backgroundColor: theme[3],
              opacity: 0.5,
              pointerEvents: "none",
            },
          ]}
        >
          <Icon style={{ color: theme[id === "all" ? 8 : 1] }}>ios_share</Icon>
          {breakpoints.md && (
            <Text style={{ color: theme[id === "all" ? 8 : 1] }} weight={400}>
              Share
            </Text>
          )}
        </Pressable>
      ) : (
        <IconButton
          onPress={handleOpen}
          variant="outlined"
          size={40}
          icon="ios_share"
        />
      )}

      <BottomSheet onClose={handleClose} sheetRef={ref} snapPoints={["60%"]}>
        <View style={{ padding: 25 }}>
          <Text weight={900} style={{ fontSize: 25 }}>
            Members
          </Text>

          <Text weight={900} style={{ fontSize: 25 }}>
            Invite link
          </Text>
        </View>
      </BottomSheet>
    </>
  );
});
