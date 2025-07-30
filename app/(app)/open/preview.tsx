import { CommandPalettePreview } from "@/components/command-palette/content";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { MenuButton } from "../home";

export default function Page() {
  const { item: _item } = useLocalSearchParams();
  const item = JSON.parse(_item as string);

  return (
    <View style={{ padding: 20, flex: 1 }}>
      <MenuButton back icon="west" left gradient />
      <CommandPalettePreview
        onCreate={(t) => console.log(t)}
        preview={item}
        loading={false}
      />
    </View>
  );
}
