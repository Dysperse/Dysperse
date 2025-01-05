import { useCollectionContext } from "@/components/collections/context";
import { useCollectionSidekickContext } from "@/components/collections/sidekickContext";
import ContentWrapper from "@/components/layout/content";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { FlashList } from "@shopify/flash-list";
import { useImperativeHandle, useRef, useState } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

function Header() {
  const theme = useColorTheme();
  const { panelRef } = useCollectionSidekickContext();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        paddingLeft: 25,
        gap: 10,
      }}
    >
      <Icon>raven</Icon>
      <Text weight={900} style={{ color: theme[11] }}>
        Sidekick
      </Text>
      <IconButton
        icon="close"
        variant="filled"
        style={{ marginLeft: "auto" }}
        onPress={() => panelRef.current.close()}
      />
    </View>
  );
}

function MessageBar({ messageRef }) {
  const theme = useColorTheme();
  const { panelRef } = useCollectionSidekickContext();

  const handleKeyPress = ({ nativeEvent }) => {
    if (nativeEvent.key === "Enter" && !nativeEvent.shiftKey) {
      console.log("Send message");
    }
    if (nativeEvent.key === "Escape") {
      panelRef.current.close();
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <View
        style={{
          alignItems: "center",
          paddingRight: 10,
          borderRadius: 200,
          flexDirection: "row",
          backgroundColor: theme[3],
        }}
      >
        <TextField
          multiline
          inputRef={messageRef}
          placeholder="Type a message"
          numberOfLines={1}
          style={{
            padding: 20,
            flex: 1,
            paddingVertical: 20,
            borderRadius: 200,
            shadowRadius: 0,
          }}
          onKeyPress={handleKeyPress}
        />
        <IconButton
          icon="north"
          variant="filled"
          size={35}
          backgroundColors={{
            default: theme[10],
            hovered: theme[11],
            pressed: theme[12],
          }}
          iconProps={{ bold: true, size: 17 }}
          iconStyle={{ color: theme[1] }}
        />
      </View>
    </View>
  );
}

function Message({ message }) {
  const theme = useColorTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        margin: 5,
        marginBottom: 0,
        marginLeft: 0,
        justifyContent:
          message.role === "assistant" ? "flex-start" : "flex-end",
      }}
    >
      <View
        style={{
          padding: 8,
          backgroundColor: theme[message.role === "assistant" ? 3 : 11],
          borderRadius: 10,
          maxWidth: message.role === "assistant" ? "100%" : 300,
          overflow: "hidden",
        }}
      >
        <Text
          style={{
            fontSize: 13,
            color: theme[message.role === "assistant" ? 11 : 3],
          }}
        >
          {message.content}
        </Text>
      </View>
      {message.role !== "assistant" && (
        <Icon name="profile" size={30} style={{ marginLeft: 10 }} />
      )}
    </View>
  );
}

export function Sidekick() {
  const { panelRef } = useCollectionSidekickContext();
  const width = useSharedValue(0);
  const breakpoints = useResponsiveBreakpoints();
  const { data } = useCollectionContext();

  const messageRef = useRef();

  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "assistant",
      content: `Hey there! How can I help you today with your "${data?.name}" collection?`,
    },
  ]);

  const widthStyle = useAnimatedStyle(() => ({
    width: withSpring(width.value, {
      stiffness: 200,
      damping: 30,
      overshootClamping: true,
    }),
  }));

  const messageBarHandling = () => {
    setTimeout(() => {
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
    },
    toggle: () => {
      width.value = width.value === 0 ? (breakpoints.md ? 300 : 500) : 0;
      messageBarHandling();
    },
  }));

  return (
    breakpoints.md && (
      <Animated.View style={widthStyle}>
        <ContentWrapper style={{ marginLeft: 10, padding: 0 }}>
          <View style={{ width: 300 - 4 - 10, flex: 1 }}>
            <Header />
            <FlashList
              contentContainerStyle={{ padding: 10 }}
              renderItem={({ item }) => <Message message={item} />}
              style={{ flex: 1 }}
              data={messages}
              keyExtractor={(message) => message.id}
            />
            <MessageBar messageRef={messageRef} />
          </View>
        </ContentWrapper>
      </Animated.View>
    )
  );
}
