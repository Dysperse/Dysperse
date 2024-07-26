import { Avatar } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { useFocusPanelContext } from "../../context";
import { widgetMenuStyles } from "../../widgetMenuStyles";

const CoinFlip = () => {
  const theme = useColorTheme();
  const [result, setResult] = useState("");
  const { panelState } = useFocusPanelContext();

  const animation = useSharedValue(1);

  const flipCoin = () => {
    animation.value = withSequence(
      withSpring(isCollapsed ? 0 : 0.9, {
        overshootClamping: true,
      }),
      withSpring(1, {})
    );
    setTimeout(() => {
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

  const isCollapsed = panelState === "COLLAPSED";

  return (
    <View>
      <Animated.View
        style={[
          animatedStyle,
          {
            alignItems: "center",
            justifyContent: "center",
            padding: isCollapsed ? 0 : 20,
            flexDirection: "row",
            gap: 20,
            marginBottom: 10,
            backgroundColor: isCollapsed ? undefined : theme[2],
            borderRadius: 30,
          },
        ]}
      >
        <Avatar
          icon={result === "Tails" ? "account_balance" : "person"}
          size={60}
          style={{ backgroundColor: theme[isCollapsed ? 5 : 3] }}
          iconProps={{ size: 35 }}
        />
        {!isCollapsed && (
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
        )}
      </Animated.View>
      <Button
        height={isCollapsed ? 40 : 60}
        dense
        onPress={flipCoin}
        variant={isCollapsed ? "text" : "outlined"}
        containerStyle={{
          borderWidth: isCollapsed ? 0 : 1,
          marginBottom: isCollapsed ? -10 : 0,
        }}
      >
        <Icon size={isCollapsed ? 20 : 24}>casino</Icon>
        <ButtonText>Flip{!isCollapsed && " coin"}</ButtonText>
      </Button>
    </View>
  );
};

const Dice = () => {
  const theme = useColorTheme();
  const [result, setResult] = useState(1);
  const { panelState } = useFocusPanelContext();

  const animation = useSharedValue(0);

  const rollDice = () => {
    animation.value = withSequence(
      withSpring(isCollapsed ? 0 : 0.9, {
        overshootClamping: true,
      }),
      withSpring(1, {})
    );
    setTimeout(() => {
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

  const isCollapsed = panelState === "COLLAPSED";

  return (
    <View style={{ flexDirection: isCollapsed ? "column" : "row", gap: 10 }}>
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
          style={{ backgroundColor: theme[isCollapsed ? 5 : 2] }}
          iconProps={{ size: 35 }}
        />
      </Animated.View>
      <Button
        height={isCollapsed ? 40 : 60}
        dense
        onPress={rollDice}
        variant={isCollapsed ? "text" : "outlined"}
        containerStyle={{
          borderWidth: isCollapsed ? 0 : 1,
          marginBottom: isCollapsed ? -10 : 0,
          flex: isCollapsed ? undefined : 1,
        }}
      >
        <Icon size={isCollapsed ? 20 : 24}>casino</Icon>
        <ButtonText>Roll{!isCollapsed && " dice"}</ButtonText>
      </Button>
    </View>
  );
};

export default function Randomizer({
  navigation,
  widget,
  setParam,
  menuActions,
}) {
  const theme = useColorTheme();
  const { panelState } = useFocusPanelContext();
  const isCollapsed = panelState === "COLLAPSED";

  const [mode, setMode] = useState<"coin" | "dice">(
    widget?.params?.mode || "coin"
  );

  return (
    <View>
      {!isCollapsed && (
        <MenuPopover
          options={[
            ...menuActions,
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
            <Button style={widgetMenuStyles.button} dense>
              <ButtonText weight={800} style={widgetMenuStyles.text}>
                Randomizer
              </ButtonText>
              <Icon style={{ color: theme[11] }}>expand_more</Icon>
            </Button>
          }
        />
      )}
      <View
        style={{
          padding: isCollapsed ? 0 : 15,
          paddingVertical: isCollapsed ? 10 : 15,
          backgroundColor: theme[3],
          borderRadius: 20,
        }}
      >
        {mode === "coin" ? <CoinFlip /> : <Dice />}
      </View>
    </View>
  );
}
