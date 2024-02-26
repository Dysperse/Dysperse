import { ContentWrapper } from "@/components/layout/content";
import { ButtonGroup } from "@/ui/ButtonGroup";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { View } from "react-native";
import useSWR from "swr";

const Labels = () => {
  const [selectedLabel, setSelectedLabel] = useState<number | null>(null);
  const theme = useColorTheme();

  const { data, mutate, error } = useSWR(["space/labels"]);

  const d =
    Array.isArray(data) &&
    data.map((l) => ({ ...l, selected: l.id === selectedLabel }));

  const selectedLabelData = selectedLabel && d.find((i) => i.selected);

  return (
    <View style={{ flexDirection: "row", flex: 1 }}>
      {Array.isArray(d) ? (
        <>
          <View
            style={{ flex: 1, borderRightWidth: 1, borderRightColor: theme[5] }}
          >
            <FlashList
              estimatedItemSize={60}
              data={d}
              contentContainerStyle={{ padding: 20 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <ListItemButton
                  style={{ height: 60 }}
                  variant={item.selected ? "filled" : undefined}
                  onPress={() => setSelectedLabel(item.id)}
                >
                  <Emoji emoji={item.emoji} size={20} />
                  <ListItemText
                    primary={item.name}
                    secondary={`${item._count.entities} item${
                      item._count.entities.length !== 1 ? "s" : ""
                    }`}
                  />
                  {selectedLabel === item.id && <Icon>check</Icon>}
                </ListItemButton>
              )}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
          {selectedLabelData ? (
            <View style={{ flex: 2, padding: 20 }}>
              <Text>{JSON.stringify(selectedLabelData, null, 2)}</Text>
            </View>
          ) : (
            <View
              style={{
                flex: 2,
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
              }}
            >
              <Text style={{ color: theme[7], fontSize: 20 }} weight={600}>
                No label selected
              </Text>
            </View>
          )}
        </>
      ) : (
        <Spinner />
      )}
    </View>
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
