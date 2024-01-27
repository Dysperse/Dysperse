import { Entity } from "@/components/collections/entity";
import { ContentWrapper } from "@/components/layout/content";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import IconButton from "@/ui/IconButton";
import MenuPopover from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, View, useColorScheme } from "react-native";
import useSWR from "swr";

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 30,
    marginTop: 30,
    marginBottom: 20,
  },
  icon: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 40,
  },
  row: { flexDirection: "row", marginTop: 15 },
  right: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    width: 350,
  },
  foundInContainer: {
    gap: 5,
    flexDirection: "row",
    flexWrap: "wrap",
  },
});

function LabelHeader({ data }) {
  const theme = useColorTheme();
  const color = useColor(data.color, useColorScheme() === "dark");

  return (
    <>
      <View style={headerStyles.container}>
        <MenuPopover
          trigger={
            <Pressable
              style={[
                headerStyles.icon,
                {
                  backgroundColor: color[4],
                },
              ]}
            >
              <Emoji size={40} emoji={data.emoji} />
            </Pressable>
          }
          options={[
            { text: "Edit icon", icon: "mood", callback: () => {} },
            { text: "Change color", icon: "palette", callback: () => {} },
          ]}
        />
        <View style={{ flex: 1 }}>
          <View style={headerStyles.row}>
            <Chip label="Label" icon="tag" dense />
          </View>
          <Text heading style={{ fontSize: 60 }} numberOfLines={1}>
            {data.name}
          </Text>
        </View>
        <View
          style={[
            headerStyles.right,
            {
              backgroundColor: theme[2],
              borderColor: theme[4],
            },
          ]}
        >
          <Text variant="eyebrow" style={{ marginTop: -5, marginBottom: 5 }}>
            Found in
          </Text>
          <View style={headerStyles.foundInContainer}>
            <Chip label={`${data._count.entities} items`} icon="shapes" />
            {data.collections.map((collection) => (
              <Chip
                key={collection.id}
                label={collection.name}
                icon={
                  collection.emoji ? (
                    <Emoji emoji={collection.emoji} />
                  ) : (
                    "grid_view"
                  )
                }
              />
            ))}
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    margin: 15,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    paddingRight: 10,
  },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
});

export default function Page() {
  const { id } = useLocalSearchParams();
  const { data, error } = useSWR(id ? ["space/labels/label", { id }] : null);

  //   const handleBack = () => router.push("/all-labels");

  return (
    <ContentWrapper>
      <View style={styles.header}>
        <IconButton size={55} variant="outlined" icon="edit" />
        <IconButton size={55} variant="outlined" icon="delete" />
      </View>
      <View style={styles.scrollContainer}>
        {data?.entities ? (
          <>
            <FlashList
              data={data.entities}
              ListHeaderComponent={<LabelHeader data={data} />}
              contentContainerStyle={{
                paddingHorizontal: 100,
                paddingBottom: 50,
              }}
              renderItem={({ item }) => (
                <Entity
                  item={item}
                  onTaskUpdate={() => {}}
                  openColumnMenu={() => {}}
                />
              )}
              keyExtractor={(item: any) => item.id}
            />
          </>
        ) : error ? (
          <ErrorAlert />
        ) : (
          <View style={styles.loading}>
            <Spinner />
          </View>
        )}
      </View>
    </ContentWrapper>
  );
}
