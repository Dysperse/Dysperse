import { SidekickComingSoonModal } from "@/app/(app)/settings/sidekick";
import { IndeterminateProgressBar } from "@/components/IndeterminateProgressBar";
import { COLLECTION_VIEWS } from "@/components/layout/command-palette/list";
import SelectionNavbar from "@/components/layout/SelectionNavbar";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import MenuIcon from "@/components/menuIcon";
import { useSession } from "@/context/AuthProvider";
import { AttachStep, OnboardingContainer } from "@/context/OnboardingProvider";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import IconButton from "@/ui/IconButton";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import dayjs from "dayjs";
import { router, useGlobalSearchParams, usePathname } from "expo-router";
import { openBrowserAsync } from "expo-web-browser";
import { memo, useMemo, useRef } from "react";
import { Platform, View } from "react-native";
import { Menu } from "react-native-popup-menu";
import Toast from "react-native-toast-message";
import useSWR, { useSWRConfig } from "swr";
import { CollectionContext, useCollectionContext } from "../context";
import { useCollectionSidekickContext } from "../sidekickContext";
import { AgendaButtons } from "./AgendaButtons";
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
    const type = details.type || details.category;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(view);
    return acc;
  },
  {}
);

function CollectionSidekick() {
  const { session } = useUser();
  const { panelRef } = useCollectionSidekickContext();

  return session.user?.betaTester ? (
    <IconButton
      icon="raven"
      size={40}
      onPress={() => panelRef.current?.toggle()}
    />
  ) : (
    <SidekickComingSoonModal>
      <IconButton size={40} icon="raven" />
    </SidekickComingSoonModal>
  );
}

