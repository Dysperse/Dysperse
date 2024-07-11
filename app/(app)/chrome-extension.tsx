import { CreateEntityTrigger } from "@/components/collections/views/CreateEntityTrigger";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { ProfilePicture } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import Logo from "@/ui/logo";
import MenuPopover from "@/ui/MenuPopover";
import { Portal } from "@gorhom/portal";
import dayjs from "dayjs";
import { useGlobalSearchParams } from "expo-router";
import { Linking, View } from "react-native";
import Toast from "react-native-toast-message";

function Branding() {
  const theme = useColorTheme();
  const { session } = useUser();

  return (
    <View style={{ flexDirection: "row", padding: 20, alignItems: "center" }}>
      <Logo size={40} />

      <MenuPopover
        trigger={
          <ProfilePicture
            name={session.user?.profile?.name || ""}
            image={session.user?.profile?.picture}
            size={35}
            style={{}}
          />
        }
        menuProps={{
          style: { marginLeft: "auto" },
          rendererProps: { placement: "bottom" },
        }}
        options={[
          {
            icon: "info",
            text: "About",
            callback: () => Linking.openURL("https://dysperse.com"),
          },
          {
            icon: "person",
            text: "Profile",
            callback: () =>
              Linking.openURL(
                "https://app.dysperse.com/settings/account/profile"
              ),
          },
          {
            icon: "settings",
            text: "Settings",
            callback: () =>
              Linking.openURL("https://app.dysperse.com/settings"),
          },
        ]}
      />
    </View>
  );
}

export default function ChromeExtension() {
  const params = useGlobalSearchParams();
  const theme = useColorTheme();
  const { sessionToken } = useUser();

  if (!params.pageData) {
    return <View style={{ flex: 1, backgroundColor: theme[1] }} />;
  }

  const pageData = JSON.parse(params.pageData as any);

  const handleSaveWebpage = async () => {
    try {
      await sendApiRequest(
        sessionToken,
        "POST",
        "space/entity",
        {},
        {
          body: JSON.stringify({
            name: pageData.title,
            note: "This task was saved from the #dysperse extension",
            start: dayjs().toISOString(),
            type: "TASK",
            attachments: [{ type: "LINK", data: pageData.url }],
          }),
        }
      );
    } catch (e) {
      Toast.show({ type: "error" });
    }
  };

  return (
    <Portal>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme[2],
        }}
      >
        <Branding />
        <View style={{ padding: 20, paddingTop: 0, gap: 10 }}>
          <CreateEntityTrigger defaultValues={{ date: dayjs() }}>
            <Button
              variant="filled"
              height={90}
              containerStyle={{ borderRadius: 99 }}
            >
              <Icon size={40}>add</Icon>
              <ButtonText weight={900} style={{ fontSize: 20 }}>
                Create task
              </ButtonText>
            </Button>
          </CreateEntityTrigger>
          <Button
            variant="filled"
            height={90}
            onPress={handleSaveWebpage}
            containerStyle={{ borderRadius: 99 }}
          >
            <Icon size={40}>bookmark</Icon>
            <ButtonText weight={900} style={{ fontSize: 20 }}>
              Save webpage
            </ButtonText>
          </Button>
          <Button
            variant="filled"
            height={90}
            onPress={() => Linking.openURL("https://app.dysperse.com")}
            containerStyle={{ borderRadius: 99 }}
          >
            <Icon size={40}>open_in_new</Icon>
            <ButtonText weight={900} style={{ fontSize: 20 }}>
              Open Dysperse
            </ButtonText>
          </Button>
        </View>
      </View>
    </Portal>
  );
}
