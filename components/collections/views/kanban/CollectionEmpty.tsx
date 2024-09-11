import Emoji from "@/ui/Emoji";
import Text from "@/ui/Text";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { CollectionLabelMenu } from "../../navbar/CollectionLabelMenu";

export const CollectionEmpty = () => {
  const { id } = useLocalSearchParams();

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
      }}
    >
      <Emoji size={64} emoji="1f92b" />
      <Text
        style={{ fontSize: 35, marginTop: 15, marginBottom: 5 }}
        weight={900}
      >
        It's quiet here...
      </Text>
      <Text
        style={{
          fontSize: 20,
          opacity: 0.7,
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        {id === "all" && "You haven't created any labels yet. \n"}
        Selected labels appear as columns here.
      </Text>
      <CollectionLabelMenu />
    </View>
  );
};
