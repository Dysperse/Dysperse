import { ContentWrapper } from "@/components/layout/content";
import { ButtonGroup } from "@/ui/ButtonGroup";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { View } from "react-native";
import useSWR from "swr";

const Labels = () => {
  const { data, mutate, error } = useSWR(["space/labels"]);

  return (
    <>
      {data ? (
        <View>
          {data.map((label) => (
            <View key={label.id}>
              <Text>{label.name}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View>
          <Text>Loading...</Text>
        </View>
      )}
    </>
  );
};

const Collections = () => {
  return <View />;
};

export default function Page() {
  const theme = useColorTheme();
  const [view, setView] = useState<"labels" | "collections">("labels");

  return (
    <ContentWrapper>
      <LinearGradient
        colors={[theme[2], theme[3]]}
        style={{
          borderBottomWidth: 1,
          borderBottomColor: theme[5],
        }}
      >
        <ButtonGroup
          options={[
            { label: "Labels", value: "labels" },
            { label: "Collections", value: "collections" },
          ]}
          state={[view, setView]}
          buttonStyle={{ borderBottomWidth: 0 }}
          buttonTextStyle={{
            color: theme[9],
            fontFamily: "body_400",
            paddingHorizontal: 0,
          }}
          selectedButtonTextStyle={{ color: theme[11], fontFamily: "body_800" }}
          containerStyle={{
            width: 200,
            marginHorizontal: "auto",
            marginVertical: 10,
          }}
          scrollContainerStyle={{ width: "100%" }}
          activeComponent={
            <View
              style={{
                height: 4,
                width: 10,
                borderRadius: 99,
                backgroundColor: theme[11],
                margin: "auto",
              }}
            />
          }
        />
      </LinearGradient>
      {view === "labels" ? <Labels /> : <Collections />}
    </ContentWrapper>
  );
}
