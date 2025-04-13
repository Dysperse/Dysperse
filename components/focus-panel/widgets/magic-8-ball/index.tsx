import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";
import { useState } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

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

export default function Magic8Ball() {
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();
  const [message, setMessage] = useState("");

  const offset = useSharedValue<number>(0);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: withSpring(offset.value !== 0 ? 0 : 1),
  }));

  return (
    <View>
      <Text variant="eyebrow" style={{ marginBottom: 7 }}>
        Magic 8 Ball
      </Text>
      <Pressable
        style={{
          padding: 16,
          alignItems: "center",
          backgroundColor: theme[2],
          borderWidth: 1,
          borderColor: theme[5],
          borderRadius: 20,
        }}
      >
        <View
          style={{
            transform: [{ scale: 0.4 }],
            marginVertical: breakpoints.md ? -70 : -110,
          }}
        >
          <Animated.View
            style={[
              {
                backgroundColor: "#000",
                width: breakpoints.md ? 200 : 400,
                height: breakpoints.md ? 200 : 400,
                position: "relative",
                alignItems: "center",
                borderRadius: 999,
                justifyContent: "center",
                paddingTop: 35,
              },
              animatedStyles,
            ]}
          >
            <Svg
              width={breakpoints.md ? "150" : "300"}
              height={breakpoints.md ? "150" : "300"}
              viewBox="0 0 24 24"
              fill="#0035e1"
              transform={[{ scale: -1 }]}
            >
              <Path d="M24 22h-24l12-20z" />
            </Svg>
            <View
              style={{
                position: "absolute",
                top: breakpoints.md ? 65 : 100,
                width: breakpoints.md ? 65 : 180,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 99,
                zIndex: 1,
              }}
            >
              <Animated.Text
                style={[
                  {
                    color: "#fff",
                    textAlign: "center",
                    fontSize: breakpoints.md ? 16 : 30,
                    fontFamily: "body_500",
                  },
                  textStyle,
                ]}
              >
                {message}
              </Animated.Text>
            </View>
          </Animated.View>
        </View>
        <Button
          height={40}
          dense
          large
          variant="filled"
          containerStyle={{
            borderWidth: 0,
            marginTop: 10,
          }}
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
                runOnJS(setMessage)(t);
              }
            );
          }}
          icon="casino"
          text="Shake"
          textProps={{ weight: 600, style: { marginLeft: 3 } }}
          iconStyle={{ fontFamily: "symbols_bold_outlined" }}
        />
      </Pressable>
    </View>
  );
}

