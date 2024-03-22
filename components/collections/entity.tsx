import Task from "@/components/task";
import Text from "@/ui/Text";
import { View } from "react-native";

interface EntityProps {
  item: any;
  onTaskUpdate: any;
  showLabel?: boolean;
  showRelativeTime?: boolean;
  showDate?: boolean;
}

export const Entity = ({
  onTaskUpdate,
  item,
  showLabel = false,
  showRelativeTime = false,
  showDate = false,
}: EntityProps) => {
  switch (item.type) {
    case "TASK":
      return (
        <Task
          showLabel={showLabel}
          onTaskUpdate={onTaskUpdate}
          task={item}
          showDate={showDate}
          showRelativeTime={showRelativeTime}
        />
      );
    default:
      return (
        <View>
          <Text>{item.name}</Text>
          <Text>{item.agendaOrder?.toString()}</Text>
        </View>
      );
  }
};
