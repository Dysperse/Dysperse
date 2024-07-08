import { collectionViews } from "@/components/layout/command-palette/list";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import Alert from "@/ui/Alert";
import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import { EmojiPicker } from "@/ui/EmojiPicker";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import MenuPopover from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, View } from "react-native";
import Toast from "react-native-toast-message";

const collectionCategories = [
  { text: "Home", icon: "home" },
  { text: "Business", icon: "business" },
  { text: "Education", icon: "school" },
  { text: "Movies & TV", icon: "theaters" },
  { text: "Food & Drink", icon: "lunch_dining" },
  { text: "Sports & Fitness", icon: "exercise" },
  { text: "Meet-ups", icon: "celebration" },
  { text: "Travel", icon: "flight" },
  { text: "Holidays", icon: "celebration" },
];

const Labels = ({ labels }) => {
  const theme = useColorTheme();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
      {labels.map((label) => (
        <Chip
          key={label.id}
          style={{ backgroundColor: theme[5] }}
          label={label.name}
          icon={<Emoji emoji={label.emoji} size={24} />}
        />
      ))}
    </View>
  );
};

export const CollectionInfo = ({ navigation, collection }) => {
  const { session } = useSession();
  const { data, mutate } = collection;
  const theme = useColorTheme();

  const updateCollection = async (key, value) => {
    try {
      mutate({ ...data, [key]: value }, { revalidate: false });
      const res = await sendApiRequest(
        session,
        "PUT",
        "space/collections",
        {},
        {
          body: JSON.stringify({ id: data.id, [key]: value }),
        }
      );
      if (res.error) throw new Error(res);
    } catch (e) {
      console.error(e);
      Toast.show({ type: "error" });
    }
  };

  return data ? (
    <BottomSheetScrollView contentContainerStyle={{ padding: 30 }}>
      <Alert
        title="Heads up!"
        subtitle="Templates are visible to the public, including non-users. Copied collections will preserve the same overall structure. Templates that violate our values will be removed."
        emoji="26A0"
      />
      <View
        style={{
          backgroundColor: theme[3],
          borderRadius: 25,
          overflow: "hidden",
        }}
      >
        <LinearGradient
          colors={[theme[3], theme[4]]}
          style={{
            paddingTop: 100,
            justifyContent: "center",
          }}
        ></LinearGradient>
        <View
          style={{
            marginBottom: -60,
            paddingLeft: 20,
            marginTop: -50,
            zIndex: 99,
          }}
        >
          <EmojiPicker setEmoji={(emoji) => updateCollection("emoji", emoji)}>
            <Pressable
              style={({ pressed, hovered }) => ({
                borderWidth: 1,
                borderRadius: 99,
                borderColor: theme[pressed ? 8 : hovered ? 7 : 6],
                width: 100,
                height: 100,
                zIndex: 99,
                backgroundColor: theme[pressed ? 7 : hovered ? 6 : 5],
                justifyContent: "center",
                alignItems: "center",
              })}
            >
              <Emoji emoji={data.emoji} size={64} />
            </Pressable>
          </EmojiPicker>
        </View>

        <View
          style={{
            padding: 20,
            paddingTop: 70,
          }}
        >
          <Text variant="eyebrow" style={{ marginVertical: 5 }}>
            Collection name
          </Text>
          <TextField
            placeholder="Collection name"
            defaultValue={data.name}
            variant="filled+outlined"
            style={{ fontSize: 30 }}
            weight={900}
            onBlur={(e) => updateCollection("name", e.nativeEvent.text)}
          />
          <Text variant="eyebrow" style={{ marginVertical: 5, marginTop: 20 }}>
            About
          </Text>
          <TextField
            placeholder="What's this collection about?"
            defaultValue={data.description}
            variant="filled+outlined"
            multiline
            style={{ minHeight: 100 }}
            onBlur={(e) => updateCollection("description", e.nativeEvent.text)}
          />

          <Text variant="eyebrow" style={{ marginVertical: 5, marginTop: 20 }}>
            Labels
          </Text>
          <Labels labels={data.labels} />
          <Text variant="eyebrow" style={{ marginVertical: 5, marginTop: 20 }}>
            Category
          </Text>
          <MenuPopover
            scrollViewStyle={{
              maxHeight: 285,
            }}
            trigger={
              <Button variant="outlined">
                <ButtonText>
                  {data.category ? "Category 1" : "Select category"}
                </ButtonText>
              </Button>
            }
            options={collectionCategories.map((category: any) => ({
              ...category,
              callback: () => updateCollection("category", category.text),
            }))}
          />
        </View>
      </View>

      <View style={{ paddingTop: 20, gap: 10, marginTop: 20 }}>
        <ListItemButton disabled>
          <ListItemText
            primary="Default view"
            secondary="Tabs will default to this view when opened"
          />
          <MenuPopover
            trigger={
              <Button variant="outlined">
                <ButtonText>
                  {capitalizeFirstLetter(data.defaultView)}
                </ButtonText>
                <Icon>expand_more</Icon>
              </Button>
            }
            options={Object.keys(collectionViews).map((key) => ({
              text: capitalizeFirstLetter(key),
              icon: collectionViews[key],
              selected: data.defaultView === key,
              callback: () => updateCollection("defaultView", key),
            }))}
          />
        </ListItemButton>

        <ListItemButton
          onPress={() => updateCollection("public", !data.public)}
        >
          <ListItemText
            primary="Share items from this collection"
            secondary="Others can copy labels, but items aren't shared."
          />
          <Icon size={40} style={{ opacity: data.public ? 1 : 0.4 }}>
            toggle_{data.public ? "on" : "off"}
          </Icon>
        </ListItemButton>
        <ListItemButton
          onPress={() =>
            updateCollection("keepProfileAnonymous", !data.keepProfileAnonymous)
          }
        >
          <ListItemText primary="Keep my profile anonymous" />
          <Icon
            size={40}
            style={{ opacity: data.keepProfileAnonymous ? 1 : 0.4 }}
          >
            toggle_{data.keepProfileAnonymous ? "on" : "off"}
          </Icon>
        </ListItemButton>
      </View>
    </BottomSheetScrollView>
  ) : (
    <Spinner />
  );
};
