import { MenuButton } from "@/app/(app)/home";
import {
  CollectionContext,
  CollectionType,
  useCollectionContext,
} from "@/components/collections/context";
import CollectionNavbar from "@/components/collections/navbar";
import { CollectionLabelMenu } from "@/components/collections/navbar/CollectionLabelMenu";
import { CollectionSidekickContext } from "@/components/collections/sidekickContext";
import Calendar from "@/components/collections/views/calendar";
import Grid from "@/components/collections/views/grid";
import Kanban from "@/components/collections/views/kanban";
import List from "@/components/collections/views/list";
import MapView from "@/components/collections/views/map";
import Matrix from "@/components/collections/views/matrix";
import Planner from "@/components/collections/views/planner";
import Skyline from "@/components/collections/views/skyline";
import Stream from "@/components/collections/views/stream";
import Workload from "@/components/collections/views/workload";
import { COLLECTION_VIEWS } from "@/components/layout/command-palette/list";
import ContentWrapper from "@/components/layout/content";
import { FadeOnRender } from "@/components/layout/FadeOnRender";
import WindowTitle from "@/components/layout/WindowTitle";
import CreateTask from "@/components/task/create";
import { useSession } from "@/context/AuthProvider";
import { SelectionContextProvider } from "@/context/SelectionContext";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import { useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import OtpInput from "@/ui/OtpInput";
import CircularSkeleton from "@/ui/Skeleton/circular";
import LinearSkeleton, { LinearSkeletonArray } from "@/ui/Skeleton/linear";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useDidUpdate } from "@/utils/useDidUpdate";
import dayjs from "dayjs";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  AppState,
  InteractionManager,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { mutations } from "../../mutations";
import { Sidekick } from "./Sidekick";

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    paddingBottom: 10,
    gap: 10,
    marginTop: -15,
  },
});

const Loading = ({ isPublic }: any) => {
  let content;
  const insets = useSafeAreaInsets();
  const breakpoints = useResponsiveBreakpoints();
  const { type } = useLocalSearchParams();
  switch ((type || (isPublic ? "kanban" : null)) as CollectionType) {
    case "planner":
    case "skyline":
    case "workload":
    case "kanban":
      content = (
        <>
          {[...new Array(5)].map((_, i) => (
            <LinearSkeleton width={320} height="100%" key={i} />
          ))}
        </>
      );
      break;

    case "grid":
    case "matrix":
      content = (
        <>
          {[...new Array(5)].map((_, i) => (
            <View style={{ flexDirection: "column", gap: 10 }} key={i}>
              <View style={{ flex: 1 }}>
                <LinearSkeleton height="100%" width={400} />
              </View>
              <View style={{ flex: 1 }}>
                <LinearSkeleton height="100%" width={400} />
              </View>
            </View>
          ))}
        </>
      );
      break;

    case "stream":
      content = (
        <View style={{ flex: 1, flexDirection: "row" }}>
          <View
            style={{
              padding: 25,
              paddingTop: 22,
              width: 320,
              gap: 10,
            }}
          >
            <LinearSkeleton width="100%" height={50} />
            <LinearSkeleton width="100%" height={70} />

            <LinearSkeletonArray
              height={33}
              widths={["100%", "100%", "100%", "100%", "100%"]}
            />
          </View>
          <View style={{ flex: 1, gap: 20, paddingTop: 25, maxWidth: 500 }}>
            <LinearSkeletonArray
              height={10}
              animateWidth
              widths={[20, 39, 51, 42, 63, 79, 41]}
            />
          </View>
        </View>
      );
      break;
    case "list":
      content = (
        <View
          style={{
            flex: 1,
            gap: 10,
            alignItems: "center",
            paddingTop: 25,
            marginHorizontal: "auto",
          }}
        >
          <View style={{ gap: 10, maxWidth: 500, width: "100%" }}>
            <LinearSkeletonArray
              height={50}
              widths={["100%", "100%", "100%", "100%", "100%"]}
            />
          </View>
        </View>
      );
      break;
    case "calendar":
      content = (
        <View
          style={{
            flex: 1,
            gap: 10,
            height: "100%",
          }}
        >
          {[...new Array(5)].map((_, i) => (
            <View style={{ gap: 10, flexDirection: "row", flex: 1 }} key={i}>
              {["100%", "100%", "100%", "100%", "100%", "100%", "100%"].map(
                (width, j) => (
                  <View key={j} style={{ flex: 1 }}>
                    <LinearSkeleton
                      width={width}
                      height={"100%"}
                      style={{ flex: 1 }}
                    />
                  </View>
                )
              )}
            </View>
          ))}
        </View>
      );
      break;
    case "map":
      content = (
        <View style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              gap: 10,
              height: "100%",
              flexDirection: "row",
            }}
          >
            <View style={{ gap: 10, flex: 2 }}>
              <LinearSkeletonArray
                height={50}
                widths={["75%", "70%", "80%", "48%", "20%", "84%", "68%"]}
              />
            </View>
            <View style={{ flex: 3 }}>
              <LinearSkeleton height={"100%"} width={"100%"} />
            </View>
          </View>
        </View>
      );
      break;
    default:
      content = <Text>404: {type}</Text>;
      break;
  }

  return (
    <>
      <View
        style={{
          flex: 1,
          padding: 10,
          paddingTop: breakpoints.md ? 10 : insets.top + 10,
        }}
      >
        {/* Navbar */}
        <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
          <View
            style={{ paddingLeft: 7, flexDirection: "row", gap: 12, flex: 1 }}
          >
            <CircularSkeleton size={34} />
            <View style={{ gap: 5 }}>
              <LinearSkeleton width={55} height={10} />
              <LinearSkeleton width={170} height={17} />
            </View>
          </View>
          <CircularSkeleton size={34} />
          <CircularSkeleton size={34} />
          {breakpoints.md && <CircularSkeleton size={34} />}
          {breakpoints.md && <CircularSkeleton size={34} />}
          {breakpoints.md && <LinearSkeleton width={100} height={43} />}
        </View>

        {/* Columns */}
        <View
          style={{
            flexDirection: "row",
            flex: 1,
            padding: 5,
            paddingTop: 25,
            gap: 10,
          }}
        >
          {content}
        </View>
      </View>
    </>
  );
};

