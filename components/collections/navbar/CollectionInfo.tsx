import { COLLECTION_VIEWS } from "@/components/layout/command-palette/list";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import Alert from "@/ui/Alert";
import { Button, ButtonText } from "@/ui/Button";
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
import { router, usePathname } from "expo-router";
import { useRef } from "react";
import { Pressable, View } from "react-native";
import Toast from "react-native-toast-message";
import { CollectionLabelMenu } from "./CollectionLabelMenu";

const collectionCategories = [
  { text: "Home", icon: "home" },
  { text: "Business", icon: "business" },
  { text: "Education", icon: "school" },
  { text: "Movies & TV", icon: "theaters" },
  { text: "Food & Drink", icon: "lunch_dining" },
  { text: "Sports & Fitness", icon: "exercise" },
  { text: "Lifestyle", icon: "emoji_objects" },
  { text: "Meet-ups", icon: "celebration" },
  { text: "Travel", icon: "flight" },
  { text: "Holidays", icon: "celebration" },
];

const Labels = ({ labels }) => {
  const sheetRef = useRef();
  const openLabelPicker = () => sheetRef.current?.present();

  return (
    <View style={{ gap: 5, marginHorizontal: -15 }}>
      {labels.map((label) => (
        <ListItemButton key={label.id}>
          <Emoji emoji={label.emoji} size={24} />
          <ListItemText primary={label?.name} />
        </ListItemButton>
      ))}

      <CollectionLabelMenu sheetRef={sheetRef}>
        <Pressable />
      </CollectionLabelMenu>

      <Button
        large
        onPress={openLabelPicker}
        text="Edit"
        icon="edit"
        variant="filled"
        containerStyle={{ marginHorizontal: 10 }}
      />
    </View>
  );
};

export const CollectionInfo = ({ collection }) => {
  const { session } = useSession();
  const { data, mutate } = collection;
  const theme = useColorTheme();
  const pathname = usePathname();

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
    <View style={{ paddingHorizontal: 20 }}>
      {collection.public && (
        <Alert
          title="Heads up!"
          subtitle="Templates are visible to the public, including non-users. Copied collections will preserve the same overall structure. Templates that violate our values will be removed."
          emoji="26A0"
        />
      )}
      <View>
        <View
          style={{
            zIndex: 99,
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row",
          }}
        >
          <Text variant="eyebrow">Icon</Text>
          <EmojiPicker setEmoji={(emoji) => updateCollection("emoji", emoji)}>
            <Pressable
              style={({ pressed, hovered }) => ({
                borderWidth: 2,
                borderRadius: 10,
                borderColor: theme[pressed ? 8 : hovered ? 7 : 6],
                width: 50,
                height: 50,
                borderStyle: "dashed",
                zIndex: 99,
                justifyContent: "center",
                alignItems: "center",
              })}
            >
              <Emoji emoji={data.emoji} size={30} />
            </Pressable>
          </EmojiPicker>
        </View>

        <Text variant="eyebrow" style={{ marginVertical: 5 }}>
          Name
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
      </View>

      <Text variant="eyebrow" style={{ marginTop: 30 }}>
        Settings
      </Text>
      <View style={{ marginHorizontal: -13 }}>
        <ListItemButton
          onPress={() => updateCollection("showCompleted", !data.showCompleted)}
        >
          <ListItemText primary="Show completed tasks?" />
          <Icon size={40} style={{ opacity: data.showCompleted ? 1 : 0.4 }}>
            toggle_{data.showCompleted ? "on" : "off"}
          </Icon>
        </ListItemButton>
        <ListItemButton
          onPress={() => router.push(pathname.replace("customize", "pin-code"))}
        >
          <ListItemText primary="Password protection" />
          <Icon>arrow_forward_ios</Icon>
        </ListItemButton>
        <ListItemButton disabled>
          <ListItemText
            primary="Default view"
            secondary="When new tabs are opened"
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
            options={Object.keys(COLLECTION_VIEWS).map((key) => ({
              text: capitalizeFirstLetter(key),
              icon: COLLECTION_VIEWS[key].icon,
              selected: data.defaultView === key,
              callback: () => updateCollection("defaultView", key),
            }))}
          />
        </ListItemButton>
      </View>
      <Text variant="eyebrow" style={{ marginTop: 30 }}>
        Template settings
      </Text>
      <View style={{ marginHorizontal: -13 }}>
        <ListItemButton
          onPress={() => updateCollection("public", !data.public)}
        >
          <ListItemText
            primary="Share items from this collection"
            secondary={
              data.public
                ? "Templates include labels and items."
                : "Others can copy labels, but items aren't shared."
            }
          />
          <Icon size={40} style={{ opacity: data.public ? 1 : 0.4 }}>
            toggle_{data.public ? "on" : "off"}
          </Icon>
        </ListItemButton>
        <ListItemButton>
          <ListItemText primary="Category" />
          <MenuPopover
            scrollViewStyle={{
              maxHeight: 285,
            }}
            trigger={
              <Button variant="outlined">
                {data.category ? (
                  <View style={{ flexDirection: "row", gap: 5 }}>
                    <Icon size={20}>
                      {
                        collectionCategories.find(
                          (category) => category.text === data.category
                        ).icon
                      }
                    </Icon>
                    <ButtonText>{data.category}</ButtonText>
                  </View>
                ) : (
                  <>
                    <ButtonText>Select</ButtonText>
                    <Icon>expand_more</Icon>
                  </>
                )}
              </Button>
            }
            options={collectionCategories.map((category: any) => ({
              ...category,
              callback: () => updateCollection("category", category.text),
            }))}
          />
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
    </View>
  ) : (
    <Spinner />
  );
};

