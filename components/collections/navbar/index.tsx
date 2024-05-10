import { collectionViews } from "@/components/layout/command-palette/list";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { LinearGradient } from "expo-linear-gradient";
import { router, useGlobalSearchParams } from "expo-router";
import { memo, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { CollectionContext, useCollectionContext } from "../context";
import { AgendaButtons } from "./AgendaButtons";
import { CollectionLabelMenu } from "./CollectionLabelMenu";
import { CollectionRenameMenu } from "./CollectionRenameMenu";
import { CollectionSearch } from "./CollectionSearch";
import { CollectionShareMenu } from "./CollectionShareMenu";

export const styles = StyleSheet.create({
  navbarIconButton: {
    flexDirection: "row",
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    borderRadius: 20,
  },
});

interface CollectionNavbarProps {
  editOrderMode: boolean;
  setEditOrderMode: (value: boolean) => void;
}

export const CollectionNavbar = memo(function CollectionNavbar({
  editOrderMode,
  setEditOrderMode,
}: CollectionNavbarProps) {
  const theme = useColorTheme();
  const { data, access, type, ...ctx } = useCollectionContext();
  const isReadOnly = access?.access === "READ_ONLY";
  const breakpoints = useResponsiveBreakpoints();
  const { id } = useGlobalSearchParams();
  const insets = useSafeAreaInsets();

  const isAll = id === "all";

  const options = Object.keys(collectionViews).map((i) => ({
    icon: collectionViews[i],
    text: capitalizeFirstLetter(i),
    selected: i.toLowerCase() === type,
    callback: () => router.setParams({ type: i.toLowerCase() }),
  }));
  const { session } = useSession();

  const toggleShowCompleted = async () => {
    const showCompleted = !data.showCompleted;
    await sendApiRequest(
      session,
      "PUT",
      "space/collections",
      {},
      { body: JSON.stringify({ id: data.id, showCompleted }) }
    );
    await ctx.mutate();
  };

  const { mutate } = useSWR(["user/tabs"]);

  const collectionMenuOptions = [
    !isAll && {
      icon: "edit",
      text: "Edit",
      renderer: (props) => (
        <CollectionContext.Provider value={{ data, ...ctx, access: null }}>
          <CollectionRenameMenu {...props} />
        </CollectionContext.Provider>
      ),
    },
    !isAll && {
      icon: "label",
      text: "Edit labels",
      renderer: (props) => (
        <CollectionContext.Provider value={{ data, ...ctx, access: null }}>
          <CollectionLabelMenu {...props} />
        </CollectionContext.Provider>
      ),
    },
    !isAll &&
      type === "grid" && {
        icon: "grid_on",
        text: "Reorder labels",
        callback: () => setEditOrderMode(true),
      },
    !isAll && {
      icon: "remove_selection",
      text: "Delete",
      renderer: () => (
        <ConfirmationModal
          height={450}
          onSuccess={async () => {
            await sendApiRequest(session, "DELETE", "space/collections", {
              id: data.id,
            });
            router.replace("/");
            await mutate();
          }}
          title="Delete collection?"
          secondary="This won't delete any labels or its contents. Any opened views with this collection will be closed"
        >
          <MenuItem>
            <Icon>delete</Icon>
            <Text variant="menuItem" weight={300}>
              Delete
            </Text>
          </MenuItem>
        </ConfirmationModal>
      ),
    },
    !isAll && {
      divider: true,
    },
    {
      icon: "sync",
      text: "Refresh",
      callback: async () => {
        await ctx.mutate();
        Toast.show({ type: "success", text1: "Collection up to date!" });
      },
    },
    {
      icon: "fluorescent",
      text: "Customize task chips",
      callback: () => Toast.show({ type: "info", text1: "Coming soon" }),
    },
    {
      renderer: () => (
        <ConfirmationModal
          height={430}
          onSuccess={toggleShowCompleted}
          title={
            data.showCompleted
              ? "Hide completed tasks?"
              : "Show completed tasks?"
          }
          disabled={!data.name}
          secondary="This will affect all views in this collection"
        >
          <MenuItem
            onPress={() => {
              if (!data.name)
                Toast.show({ type: "info", text1: "Coming soon" });
            }}
          >
            <Icon>edit_attributes</Icon>
            <Text variant="menuItem" weight={300}>
              {data.showCompleted ? "Hide" : "Show"} completed
            </Text>
            {data.showCompleted && (
              <Icon style={{ marginLeft: "auto" }}>check</Icon>
            )}
          </MenuItem>
        </ConfirmationModal>
      ),
    },
  ].filter((e) => e);

  const { openSidebar } = useSidebarContext();

  const menu = useMemo(
    () =>
      !breakpoints.md && (
        <IconButton icon="menu" size={40} onPress={openSidebar} />
      ),
    [openSidebar, breakpoints.md]
  );

  return editOrderMode ? (
    <View
      style={{
        height: 80,
        paddingHorizontal: 15,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme[6],
      }}
    >
      <View>
        <Text weight={900}>Reorder labels</Text>
        <Text style={{ opacity: 0.6 }}>{data.name}</Text>
      </View>
      <IconButton
        icon="check"
        variant="filled"
        size={55}
        style={{ marginLeft: "auto" }}
        onPress={() => setEditOrderMode(false)}
      />
    </View>
  ) : (
    <>
      <LinearGradient
        colors={[theme[breakpoints.md ? 1 : 2], theme[breakpoints.md ? 2 : 3]]}
        style={{
          backgroundColor: theme[3],
          height: 60 + insets.top,
          paddingTop: insets.top,
          paddingHorizontal: 10,
          flexDirection: "row",
          borderBottomWidth: breakpoints.md ? 1 : 0,
          borderBottomColor: theme[5],
          alignItems: "center",
          gap: 5,
        }}
      >
        {menu}
        <MenuPopover
          menuProps={{
            style: {
              marginRight: "auto",
              maxWidth: "100%",
              width: breakpoints.md ? 220 : undefined,
              minWidth: 0,
            },
            rendererProps: { placement: "bottom" },
          }}
          trigger={
            <Pressable
              style={{
                maxWidth: breakpoints.md ? 220 : "100%",
                flexDirection: "row",
                alignItems: "center",
                gap: 13,
                paddingLeft: 10,
                minWidth: 0,
              }}
            >
              {!isAll && <Emoji emoji={data.emoji} size={30} />}
              <View style={{ minWidth: 0, flexShrink: 1 }}>
                <Text
                  numberOfLines={1}
                  variant="eyebrow"
                  style={{ fontSize: 11 }}
                >
                  {type}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{ color: theme[11] }}
                  weight={900}
                >
                  {data.name || "All tasks"}
                </Text>
              </View>
              <Icon size={30} style={{ marginLeft: -5 }}>
                expand_more
              </Icon>
            </Pressable>
          }
          options={options}
        />
        {type === "planner" && breakpoints.md && <AgendaButtons />}
        <View
          style={{
            width: breakpoints.md ? 220 : undefined,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <CollectionContext.Provider value={{ data, type, access, ...ctx }}>
            <CollectionSearch />
            {!isReadOnly && (
              <MenuPopover
                {...(isReadOnly && { menuProps: { opened: false } })}
                containerStyle={{ width: 230 }}
                menuProps={{
                  rendererProps: { placement: "bottom" },
                }}
                trigger={<IconButton icon="pending" size={40} />}
                options={(isReadOnly ? [] : collectionMenuOptions) as any}
              />
            )}
            <CollectionShareMenu />
          </CollectionContext.Provider>
        </View>
      </LinearGradient>
      {type === "planner" && !breakpoints.md && <AgendaButtons />}
    </>
  );
});
