import { SettingsLayout } from "@/components/settings/layout";
import { settingStyles } from "@/components/settings/settingsStyles";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
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
import { useSharedValue } from "react-native-reanimated";
import useSWR from "swr";

function SpaceHeader({ data }) {
  const spaceTheme = useColor(data?.color, useColorScheme() === "dark");
  const breakpoints = useResponsiveBreakpoints();

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
      <Text numberOfLines={2} style={{ fontSize: breakpoints.md ? 40 : 30 }}>
        {data.name}
      </Text>
      <Text>
        {data.members?.length} member{data.members?.length === 1 ? "" : "s"}
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
  const isOpen = useSharedValue(0);
  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    isOpen.value = isCollapsed ? 1 : 1;
  };
  const theme = useColorTheme();
  const orange = useColor("orange", useColorScheme() === "dark");

  return (
    <>
      {/* bruh */}
      {/* <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          gap: 20,
          padding: 10,
          paddingHorizontal: 20,
          marginHorizontal: -10,
          marginBottom: 10,
          marginTop: 5,
          backgroundColor: orange[4],
          borderRadius: 20,
        }}
      >
        <Icon filled style={{ color: orange[11] }} size={30}>
          diamond
        </Icon>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, color: orange[11] }} weight={700}>
            elite
            <Text style={{ verticalAlign: "top", color: orange[11] }}>+</Text>
          </Text>
          <Text style={{ opacity: 0.6, color: orange[11] }}>
            Join #elite and unlock unlimited storage. Plans coming soon.
          </Text>
        </View>
        <Text style={{ fontSize: 20, color: orange[11] }} weight={200}>
          $1.99/mo
        </Text>
      </View> */}
      <View
        style={{
          backgroundColor: theme[isCollapsed ? 2 : 3],
          borderRadius: 20,
          paddingHorizontal: 10,
          marginHorizontal: -10,
          borderWidth: 1,
          borderColor: theme[isCollapsed ? 4 : 3],
        }}
      >
        <ListItemButton
          onPress={handleToggle}
          style={{ paddingHorizontal: 0, backgroundColor: "transparent" }}
        >
          <Avatar icon="storage" size={40} />
          <ListItemText
            primary={`${-~(
              (data.storage?.used / data.storage?.limit) *
              100
            )}% used`}
            secondary={`${-~(data.storage?.limit - data.storage?.used)}/${
              data.storage?.limit
            } credits left`}
          />
          <IconButton
            icon="expand_more"
            variant="outlined"
            onPress={handleToggle}
          />
        </ListItemButton>
        <Collapsible
          collapsed={isCollapsed}
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
          }}
        >
          {[
            { name: "tasks", icon: "task_alt" },
            { name: "notes", icon: "sticky_note_2" },
            { name: "items", icon: "package_2" },
            { name: "labels", icon: "label" },
            { name: "collections", icon: "shapes" },
          ].map(({ name, icon }) => (
            <ListItemButton
              key={name}
              disabled
              style={{ paddingHorizontal: 0, width: "50%" }}
            >
              <Avatar icon={icon} size={40} />
              <ListItemText
                primary={`${~~parseInt(
                  ((data.storage?.breakdown?.[name] / data.storage?.limit) *
                    100) as any
                )}%`}
                secondary={`${capitalizeFirstLetter(name)}`}
              />
            </ListItemButton>
          ))}
        </Collapsible>
      </View>
    </>
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
