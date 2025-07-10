import { Button } from "@/ui/Button";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Platform, View } from "react-native";
import Toast from "react-native-toast-message";
import CreateTask from "../../create";
import { useTaskDrawerContext } from "../context";

export function SubtaskCreation({ handleBack }) {
  const theme = useColorTheme();
  const { task, updateTask } = useTaskDrawerContext();

  return (
    <View style={{ width: "100%", flexDirection: "row", gap: 10 }}>
      <CreateTask
        stackBehavior="replace"
        mutate={(t) => {
          updateTask({
            subtasks: {
              ...task.subtasks,
              [t.id]: t,
            },
          });
        }}
        onPress={() => {
          if (Platform.OS === "web" && !localStorage.getItem("subtaskTip")) {
            localStorage.setItem("subtaskTip", "true");
            Toast.show({
              type: "info",
              text1: "Pro tip",
              text2: "Tap twice on a task to open this popup",
              visibilityTime: 5000,
            });
          }
        }}
        defaultValues={{ parentTask: task }}
      >
        <Button
          containerStyle={{ flex: 1 }}
          variant="filled"
          large
          icon="prompt_suggestion"
          style={{ justifyContent: "flex-start", marginHorizontal: 5 }}
          text="Create subtask"
          backgroundColors={{
            default: addHslAlpha(theme[11], 0.1),
            hovered: addHslAlpha(theme[11], 0.2),
            pressed: addHslAlpha(theme[11], 0.3),
          }}
        />
      </CreateTask>
    </View>
  );
}
