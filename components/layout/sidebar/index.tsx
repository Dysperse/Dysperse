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
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router, usePathname } from "expo-router";
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
import { OpenTabsList } from "../bottom-navigation/tabs/carousel";
import Logo from "@/ui/logo";

export const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  button: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    gap: 5,
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 10,
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
  const pathname = usePathname();

  const openSupport = useCallback(() => {
    Linking.openURL("https://blog.dysperse.com");
  }, []);

  const handleHome = () => router.push("/");

  return (
    <View
      style={{
        height: "100%",
        width: width > 600 ? 220 : "100%",
        flexDirection: "column",
        maxHeight: width > 600 ? height : undefined,
        backgroundColor: theme[2],
      }}
    >
      <View
        style={{
          padding: 15,
          paddingBottom: 0,
          paddingTop: 20,
        }}
      >
        <Logo size={35} color={theme[6]} />
        <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
          <Pressable
            onPress={handleHome}
            style={({ pressed }) => [
              styles.button,
              {
                borderColor: theme[5],
                backgroundColor: theme[1],
                opacity: pressed ? 0.5 : 1,
              },
            ]}
          >
            <Icon filled={pathname === "/"}>home</Icon>
          </Pressable>
          <Pressable
            onPress={openPalette}
            style={({ pressed }) => [
              styles.button,
              {
                flex: 1,
                borderColor: theme[5],
                backgroundColor: theme[1],
                opacity: pressed ? 0.5 : 1,
              },
            ]}
          >
            <Icon>electric_bolt</Icon>
            <Text style={{ color: theme[11] }}>Jump to</Text>
          </Pressable>
        </View>
      </View>
      <OpenTabsList />
      <View
        style={{
          marginTop: "auto",
          padding: 15,
          paddingTop: 0,
        }}
      >
        <View
          style={{
            gap: 10,
            paddingTop: 15,
            alignItems: "center",
            flexDirection: "row",
            borderTopWidth: 1,
            borderTopColor: theme[6],
          }}
        >
          <IconButton
            variant="filled"
            style={{ marginRight: "auto" }}
            onPress={openSupport}
          >
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
    </View>
  );
}
