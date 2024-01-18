import { useCollectionContext } from "@/components/collections/context";
import Perspectives from "@/components/collections/views/agenda";
import { Masonry } from "@/components/collections/views/masonry";
import Text from "@/ui/Text";
import { useLocalSearchParams } from "expo-router";

function Kanban() {
  const { data } = useCollectionContext();

  return (
    <>
      <Text>{JSON.stringify(data, null, 5)}</Text>
    </>
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
