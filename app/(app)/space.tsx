import { ContentWrapper } from "@/components/layout/content";
import { useUser } from "@/context/useUser";
import { Avatar, ProfilePicture } from "@/ui/Avatar";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useHotkeys } from "react-hotkeys-hook";
import {
  Platform,
  StyleSheet,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import useSWR from "swr";

const spaceStyles = StyleSheet.create({
  button: {
    padding: 20,
    paddingRight: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonContent: {
    flexGrow: 1,
  },
});

function ProgressBar({
  progress,
  height = 5,
}: {
  progress: number;
  height?: number;
}) {
  const theme = useColorTheme();
  return (
    <View
      style={{
        height,
        backgroundColor: theme[3],
        borderRadius: 99,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height,
          width: `${progress * 100}%`,
          backgroundColor: theme[9],
        }}
      />
    </View>
  );
}

function MembersTrigger({ space }: any) {
  const theme = useColor(space.color, useColorScheme() === "dark");

  return (
    <View style={{ padding: 20 }}>
      <Text variant="eyebrow" style={{ paddingLeft: 8 }}>
        Members
      </Text>
      {space.members.map((member) => (
        <ListItemButton key={member.id} disabled>
          <ProfilePicture
            size={35}
            name={member.user.profile.name}
            image={member.user.profile.picture}
          />
          <ListItemText
            primary={member.user.profile.name}
            secondary={capitalizeFirstLetter(member.access.toLowerCase())}
          />
          <IconButton icon="more_horiz" variant="outlined" />
        </ListItemButton>
      ))}
    </View>
  );
}

function StorageTrigger({ space }) {
  const theme = useColorTheme();
  const cardStyles: any = {
    borderWidth: 2,
    borderColor: theme[6],
    height: 130,
    flex: 1,
    justifyContent: "flex-end",
    borderRadius: 20,
    padding: 20,
  };
  const rowStyles: any = { flexDirection: "row", gap: 20, marginBottom: 20 };
  return (
    <View style={{ padding: 20, paddingLeft: 28 }}>
      <Text variant="eyebrow">Storage</Text>
      <View style={rowStyles}>
        <View style={cardStyles}>
          <Avatar icon="check" theme={space.color} />
          <Text>{space._count.entities} </Text>
          <Text>Tasks</Text>
        </View>
        <View style={cardStyles}>
          <Avatar icon="package_2" theme={space.color} />
          <Text>{space._count.entities} </Text>
          <Text>Items</Text>
        </View>
      </View>
      <View style={rowStyles}>
        <View style={cardStyles}>
          <Avatar icon="sticky_note_2" theme={space.color} />
          <Text>{space._count.entities} </Text>
          <Text>Notes</Text>
        </View>
        <View style={cardStyles}>
          <Avatar icon="label" theme={space.color} />
          <Text>{space._count.labels} </Text>
          <Text>Labels</Text>
        </View>
      </View>
    </View>
  );
}

function SpacePage({ space }: any) {
  const theme = useColor(space.color, useColorScheme() === "dark");
  const { height } = useWindowDimensions();

  return (
    <ColorThemeProvider theme={theme}>
      <ContentWrapper noPaddingTop>
        <ScrollView>
          {Platform.OS === "ios" && (
            <View
              style={{
                backgroundColor: theme[5],
                height,
                position: "absolute",
                top: -height,
                left: 0,
                right: 0,
              }}
            />
          )}
          <LinearGradient
            colors={[theme[4], theme[2], theme[3]]}
            start={[0, 0]}
            end={[1, 1]}
            style={{
              borderRadius: 10,
              padding: 20,
            }}
          >
            <View style={{ flexDirection: "row", gap: 10 }}>
              <IconButton
                onPress={() => router.back()}
                size={55}
                style={{ borderWidth: 1, borderColor: theme[6] }}
              >
                <Icon size={26}>close</Icon>
              </IconButton>
              <View style={{ flexGrow: 1 }} />
              <IconButton
                size={55}
                style={{ borderWidth: 1, borderColor: theme[6] }}
              >
                <Icon size={26}>edit</Icon>
              </IconButton>
              <IconButton
                size={55}
                style={{ borderWidth: 1, borderColor: theme[6] }}
              >
                <Icon size={26}>history</Icon>
              </IconButton>
              <IconButton
                size={55}
                style={{ borderWidth: 1, borderColor: theme[6] }}
              >
                <Icon size={26}>more_horiz</Icon>
              </IconButton>
            </View>
            <Text
              heading
              style={{
                fontSize: 50,
                marginVertical: 50,
                marginTop: 60,
                textAlign: "center",
              }}
            >
              {space.name}
            </Text>
          </LinearGradient>
          <View style={{ backgroundColor: theme[1], flex: 1 }}>
            <MembersTrigger space={space} />
            <TouchableOpacity style={spaceStyles.button}>
              <View style={spaceStyles.buttonContent}>
                <Text variant="eyebrow">Integrations</Text>
                <Text style={{ opacity: 0.6 }}>Coming soon!</Text>
              </View>
              <Icon>arrow_forward_ios</Icon>
            </TouchableOpacity>
            <StorageTrigger space={space} />
          </View>
        </ScrollView>
      </ContentWrapper>
    </ColorThemeProvider>
  );
}

export default function Page() {
  const { session } = useUser();
  const { data, error } = useSWR(
    session?.space ? ["space", { spaceId: session?.space?.space?.id }] : null
  );
  useHotkeys("esc", () => router.back());

  return (
    <>
      {data ? (
        <SpacePage space={data} />
      ) : error ? (
        <ErrorAlert />
      ) : (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Spinner />
        </View>
      )}
    </>
  );
}
