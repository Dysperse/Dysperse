import { CreateEntityTrigger } from "@/components/collections/views/CreateEntityTrigger";
import LabelPicker from "@/components/labels/picker";
import { useBadgingService } from "@/context/BadgingProvider";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { ProfilePicture } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import DropdownMenu from "@/ui/DropdownMenu";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Logo from "@/ui/logo";
import dayjs from "dayjs";
import { useGlobalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Linking, Platform, View } from "react-native";
import { toast } from "sonner-native";

function Branding() {
  const { session } = useUser();

  return (
    <View style={{ flexDirection: "row", padding: 20, alignItems: "center" }}>
      <Logo size={40} />

      <DropdownMenu
        menuWidth={300}
        horizontalPlacement="right"
        options={[
          {
            icon: "info",
            text: "About",
            onPress: () => Linking.openURL("https://dysperse.com"),
          },
          {
            icon: "north_east",
            text: "Open Dysperse",
            onPress: () => Linking.openURL("https://go.dysperse.com"),
          },
          {
            icon: "settings",
            text: "Settings",
            onPress: () => Linking.openURL("https://go.dysperse.com/settings"),
          },
        ]}
      >
        <IconButton size={35} style={{ marginLeft: "auto" }}>
          <ProfilePicture
            name={session.user?.profile?.name || ""}
            image={session.user?.profile?.picture}
            size={35}
            disabled
          />
        </IconButton>
      </DropdownMenu>
    </View>
  );
}

export default function ChromeExtension() {
  const params = useGlobalSearchParams();
  const theme = useColorTheme();
  const { sessionToken } = useUser();
  const [loading, setLoading] = useState(false);
  const badgingService = useBadgingService();

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
            note: pageData.url,
            start: dayjs().toISOString(),
            type: "TASK",
          }),
        }
      );
      badgingService.current.mutate();
      toast.success("Saved webpage!", {
        action: (
          <LabelPicker
            label={task.label}
            onClose={() => {}}
            onOpen={() => toast.dismiss()}
            defaultCollection={task.collectionId}
            disabled={Boolean(task.label?.integrationParams)}
            setLabel={async (label) => {
              await sendApiRequest(
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
              badgingService.current.mutate();
            }}
          >
            <Button
              dense
              icon="new_label"
              containerStyle={{ marginTop: -10 }}
              backgroundColors={{
                default: theme[5],
                hovered: theme[6],
                pressed: theme[7],
              }}
            />
          </LabelPicker>
        ),
      });
    } catch (e) {
      toast.error("Something went wrong", {
        description: "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
}

