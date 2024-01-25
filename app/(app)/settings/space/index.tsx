import { SettingsLayout } from "@/components/settings/layout";
import { settingStyles } from "@/components/settings/settingsStyles";
import { useUser } from "@/context/useUser";
import { Avatar, ProfilePicture } from "@/ui/Avatar";
import ErrorAlert from "@/ui/Error";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { View, useColorScheme } from "react-native";
import Collapsible from "react-native-collapsible";
import useSWR from "swr";

function SpaceHeader({ data }) {
  const spaceTheme = useColor(data?.color, useColorScheme() === "dark");

  return (
    <LinearGradient
      colors={[spaceTheme[4], spaceTheme[2], spaceTheme[3]]}
      start={[0, 0]}
      end={[1, 1]}
      style={{
        borderRadius: 25,
        height: 200,
        justifyContent: "flex-end",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 40 }}>{data.name}</Text>
      <Text>
        {data.members.length} member{data.members.length === 1 ? "" : "s"}
      </Text>
    </LinearGradient>
  );
}

function SpaceMembers({ data }) {
  return (
    <>
      {data.members.map((member) => (
        <ListItemButton
          key={member.id}
          disabled
          style={{ paddingHorizontal: 0 }}
        >
          <ProfilePicture
            image={member.user.profile.picture}
            name={member.user.profile.name}
            size={40}
          />
          <ListItemText
            primary={member.user.profile.name}
            secondary={capitalizeFirstLetter(member.access.toLowerCase())}
          />
          <MenuPopover
            trigger={<IconButton icon="more_horiz" variant="outlined" />}
            options={[
              ...["View only", "Member", "Owner"].map((access) => ({
                text: access,
                callback: () => {},
                selected: member.access === access.toUpperCase(),
              })),
              { divider: true, key: "divider" },
              { icon: "remove_circle", text: "Remove", callback: () => {} },
            ]}
          />
        </ListItemButton>
      ))}
      <ListItemButton disabled style={{ paddingHorizontal: 0 }}>
        <Avatar icon="add" size={40} />
        <ListItemText primary="Invite member" />
      </ListItemButton>
      <ListItemButton disabled style={{ paddingHorizontal: 0 }}>
        <Avatar icon="link" size={40} />
        <ListItemText primary="Copy invite link" />
      </ListItemButton>
    </>
  );
}

function SpaceStorage({ data }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const handleToggle = () => setIsCollapsed(!isCollapsed);
  const theme = useColorTheme();
  return (
    <View
      style={{
        backgroundColor: theme[isCollapsed ? 2 : 3],
        paddingHorizontal: isCollapsed ? 0 : 10,
        borderRadius: 20,
      }}
    >
      <ListItemButton
        onPress={handleToggle}
        style={{ paddingHorizontal: 0, backgroundColor: "transparent" }}
      >
        <Avatar icon="storage" size={40} />
        <ListItemText
          primary={`${-~data.storage?.used} / ${
            data.storage?.limit
          } credits used`}
          secondary={`${-~(data.storage.limit - data.storage.used)} left`}
        />
        <IconButton
          icon="expand_more"
          variant="outlined"
          onPress={handleToggle}
        />
      </ListItemButton>
      <Collapsible collapsed={isCollapsed}>Hi</Collapsible>
    </View>
  );
}

export default function Page() {
  const { session } = useUser();
  const { data, error } = useSWR(
    session?.space ? ["space", { spaceId: session?.space?.space?.id }] : null
  );
  const spaceTheme = useColor(data?.color, useColorScheme() === "dark");

  return (
    <SettingsLayout>
      <Text heading style={{ fontSize: 50 }}>
        Space
      </Text>
      {data ? (
        <>
          <ColorThemeProvider theme={spaceTheme}>
            <SpaceHeader data={data} />
          </ColorThemeProvider>
          <View style={{ paddingHorizontal: 15 }}>
            <Text style={settingStyles.heading} weight={700}>
              Storage
            </Text>
            <SpaceStorage data={data} />
            <Text style={settingStyles.heading} weight={700}>
              Members
            </Text>
            <SpaceMembers data={data} />
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