const CollectionNavbar = memo(function CollectionNavbar({
  isLoading,
}: CollectionNavbarProps) {
  const { session } = useSession();
  const { session: userSession } = useUser();
  const { data, access, type, swrKey, ...ctx } = useCollectionContext();
  const isReadOnly = access?.access === "READ_ONLY" || (!access && !session);
  const breakpoints = useResponsiveBreakpoints();
  const { id, days, fullscreen, tab, showAs } = useGlobalSearchParams();
  const menuRef = useRef<Menu>(null);
  const pathname = usePathname();
  const shareMenuRef = useRef(null);

  const { mutate: mutateGlobal } = useSWRConfig();

  const isAll = id === "all";
  const contextValue = { data, swrKey, type, ...ctx, access: null };

  const handleRefresh = async (e) => {
    e?.preventDefault?.();
    await mutateGlobal(() => true);
  };

  const openPopOut = async () => {
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
    ["p", "y", "k", "s", "g", "w", "l", "m", "c", "a"],
    (e) => {
      e.preventDefault();
      if (!pathname.includes("search"))
        router.setParams({
          type: Object.keys(COLLECTION_VIEWS).find((v) =>
            v === "skyline"
              ? e.key === "y"
              : v === "map"
              ? e.key === "a"
              : v[0].toLowerCase() === e.key
          ),
        });
    },
    {
      ignoreEventWhen: () =>
        document.querySelectorAll('[aria-modal="true"]').length > 0,
    }
  );

  const collectionMenuOptions = [
    ...(type === "planner" && userSession.user.betaTester
      ? [
          {
            id: "render",
            renderer: () => (
              <Text
                variant="eyebrow"
                style={{ paddingHorizontal: 10, marginTop: 5 }}
              >
                Show as
              </Text>
            ),
          },
          {
            text: "List",
            id: "planner",
            callback: () => router.setParams({ showAs: null }),
            selected: !showAs || showAs === "list",
          },
          {
            text: "Schedule",
            id: "planner",
            callback: () => router.setParams({ showAs: "schedule" }),
            selected: showAs === "schedule",
          },
          { key: "1", id: "divider", divider: true },
          {
            id: "text",
            renderer: () => (
              <Text
                variant="eyebrow"
                style={{ paddingHorizontal: 10, marginTop: 5 }}
              >
                View
              </Text>
            ),
          },
        ]
      : []),
    ...(type === "planner" && userSession.user.betaTester
      ? [
          {
            text: "2 days",
            id: "2",
            callback: () => router.setParams({ days: 2 }),
          },
          {
            text: "3 days",
            id: "3",
            callback: () => router.setParams({ days: 3 }),
          },
          {
            text: "Week",
            id: "7",
            callback: () => router.setParams({ days: null }),
          },
        ].map((e) => ({
          ...e,
          selected: e.text && e.id.toString() === (days || 7)?.toString(),
        }))
      : []),
    ...(type === "planner" && userSession.user.betaTester
      ? [{ key: 2, divider: true }]
      : []),
    session &&
      !isAll && {
        icon: "edit",
        text: "Edit",
        callback: () => router.push(pathname + "/customize"),
      },
    session &&
      userSession.user.betaTester &&
      !isReadOnly && {
        icon: "upload",
        text: "Import tasks",
        callback: () => router.push(pathname + "/upload"),
      },
    session &&
      !isReadOnly && {
        icon: "printer",
        text: "Print",
        callback: () =>
          Toast.show({
            type: "info",
            text1: "oh, look at you...",
            text2: "you found a secret feature that's coming soon. stay tuned!",
          }),
      },
    Platform.OS === "web" &&
      !fullscreen &&
      breakpoints.md && {
        icon: "pin_invoke",
        text: "Pop out",
        callback: openPopOut,
      },

    !breakpoints.md &&
      !isAll && {
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

  const { sidebarRef, desktopCollapsed } = useSidebarContext();

  const menu = useMemo(
    () =>
      (!breakpoints.md || desktopCollapsed) && (
        <IconButton
          size={40}
          onPress={() => sidebarRef.current.openDrawer()}
          icon={<MenuIcon />}
        />
      ),
    [sidebarRef, breakpoints.md, desktopCollapsed]
  );

  return (
    <OnboardingContainer
      id="COLLECTION"
      onlyIf={() => type !== "matrix" && pathname.includes("collections")}
      delay={500}
      steps={
        [
          {
            text: "Tap here to switch between views",
          },
          {
            text:
              Platform.OS === "web"
                ? "Find the tasks you need by hitting ⌘ F"
                : "Search for tasks and narrow results down with filters",
          },
          {
            text: breakpoints.md
              ? "Edit, print, and import tasks to your collection"
              : "Edit, print, and share your collection with others",
          },
          id !== "all" &&
            breakpoints.md && {
              text: "Share or publish your collection as a template",
            },
        ].filter(Boolean) as any
      }
    >
      {() => (
        <>
          <SelectionNavbar />
          <NavbarGradient>
            {!fullscreen && menu}
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
              breakpoints.md && (
                <AgendaButtons
                  weekMode={type === "planner"}
                  monthMode={type === "calendar"}
                />
              )}
            <View
              style={{
                width: breakpoints.md ? 220 : undefined,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              {/* {!isLoading && COLLECTION_VIEWS[type].type === "Category Based" && (
              <CategoryLabelButtons />
            )} */}
              <CollectionContext.Provider value={contextValue}>
                <CollectionSidekick />
                {session && (
                  <AttachStep index={1}>
                    <CollectionSearch />
                  </AttachStep>
                )}
                {!isLoading && !isReadOnly && (
                  <AttachStep index={2}>
                    <View
                      style={breakpoints.md && !isAll && { marginRight: 10 }}
                    >
                      <MenuPopover
                        menuRef={menuRef}
                        closeOnSelect
                        {...(isReadOnly && { menuProps: { opened: false } })}
                        containerStyle={{
                          width: 175,
                          marginLeft: isAll ? -10 : 0,
                        }}
                        menuProps={{
                          rendererProps: { placement: "bottom" },
                        }}
                        trigger={<IconButton icon="pending" size={40} />}
                        options={
                          (isReadOnly ? [] : collectionMenuOptions) as any
                        }
                      />
                    </View>
                  </AttachStep>
                )}
                {breakpoints.md && session && !isReadOnly && !isAll && (
                  <AttachStep index={3}>
                    <View>
                      <CollectionShareMenu ref={shareMenuRef} />
                    </View>
                  </AttachStep>
                )}
              </CollectionContext.Provider>
            </View>
          </NavbarGradient>
          <LoadingIndicator />
        </>
      )}
    </OnboardingContainer>
  );
});

export default CollectionNavbar;

