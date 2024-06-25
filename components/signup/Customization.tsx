import { useSignupContext } from "@/app/auth/sign-up";
import { Avatar } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Controller } from "react-hook-form";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export const Customization = ({ form }) => {
  const theme = useColorTheme();
  const { control } = form;
  const { handleNext } = useSignupContext();

  const methods = [
    {
      key: "POMODORO",
      icon: "timer",
      name: "Pomodoro",
      description:
        "Work for 25 minutes, then take a 5-minute break. Repeat 4 times, then take a 15-minute break.",
    },
    {
      key: "EISENHOWER",
      icon: "crisis_alert",
      name: "Eisenhower matrix",
      description: "Prioritize tasks based on urgency and importance.",
    },
    {
      key: "KANBAN",
      icon: "view_kanban",
      name: "Kanban",
      description: "Categorize your tasks into separate columns",
    },
    {
      key: "PLANNER",
      icon: "transition_slide",
      name: "Planner",
      description: "List your tasks by day in a notebook/agenda",
    },
    {
      key: "CHECKLIST",
      icon: "priority",
      name: "Checklist",
      description: "Write down all your tasks in a list",
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        padding: 20,
      }}
    >
      <Text
        style={{
          marginTop: "auto",
          fontSize: 30,
          marginBottom: 10,
          color: theme[11],
        }}
        weight={900}
      >
        What productivity methods do you already use?
      </Text>
      <Text
        style={{
          color: theme[11],
          opacity: 0.7,
          fontSize: 20,
          marginBottom: 30,
        }}
      >
        We'll incorporate them into your Dysperse experience.
      </Text>
      <Controller
        control={control}
        name="methods"
        render={({ field: { value, onChange } }) => (
          <View>
            {methods.map((method) => (
              <ListItemButton
                variant="outlined"
                key={method.key}
                onPress={() => {
                  if (value.includes(method.key)) {
                    onChange(value.filter((v) => v !== method.key));
                  } else {
                    onChange([...value, method.key]);
                  }
                }}
                style={({ pressed, hovered }) => [
                  {
                    flexDirection: "row",
                    marginBottom: 15,
                  },
                  value.includes(method.key) && {
                    backgroundColor: theme[pressed ? 6 : hovered ? 5 : 4],
                  },
                ]}
              >
                <Avatar
                  icon={method.icon}
                  size={40}
                  style={{
                    backgroundColor: theme[value.includes(method.key) ? 7 : 6],
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
            ))}
          </View>
        )}
      />
      <Button
        onPress={handleNext}
        containerStyle={{
          marginTop: "auto",
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
        }}
        height={70}
        variant="filled"
      >
        <ButtonText weight={900} style={{ fontSize: 20 }}>
          Next
        </ButtonText>
        <Icon bold style={{ marginLeft: 10 }}>
          arrow_forward
        </Icon>
      </Button>
    </ScrollView>
  );
};
