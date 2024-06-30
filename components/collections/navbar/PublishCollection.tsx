import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { Avatar } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import { useColorTheme } from "@/ui/color/theme-provider";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Text, { getFontName } from "@/ui/Text";
import { View } from "react-native";
import Toast from "react-native-toast-message";

export const PublishCollection = ({ collection, navigation }: any) => {
  const { data, mutate } = collection;
  const { session } = useSession();
  const theme = useColorTheme();

  const updateCollection = async (key, value) => {
    try {
      mutate({ ...data, [key]: value });
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

  return process.env.NODE_ENV === "development" ? (
    <View style={{ marginHorizontal: -10 }}>
      {data?.public ? (
        <>
          <ListItemButton disabled>
            <Avatar icon="celebration" size={40} disabled />
            <ListItemText
              primary="Published to the Dysverse!"
              secondary="Tap to view or unpublish"
            />
            <View style={{ flexDirection: "row", gap: 5 }}>
              <IconButton
                size={45}
                variant="outlined"
                onPress={() => updateCollection("public", false)}
                icon="delete"
              />
              <IconButton icon="open_in_new" variant="filled" size={45} />
            </View>
          </ListItemButton>
          <ListItemButton onPress={() => navigation.navigate("publish")}>
            <Avatar icon="format_paint" size={40} disabled />
            <ListItemText primary="Template customization" />
            <Icon>arrow_forward_ios</Icon>
          </ListItemButton>
        </>
      ) : (
        <ListItemButton disabled>
          <Avatar icon="publish" size={40} disabled />
          <ListItemText
            primary="Publish to the Dysverse"
            secondary="Create a template which anyone can use to create their own collection. "
          />
          <Button
            variant="filled"
            style={{ paddingHorizontal: 20 }}
            containerStyle={{ marginLeft: 10 }}
            backgroundColors={{
              default: theme[9],
              hovered: theme[10],
              pressed: theme[11],
            }}
            onPress={() => updateCollection("public", true)}
          >
            <ButtonText style={{ color: theme[3] }}>Publish</ButtonText>
          </Button>
        </ListItemButton>
      )}
    </View>
  ) : (
    <View
      style={{
        padding: 20,
        paddingHorizontal: 30,
        backgroundColor: theme[3],
        borderWidth: 1,
        borderColor: theme[6],
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 25,
        gap: 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text
          weight={900}
          style={{
            fontSize: 20,
          }}
        >
          Publish to the{" "}
        </Text>
        <Chip
          style={{ backgroundColor: theme[6], gap: 5 }}
          label={
            <Text
              style={{
                fontFamily: getFontName("jetBrainsMono", 500),
                color: theme[11],
                fontStyle: "italic",
              }}
            >
              DYSVERSE
            </Text>
          }
          icon={<Emoji emoji="1f680" size={20} />}
        />
      </View>
      <Text style={{ opacity: 0.6, textAlign: "center" }}>
        Create a template which anyone can use to create their own collection.
        Your tasks won't be shared.
      </Text>
      <Button variant="outlined">
        <ButtonText>Coming soon</ButtonText>
      </Button>
    </View>
  );
};
