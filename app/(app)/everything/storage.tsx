import ContentWrapper from "@/components/layout/content";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar } from "@/ui/Avatar";
import ConfirmationModal from "@/ui/ConfirmationModal";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { useCallback, useEffect } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { MenuButton } from "../home";

function SpaceStorage({ data }: { data: any }) {
  const theme = useColorTheme();

  const width = useSharedValue(0);

  useEffect(() => {
    width.value = -~((data.storage?.used / data.storage?.limit) * 100);
  }, [data.storage?.used, data.storage?.limit]);

  const widthStyle = useAnimatedStyle(() => ({
    width: withSpring(`${width.value}%`, { stiffness: 400, damping: 30 }),
  }));

  return (
    <View
      style={{
        borderWidth: 1,
        borderRadius: 20,
        borderColor: theme[5],
        backgroundColor: addHslAlpha(theme[5], 0.1),
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
          height: 10,
          backgroundColor: theme[4],
          overflow: "hidden",
        }}
      >
        <Animated.View
          style={[
            widthStyle,
            {
              height: "100%",
              marginLeft: -15,
              backgroundColor: theme[9],
              overflow: "hidden",
            },
          ]}
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
  const { session, sessionToken } = useUser();
  const breakpoints = useResponsiveBreakpoints();
  const { desktopCollapsed } = useSidebarContext();
  const insets = useSafeAreaInsets();

  const theme = useColorTheme();
  const { data, mutate, error } = useSWR(
    session?.space ? ["space", { spaceId: session?.space?.space?.id }] : null
  );

  const handleTrashDelete = useCallback(async () => {
    try {
      await sendApiRequest(sessionToken, "DELETE", "space/trash");
      await mutate();
      Toast.show({ type: "success", text1: "Trash emptied!" });
    } catch (e) {
      Toast.show({ type: "error" });
      await mutate();
    }
  }, [sessionToken, mutate]);

  const deleteCompletedTasks = useCallback(async () => {
    try {
      await sendApiRequest(sessionToken, "GET", "space/deleteCompletedTasks");
      await mutate();
      Toast.show({ type: "success", text1: "Trash emptied!" });
    } catch (e) {
      Toast.show({ type: "error" });
      await mutate();
    }
  }, [sessionToken, mutate]);

  return (
    <ContentWrapper
      noPaddingTop
      style={!breakpoints.md && { paddingTop: insets.top + 70 }}
    >
      {(!breakpoints.md || desktopCollapsed) && (
        <MenuButton gradient addInsets />
      )}
      <ScrollView contentContainerStyle={{ padding: breakpoints.md ? 50 : 20 }}>
        <Text style={{ fontFamily: "serifText700", fontSize: 27 }}>Usage</Text>
        <Text
          style={{ marginTop: 10, opacity: 0.6, marginBottom: 20 }}
          weight={300}
        >
          Dysperse is free, but we have limits to ensure smooth service and
          prevent abuse.{"\n"}Once you reach your limit, you must free up space
          to create more.
        </Text>
        <View
          style={{
            flexDirection: !breakpoints.md ? "column" : "row",
            gap: 10,
          }}
        >
          <View style={{ flex: 1 }}>
            {data ? (
              <SpaceStorage data={data} />
            ) : error ? (
              <ErrorAlert />
            ) : (
              <Spinner />
            )}
          </View>
          <View
            style={{
              flex: 1,
              borderWidth: 1,
              borderRadius: 20,
              borderColor: theme[5],
              backgroundColor: addHslAlpha(theme[5], 0.1),
              padding: 20,
            }}
          >
            <Text
              style={{
                fontFamily: "serifText800",
                fontSize: 20,
                marginTop: 10,
                textAlign: "center",
              }}
            >
              Suggestions
            </Text>
            <View style={{ marginTop: 10 }}>
              <ConfirmationModal
                height={400}
                title="Move completed items to trash?"
                secondary="You'll be able to undo this in case you change your mind."
                onSuccess={deleteCompletedTasks}
              >
                <ListItemButton>
                  <Icon>check_circle</Icon>
                  <ListItemText
                    primary="Delete completed tasks"
                    secondary="Move completed items to trash. You can undo this."
                  />
                  <Text>{data?.storage?.completeTasksCount || 0}</Text>
                </ListItemButton>
              </ConfirmationModal>
              <ConfirmationModal
                height={400}
                title="Permanently delete trash?"
                secondary="Careful! You can't undo this."
                onSuccess={handleTrashDelete}
              >
                <ListItemButton>
                  <Icon>delete</Icon>
                  <ListItemText
                    primary="Empty trash"
                    secondary="Permanently delete all items in the trash"
                  />
                  <Text>{data?.storage?.entitiesInTrash || 0}</Text>
                </ListItemButton>
              </ConfirmationModal>
            </View>
          </View>
        </View>
      </ScrollView>
    </ContentWrapper>
  );
}

