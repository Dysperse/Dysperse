import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { ButtonGroup } from "@/ui/ButtonGroup";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import { Menu } from "@/ui/Menu";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Platform, View, useColorScheme } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import useSWR from "swr";

export function SpacesTrigger({ children }) {
  const ref = useRef<BottomSheetModal>(null);
  const [view, setView] = useState("all");
  const { data, error } = useSWR(["user/spaces"]);

  const handleClose = useCallback(() => ref.current.close(), []);
  const breakpoints = useResponsiveBreakpoints();

  return (
    <Menu
      menuRef={ref}
      width={breakpoints.lg ? 400 : undefined}
      height={["55%"]}
      trigger={children}
    >
      {data ? (
        <FlatList
          data={data}
          ListHeaderComponent={
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 20,
                  marginTop: -15,
                }}
              >
                <IconButton size={55} variant="outlined" onPress={handleClose}>
                  <Icon>close</Icon>
                </IconButton>
                <Text heading style={{ fontSize: 40 }}>
                  Spaces
                </Text>
              </View>
              <ButtonGroup
                scrollContainerStyle={{ width: "100%" }}
                buttonStyle={{ flexGrow: 1, flexBasis: 0 }}
                containerStyle={{ marginVertical: 10 }}
                options={[
                  { label: "All", value: "all" },
                  { label: "Invitations", value: "invitations" },
                ]}
                state={[view, setView]}
              />
            </View>
          }
          contentContainerStyle={{ padding: 20 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: any) => (
            <SpaceButton handleClose={handleClose} item={item} />
          )}
        />
      ) : error ? (
        <ErrorAlert />
      ) : (
        <Spinner />
      )}
    </Menu>
  );
}
export function SpaceButton({ handleClose, item }: any) {
  const theme = useColor(item.space.color, useColorScheme() === "dark");

  const handleSpacePress = useCallback(() => {
    handleClose();
    setTimeout(
      () =>
        router.push({
          pathname: "/space",
        }),
      1000
    );
  }, [handleClose]);

  return (
    <ListItemButton
      onPress={handleSpacePress}
      style={({ pressed, hovered }: any) => ({
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
        ...(Platform.OS === "web" && ({ userSelect: "none" } as any)),
      })}
    >
      <View
        style={{
          width: 15,
          height: 15,
          borderRadius: 99,
          backgroundColor: theme[9],
        }}
      />
      <ListItemText
        primary={item.space.name}
        secondary={`${item.space?._count?.members} member${
          item.space?._count?.members !== 1 ? "s" : ""
        }`}
      />
    </ListItemButton>
  );
}
