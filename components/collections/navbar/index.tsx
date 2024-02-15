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
import { CollectionContext, useCollectionContext } from "../context";
import { AgendaButtons } from "./AgendaButtons";
import { CollectionIntegrationsMenu } from "./CollectionIntegrationsMenu";
import { CollectionLabelMenu } from "./CollectionLabelMenu";
import { CollectionRenameMenu } from "./CollectionRenameMenu";
import { CollectionShareMenu } from "./CollectionShareMenu";

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
  };

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
      icon: "priority",
      text: "Show completed",
      selected: true,
      callback: toggleShowCompleted,
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
          onSuccess={() => alert("coming soon")}
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
      icon: "auto_awesome",
      text: "Auto",
      callback: () => alert("filter auto"),
    },
    {
      icon: "sort_by_alpha",
      text: "Alphabetical",
      callback: () => alert("filter az"),
    },
    {
      icon: "calendar_month",
      text: "Due date",
      callback: () => alert("filter due"),
    },
    {
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
                variant="filled"
                style={[
                  styles.navbarIconButton,
                  {
                    backgroundColor: "transparent",
                    height: 30,
                    gap: 10,
                    width: "auto",
                    justifyContent: "flex-start",
                    paddingRight: 5,
                  },
                ]}
              >
                {!isAll && <Emoji emoji={data.emoji} size={30} />}
                <View>
                  <Text style={{ fontSize: 20 }}>
                    {data.name || "Everything"}
                  </Text>
                  {data.integration && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                        marginTop: -3,
                      }}
                    >
                      <Icon size={20}>sync_alt</Icon>

                      <Text style={{ fontSize: 12, opacity: 0.6 }}>
                        {capitalizeFirstLetter(
                          data.integration.name.replaceAll("-", " ")
                        )}
                      </Text>
                    </View>
                  )}
                </View>
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
              variant={breakpoints.md ? "filled" : "outlined"}
              style={[
                breakpoints.md && styles.navbarIconButton,
                breakpoints.md
                  ? {
                      width: 60,
                      height: 30,
                      paddingLeft: 5,
                      borderLeftColor: theme[6],
                      borderLeftWidth: 2,
                      borderRadius: 0,
                      backgroundColor: "transparent",
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
              <Icon style={{ marginLeft: -4, color: theme[11] }}>
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
              variant="outlined"
              size={breakpoints.md ? 50 : 40}
              style={breakpoints.md && { borderRadius: 20 }}
              icon="filter_list"
            />
          }
          options={filterOptions}
        />
        <CollectionIntegrationsMenu />
        <CollectionShareMenu />
      </LinearGradient>
      {type === "planner" && !breakpoints.md && <AgendaButtons />}
    </>
  );
});
