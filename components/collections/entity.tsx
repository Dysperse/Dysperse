import Task from "@/components/task";
import Text from "@/ui/Text";
import { View } from "react-native";

interface EntityProps {
  item: any;
  onTaskUpdate: any;
  showLabel?: boolean;
  showRelativeTime?: boolean;
  showDate?: boolean;
  isReadOnly: boolean;
  dateRange?: [Date, Date];
}

export const Entity = ({
  onTaskUpdate,
  item,
  showLabel = false,
  showRelativeTime = false,
  showDate = false,
  isReadOnly = false,
  dateRange,
}: EntityProps) => {
  switch (item.type) {
    case "TASK":
      return (
        <Task
          dateRange={dateRange}
          showLabel={showLabel}
          onTaskUpdate={onTaskUpdate}
          task={item}
          isReadOnly={isReadOnly}
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
