import { CreateEntityTrigger } from "@/components/collections/views/CreateEntityTrigger";
import LabelPicker from "@/components/labels/picker";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { ProfilePicture } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Logo from "@/ui/logo";
import MenuPopover from "@/ui/MenuPopover";
import { Portal } from "@gorhom/portal";
import dayjs from "dayjs";
import { useGlobalSearchParams } from "expo-router";
import { useState } from "react";
import { Linking, Platform, View } from "react-native";
import Toast from "react-native-toast-message";

function Branding() {
  const theme = useColorTheme();
  const { session } = useUser();

  return (
    <View style={{ flexDirection: "row", padding: 20, alignItems: "center" }}>
      <Logo size={40} />

      <MenuPopover
        trigger={
          <IconButton size={35}>
            <ProfilePicture
              name={session.user?.profile?.name || ""}
              image={session.user?.profile?.picture}
              size={35}
              disabled
              style={{}}
            />
          </IconButton>
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
            icon: "north_east",
            text: "Open Dysperse",
            callback: () => Linking.openURL("https://app.dysperse.com"),
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
  const [loading, setLoading] = useState(false);

  if (!params.pageData) {
    return <View style={{ flex: 1, backgroundColor: theme[1] }} />;
  }

  const pageData = JSON.parse(params.pageData as any);

  const handleSaveWebpage = async () => {
    setLoading(true);
    try {
      const task = await sendApiRequest(
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
      Toast.show({
        type: "success",
        text1: "Saved webpage!",
        props: {
          renderTrailingIcon: () => (
            <LabelPicker
              label={task.label}
              onClose={() => {}}
              onOpen={() => Toast.hide()}
              defaultCollection={task.collectionId}
              disabled={Boolean(task.label?.integrationParams)}
              setLabel={(label) => {
                sendApiRequest(
                  sessionToken,
                  "PUT",
                  "space/entity",
                  {},
                  {
                    body: JSON.stringify({
                      id: task.id,
                      labelId: (label as any).id,
                    }),
                  }
                );
              }}
            >
              <IconButton
                icon="new_label"
                size={40}
                style={{
                  marginRight: 5,
                  marginLeft: -10,
                }}
                backgroundColors={{
                  default: theme[5],
                  hovered: theme[6],
                  pressed: theme[7],
                }}
              />
            </LabelPicker>
          ),
        },
      });
    } catch (e) {
      Toast.show({ type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <View
        {...(Platform.OS === "web" && {
          onContextMenu: () => {
            return false;
          },
        })}
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
            isLoading={loading}
          >
            <Icon size={40}>bookmark</Icon>
            <ButtonText weight={900} style={{ fontSize: 20 }}>
              Save webpage
            </ButtonText>
          </Button>
          <Button
            variant="filled"
            height={90}
            onPress={() => window.parent.postMessage("openSidePanel", "*")}
            containerStyle={{ borderRadius: 99 }}
          >
            <Icon size={40}>dock_to_left</Icon>
            <ButtonText weight={900} style={{ fontSize: 20 }}>
              Open in panel
            </ButtonText>
          </Button>
        </View>
      </View>
    </Portal>
  );
}

