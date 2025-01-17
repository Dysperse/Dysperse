import {
  CollectionContext,
  useCollectionContext,
} from "@/components/collections/context";
import {
  CollectionSidekickContext,
  useCollectionSidekickContext,
} from "@/components/collections/sidekickContext";
import ContentWrapper from "@/components/layout/content";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import AutoSizeTextArea from "@/ui/AutoSizeTextArea";
import BottomSheet from "@/ui/BottomSheet";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import SkeletonContainer from "@/ui/Skeleton/container";
import { LinearSkeletonArray } from "@/ui/Skeleton/linear";
import Text from "@/ui/Text";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { useImperativeHandle, useRef, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useSWR from "swr";

function MessageBar({
  onRetry,
  messageState,
  messageRef,
  placeholder = "Type a message...",
}: {
  onRetry?: any;
  messageState;
  messageRef;
  placeholder?: string;
}) {
  const theme = useColorTheme();
  const [value, setValue] = useState("");
  const { panelRef } = useCollectionSidekickContext();
  const [message, setMessage] = messageState;
  const breakpoints = useResponsiveBreakpoints();

  const handleKeyPress = ({ nativeEvent }) => {
    if (nativeEvent.key === "Enter" && !nativeEvent.shiftKey) {
      nativeEvent.preventDefault();
      setMessage(value);
    }
    if (nativeEvent.key === "Escape") {
      panelRef.current.close();
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 10,
      }}
    >
      <View
        style={{
          alignItems: "center",
          paddingRight: 10,
          borderRadius: 35,
          flexDirection: "row",
          flex: 1,
          paddingHorizontal: onRetry && !value ? 10 : 20,
          gap: 10,
          backgroundColor: theme[3],
        }}
      >
        {typeof onRetry !== "undefined" && !value && (
          <IconButton onPress={onRetry} variant="filled" icon="loop" />
        )}
        <AutoSizeTextArea
          multiline
          ref={messageRef}
          placeholder="Type a message..."
          numberOfLines={1}
          style={{
            flex: 1,
            paddingVertical: 20,
            height: "100%",
            shadowRadius: 0,
            color: theme[11],
            fontFamily: "body_400",
          }}
          value={value}
          onChangeText={setValue}
          onKeyPress={handleKeyPress}
        />
        <IconButton
          icon={breakpoints.md ? "east" : "north"}
          disabled={!value}
          size={35}
          backgroundColors={{
            default: theme[value ? 10 : 6],
            hovered: theme[value ? 11 : 6],
            pressed: theme[value ? 12 : 6],
          }}
          onPress={() => {
            setMessage(value);
            setValue("");
          }}
          iconProps={{ bold: true, size: 17 }}
          iconStyle={value && { color: theme[1] }}
        />
      </View>
    </View>
  );
}

function MessageHeader() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { data } = useCollectionContext();

  return (
    <View
      style={{ alignItems: breakpoints?.md ? undefined : "center", gap: 10 }}
    >
      <View
        style={{
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
          opacity: 0.5,
        }}
      >
        <Icon size={breakpoints.md ? 40 : 55}>raven</Icon>
        <Text
          style={{
            color: theme[11],
            fontSize: breakpoints.md ? 20 : 30,
            textAlign: "center",
            fontFamily: "serifText700",
          }}
        >
          {data?.name ? `How can I help\nwith "${data?.name}"?` : "Sidekick"}
        </Text>
      </View>
      <Button
        height={50}
        large
        icon="low_priority"
        text="Help me prioritize"
        variant="outlined"
      />
      <Button
        height={50}
        large
        icon="sports_martial_arts"
        text="Divide & conquer"
        variant="outlined"
      />
      <Button
        height={50}
        large
        icon="kid_star"
        text="Simplify tasks"
        variant="outlined"
      />
    </View>
  );
}

function FilterChips({ filters }) {
  const theme = useColorTheme();

  return (
    <View
      style={{
        gap: 5,
        marginBottom: 15,
        marginTop: 5,
      }}
    >
      {filters.map((filter) => (
        <View key={filter} style={{ flexDirection: "row", gap: 5 }}>
          <Icon size={17} style={{ flexShrink: 0 }}>
            {filter.icon}
          </Icon>
          <Text style={{ color: theme[11], fontSize: 13 }}>{filter.text}</Text>
        </View>
      ))}
    </View>
  );
}

