import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { Avatar } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import { usePathname } from "expo-router";
import { Linking, View } from "react-native";
import Toast from "react-native-toast-message";

export const PublishCollection = ({ collection }: any) => {
  const { data, mutate } = collection;
  const { session } = useSession();
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

  return (
    <View style={{ marginHorizontal: -10 }}>
      {data?.public ? (
        <>
          <ListItemButton disabled>
            <Avatar icon="celebration" size={40} disabled />
            <ListItemText
              primary="Published!"
              secondary="Visible in the Dysverse"
            />
            <View style={{ flexDirection: "row", gap: 5 }}>
              <IconButton
                size={45}
                variant="outlined"
                onPress={() => updateCollection("public", false)}
                icon="delete"
              />
              <IconButton
                icon="open_in_new"
                onPress={() =>
                  Linking.openURL(`https://dysperse.com/templates/${data.id}`)
                }
                variant="filled"
                size={45}
              />
            </View>
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
  );
};

