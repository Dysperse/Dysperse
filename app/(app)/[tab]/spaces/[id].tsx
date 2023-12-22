import { ContentWrapper } from "@/components/layout/content";
import Chip from "@/ui/Chip";
import ErrorAlert from "@/ui/Error";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, View, useColorScheme } from "react-native";
import useSWR from "swr";

function SpacePage({ space }: any) {
  const theme = useColor(space.color, useColorScheme() === "dark");

  return (
    <View style={{ padding: 20 }}>
      <LinearGradient
        colors={[theme[5], theme[4], theme[6]]}
        style={{
          borderRadius: 25,
          padding: 25,
        }}
      >
        <Text heading style={{ fontSize: 45, marginBottom: 5 }}>
          {space.name}
        </Text>
        <View style={{ flexDirection: "row" }}>
          <Chip
            label={`${space._count.members} member${
              space._count.members !== 1 ? "s" : ""
            }`}
            style={{
              backgroundColor: theme[7],
            }}
          />
        </View>
      </LinearGradient>

      <Text>{JSON.stringify(space, null, 2)}</Text>
    </View>
  );
}

export default function Page() {
  const params = useLocalSearchParams();
  const { data, error } = useSWR(
    params.id ? ["space", { spaceId: params.id }] : null
  );

  return (
    <ContentWrapper>
      {data ? (
        <SpacePage space={data} />
      ) : error ? (
        <ErrorAlert />
      ) : (
        <ActivityIndicator />
      )}
    </ContentWrapper>
  );
}