function CollectionQuestionAnser({ message, messageRef, messageState }) {
  const { data: collectionData } = useCollectionContext();
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();

  const { data, mutate, error, isLoading, isValidating } = useSWR(
    !message
      ? null
      : [
          "ai/collection-chat",
          {},
          process.env.EXPO_PUBLIC_API_URL,
          {
            method: "POST",
            body: JSON.stringify({
              id: collectionData?.id,
              prompt: message,
            }),
          },
        ],
    {
      revalidateOnFocus: false,
    }
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 20, paddingBottom: 0, zIndex: 999 }}>
        <IconButton
          variant={breakpoints.md ? "filled" : undefined}
          icon={breakpoints.md ? "close" : "arrow_back_ios_new"}
          onPress={() => messageState[1]("")}
        />
        <LinearGradient
          colors={[theme[breakpoints.md ? 1 : 2], "transparent"]}
          style={{
            height: 20,
            marginTop: 10,
            marginBottom: -20,
            width: "100%",
          }}
        />
      </View>
      <ScrollView style={{ flex: 1, padding: 20 }}>
        <View style={{ paddingHorizontal: breakpoints.md ? 5 : 10 }}>
          <Text
            style={{
              fontFamily: "serifText800",
              fontSize: 30,
              marginBottom: 10,
            }}
          >
            {message}
          </Text>
          {isLoading || isValidating ? (
            <SkeletonContainer>
              <LinearSkeletonArray
                animateWidth
                height={20}
                widths={[40, 61, 75, 85, 83, 81, 37, 61, 53, 48]}
              />
            </SkeletonContainer>
          ) : data?.error ? (
            <Text>Couldn't generate text. Did you hit your limit?</Text>
          ) : data ? (
            <>
              {data.addedFilters.length > 0 && (
                <FilterChips filters={data.addedFilters} />
              )}
              <MarkdownRenderer>{data.generated}</MarkdownRenderer>
              <Text style={{ opacity: 0.5, marginTop: 5, fontSize: 12 }}>
                AI can make mistakes. Check important info
              </Text>
            </>
          ) : (
            <ErrorAlert />
          )}
        </View>
      </ScrollView>

      <View style={{ padding: 20, paddingTop: 0 }}>
        <LinearGradient
          colors={["transparent", theme[breakpoints.md ? 1 : 2]]}
          style={{ height: 20, marginTop: -20, width: "100%" }}
        />
        <MessageBar
          onRetry={mutate}
          placeholder="Ask another question"
          messageRef={messageRef}
          messageState={messageState}
        />
      </View>
    </View>
  );
}

export function Sidekick() {
  const width = useSharedValue(0);
  const breakpoints = useResponsiveBreakpoints();
  const messageRef = useRef();
  const mobileRef = useRef<BottomSheetModal>();
  const [message, setMessage] = useState("");
  const { height } = useWindowDimensions();

  const collectionContextValue = useCollectionContext();
  const insets = useSafeAreaInsets();
  const collectionSidekickContextValue = useCollectionSidekickContext();
  const { panelRef } = collectionSidekickContextValue;

  const widthStyle = useAnimatedStyle(() => ({
    width: withSpring(width.value, {
      stiffness: 200,
      damping: width.value === 0 ? 30 : 23,
      overshootClamping: width.value === 0,
    }),
  }));

  const messageBarHandling = () => {
    setTimeout(() => {
      if (!breakpoints.md) messageRef.current.focus();
      else if (messageRef?.current && breakpoints.md)
        messageRef?.current[width.value === 0 ? "blur" : "focus"]();
    }, 500);
  };

  useImperativeHandle(panelRef, () => ({
    open: () => {
      width.value = breakpoints.md ? 300 : 500;
      messageBarHandling();
    },
    close: () => {
      width.value = 0;
      messageBarHandling();

      mobileRef.current?.close();
    },
    toggle: () => {
      if (breakpoints.md) {
        width.value = width.value === 0 ? (breakpoints.md ? 300 : 500) : 0;
        messageBarHandling();
      } else {
        mobileRef.current.present();
        messageBarHandling();
      }
    },
  }));

  const { type } = collectionContextValue;
  const sidekickEnabled = collectionContextValue.data?.id || type === "planner";

  const content = !sidekickEnabled ? (
    <View style={{ padding: 20, flex: 1 }}>
      <Text style={{ fontSize: 20, fontFamily: "serifText700" }}>
        Navigate to a collection or open planner view to enable Sidekick
      </Text>
    </View>
  ) : message ? (
    <CollectionQuestionAnser
      messageRef={messageRef}
      messageState={[message, setMessage]}
      message={message}
    />
  ) : (
    <View
      style={{
        height: "100%",
        padding: 20,
        paddingRight: 20,
        justifyContent: "center",
        gap: breakpoints.md ? 10 : 0,
        position: "relative",
      }}
    >
      <IconButton
        variant="filled"
        icon="close"
        style={{
          position: "absolute",
          top: breakpoints.md ? 15 : 5,
          right: breakpoints.md ? 15 : 20,
        }}
        onPress={() => panelRef.current.close()}
      />
      <View style={{ marginTop: "auto", gap: 10 }}>
        <MessageHeader />
      </View>
      <View
        style={
          !breakpoints.md ? { marginTop: "auto" } : { marginBottom: "auto" }
        }
      >
        <MessageBar
          messageState={[message, setMessage]}
          messageRef={messageRef}
        />
      </View>
    </View>
  );

  return breakpoints.md ? (
    <Animated.View style={widthStyle}>
      <ContentWrapper
        noPaddingTop
        style={{
          marginLeft: 10,
          width: 290,
          flex: 1,
        }}
      >
        {content}
      </ContentWrapper>
    </Animated.View>
  ) : (
    <View>
      <BottomSheet
        animationConfigs={{
          overshootClamping: true,
          stiffness: 400,
          damping: 40,
        }}
        snapPoints={[height - insets.top - 30]}
        sheetRef={mobileRef}
        onClose={() => mobileRef.current.close()}
        maxWidth="100%"
        maxBackdropOpacity={0.4}
      >
        <CollectionSidekickContext.Provider
          value={collectionSidekickContextValue}
        >
          <CollectionContext.Provider value={collectionContextValue}>
            {content}
          </CollectionContext.Provider>
        </CollectionSidekickContext.Provider>
      </BottomSheet>
    </View>
  );
}

