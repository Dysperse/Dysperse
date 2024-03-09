import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import { ButtonGroup } from "@/ui/ButtonGroup";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useLocalSearchParams } from "expo-router";
import { memo, useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { styles } from ".";
import { useCollectionContext } from "../context";

const modalStyles = StyleSheet.create({
  eyebrow: { marginTop: 10, marginBottom: 5, marginLeft: 5 },
});
const CollectionMembers = ({ collection: { data: collection } }) => {
  // const { session } = useUser();

  return (
    <View style={{ padding: 20 }}>
      <Text variant="eyebrow" style={modalStyles.eyebrow}>
        Group
      </Text>
      {collection.public && (
        <ListItemButton>
          <Avatar
            icon={collection.public ? "people" : "lock"}
            size={40}
            disabled
          />
          <ListItemText
            primary={collection.public ? "Public" : "Private"}
            secondary={
              collection.public
                ? "Members in this space have access"
                : "Only you & selected members have access"
            }
          />
          <Icon size={45} style={{ opacity: collection.public ? 1 : 0.5 }}>
            toggle_{collection.public ? "on" : "off"}
          </Icon>
        </ListItemButton>
      )}
      <Text variant="eyebrow" style={[modalStyles.eyebrow, { marginTop: 15 }]}>
        People
      </Text>
      <ListItemButton>
        <Avatar icon="add" size={40} />
        <ListItemText primary="Invite people" />
      </ListItemButton>
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

  const collection = useCollectionContext();

  return (
    <>
      {id !== "all" &&
        (breakpoints.md ? (
          <Pressable
            onPress={handleOpen}
            style={({ pressed, hovered }: any) => [
              styles.navbarIconButton,
              {
                backgroundColor: theme[pressed ? 8 : hovered ? 9 : 10],
                width: breakpoints.md ? 120 : 50,
                gap: 15,
              },
            ]}
          >
            <Icon style={{ color: theme[11] }}>ios_share</Icon>
            {breakpoints.md && (
              <Text style={{ color: theme[11] }} weight={400}>
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
        ))}

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
        <BottomSheetScrollView>
          {viewState[0] === "Members" ? (
            <CollectionMembers collection={collection} />
          ) : (
            <CollectionLink />
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </>
  );
});
