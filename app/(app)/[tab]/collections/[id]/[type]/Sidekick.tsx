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
import BottomSheet from "@/ui/BottomSheet";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import SkeletonContainer from "@/ui/Skeleton/container";
import { LinearSkeletonArray } from "@/ui/Skeleton/linear";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
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
    <View style={{ flexDirection: "row", gap: 10 }}>
      {typeof onRetry !== "undefined" && (
        <IconButton onPress={onRetry} variant="filled" size={60} icon="loop" />
      )}
      <View
        style={{
          alignItems: "center",
          paddingRight: 10,
          borderRadius: 200,
          flexDirection: "row",
          flex: 1,
          backgroundColor: theme[3],
        }}
      >
        <TextField
          multiline
          inputRef={messageRef}
          placeholder="Type a message..."
          numberOfLines={1}
          style={{
            padding: 20,
            flex: 1,
            paddingVertical: 20,
            borderRadius: 200,
            shadowRadius: 0,
          }}
          value={value}
          onChangeText={setValue}
          onKeyPress={handleKeyPress}
        />
        <IconButton
          icon="north"
          variant={"filled"}
          disabled={!value}
          size={35}
          backgroundColors={{
            default: theme[value ? 10 : 6],
            hovered: theme[value ? 11 : 6],
            pressed: theme[value ? 12 : 6],
          }}
          onPress={() => setMessage(value)}
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
    <View style={{ alignItems: "center", gap: 10 }}>
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
              id: collectionData.id,
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
          variant="filled"
          icon="close"
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
        <View style={{ paddingHorizontal: 5 }}>
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
          ) : data.error ? (
            <Text>Couldn't generate text. Did you hit your limit?</Text>
          ) : data ? (
            <MarkdownRenderer>{data.generated}</MarkdownRenderer>
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

  const content = message ? (
    <CollectionQuestionAnser
      messageRef={messageRef}
      messageState={[message, setMessage]}
      message={message}
    />
  ) : (
    <View
      style={{
        padding: 20,
        paddingRight: 20,
        justifyContent: "center",
        flex: 1,
        gap: breakpoints.md ? 10 : 0,
        position: "relative",
      }}
    >
      <IconButton
        variant="filled"
        icon="close"
        style={{
          position: "absolute",
          top: 5,
          right: 20,
        }}
        onPress={() => mobileRef.current.close()}
      />
      <View style={{ marginTop: "auto", gap: 10 }}>
        <MessageHeader />
      </View>
      <View style={!breakpoints.md && { marginTop: "auto" }}>
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
