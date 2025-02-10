import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Text from "@/ui/Text";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, { FadeIn } from "react-native-reanimated";

const methods = [
  {
    key: "POMODORO",
    icon: "timer",
    name: "Pomodoro",
    description: "Set a timer and take breaks at intervals.",
  },
  {
    key: "CHECKLIST",
    icon: "done_all",
    name: "Checklist",
    description: "The good old paper and pen to-do list.",
  },
  {
    key: "KANBAN",
    icon: "view_kanban",
    name: "Kanban",
    description: "Categorize tasks into columns",
  },
  {
    key: "PLANNER",
    icon: "transition_slide",
    name: "Planner",
    description: "List tasks by day in a notebook",
  },
  {
    key: "EISENHOWER",
    icon: "crisis_alert",
    name: "Eisenhower matrix",
    description: "Prioritize tasks based on urgency and importance.",
  },
  {
    key: "NONE",
    icon: "sentiment_dissatisfied",
    name: "I'm not organized",
    description: "It's fine — I guess that's why we're here...",
  },
];

function Customization() {
  const theme = useColorTheme();
  const params = useLocalSearchParams();
  const [value, onChange] = useState([]);

  return (
    <View
      style={{
        padding: 20,
        flex: 1,
        paddingTop: 110,
        justifyContent: "center",
      }}
    >
      <Animated.View entering={FadeIn.delay(300)}>
        <Text variant="eyebrow">3/4</Text>
        <Text
          style={{
            fontFamily: "serifText700",
            fontSize: 45,
            marginTop: 10,
            color: theme[11],
          }}
        >
          What do you use{"\n"}to currently stay organized?
        </Text>
      </Animated.View>
      <Animated.View entering={FadeIn.delay(600)}>
        <Text
          style={{
            opacity: 0.4,
            fontSize: 25,
            marginTop: 5,
            marginBottom: 15,
            color: theme[11],
          }}
          weight={600}
        >
          This will help us craft a better experience for you.
        </Text>
      </Animated.View>
      <Animated.View
        entering={FadeIn.delay(900)}
        style={{ gap: 10, marginBottom: 20 }}
      >
        {methods.map((method, index) => (
          <Animated.View
            entering={FadeIn.delay(900 + index * 100)}
            key={method.key}
          >
            <ListItemButton
              variant="filled"
              key={method.key}
              onPress={() => {
                // if (value.includes(method.key)) {
                //   onChange(value.filter((v) => v !== method.key));
                // } else {
                //   onChange([...value, method.key]);
                // }
              }}
              backgroundColors={{
                default: addHslAlpha(theme[4], 0.3),
                hover: theme[3],
                active: theme[4],
              }}
            >
              <Avatar
                disabled
                icon={method.icon}
                size={40}
                style={{
                  backgroundColor: theme[value.includes(method.key) ? 7 : 4],
                }}
              />
              <ListItemText
                primary={method.name}
                secondary={method.description}
              />
              <Icon
                filled={value.includes(method.key)}
                style={{
                  marginLeft: -10,
                }}
                size={30}
              >
                {value.includes(method.key) ? "check_circle" : ""}
              </Icon>
            </ListItemButton>
          </Animated.View>
        ))}
      </Animated.View>
      <Animated.View entering={FadeIn.delay(900 + methods.length * 100)}>
        <Button
          height={65}
          variant="filled"
          style={{ margin: 20 }}
          text="Next"
          icon="east"
          iconPosition="end"
          bold
          onPress={() => {
            router.push({
              pathname: "/auth/join/4",
              params: { ...params, methods: value },
            });
          }}
        />
      </Animated.View>
    </View>
  );
}

export default function Page() {
  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
    >
      <Customization />
    </KeyboardAwareScrollView>
  );
}
