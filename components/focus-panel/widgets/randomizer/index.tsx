import { Avatar } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

const CoinFlip = () => {
  const theme = useColorTheme();
  const [result, setResult] = useState("");

  const animation = useSharedValue(1);

  const flipCoin = () => {
    impactAsync(ImpactFeedbackStyle.Light);
    animation.value = withSequence(
      withSpring(0.9, {
        overshootClamping: true,
      }),
      withSpring(1, {})
    );
    setTimeout(() => {
      impactAsync(ImpactFeedbackStyle.Medium);
      const coin = Math.random() < 0.5 ? "Heads" : "Tails";
      setResult(coin);
    }, 200);
  };

  useEffect(() => {
    flipCoin();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animation.value }],
    opacity: animation.value,
  }));

  return (
    <View>
      <Animated.View
        style={[
          animatedStyle,
          {
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            flexDirection: "row",
            gap: 20,
            marginBottom: 10,
            backgroundColor: theme[2],
            borderRadius: 30,
          },
        ]}
      >
        <Avatar
          icon={result === "Tails" ? "account_balance" : "person"}
          size={60}
          style={{ backgroundColor: theme[4] }}
          iconProps={{ size: 35 }}
        />
        <Text
          style={{
            color: theme[11],
            opacity: 0.5,
            fontSize: 40,
            marginLeft: "auto",
          }}
          weight={300}
        >
          {result}
        </Text>
      </Animated.View>
      <Button
        height={60}
        dense
        onPress={flipCoin}
        variant={"outlined"}
        containerStyle={{
          borderWidth: 1,
          marginBottom: 0,
        }}
      >
        <Icon size={24}>casino</Icon>
        <ButtonText>Flip</ButtonText>
      </Button>
    </View>
  );
};

const Dice = () => {
  const theme = useColorTheme();
  const [result, setResult] = useState(1);

  const animation = useSharedValue(0);

  const rollDice = () => {
    impactAsync(ImpactFeedbackStyle.Light);
    animation.value = withSequence(
      withSpring(0.9, {
        overshootClamping: true,
      }),
      withSpring(1, {})
    );
    setTimeout(() => {
      impactAsync(ImpactFeedbackStyle.Medium);
      const dice = Math.floor(Math.random() * 6) + 1;
      setResult(dice);
    }, 200);
  };

  useEffect(() => {
    rollDice();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animation.value }],
    opacity: animation.value === 0.9 ? 0 : animation.value,
  }));

  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      <Animated.View
        style={[
          animatedStyle,
          {
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 20,
          },
        ]}
      >
        <Avatar
          icon={`counter_${result}`}
          size={60}
          style={{ backgroundColor: theme[5] }}
          iconProps={{ size: 35 }}
        />
      </Animated.View>
      <Button
        height={60}
        dense
        onPress={rollDice}
        variant={"outlined"}
        containerStyle={{
          borderWidth: 1,
          marginBottom: 0,
          flex: 1,
        }}
      >
        <Icon size={24}>casino</Icon>
        <ButtonText>Roll dice</ButtonText>
      </Button>
    </View>
  );
};

export default function Randomizer({ widget, setParam }) {
  const theme = useColorTheme();

  const [mode, setMode] = useState<"coin" | "dice">(
    widget?.params?.mode || "coin"
  );

  return (
    <View>
      <MenuPopover
        options={[
          {
            text: "Switch to " + (mode === "coin" ? "Dice" : "Coin"),
            icon: "casino",
            callback: () => {
              setParam("mode", mode === "coin" ? "dice" : "coin");
              setMode(mode === "coin" ? "dice" : "coin");
            },
          },
        ]}
        containerStyle={{ marginTop: -15 }}
        trigger={
          <Button
            dense
            containerStyle={{
              marginRight: "auto",
              marginBottom: 6,
              marginLeft: -10,
            }}
          >
            <Text variant="eyebrow">Randomizer</Text>
            <Icon style={{ color: theme[11], opacity: 0.6 }}>expand_more</Icon>
          </Button>
        }
      />
      <View
        style={{
          padding: 20,
          borderRadius: 20,
          backgroundColor: theme[2],
          borderColor: theme[5],
          borderWidth: 1,
        }}
      >
        {mode === "coin" ? <CoinFlip /> : <Dice />}
      </View>
    </View>
  );
}