function ResetPin({ handleClose }: any) {
  const { session } = useSession();
  const { data, mutate } = useCollectionContext();
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const t = await sendApiRequest(
        session,
        "POST",
        "space/collections/collection/reset-pin",
        {},
        {
          body: JSON.stringify({
            id: data.id,
            password,
          }),
        }
      );
      if (t?.error) {
        Toast.show({ type: "error" });
        throw new Error(t.error);
      } else {
        Toast.show({
          type: "info",
          text1: "Pin code for this collection has been removed",
        });
      }
      await mutate();
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TextField
        variant="filled+outlined"
        placeholder="Password"
        secureTextEntry
        inputRef={inputRef}
        style={{
          height: 60,
          borderRadius: 999,
          fontSize: 20,
          paddingHorizontal: 25,
          textAlign: "center",
        }}
        autoFocus
        editable={!loading}
        onChangeText={setPassword}
        value={password}
        weight={700}
        onKeyPress={({ nativeEvent }) => {
          if (nativeEvent.key === "Escape") handleClose();
        }}
        onSubmitEditing={handleSubmit}
      />
      <View
        style={{
          flexDirection: "row",
          gap: 10,
        }}
      >
        <Button
          text="Cancel"
          variant="outlined"
          large
          height={60}
          containerStyle={{ flex: 1 }}
          onPress={handleClose}
        />
        <Button
          text="Unlock"
          variant="filled"
          large
          containerStyle={{ flex: 1, opacity: password ? 1 : 0.5 }}
          bold
          height={60}
          isLoading={loading}
          icon="arrow_forward_ios"
          iconPosition="end"
          disabled={!password}
          onPress={handleSubmit}
        />
      </View>
    </>
  );
}

