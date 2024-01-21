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
import { useLocalSearchParams } from "expo-router";
import { ScrollView, View, useColorScheme } from "react-native";
import useSWR from "swr";

export default function Page() {
  const { id } = useLocalSearchParams();
  const { data, error } = useSWR(id ? ["space/labels/label", { id }] : null);

  const setEmoji = () => {};
  const theme = useColorTheme();
  const color = useColor(data.color, useColorScheme() === "dark");

  return (
    <ContentWrapper>
      <ScrollView
        contentContainerStyle={{
          minHeight: "100%",
        }}
      >
        {data ? (
          <>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <IconButton
                size={55}
                style={{ margin: 15 }}
                variant="outlined"
                icon="arrow_back_ios_new"
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 30,
                marginTop: 30,
                paddingHorizontal: 100,
              }}
            >
              <MenuPopover
                trigger={
                  <View
                    style={{
                      width: 100,
                      height: 100,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 40,
                      backgroundColor: color[4],
                    }}
                  >
                    <Emoji size={40} emoji={data.emoji} />
                  </View>
                }
                options={[
                  { text: "Edit icon", icon: "mood", callback: () => {} },
                  { text: "Change color", icon: "palette", callback: () => {} },
                ]}
              />
              <View>
                <View style={{ flexDirection: "row", marginTop: 15 }}>
                  <Chip label="Label" icon="tag" dense />
                </View>
                <Text heading style={{ fontSize: 60 }}>
                  {data.name}
                </Text>
              </View>
              <View
                style={{
                  borderWidth: 1,
                  borderRadius: 20,
                  padding: 20,
                  width: 350,
                  marginLeft: "auto",
                  backgroundColor: theme[2],
                  borderColor: theme[4],
                }}
              >
                <Text
                  variant="eyebrow"
                  style={{ marginTop: -5, marginBottom: 5 }}
                >
                  Found in
                </Text>
                <View
                  style={{
                    gap: 5,
                    flexDirection: "row",
                    flexWrap: "wrap",
                  }}
                >
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
        ) : error ? (
          <ErrorAlert />
        ) : (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Spinner />
          </View>
        )}
      </ScrollView>
    </ContentWrapper>
  );
}
