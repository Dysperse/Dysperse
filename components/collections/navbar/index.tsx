import { IndeterminateProgressBar } from "@/components/IndeterminateProgressBar";
import { COLLECTION_VIEWS } from "@/components/layout/command-palette/list";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import IconButton from "@/ui/IconButton";
import MenuPopover from "@/ui/MenuPopover";
import dayjs from "dayjs";
import { router, useGlobalSearchParams, usePathname } from "expo-router";
import { openBrowserAsync } from "expo-web-browser";
import { memo, useMemo, useRef } from "react";
import { Platform, View } from "react-native";
import { Menu } from "react-native-popup-menu";
import useSWR from "swr";
import { CollectionContext, useCollectionContext } from "../context";
import { AgendaButtons } from "./AgendaButtons";
import { CategoryLabelButtons } from "./CategoryLabelButtons";
import { CollectionSearch } from "./CollectionSearch";
import { CollectionShareMenu } from "./CollectionShareMenu";
import { NavbarGradient } from "./NavbarGradient";
import { ViewPicker } from "./ViewPicker";

interface CollectionNavbarProps {
  isLoading?: boolean;
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
    router.replace("/home");
  };

  const handleLock = async () => {
    ctx.mutate(
      (o) => ({
        ...o,
        pinAuthorizationExpiresAt: dayjs().subtract(1, "year").toISOString(),
      }),
      { revalidate: false }
    );

    await sendApiRequest(
      session,
      "PUT",
      "space/collections",
      {},
      {
        body: JSON.stringify({
          id: data.id,
          pinAuthorizationExpiresAt: true,
        }),
      }
    );
  };

  useHotkeys(["ctrl+d"], (e) => {
    if (id === "all") return;
    e.preventDefault();
    router.navigate({
      pathname: "[tab]/collections/[id]/[view]/customize",
      params: { id, tab, view: type },
    });
  });
  useHotkeys(["ctrl+l", "ctrl+shift+l"], (e) => {
    if (id === "all") return;
    e.preventDefault();
    if (!data?.pinCode) return;
    handleLock();
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
        ].map((e) => ({
          ...e,
          selected: e.text && e.id === mode,
        }))
      : []),
    !isAll &&
      session && {
        icon: "edit",
        text: "Edit",
        callback: () => router.push(pathname + "/customize"),
      },
    Platform.OS === "web" &&
      !fullscreen &&
      breakpoints.md && {
        icon: "pin_invoke",
        text: "Pop out",
        callback: openPopOut,
      },

    !isAll &&
      !breakpoints.md && {
        icon: "ios_share",
        text: "Share",
        callback: () => router.push(pathname + "/share"),
      },

    data?.pinCode && {
      icon: "lock",
      text: "Lock now",
      callback: handleLock,
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
            (type === "planner" || type === "skyline" || type === "calendar") &&
            breakpoints.md && <AgendaButtons weekMode={type === "planner"} />}
          <View
            style={{
              width: breakpoints.md ? 220 : undefined,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            {!isLoading && COLLECTION_VIEWS[type].type === "Category Based" && (
              <CategoryLabelButtons />
            )}
            <CollectionContext.Provider value={contextValue}>
              {session && <CollectionSearch />}
              {!isLoading && !isReadOnly && !(!breakpoints.md && isAll) && (
                <MenuPopover
                  menuRef={menuRef}
                  closeOnSelect
                  {...(isReadOnly && { menuProps: { opened: false } })}
                  containerStyle={{ width: 175, marginLeft: isAll ? -10 : 0 }}
                  menuProps={{
                    rendererProps: { placement: "bottom" },
                  }}
                  trigger={
                    <IconButton
                      icon="settings"
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
    </>
  );
});

export default CollectionNavbar;