function PasswordPrompt({ mutate }) {
  const breakpoints = useResponsiveBreakpoints();
  const { data } = useCollectionContext();
  const ref = useRef(null);
  const theme = useColorTheme();
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const { session } = useSession();
  const insets = useSafeAreaInsets();

  const [view, setView] = useState<"unlock" | "reset">("unlock");

  useEffect(() => {
    if (!breakpoints.md)
      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => ref.current?.focus(), 100);
      });
    else ref.current?.focus();
  }, [breakpoints]);

  const handleSubmit = async (defaultCode) => {
    setLoading(true);
    try {
      const t = await sendApiRequest(
        session,
        "POST",
        "space/collections/collection/unlock",
        {},
        {
          body: JSON.stringify({
            id: data.id,
            pinCode: defaultCode || code,
          }),
        }
      );
      if (t.error) {
        throw new Error("invalid");
      }
      await mutate();
    } catch (e) {
      setLoading(false);
      ref.current?.clear();
      shake();
      ref.current?.focus();
      if (e.message !== "invalid") Toast.show({ type: "error" });
      console.log(e);
    }
  };

  const errorAnimation = useSharedValue(0);
  // ios shake animation

  const shake = () => {
    errorAnimation.value = withSequence(
      withTiming(-10, { duration: 100 }),
      withTiming(10, { duration: 100 }),
      withTiming(-10, { duration: 100 }),
      withTiming(10, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );
  };

  const errorAnimationStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: errorAnimation.value }],
  }));

  return (
    <View
      style={{
        flex: 1,
        position: "relative",
      }}
    >
      <MenuButton addInsets gradient />
      <KeyboardAvoidingView
        behavior="padding"
        style={{
          flex: 1,
          padding: 40,
          maxWidth: 500,
          marginHorizontal: "auto",
        }}
      >
        <FadeOnRender
          animateUp
          style={{
            justifyContent: "center",
            gap: breakpoints.md ? 20 : 10,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: breakpoints.md ? 35 : 30,
                fontFamily: breakpoints.md ? "serifText800" : "serifText700",
                textAlign: "center",
                color: theme[11],
                marginBottom: 5,
              }}
            >
              {view === "unlock" ? "Password required" : "Reset your password"}
            </Text>
            <Text
              style={{
                color: theme[11],
                fontSize: breakpoints.md ? 18 : 16,
                textAlign: "center",
                marginBottom: breakpoints.md ? 0 : 5,
              }}
              weight={breakpoints.md ? 300 : 500}
            >
              {
                {
                  unlock: "Enter the PIN code to unlock this collection",
                  reset: "Enter your account password to continue",
                }[view]
              }
            </Text>
          </View>
          {view === "reset" ? (
            <ResetPin handleClose={() => setView("unlock")} />
          ) : (
            <>
              <Animated.View style={errorAnimationStyle}>
                <OtpInput
                  ref={ref}
                  textInputProps={{ autoComplete: "off" }}
                  secureTextEntry
                  numberOfDigits={6}
                  blurOnFilled
                  containerGap={5}
                  onTextChange={setCode}
                  onFilled={(t) => handleSubmit(t)}
                />
              </Animated.View>
              <View style={{ flexDirection: "row", marginTop: 10, gap: 10 }}>
                <Button
                  large
                  variant="outlined"
                  text="Forgot?"
                  containerStyle={{ flex: 1 }}
                  onPress={() => setView("reset")}
                />
                <Button
                  isLoading={loading}
                  text="Unlock"
                  variant="filled"
                  large
                  iconPosition="end"
                  icon="arrow_forward_ios"
                  bold
                  onPress={handleSubmit}
                  containerStyle={{ flex: 1 }}
                />
              </View>
            </>
          )}
        </FadeOnRender>
      </KeyboardAvoidingView>
    </View>
  );
}

function TaskShortcutCreation() {
  const createTaskRef = useRef(null);
  const { data, mutate } = useCollectionContext();
  const { type } = useLocalSearchParams();

  useHotkeys("space", (e) => {
    e.preventDefault();
    createTaskRef.current?.present();
  });

  return (
    <CreateTask
      ref={createTaskRef}
      mutate={mutations.categoryBased.add(mutate)}
      defaultValues={{
        collectionId: data?.id,
        ...(COLLECTION_VIEWS[type]?.type === "Time Based" && {
          date: dayjs().startOf("day"),
        }),
      }}
    />
  );
}

