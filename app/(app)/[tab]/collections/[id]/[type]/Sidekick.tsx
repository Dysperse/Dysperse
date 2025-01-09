import { useCollectionContext } from "@/components/collections/context";
import { useCollectionSidekickContext } from "@/components/collections/sidekickContext";
import ContentWrapper from "@/components/layout/content";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useImperativeHandle, useRef, useState } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

function MessageBar({ messageRef }) {
  const theme = useColorTheme();
  const [value, setValue] = useState("");
  const { panelRef } = useCollectionSidekickContext();

  const { data, error } = useCollectionContext();

  const handleKeyPress = ({ nativeEvent }) => {
    if (nativeEvent.key === "Enter" && !nativeEvent.shiftKey) {
      console.log("Send message");
      alert(JSON.stringify(data));
    }
    if (nativeEvent.key === "Escape") {
      panelRef.current.close();
    }
  };

  return (
    <View style={{ padding: 20, gap: 10, justifyContent: "center", flex: 1 }}>
      <View
        style={{
          alignItems: "center",
          gap: 10,
          marginBottom: 20,
          opacity: 0.5,
        }}
      >
        <Icon size={40}>raven</Icon>
        <Text
          style={{ color: theme[11], fontSize: 20, textAlign: "center" }}
          weight={300}
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
          icon="east"
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

export function Sidekick() {
  const { panelRef } = useCollectionSidekickContext();
  const width = useSharedValue(0);
  const breakpoints = useResponsiveBreakpoints();
  const { data } = useCollectionContext();
  const theme = useColorTheme();
  const messageRef = useRef();

  const widthStyle = useAnimatedStyle(() => ({
    width: withSpring(width.value, {
      stiffness: 200,
      damping: width.value === 0 ? 30 : 23,
      overshootClamping: width.value === 0,
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
        <ContentWrapper
          style={{
            marginLeft: 10,
            width: 290,
            flex: 1,
          }}
        >
          <MessageBar messageRef={messageRef} />
        </ContentWrapper>
      </Animated.View>
    )
  );
}
