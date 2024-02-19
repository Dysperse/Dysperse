import Task from "@/components/task";
import Text from "@/ui/Text";
import { View } from "react-native";

interface EntityProps {
  item: any;
  onTaskUpdate: any;
  openColumnMenu: any;
  showLabel?: boolean;
}

export const Entity = ({
  onTaskUpdate,
  item,
  openColumnMenu,
  showLabel = false,
}: EntityProps) => {
  switch (item.type) {
    case "TASK":
      return (
        <Task
          showLabel={showLabel}
          onTaskUpdate={onTaskUpdate}
          task={item}
          openColumnMenu={openColumnMenu}
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
