import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import useSWR from "swr";

export default function Page() {
  // Get [space]
  const { space } = useLocalSearchParams();
  const { data, error, isLoading } = useSWR([
    "space",
    {
      propertyId: space,
    },
  ]);

  // const palette = useColor("gray", false);

  return isLoading ? (
    <ActivityIndicator />
  ) : (
    <>
      <StatusBar backgroundColor="#000" style="light" />
      <ScrollView>
        <View>
          <View>
            {/* <Button iconButton onPress={() => router.back()}>
              <MaterialIcons name="expand-more" size={22} color="black" />
            </Button> */}
          </View>
          <Text>Space</Text>
        </View>
        <Text>{JSON.stringify(data)}</Text>
      </ScrollView>
    </>
  );
}
