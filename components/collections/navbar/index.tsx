import { IndeterminateProgressBar } from "@/components/IndeterminateProgressBar";
import { COLLECTION_VIEWS } from "@/components/layout/command-palette/list";
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
import { router, useGlobalSearchParams, usePathname } from "expo-router";
import { openBrowserAsync } from "expo-web-browser";
import { memo, useMemo, useRef } from "react";
import { Platform, View } from "react-native";
import { Menu } from "react-native-popup-menu";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { CollectionContext, useCollectionContext } from "../context";
import { AgendaButtons } from "./AgendaButtons";
import { CollectionSearch } from "./CollectionSearch";
import { CollectionShareMenu } from "./CollectionShareMenu";
import { NavbarEyebrow } from "./NavbarEyebrow";
import { NavbarGradient } from "./NavbarGradient";
import { NavbarIcon } from "./NavbarIcon";
import { NavbarTitle } from "./NavbarTitle";
import { ViewPicker } from "./ViewPicker";

interface CollectionNavbarProps {
  isLoading?: boolean;
  editOrderMode: boolean;
  setEditOrderMode: (value: boolean) => void;
}

const LoadingIndicator = () => {
  const { swrKey } = useCollectionContext();
  const { isValidating } = useSWR(swrKey);

  return (
    isValidating && (
      <View style={{ marginBottom: -3, zIndex: 999 }}>
        <IndeterminateProgressBar height={3} />
      </View>
    )
  );
};

// Group by type
export const groupedViews = Object.entries(COLLECTION_VIEWS).reduce(
  (acc, [view, details]) => {
    const type = details.type || details.category; // Use type or fallback to category
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(view);
    return acc;
  },
  {}
);

const CollectionNavbar = memo(function CollectionNavbar({
  isLoading,
  editOrderMode,
  setEditOrderMode,
}: CollectionNavbarProps) {
  const { session } = useSession();
  const { data, access, type, swrKey, openLabelPicker, ...ctx } =
    useCollectionContext();
  const isReadOnly = access?.access === "READ_ONLY" || (!access && !session);
  const breakpoints = useResponsiveBreakpoints();
  const { id, mode, fullscreen, tab } = useGlobalSearchParams();
  const menuRef = useRef<Menu>(null);
  const pathname = usePathname();
  const shareMenuRef = useRef(null);

  const isAll = id === "all";
  const contextValue = { data, swrKey, type, ...ctx, access: null };

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

  const openPopOut = async (e) => {
    if (fullscreen) return;
    const t = new URL(window.location.href);
    t.searchParams.set("fullscreen", "true");
    await openBrowserAsync(t.toString(), {
      windowFeatures: { width: 800, height: 600 },
    });
    router.replace("/");
  };

  useHotkeys(["ctrl+d"], (e) => {
    if (id === "all") return;
    e.preventDefault();
    router.navigate({
      pathname: "[tab]/collections/[id]/[view]/customize",
      params: { id, tab, view: type },
    });
  });
  useHotkeys(["ctrl+r"], handleRefresh);
  useHotkeys(["o"], openPopOut);

  useHotkeys(
    ["p", "y", "k", "s", "g", "w", "l", "m", "c"],
    (e) => {
      router.setParams({
        type: Object.keys(COLLECTION_VIEWS).find((v) =>
          v === "skyline" ? e.key === "y" : v[0].toLowerCase() === e.key
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
    !isAll &&
      session && {
        renderer: () => (
          <Text variant="eyebrow" style={{ padding: 10, paddingBottom: 3 }}>
            Collection
          </Text>
        ),
      },
    !isAll &&
      session &&
      process.env.NODE_ENV === "development" && {
        icon: "lock_open",
        text: "Lock",
        callback: () => Toast.show({ type: "info", text1: "Coming soon" }),
      },
    !isAll &&
      session && {
        icon: "edit",
        text: "Edit",
        callback: () => router.push(pathname + "/customize"),
      },
    !isAll &&
      session && {
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
    !isAll && session && { divider: true },
    !isAll &&
      session && {
        renderer: () => (
          <Text variant="eyebrow" style={{ padding: 10, paddingBottom: 3 }}>
            Labels
          </Text>
        ),
      },
    !isAll &&
      session && {
        icon: "label",
        text: "Select labels",
        callback: openLabelPicker,
      },
    !isAll &&
      session &&
      (type === "grid" || type === "kanban") && {
        icon: "swipe",
        text: "Reorder",
        callback: () => setEditOrderMode(true),
      },
    !isAll &&
      session && {
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

    Platform.OS === "web" &&
      !fullscreen &&
      breakpoints.md && {
        icon: "pin_invoke",
        text: "Pop out",
        callback: openPopOut,
      },
    // {
    //   icon: "fluorescent",
    //   text: "Customize task chips",
    //   callback: () => Toast.show({ type: "info", text1: "Coming soon" }),
    // },
    session && {
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
              {data.showCompleted ? "Show" : "Hide"} completed
            </Text>
            {data.showCompleted && (
              <Icon style={{ marginLeft: "auto" }}>check</Icon>
            )}
          </MenuItem>
        </ConfirmationModal>
      ),
    },
  ]
    .flat()
    .filter((e) => e);

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

  return (
    <>
      {editOrderMode ? (
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
            <NavbarIcon
              isAll={isAll}
              emoji={data.emoji}
              isLoading={isLoading}
            />
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
            <View
              style={{
                marginRight: "auto",
                maxWidth: "100%",
                width: breakpoints.md ? 220 : undefined,
                minWidth: 0,
                flex: breakpoints.md ? undefined : 1,
              }}
            >
              <ViewPicker isLoading={isLoading} />
            </View>
            {!isLoading &&
              (type === "planner" ||
                type === "skyline" ||
                type === "calendar") &&
              breakpoints.md && <AgendaButtons weekMode={type === "planner"} />}
            <View
              style={{
                width: breakpoints.md ? 220 : undefined,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <CollectionContext.Provider value={contextValue}>
                {session && <CollectionSearch />}
                {!breakpoints.md && session && !isReadOnly && (
                  <CollectionShareMenu ref={shareMenuRef} />
                )}
                {!isLoading && !isReadOnly && (
                  <MenuPopover
                    menuRef={menuRef}
                    closeOnSelect
                    {...(isReadOnly && { menuProps: { opened: false } })}
                    containerStyle={{ width: 240 }}
                    menuProps={{
                      rendererProps: { placement: "bottom" },
                    }}
                    trigger={
                      <IconButton
                        icon="pending"
                        size={40}
                        style={breakpoints.md && !isAll && { marginRight: 10 }}
                      />
                    }
                    options={(isReadOnly ? [] : collectionMenuOptions) as any}
                  />
                )}
                {breakpoints.md && session && !isReadOnly && (
                  <CollectionShareMenu ref={shareMenuRef} />
                )}
              </CollectionContext.Provider>
            </View>
          </NavbarGradient>
          <LoadingIndicator />
        </>
      )}
    </>
  );
});

export default CollectionNavbar;

