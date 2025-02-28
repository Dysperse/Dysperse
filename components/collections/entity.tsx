import Task from "@/components/task";
import Text from "@/ui/Text";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { cloneElement, Fragment } from "react";
import { View } from "react-native";
import { useReorderableDrag } from "react-native-reorderable-list";

interface EntityProps {
  item: any;
  onTaskUpdate: any;
  showLabel?: boolean;
  showRelativeTime?: boolean;
  showDate?: boolean;
  isReadOnly: boolean;
  dateRange?: string;
  planMode?: boolean;
  dense?: boolean;
  reorderable?: boolean;
}

const ReorderableWrapper = ({ children }) => {
  const drag = useReorderableDrag();
  return cloneElement(children, {
    reorderFunction: () => {
      drag();
      impactAsync(ImpactFeedbackStyle.Light);
    },
  });
};

export const Entity = ({
  onTaskUpdate,
  item,
  showLabel = false,
  showRelativeTime = false,
  showDate = false,
  isReadOnly = false,
  dateRange,
  planMode = false,
  dense = false,
  reorderable = false,
}: EntityProps) => {
  const Wrapper = reorderable ? ReorderableWrapper : Fragment;

  switch (item.type) {
    case "TASK":
      return (
        <Wrapper>
          <Task
            dense={dense}
            dateRange={dateRange}
            showLabel={showLabel}
            onTaskUpdate={onTaskUpdate}
            task={item}
            isReadOnly={isReadOnly}
            showDate={showDate}
            showRelativeTime={showRelativeTime}
            planMode={planMode}
          />
        </Wrapper>
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

