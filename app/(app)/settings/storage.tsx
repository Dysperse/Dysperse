import { settingStyles } from "@/components/settings/settingsStyles";
import { useUser } from "@/context/useUser";
import { Avatar } from "@/ui/Avatar";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import SettingsScrollView from "@/ui/SettingsScrollView";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { View } from "react-native";
import Animated, { BounceInLeft } from "react-native-reanimated";
import useSWR from "swr";

function SpaceStorage({ data }: { data: any }) {
  const theme = useColorTheme();

  return (
    <View
      style={{
        borderWidth: 1,
        borderRadius: 20,
        borderColor: theme[5],
        backgroundColor: addHslAlpha(theme[5], 0.1),
        marginTop: 20,
      }}
    >
      <ListItemButton disabled style={{ backgroundColor: "transparent" }}>
        <ListItemText
          style={{ paddingVertical: 20 }}
          primaryProps={{
            style: { textAlign: "center", fontSize: 25 },
            weight: 900,
          }}
          secondaryProps={{
            style: { textAlign: "center", fontSize: 20, opacity: 0.5 },
          }}
          primary={`${-~(
            (data.storage?.used / data.storage?.limit) *
            100
          )}% used`}
          secondary={`${-~(data.storage?.limit - data.storage?.used)}/${
            data.storage?.limit
          } credits left`}
        />
      </ListItemButton>
      <View
        style={{
          width: "100%",
          height: 5,
          borderRadius: 99,
          backgroundColor: theme[4],
          overflow: "hidden",
        }}
      >
        <Animated.View
          entering={BounceInLeft.duration(700).overshootClamping(0)}
          style={{
            width: `${-~((data.storage?.used / data.storage?.limit) * 100)}%`,
            height: "100%",
            marginLeft: -15,
            backgroundColor: theme[9],
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          {data.storage?.inTrash > 0 && (
            <View
              style={{
                width: `${-~(
                  (data.storage?.inTrash / data.storage?.limit) *
                  100
                )}%`,
                height: "100%",
                backgroundColor: theme[8],
                marginLeft: "auto",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 99,
              }}
            />
          )}
        </Animated.View>
      </View>
      <View
        style={{
          marginVertical: 10,
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        {[
          { name: "tasks", icon: "task_alt" },
          { name: "integrations", icon: "interests" },
          { name: "labels", icon: "label" },
          { name: "collections", icon: "shapes" },
        ].map(({ name, icon }) => (
          <ListItemButton key={name} disabled style={{ width: "50%" }}>
            <Avatar icon={icon} size={40} />
            <ListItemText
              primary={`${~~parseInt(
                (
                  (data.storage?.breakdown?.[name] / data.storage?.limit) *
                  100
                ).toFixed(2)
              )}%`}
              secondary={`${capitalizeFirstLetter(name)}`}
            />
          </ListItemButton>
        ))}
      </View>
    </View>
  );
}

export default function Page() {
  const { session } = useUser();
  const { data, error } = useSWR(
    session?.space ? ["space", { spaceId: session?.space?.space?.id }] : null
  );

  return (
    <SettingsScrollView>
      <Text style={settingStyles.title}>Usage</Text>
      <Text style={{ fontSize: 17, opacity: 0.6 }} weight={300}>
        #dysperse is free. That being said, we need to enforce some limits to
        keep the service running smoothly for everyone (and to prevent abuse!)
        After you reach your limits, you won't be able to create anything until
        you free up some space.
      </Text>

      {data ? (
        <SpaceStorage data={data} />
      ) : error ? (
        <ErrorAlert />
      ) : (
        <Spinner />
      )}

      <Text style={settingStyles.heading}>Suggestions</Text>
      <Text style={{ marginBottom: 10 }}>
        Running out of space? Here's what you can do...
      </Text>
      <View style={{ marginTop: 10, gap: 10 }}>
        <ListItemButton variant="outlined">
          <Icon>check_circle</Icon>
          <ListItemText
            primary="Delete completed tasks"
            secondary="Permanently delete all completed tasks"
          />
          <Text>{data?.storage?.completeTasksCount || 0}</Text>
        </ListItemButton>
        {/* <ListItemButton variant="outlined">
          <Icon>history</Icon>
          <ListItemText
            primary="Delete old tasks"
            secondary="Delete tasks that are older than 30 days"
          />
          <Text>{data?.storage?.moreThan30DaysOld || 0}</Text>
        </ListItemButton> */}
        <ListItemButton variant="outlined">
          <Icon>delete</Icon>
          <ListItemText
            primary="Empty trash"
            secondary="Permanently delete all items in the trash"
          />
          <Text>{data?.storage?.inTrash || 0}</Text>
        </ListItemButton>
      </View>
    </SettingsScrollView>
  );
}
