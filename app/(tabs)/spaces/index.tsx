import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import useSWR from "swr";

export default function Page() {
  const { data, error } = useSWR(["user/spaces", { test: "true" }]);
  const [view, setView] = useState("all");

  return data ? (
    <View>
      <FlatList
        ListHeaderComponent={
          <View>
            <Text>Spaces</Text>
            {/* <ButtonGroup isAttached mb={4}>
              <Button
                width="50%"
                borderWidth={2}
                borderRightWidth={0}
                variant={view !== "all" ? "outlined" : "filled"}
                onPress={() => setView("all")}
              >
                <ButtonText>All</ButtonText>
              </Button>
              <Button
                width="50%"
                borderWidth={2}
                borderLeftWidth={0}
                variant={view !== "invitations" ? "outlined" : "filled"}
                onPress={() => setView("invitations")}
              >
                <ButtonText>Invitations</ButtonText>
              </Button>
            </ButtonGroup>
          </Box> */}
          </View>
        }
        data={data}
        renderItem={({ item }: any) => (
          <Pressable onPress={() => router.push("/spaces/" + item.id)}>
            <Text>{item.profile.name}</Text>
            <Text>{item.profile.type}</Text>
          </Pressable>
        )}
      />
    </View>
  ) : (
    <ActivityIndicator />
  );
}