function NativeProtection() {
  const [showProtection, setShowProtection] = useState(false);
  const isDark = useDarkMode();

  useEffect(() => {
    AppState.addEventListener("change", (state) => {
      if (state === "active") {
        setShowProtection(false);
      } else {
        setShowProtection(true);
      }
    });
  }, []);

  return (
    <BlurView
      tint={isDark ? "dark" : "light"}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        display: showProtection ? "flex" : "none",
      }}
    />
  );
}

function Protection() {
  const isDark = useDarkMode();
  const [showProtection, setShowProtection] = useState(false);

  useEffect(() => {
    const update = () => {
      const isInactive = document.hidden || !document.hasFocus();
      setShowProtection(isInactive);
    };

    update();

    window.addEventListener("focus", update);
    window.addEventListener("blur", update);
    document.addEventListener("visibilitychange", update);

    return () => {
      window.removeEventListener("focus", update);
      window.removeEventListener("blur", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <BlurView
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        display: showProtection ? "flex" : "none",
        borderRadius: 20,
        overflow: "hidden",
      }}
      intensity={50}
      tint={isDark ? "dark" : "light"}
    />
  );
}

export default function Page({ isPublic }: { isPublic: boolean }) {
  const { id, type }: any = useLocalSearchParams();
  const sheetRef = useRef(null);
  const breakpoints = useResponsiveBreakpoints();

  const swrKey = id
    ? [
        "space/collections/collection",
        id === "all"
          ? { all: "true", id: "??" }
          : { id, isPublic: isPublic ? "true" : "false" },
      ]
    : null;
  const { data, mutate, error } = useSWR(swrKey);

  useEffect(() => {
    if (!type && isPublic) {
      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => router.setParams({ type: "kanban" }), 200);
      });
    }
  }, [isPublic, type]);

  let content = null;
  switch ((type || (isPublic ? "kanban" : null)) as CollectionType) {
    case "planner":
      content = <Planner />;
      break;
    case "kanban":
      content = <Kanban />;
      break;
    case "stream":
      content = <Stream />;
      break;
    case "grid":
      content = <Grid />;
      break;
    case "workload":
      content = <Workload />;
      break;
    case "list":
      content = <List />;
      break;
    case "matrix":
      content = <Matrix />;
      break;
    case "calendar":
      content = <Calendar />;
      break;
    case "skyline":
      content = <Skyline />;
      break;

    case "map":
      content = <MapView />;
      break;
    default:
      content = <Text>404: {type}</Text>;
      break;
  }

  const collectionContextValue = {
    data,
    mutate,
    error,
    type,
    access: data?.access,
    swrKey,
    isPublic,
    openLabelPicker: () => sheetRef.current?.present(),
  };

  const pathname = usePathname();

  useDidUpdate(() => {
    mutate();
  }, [pathname]);

  const panelRef = useRef(null);
  const collectionSidekickContextValue = { panelRef };

  return (
    <SelectionContextProvider>
      <CollectionContext.Provider value={collectionContextValue}>
        <CollectionSidekickContext.Provider
          value={collectionSidekickContextValue}
        >
          <View style={{ flex: 1, flexDirection: "row" }}>
            <ContentWrapper noPaddingTop>
              <CollectionLabelMenu sheetRef={sheetRef}>
                <Pressable />
              </CollectionLabelMenu>
              <TaskShortcutCreation />
              {data && <WindowTitle title={data?.name || "All tasks"} />}
              {data?.pinCode && Platform.OS === "web" && <Protection />}
              {data?.pinCode && Platform.OS !== "web" && <NativeProtection />}
              {(data ? (
                (data.pinCode || data.pinCodeError) &&
                (!data.pinAuthorizationExpiresAt ||
                  dayjs(data.pinAuthorizationExpiresAt).isBefore(dayjs())) ? (
                  <PasswordPrompt mutate={mutate} />
                ) : !data?.error ? (
                  <>
                    <CollectionNavbar />
                    {breakpoints.md ? (
                      <FadeOnRender>{content}</FadeOnRender>
                    ) : (
                      content
                    )}
                  </>
                ) : (
                  false
                )
              ) : (
                false
              )) || (
                <Loading isPublic={isPublic} error={error || data?.error} />
              )}
            </ContentWrapper>
            <Sidekick />
          </View>
        </CollectionSidekickContext.Provider>
      </CollectionContext.Provider>
    </SelectionContextProvider>
  );
}

