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
  const Container = ({ children }: { children: JSX.Element }) => {
    return (
      <View
        style={{
          padding: 5,
          paddingHorizontal: 3,
        }}
      >
        {children}
      </View>
    );
  };

  switch (item.type) {
    case "TASK":
      return (
        <Container>
          <Task
            showLabel={showLabel}
            onTaskUpdate={onTaskUpdate}
            task={item}
            openColumnMenu={openColumnMenu}
          />
        </Container>
      );
    default:
      return (
        <Container>
          <View>
            <Text>{item.name}</Text>
            <Text>{item.agendaOrder?.toString()}</Text>
          </View>
        </Container>
      );
  }
};
