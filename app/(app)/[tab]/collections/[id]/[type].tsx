import Perspectives from "@/app/(app)/[tab]/perspectives/agenda/[type]/[start]";
import { useCollectionContext } from "@/components/collections/context";
import Task from "@/components/task";
import { useKeyboardShortcut } from "@/helpers/useKeyboardShortcut";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { MasonryFlashList } from "@shopify/flash-list";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

const Entity = ({ onTaskUpdate, item, openColumnMenu }) => {
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

function Masonry() {
  const { data } = useCollectionContext();
  const { type } = useLocalSearchParams();

  const flattened = data.labels
    .reduce((acc, curr) => [...acc, ...curr.entities], [])
    .sort(
      (a, b) => a.completionInstances.length - b.completionInstances.length
    );

  useKeyboardShortcut(["c o", "c n", "c i"], (shortcut) =>
    alert("create " + shortcut.split(" ")[1])
  );

  return (
    <View
      style={{
        width: "100%",
        maxWidth: 900,
        marginHorizontal: "auto",
        paddingTop: 100,
      }}
    >
      <MasonryFlashList
        ListHeaderComponent={
          <View
            style={{
              padding: 10,
              marginBottom: 20,
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <MenuPopover
              trigger={
                <Button
                  disabled
                  variant="filled"
                  style={{ height: 70, paddingHorizontal: 40 }}
                >
                  <Icon size={35}>add</Icon>
                  <ButtonText style={{ fontSize: 20 }}>New</ButtonText>
                </Button>
              }
              options={[
                { icon: "task_alt", text: "Task", callback: () => {} },
                { icon: "sticky_note_2", text: "Note", callback: () => {} },
                { icon: "package_2", text: "Item", callback: () => {} },
              ]}
            ></MenuPopover>
          </View>
        }
        renderItem={({ item }) => (
          <Entity
            onTaskUpdate={() => alert("something updated ")}
            openColumnMenu={() => alert("open column menu")}
            item={item}
          />
        )}
        data={flattened}
        keyExtractor={(i: any) => i.id}
        numColumns={2}
      />
    </View>
  );
}

export default function Page() {
  const { data } = useCollectionContext();
  const { type } = useLocalSearchParams();

  switch (type) {
    case "agenda":
      return <Perspectives />;
    case "kanban":
      return <Text>Kanban</Text>;
    case "stream":
      return <Text>Stream</Text>;
    case "masonry":
      return <Masonry />;
    case "grid":
      return <Text>Grid</Text>;
    case "difficulty":
      return <Text>Difficulty</Text>;
    default:
      return <Text>404</Text>;
  }
}
