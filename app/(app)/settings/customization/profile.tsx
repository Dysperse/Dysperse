import { SettingsLayout } from "@/components/settings/layout";
import { settingStyles } from "@/components/settings/settingsStyles";
import { useUser } from "@/context/useUser";
import { ProfilePicture } from "@/ui/Avatar";
import ErrorAlert from "@/ui/Error";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import useSWR from "swr";

function ProfileBanner({ data }) {
  const theme = useColorTheme();

  return (
    <LinearGradient
      colors={[theme[9], theme[5]]}
      style={{
        padding: 30,
        height: 140,
        marginBottom: 20,
      }}
    >
      <ProfilePicture
        style={{ top: 80, position: "absolute" }}
        name={data.profile?.name || "--"}
        image={data.profile?.picture}
        size={90}
      />
    </LinearGradient>
  );
}

export default function Page() {
  const theme = useColorTheme();
  const { session } = useUser();
  const { data, error } = useSWR([
    "user/profile",
    { email: session.user.email },
  ]);

  return (
    <SettingsLayout>
      <Text heading style={{ fontSize: 50 }}>
        Profile
      </Text>
      {data ? (
        <>
          <View
            style={{
              borderRadius: 20,
              backgroundColor: theme[3],
              overflow: "hidden",
            }}
          >
            <ProfileBanner data={data} />
            <View style={{ paddingHorizontal: 40 }}>
              <Text weight={800} style={{ fontSize: 30, marginTop: 20 }}>
                {data.profile.name}
              </Text>
              <Text style={{ fontSize: 20, opacity: 0.6, marginBottom: 35 }}>
                {data.username ? `@${data.username}` : data.email}
              </Text>
            </View>
          </View>
          <View style={{ paddingHorizontal: 10 }}>
            <Text style={settingStyles.heading}>About me</Text>
            <TextField
              editable={false}
              variant="filled+outlined"
              value={data.profile.name}
              style={{ marginBottom: 10 }}
            />
            <TextField
              variant="filled+outlined"
              defaultValue={data.profile.bio}
              multiline
              placeholder="Tell the world about yourself <3"
            />
            <Text style={settingStyles.heading}>Picture</Text>
            <TextField
              editable={false}
              variant="filled+outlined"
              value={data.profile.picture}
            />
            <Text style={settingStyles.heading}>Email & Username</Text>
            <TextField
              editable={false}
              variant="filled+outlined"
              value={data.email}
              style={{ marginBottom: 10 }}
            />
            <TextField
              editable={false}
              variant="filled+outlined"
              value={data.username}
              style={{ marginBottom: 10 }}
            />
            <Text style={settingStyles.heading}>Birthday</Text>
            <TextField
              editable={false}
              variant="filled+outlined"
              value={dayjs(data.profile.birthday).format("MMMM D, YYYY")}
              placeholder="Tell the world about yourself <3"
            />
          </View>
        </>
      ) : error ? (
        <ErrorAlert />
      ) : (
        <Text>Loading...</Text>
      )}
    </SettingsLayout>
  );
}
