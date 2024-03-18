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
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useSWR from "swr";
import { CollectionContext, useCollectionContext } from "../context";
import { AgendaButtons } from "./AgendaButtons";
import { CollectionIntegrationsMenu } from "./CollectionIntegrationsMenu";
import { CollectionLabelMenu } from "./CollectionLabelMenu";
import { CollectionRenameMenu } from "./CollectionRenameMenu";
import { CollectionShareMenu } from "./CollectionShareMenu";
import Toast from "react-native-toast-message";

export const styles = StyleSheet.create({
  navbarIconButton: {
    flexDirection: "row",
    height: 50,
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

const CollectionSearch = () => {
  const breakpoints = useResponsiveBreakpoints();

  return (
    <IconButton
      size={breakpoints.md ? 50 : 40}
      style={[breakpoints.md && { borderRadius: 20 }]}
      icon="search"
      onPress={() => Toast.show({ text1: "Coming soon!" })}
      variant={breakpoints.md ? "filled" : "outlined"}
    />
  );
};

export const CollectionNavbar = memo(function CollectionNavbar({
  editOrderMode,
  setEditOrderMode,
}: CollectionNavbarProps) {
  const theme = useColorTheme();
  const { data, ...ctx } = useCollectionContext();
  const breakpoints = useResponsiveBreakpoints();
  const { type, id } = useGlobalSearchParams();
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
        <CollectionContext.Provider value={{ data, ...ctx }}>
          <CollectionRenameMenu {...props} />
        </CollectionContext.Provider>
      ),
    },
    !isAll && {
      icon: "label",
      text: "Edit labels",
      renderer: (props) => (
        <CollectionContext.Provider value={{ data, ...ctx }}>
          <CollectionLabelMenu {...props} />
        </CollectionContext.Provider>
      ),
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
          secondary="This will affect all views in this collection"
        >
          <MenuItem>
            <Icon>priority</Icon>
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
  ].filter((e) => e);

  const filterOptions = [
    {
      renderer: () => (
        <View style={{ alignItems: "center", paddingVertical: 10 }}>
          <Text variant="eyebrow">Coming soon!</Text>
        </View>
      ),
    },
    {
      selected: true,
      icon: "auto_awesome",
      text: "Auto",
      callback: () => {},
    },
    {
      disabled: true,
      icon: "sort_by_alpha",
      text: "Alphabetical",
      callback: () => alert("filter az"),
    },
    {
      disabled: true,
      icon: "calendar_month",
      text: "Due date",
      callback: () => alert("filter due"),
    },
    {
      disabled: true,
      icon: "timeline",
      text: "Last edited",
      callback: () => alert("filter edited"),
    },
  ];
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
        colors={breakpoints.md ? [theme[1]] : [theme[2], theme[3]]}
        style={{
          height: 80 + insets.top,
          paddingTop: insets.top,
          paddingHorizontal: 15,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        {menu}
        <View style={!breakpoints.md && { flex: 1 }}>
          <MenuPopover
            containerStyle={{ width: 230 }}
            trigger={
              <IconButton
                variant="text"
                style={[
                  styles.navbarIconButton,
                  {
                    gap: 5,
                    width: "auto",
                    justifyContent: "flex-start",
                    paddingHorizontal: 10,
                  },
                ]}
              >
                {!isAll && <Emoji emoji={data.emoji} size={30} />}
                <Text style={{ fontSize: 20 }} numberOfLines={1}>
                  {data.name || "Everything"}
                </Text>
                <Icon style={{ color: theme[12] }}>expand_more</Icon>
              </IconButton>
            }
            options={collectionMenuOptions}
          />
        </View>
        <MenuPopover
          menuProps={{
            style: { marginRight: "auto" },
            rendererProps: { placement: "bottom" },
          }}
          trigger={
            <IconButton
              variant="outlined"
              style={[
                breakpoints.md && styles.navbarIconButton,
                breakpoints.md
                  ? {
                      width: 60,
                      height: 35,
                      paddingLeft: 5,
                      marginLeft: -5,
                    }
                  : {
                      width: 60,
                      height: 40,
                      paddingLeft: 5,
                      gap: 5,
                      flexDirection: "row",
                    },
              ]}
            >
              <Icon style={{ color: theme[11] }} size={20}>
                {options.find((i) => i.selected)?.icon || "calendar_today"}
              </Icon>
              <Icon style={{ marginLeft: -2, color: theme[11] }}>
                expand_more
              </Icon>
            </IconButton>
          }
          options={options}
        />
        {type === "planner" && breakpoints.md && <AgendaButtons />}
        <MenuPopover
          menuProps={{
            rendererProps: { placement: "bottom" },
          }}
          trigger={
            <IconButton
              size={breakpoints.md ? 50 : 40}
              style={[breakpoints.md && { borderRadius: 20 }]}
              icon="filter_list"
              variant={breakpoints.md ? "filled" : "outlined"}
            />
          }
          options={filterOptions}
        />
        {breakpoints.md && <CollectionSearch />}
        <CollectionIntegrationsMenu />
        <CollectionContext.Provider value={{ data, ...ctx }}>
          <CollectionShareMenu />
        </CollectionContext.Provider>
      </LinearGradient>
      {type === "planner" && !breakpoints.md && <AgendaButtons />}
    </>
  );
});
