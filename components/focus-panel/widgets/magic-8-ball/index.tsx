import { Button, ButtonText } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import { useState } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import Toast from "react-native-toast-message";
import { useFocusPanelContext } from "../../context";

const messages = [
  "It is certain",
  "It is decidedly so",
  "Without a doubt",
  "Yes definitely",
  "You may rely on it",
  "As I see it yes",
  "Most likely",
  "Outlook good",
  "Yes",
  "Signs point to yes",
  "Reply hazy try again",
  "Ask again later",
  "Better not tell you now",
  "Cannot predict now",
  "Concentrate and ask again",
  "Don't count on it",
  "My reply is no",
  "My sources say no",
  "Outlook not so good",
  "Very doubtful",
];

export default function Magic8Ball({ navigation, menuActions, widget }) {
  const theme = useColorTheme();
  const [message, setMessage] = useState("");
  const { panelState } = useFocusPanelContext();

  const isCollapsed = panelState === "COLLAPSED";

  const offset = useSharedValue<number>(0);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: withSpring(offset.value !== 0 ? 0 : 1),
  }));

  return (
    <View>
      <Pressable
        style={{
          padding: 16,
          alignItems: "center",
          backgroundColor: theme[3],
          borderRadius: 20,
        }}
      >
        <View
          style={{
            transform: isCollapsed ? [{ scale: 0.4 }] : [],
            marginVertical: isCollapsed ? -70 : 0,
          }}
        >
          <Animated.View
            style={[
              {
                backgroundColor: "#000",
                width: 200,
                height: 200,
                position: "relative",
                alignItems: "center",
                borderRadius: 99,
                justifyContent: "center",
                paddingTop: 35,
              },
              animatedStyles,
            ]}
          >
            <Svg
              width="150"
              height="150"
              viewBox="0 0 24 24"
              fill="#0035e1"
              transform={[{ scale: -1 }]}
            >
              <Path d="M24 22h-24l12-20z" />
            </Svg>
            <View
              style={{
                position: "absolute",
                top: 65,
                width: 65,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 99,
                zIndex: 1,
              }}
            >
              <Animated.Text
                style={[
                  { color: "#fff", textAlign: "center", fontSize: 16 },
                  textStyle,
                ]}
              >
                {message}
              </Animated.Text>
            </View>
          </Animated.View>
        </View>
        <Button
          height={isCollapsed ? 40 : 60}
          dense
          variant={isCollapsed ? "text" : "outlined"}
          containerStyle={{
            borderWidth: isCollapsed ? 0 : 1,
            marginTop: 10,
            marginBottom: isCollapsed ? -10 : 0,
            flex: isCollapsed ? undefined : 1,
          }}
          icon="casino"
          onPress={() => {
            offset.value = withRepeat(
              withSequence(
                withSpring(-10, { damping: 4000, stiffness: 4200 }),
                withSpring(10, { damping: 4000, stiffness: 4200 })
              ),
              2,
              true,
              () => {
                offset.value = withSpring(0, { damping: 30, stiffness: 400 });
                const t = messages[Math.floor(Math.random() * messages.length)];
                setMessage(t);
                setTimeout(() => {
                  Toast.show({ type: "info", text1: t });
                }, 1000);
              }
            );
          }}
        >
          <Icon size={isCollapsed ? 20 : 24}>casino</Icon>
          <ButtonText>Shake</ButtonText>
        </Button>
      </Pressable>
    </View>
  );
}
