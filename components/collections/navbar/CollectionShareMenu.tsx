import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import BottomSheet from "@/ui/BottomSheet";
import { ButtonGroup } from "@/ui/ButtonGroup";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useLocalSearchParams } from "expo-router";
import { memo, useCallback, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { styles } from ".";

const CollectionMembers = () => {
  return (
    <View style={{ padding: 20 }}>
      <Text>Members</Text>
    </View>
  );
};

const CollectionLink = () => {
  return (
    <View style={{ padding: 20 }}>
      <Text>Link</Text>
    </View>
  );
};

export const CollectionShareMenu = memo(function CollectionShareMenu() {
  const ref = useRef<BottomSheetModal>(null);
  const { id } = useLocalSearchParams();
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();
  const viewState = useState("Members");

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

      <BottomSheet onClose={handleClose} sheetRef={ref} snapPoints={["80%"]}>
        <View
          style={{
            paddingHorizontal: 25,
            paddingVertical: 10,
            paddingBottom: 15,
          }}
        >
          <Text style={{ fontSize: 30 }} weight={800}>
            Share
          </Text>
        </View>
        <ButtonGroup
          options={[
            { value: "Members", label: "Members" },
            { value: "Link", label: "Link" },
          ]}
          scrollContainerStyle={{ width: "100%" }}
          state={viewState}
        />
        {viewState[0] === "Members" ? (
          <CollectionMembers />
        ) : (
          <CollectionLink />
        )}
      </BottomSheet>
    </>
  );
});
