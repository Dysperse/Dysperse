import { columnStyles } from "@/components/collections/columnStyles";
import { useCollectionContext } from "@/components/collections/context";
import Perspectives from "@/components/collections/views/agenda";
import { Masonry } from "@/components/collections/views/masonry";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Emoji from "@/ui/Emoji";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { memo } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const KanbanHeader = memo(function KanbanHeader({
  label,
}: {
  label: {
    id: string;
    emoji: string;
    color: string;
    name: string;
    entitiesLength: number;
  };
}) {
  const theme = useColorTheme();
  return (
    <LinearGradient colors={[theme[3], theme[2]]} style={columnStyles.header}>
      <Emoji emoji={label.emoji} size={35} />
      <View>
        <Text style={{ fontSize: 20 }} weight={800}>
          {label.name}
        </Text>
        <Text weight={200}>{label.entitiesLength} items</Text>
      </View>
      <IconButton icon="expand_circle_down" style={{ marginLeft: "auto" }} />
    </LinearGradient>
  );
});

function KanbanColumn({ label }) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  return (
    <View
      style={{
        ...(breakpoints.md && {
          backgroundColor: theme[2],
          borderRadius: 20,
        }),
        width: breakpoints.md ? 300 : "100%",
        flex: 1,
        minWidth: 5,
        minHeight: 5,
      }}
    >
      {breakpoints.md && (
        <KanbanHeader
          label={{
            ...label,
            entities: undefined,
            entitiesLength: label.entities.length,
          }}
        />
      )}
    </View>
  );
}

function Kanban() {
  const { data } = useCollectionContext();

  return (
    <ScrollView
      horizontal
      contentContainerStyle={{
        flexDirection: "row",
        padding: 15,
        gap: 15,
      }}
    >
      {data.labels.map((label) => (
        <KanbanColumn key={label.id} label={label} />
      ))}
      <Text>{JSON.stringify(data, null, 5)}</Text>
    </ScrollView>
  );
}

export default function Page() {
  const { type } = useLocalSearchParams();

  switch (type) {
    case "agenda":
      return <Perspectives />;
    case "kanban":
      return <Kanban />;
    case "stream":
      return <Text>Stream</Text>;
    case "masonry":
      return <Masonry />;
    case "grid":
      return <Text>Grid</Text>;
    case "difficulty":
      return <Text>Difficulty</Text>;
    default:
      return <Text>404: {type}</Text>;
  }
}
