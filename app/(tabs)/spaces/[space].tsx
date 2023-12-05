import { Button, ButtonIcon, ScrollView, View } from "@gluestack-ui/themed";
import { Box, Heading, Spinner } from "@gluestack-ui/themed";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from "react-native";
import useSWR from "swr";
import { useColor } from "../../../ui/color";
import Navbar from "../../../ui/navbar";
import { useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";

export default function Page() {
  // Get [space]
  const { space } = useLocalSearchParams();
  const { data, error, isLoading } = useSWR([
    "space",
    {
      propertyId: space,
    },
  ]);

  const palette = useColor("gray", false);
  const navigation = useNavigation();

  return isLoading ? (
    <Spinner />
  ) : (
    <>
      <StatusBar backgroundColor="#000" style="light" />
      <ScrollView>
        <Box h={300} backgroundColor={palette[9]}>
          <View>
            <Button iconButton onPress={() => router.back()}>
              <MaterialIcons name="expand-more" size={22} color="black" />
            </Button>
          </View>
          <Heading size="displayLarge">Space</Heading>
        </Box>
        <Text>{JSON.stringify(data)}</Text>
      </ScrollView>
    </>
  );
}
