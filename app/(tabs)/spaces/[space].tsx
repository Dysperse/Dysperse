import { ScrollView } from "@gluestack-ui/themed";
import { Box, Heading, Spinner } from "@gluestack-ui/themed";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from "react-native";
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

  return isLoading ? (
    <Spinner />
  ) : (
    <>
      <StatusBar backgroundColor="#000" style="light" />
      <ScrollView>
        <Box h={300}>
          <Heading size="displayLarge">Space</Heading>
        </Box>
        <Text>{JSON.stringify(data)}</Text>
      </ScrollView>
    </>
  );
}
