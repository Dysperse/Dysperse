import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import Emoji from "@/ui/Emoji";
import Text from "@/ui/Text";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { useCollectionContext } from "../context";

export const CollectionEmpty = () => {
  const theme = useColorTheme();
  const { openLabelPicker } = useCollectionContext();
  const { id } = useLocalSearchParams();

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        padding: 20,
      }}
    >
      <View
        style={{
          backgroundColor: theme[2],
          borderWidth: 1,
          borderColor: theme[5],
          padding: 20,
          borderRadius: 20,
          maxWidth: 400,
        }}
      >
        <Emoji size={40} emoji="1f92b" />
        <Text
          style={{
            fontSize: 30,
            marginTop: 10,
            marginBottom: 7,
            fontFamily: "serifText800",
          }}
        >
          It's quiet here...
        </Text>
        <Text
          style={{
            fontSize: 15,
            opacity: 0.7,
            marginBottom: 10,
          }}
        >
          {id === "all" && "You haven't created any labels yet. \n"}
          With collections, you can group related items together and view them
          in different ways.
        </Text>
        <Button
          icon="label"
          onPress={openLabelPicker}
          text="Add labels..."
          variant="filled"
        />
      </View>
    </View>
  );
};
