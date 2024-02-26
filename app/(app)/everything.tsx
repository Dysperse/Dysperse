import { Entity } from "@/components/collections/entity";
import { ContentWrapper } from "@/components/layout/content";
import { useHotkeys } from "@/helpers/useHotKeys";
import { ButtonGroup } from "@/ui/ButtonGroup";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColor } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { View, useColorScheme } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";

const LabelDetails = ({ setSelectedLabel, label }: { label: any }) => {
  const userTheme = useColorTheme();
  const labelTheme = useColor(label.color, useColorScheme() === "dark");

  const { data, error } = useSWR(["space/labels/label", { id: label.id }]);

  return (
    <ScrollView style={{ flex: 2 }}>
      <ColorThemeProvider theme={labelTheme}>
        <LinearGradient
          style={{
            height: 300,
            padding: 20,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            position: "relative",
            gap: 25,
          }}
          colors={[labelTheme[3], labelTheme[2], userTheme[1]]}
        >
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              padding: 20,
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: 10,
            }}
          >
            <IconButton variant="outlined" size={50} icon="edit" />
            <IconButton variant="outlined" size={50} icon="delete" />
          </View>
          <Emoji emoji={label.emoji} size={60} />
          <View>
            <Text style={{ fontSize: 40, color: labelTheme[11] }} weight={900}>
              {label.name}
            </Text>
            <Text
              style={{
                fontSize: 20,
                color: labelTheme[11],
                opacity: 0.7,
              }}
            >
              {label._count.entities} item
              {label._count.entities !== 1 ? "s" : ""}
            </Text>
          </View>
        </LinearGradient>
      </ColorThemeProvider>
      <View style={{ padding: 20, paddingHorizontal: 50, marginTop: 20 }}>
        <View
          style={{
            padding: 20,
            gap: 10,
            flexDirection: "row",
            backgroundColor: userTheme[2],
            borderWidth: 1,
            borderColor: userTheme[5],
            borderRadius: 20,
          }}
        >
          <View style={{ flex: 1, gap: 5 }}>
            <Text variant="eyebrow">Collections</Text>
            {label.collections.length === 0 ? (
              <Text style={{ color: userTheme[7] }} weight={600}>
                No collections found
              </Text>
            ) : (
              <View style={{ flexWrap: "wrap", flexDirection: "row", gap: 15 }}>
                {label.collections.map((c) => (
                  <Chip key={c.id} label={c.name} icon="folder" />
                ))}
              </View>
            )}
          </View>
          {label.integration && (
            <View style={{ flex: 1, gap: 5 }}>
              <Text variant="eyebrow" style={{ marginBottom: 5 }}>
                Connected to
              </Text>
              <View style={{ flexWrap: "wrap", flexDirection: "row", gap: 15 }}>
                <Chip
                  label={`${capitalizeFirstLetter(
                    label.integration.name.replaceAll("-", " ")
                  )}`}
                  icon="sync_alt"
                />
              </View>
            </View>
          )}
        </View>

        <View
          style={{
            padding: 20,
            gap: 3,
            backgroundColor: userTheme[2],
            borderWidth: 1,
            borderColor: userTheme[5],
            borderRadius: 20,
            marginTop: 20,
          }}
        >
          <Text variant="eyebrow">Items</Text>
          <View style={{ marginHorizontal: -10 }}>
            {data?.entities ? (
              data.entities.map((entity) => (
                <Entity
                  item={entity}
                  key={entity.id}
                  onTaskUpdate={() => {}}
                  openColumnMenu={() => {}}
                />
              ))
            ) : error ? (
              <ErrorAlert />
            ) : (
              <View style={{ alignItems: "center", paddingVertical: 100 }}>
                <Spinner />
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const Labels = () => {
  const [selectedLabel, setSelectedLabel] = useState<number | null>(null);
  const theme = useColorTheme();

  const [query, setQuery] = useState("");

  const { data, mutate, error } = useSWR(["space/labels"]);
  useHotkeys("esc", () => setSelectedLabel(null));

  const d =
    Array.isArray(data) &&
    data.map((l) => ({ ...l, selected: l.id === selectedLabel }));

  const selectedLabelData = selectedLabel && d.find((i) => i.selected);

  return (
    <View style={{ flexDirection: "row", flex: 1 }}>
      {Array.isArray(d) ? (
        <>
          <View
            style={{
              flex: 1,
              borderRightWidth: 1,
              borderRightColor: theme[5],
              padding: 20,
              paddingBottom: 0,
            }}
          >
            <TextField
              autoFocus
              value={query}
              onChangeText={setQuery}
              variant="filled+outlined"
              placeholder="Search labels..."
            />
            <FlashList
              estimatedItemSize={60}
              data={d.filter((l) =>
                l.name.toLowerCase().includes(query.toLowerCase())
              )}
              ListEmptyComponent={() => (
                <View
                  style={{
                    flex: 1,
                    height: "100%",
                    minHeight: 500,
                    gap: 10,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Emoji emoji="1f937" size={40} />
                  <Text style={{ color: theme[9], fontSize: 20 }} weight={600}>
                    No labels found
                  </Text>
                </View>
              )}
              contentContainerStyle={{ paddingTop: 20 }}
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
                  {/* {selectedLabel === item.id && <Icon>east</Icon>} */}
                </ListItemButton>
              )}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
          {selectedLabelData ? (
            <LabelDetails
              setSelectedLabel={setSelectedLabel}
              label={selectedLabelData}
            />
          ) : (
            <View
              style={{
                flex: 2,
                justifyContent: "center",
                alignItems: "center",
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
