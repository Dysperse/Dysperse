import Task from "@/components/task";
import Text from "@/ui/Text";
import { View } from "react-native";

export const Entity = ({ onTaskUpdate, item, openColumnMenu }) => {
  const Container = ({ children }: { children: JSX.Element }) => {
    return (
      <View
        style={{
          padding: 5,
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
