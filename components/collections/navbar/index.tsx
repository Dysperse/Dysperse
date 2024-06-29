import { IndeterminateProgressBar } from "@/components/IndeterminateProgressBar";
import { collectionViews } from "@/components/layout/command-palette/list";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { router, useGlobalSearchParams } from "expo-router";
import { memo, useMemo, useRef } from "react";
import { Pressable, View } from "react-native";
import { Menu } from "react-native-popup-menu";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { CollectionContext, useCollectionContext } from "../context";
import { AgendaButtons } from "./AgendaButtons";
import { CollectionLabelMenu } from "./CollectionLabelMenu";
import { CollectionRenameMenu } from "./CollectionRenameMenu";
import { CollectionSearch } from "./CollectionSearch";
import { CollectionShareMenu } from "./CollectionShareMenu";
import { NavbarEyebrow } from "./NavbarEyebrow";
import { NavbarGradient } from "./NavbarGradient";
import { NavbarIcon } from "./NavbarIcon";
import { NavbarTitle } from "./NavbarTitle";

interface CollectionNavbarProps {
  isLoading?: boolean;
  editOrderMode: boolean;
  setEditOrderMode: (value: boolean) => void;
}

const CollectionNavbar = memo(function CollectionNavbar({
  isLoading,
  editOrderMode,
  setEditOrderMode,
}: CollectionNavbarProps) {
  const theme = useColorTheme();
  const { data, access, type, isValidating, ...ctx } = useCollectionContext();
  const isReadOnly = access?.access === "READ_ONLY";
  const breakpoints = useResponsiveBreakpoints();
  const { id, mode } = useGlobalSearchParams();
  const menuRef = useRef<Menu>(null);

  const isAll = id === "all";
  const contextValue = { data, type, ...ctx, access: null, isValidating };

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

  const handleRefresh = async (e) => {
    e?.preventDefault?.();
    await ctx.mutate();
  };

  useHotkeys(["ctrl+r"], handleRefresh);

  useHotkeys(
    ["p", "k", "s", "g", "w", "l", "m", "c"],
    (e) => {
      router.setParams({
        type: Object.keys(collectionViews).find(
          (v) => v[0].toLowerCase() === e.key
        ),
      });
    },
    {
      ignoreEventWhen: () =>
        document.querySelectorAll('[aria-modal="true"]').length > 0,
    }
  );

  const collectionMenuOptions = [
    ...(type === "calendar"
      ? [
          {
            icon: "calendar_view_day",
            text: "Schedule view",
            id: "schedule",
            callback: () => router.setParams({ mode: "schedule" }),
          },
          {
            icon: "view_week",
            text: "3-day view",
            id: "3days",
            callback: () => router.setParams({ mode: "3days" }),
          },
          {
            icon: "calendar_view_week",
            text: "Week view",
            id: "week",
            callback: () => router.setParams({ mode: "week" }),
          },
          {
            icon: "calendar_month",
            text: "Month view",
            id: "month",
            callback: () => router.setParams({ mode: "month" }),
          },
          {
            divider: true,
          },
        ].map((e) => ({
          ...e,
          selected: e.text && e.id === mode,
        }))
      : []),
    !isAll && {
      renderer: () => (
        <Text variant="eyebrow" style={{ padding: 10, paddingBottom: 3 }}>
          Collection
        </Text>
      ),
    },
    !isAll && {
      icon: "edit",
      text: "Edit",
      renderer: (props) => (
        <CollectionContext.Provider value={contextValue}>
          <CollectionRenameMenu menuRef={menuRef} {...props} />
        </CollectionContext.Provider>
      ),
    },
    !isAll && {
      icon: "lock_open",
      text: "Lock collection",
      callback: () => Toast.show({ type: "info", text1: "Coming soon" }),
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
    !isAll && { divider: true },
    !isAll && {
      renderer: () => (
        <Text variant="eyebrow" style={{ padding: 10, paddingBottom: 3 }}>
          Labels
        </Text>
      ),
    },
    !isAll && {
      icon: "label",
      text: "Select labels",
      renderer: (props) => (
        <CollectionContext.Provider value={contextValue}>
          <CollectionLabelMenu {...props} />
        </CollectionContext.Provider>
      ),
    },
    !isAll &&
      (type === "grid" || type === "kanban") && {
        icon: "swipe",
        text: "Reorder",
        callback: () => setEditOrderMode(true),
      },
    !isAll && {
      divider: true,
    },
    {
      icon: "sync",
      text: "Refresh",
      callback: async (e) => {
        await handleRefresh(e);
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

  const { sidebarRef } = useSidebarContext();

  const menu = useMemo(
    () =>
      !breakpoints.md && (
        <IconButton
          size={40}
          onPress={() => sidebarRef.current.openDrawer()}
          icon="menu"
        />
      ),
    [sidebarRef, breakpoints.md]
  );

  return editOrderMode ? (
    <NavbarGradient>
      {menu}
      <View
        style={{
          maxWidth: breakpoints.md ? 220 : "100%",
          flexDirection: "row",
          alignItems: "center",
          gap: 13,
          paddingLeft: 10,
          minWidth: 0,
        }}
      >
        <NavbarIcon isAll={isAll} emoji={data.emoji} isLoading={isLoading} />
        <View>
          <NavbarEyebrow name="Reorder labels" />
          <NavbarTitle name={data.name} />
        </View>
      </View>
      <IconButton
        icon="check"
        variant="filled"
        size={40}
        style={{ marginLeft: "auto" }}
        onPress={() => setEditOrderMode(false)}
      />
    </NavbarGradient>
  ) : (
    <>
      <NavbarGradient>
        {menu}
        <MenuPopover
          menuProps={{
            style: {
              marginRight: "auto",
              maxWidth: "100%",
              width: breakpoints.md ? 220 : undefined,
              minWidth: 0,
              flex: breakpoints.md ? undefined : 1,
            },
            rendererProps: { placement: "bottom" },
          }}
          trigger={
            <Pressable
              android_ripple={{ color: theme[5] }}
              style={() => ({
                maxWidth: breakpoints.md ? 220 : "100%",
                flexDirection: "row",
                alignItems: "center",
                gap: 13,
                paddingLeft: 10,
                minWidth: 0,
              })}
            >
              {data?.emoji && (
                <NavbarIcon
                  isAll={isAll}
                  emoji={data.emoji}
                  isLoading={isLoading}
                />
              )}
              <View style={{ minWidth: 0, flexShrink: 1 }}>
                <NavbarEyebrow name={type} />
                {isLoading ? (
                  <View
                    style={{
                      width: 60,
                      height: 17,
                      borderRadius: 999,
                      backgroundColor: theme[4],
                    }}
                  />
                ) : (
                  <NavbarTitle name={data.name || "All tasks"} />
                )}
              </View>
              <Icon size={30} style={{ marginLeft: -5 }}>
                expand_more
              </Icon>
            </Pressable>
          }
          options={options}
        />
        {!isLoading &&
          (type === "planner" || type === "calendar") &&
          breakpoints.md && <AgendaButtons />}
        <View
          style={{
            width: breakpoints.md ? 220 : undefined,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <CollectionContext.Provider value={contextValue}>
            <CollectionSearch />
            {!breakpoints.md && <CollectionShareMenu />}
            {isLoading ? (
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  backgroundColor: theme[4],
                }}
              />
            ) : (
              !isReadOnly && (
                <MenuPopover
                  menuRef={menuRef}
                  closeOnSelect
                  {...(isReadOnly && { menuProps: { opened: false } })}
                  containerStyle={{ width: 230 }}
                  menuProps={{
                    rendererProps: { placement: "bottom" },
                  }}
                  trigger={<IconButton icon="pending" size={40} />}
                  options={(isReadOnly ? [] : collectionMenuOptions) as any}
                />
              )
            )}
            {breakpoints.md && <CollectionShareMenu />}
          </CollectionContext.Provider>
        </View>
      </NavbarGradient>
      {isValidating && (
        <View style={{ marginBottom: -3, zIndex: 999 }}>
          <IndeterminateProgressBar height={3} />
        </View>
      )}
      {(type === "planner" || type === "calendar") && !breakpoints.md && (
        <AgendaButtons />
      )}
    </>
  );
});

export default CollectionNavbar;
