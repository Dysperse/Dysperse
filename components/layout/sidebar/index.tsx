import { CreateDrawer } from "@/components/layout/bottom-navigation/create-drawer";
import { sendApiRequest } from "@/helpers/api";
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
import { useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import useSWR from "swr";
import { NavbarProfilePicture } from "../account-navbar";
import { useCommandPalette } from "../command-palette";

export const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
});

function SpaceButton({ handleClose, item }: any) {
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

export function SpacesTrigger({ children }) {
  const ref = useRef<BottomSheetModal>(null);
  const [view, setView] = useState("all");
  const { data, error } = useSWR(["user/spaces"]);

  const handleClose = useCallback(() => ref.current.close(), []);

  return (
    <Menu menuRef={ref} width={400} height={["70%"]} trigger={children}>
      {data ? (
        <FlatList
          style={{ padding: 10 }}
          data={data}
          ListHeaderComponent={
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text heading style={{ fontSize: 40 }}>
                  Spaces
                </Text>
                <IconButton
                  variant="filled"
                  style={{ marginTop: -7 }}
                  onPress={handleClose}
                >
                  <Icon>close</Icon>
                </IconButton>
              </View>
              <ButtonGroup
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

export function Sidebar() {
  const theme = useColorTheme();
  const { openPalette } = useCommandPalette();
  const { width, height } = useWindowDimensions();

  const openSupport = useCallback(() => {
    Linking.openURL("https://blog.dysperse.com");
  }, []);

  return (
    <View
      style={{
        height: "100%",
        backgroundColor: width > 600 ? theme[2] : undefined,
        width: width > 600 ? 80 : "100%",
        flexDirection: "column",
        maxHeight: width > 600 ? height : undefined,
        alignItems: "center",
      }}
    >
      {width > 600 && (
        <View
          style={{
            height: 70,
            paddingHorizontal: 20,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Logo color={theme[7]} size={40} />
        </View>
      )}
      {width > 600 && (
        <View style={{ paddingHorizontal: 20 }}>
          <CreateDrawer>
            <Pressable
              style={({ pressed, hovered }: any) => ({
                flexDirection: "row",
                backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
                shadowColor: theme[4],
                borderWidth: 2,
                borderColor: theme[pressed ? 7 : hovered ? 6 : 5],
                shadowRadius: 10,
                marginBottom: 15,
                shadowOffset: { height: 5, width: 0 },
                borderRadius: 8,
                height: 50,
                width: 50,
                alignItems: "center",
                justifyContent: "center",
                gap: 15,
                ...(Platform.OS === "web" && ({ userSelect: "none" } as any)),
              })}
            >
              <Icon bold style={{ opacity: 0.8 }}>
                add
              </Icon>
            </Pressable>
          </CreateDrawer>
        </View>
      )}
      <IconButton onPress={openPalette} size={40}>
        <Icon style={{ transform: [{ rotate: "-11deg" }] }}>electric_bolt</Icon>
      </IconButton>
      <View
        style={{
          marginTop: "auto",
          marginBottom: 10,
          gap: 10,
          alignItems: "center",
        }}
      >
        <IconButton variant="filled" onPress={openSupport}>
          <Icon>question_mark</Icon>
        </IconButton>
        <SpacesTrigger>
          <IconButton variant="filled">
            <Icon>workspaces</Icon>
          </IconButton>
        </SpacesTrigger>
        <NavbarProfilePicture />
      </View>
    </View>
  );
}
