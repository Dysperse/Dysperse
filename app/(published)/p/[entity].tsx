import MarkdownRenderer from "@/components/MarkdownRenderer";
import { TaskImportantChip, TaskLabelChip } from "@/components/task";
import {
  handleLocationPress,
  isValidHttpUrl,
  normalizeRecurrenceRuleObject,
} from "@/components/task/drawer/details";
import { STORY_POINT_SCALE } from "@/constants/workload";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Alert from "@/ui/Alert";
import { Avatar } from "@/ui/Avatar";
import Chip from "@/ui/Chip";
import { addHslAlpha, useColor } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Logo from "@/ui/logo";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import dayjs from "dayjs";
import { useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { createContext, useCallback, useContext, useMemo } from "react";
import { Linking, Pressable, useWindowDimensions, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import useSWR from "swr";

const PublishedEntityContext = createContext(null);
const usePublishedEntityContext = () => useContext(PublishedEntityContext);

const Header = () => {
  const theme = useColor("mint");
  const params = useLocalSearchParams();

  const handleShare = useCallback(() => {
    Sharing.shareAsync(`https://dys.us.to/${params.entity}`);
  }, [params]);

  return (
    <>
      <Pressable
        onPress={() => Linking.openURL("https://dysperse.com")}
        style={{
          alignItems: "center",
          gap: 10,
          flexDirection: "row",
          position: "absolute",
          top: 20,
          left: 20,
        }}
      >
        <Logo size={50} color="mint" />
        <Text
          style={{
            fontSize: 20,
            color: theme[11],
          }}
          weight={900}
        >
          #dysperse
        </Text>
        <Icon>north_east</Icon>
      </Pressable>
      <IconButton
        style={{ position: "absolute", top: 20, right: 20 }}
        icon="ios_share"
        size={50}
        variant="outlined"
        onPress={handleShare}
      />
    </>
  );
};

const ErrorPage = () => {
  const theme = useColor("mint");
  const breakpoints = useResponsiveBreakpoints();

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  return (
    <ColorThemeProvider setHTMLAttributes theme={theme}>
      <View
        style={{
          backgroundColor: theme[1],
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Header />
        <Alert
          direction={breakpoints.md ? "row" : "column"}
          emoji="1f494"
          title="This link might be broken, or you may not have access…"
          subtitle="We searched the whole galaxy but couldn't find the item you're looking for."
        />
      </View>
    </ColorThemeProvider>
  );
};

const TaskChips = () => {
  const theme = useColorTheme();
  const { data } = usePublishedEntityContext();

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
      }}
    >
      <Chip
        label="Public"
        style={{ backgroundColor: theme[4] }}
        icon="public"
      />
      {data.pinned && <TaskImportantChip published large />}
      {data.label && <TaskLabelChip large published task={data} />}
    </View>
  );
};

const TaskAttachmentCard = ({ item }) => {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  let icon = "";
  let name = item.data;

  switch (item.type) {
    case "LINK":
      icon = "link";
      if (isValidHttpUrl(name)) name = new URL(item.data).hostname;
      break;
    case "LOCATION":
      if (name.rich) {
        name = name.name;
      }
      icon = isValidHttpUrl(item.data) ? "link" : "map";
      if (isValidHttpUrl(name)) name = new URL(item.data).hostname;
      break;
    case "IMAGE":
      icon = "image";
      break;
  }

  const handleOpenPress = useCallback(() => {
    if (item.type === "LOCATION") {
      alert(JSON.stringify(item.data));
      handleLocationPress(undefined, {
        type: "LOCATION",
        data: item.data,
      });
    }
    if (isValidHttpUrl(item.data)) {
      Linking.openURL(item.data);
    } else {
      Linking.openURL(`https://maps.google.com/?q=${item.data}`);
    }
  }, [item.data, handleLocationPress]);

  return (
    <Pressable
      onPress={handleOpenPress}
      style={({ pressed, hovered }) => ({
        backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
        padding: 20,
        borderRadius: 20,
        ...(breakpoints.md
          ? { flex: 1, maxWidth: "33.33333%" }
          : { width: "100%" }),
        gap: 5,
      })}
    >
      <Avatar
        icon={icon}
        theme="mint"
        size={40}
        style={{
          backgroundColor: addHslAlpha(theme[7], 0.3),
        }}
      />
      <View style={{ paddingHorizontal: 5 }}>
        <Text weight={700} style={{ fontSize: 20 }} numberOfLines={1}>
          {item.name || name}
        </Text>
        <View
          style={{
            opacity: 0.7,
            gap: 5,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text>
            Open{" "}
            {item.type === "IMAGE"
              ? "image"
              : isValidHttpUrl(item.data)
              ? "link"
              : "in Maps"}
          </Text>
          <Icon>north_east</Icon>
        </View>
      </View>
    </Pressable>
  );
};

const Info = () => {
  const { data } = usePublishedEntityContext();
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <View
      style={{
        width: breakpoints.xl
          ? 1200
          : breakpoints.lg
          ? 1000
          : breakpoints.md
          ? 800
          : 700,
        maxWidth: "100%",
        backgroundColor: theme[1],
        shadowColor: "rgba(0,0,0,0.1)",
        shadowRadius: 20,
        shadowOffset: {
          width: 10,
          height: 10,
        },
        padding: 25,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: theme[5],
        gap: 20,
      }}
    >
      <TaskChips />
      <Text style={{ fontSize: 35, marginVertical: -10 }} weight={900}>
        {data.name}
      </Text>
      {data.note && (
        <View>
          <Text variant="eyebrow" style={{ marginBottom: -5 }}>
            About
          </Text>
          <MarkdownRenderer>{data.note}</MarkdownRenderer>
        </View>
      )}
      <View
        style={{ flexDirection: breakpoints.md ? "row" : "column", gap: 20 }}
      >
        {data.start && (
          <View style={{ gap: 5, flex: 1 }}>
            <Text variant="eyebrow">Due</Text>
            <ListItemButton disabled variant="filled">
              <Avatar icon="calendar_today" theme="mint" size={40} />
              <ListItemText
                primary={dayjs(data.start).format(
                  data.dateOnly ? "MMMM Do, YYYY" : "MMMM Do, YYYY [@] h:mm A"
                )}
                secondary={dayjs(data.start).fromNow()}
              />
            </ListItemButton>
          </View>
        )}
        {data.recurrenceRule && (
          <View style={{ gap: 5, flex: 1 }}>
            <Text variant="eyebrow">Repeats</Text>
            <ListItemButton disabled variant="filled">
              <Avatar icon="loop" theme="mint" size={40} />
              <ListItemText
                primary={capitalizeFirstLetter(
                  normalizeRecurrenceRuleObject(data.recurrenceRule).toText()
                )}
              />
            </ListItemButton>
          </View>
        )}
        <View style={{ gap: 5, flex: 1 }}>
          <Text variant="eyebrow">Complexity</Text>
          <ListItemButton disabled variant="filled">
            <Avatar icon="exercise" theme="mint" size={40} />
            <ListItemText
              primary={`${data.storyPoints} points`}
              secondary={`Marked as requiring ${
                STORY_POINT_SCALE[[2, 4, 8, 16, 32].indexOf(data.storyPoints)]
              }`}
            />
          </ListItemButton>
        </View>
      </View>
      {data.attachments?.length > 0 && (
        <View>
          <Text variant="eyebrow">Attachments</Text>
          <View
            style={{
              flexDirection: breakpoints.md ? "row" : "column",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 5,
            }}
          >
            {data.attachments.map((item, index) => (
              <TaskAttachmentCard key={index} item={item} />
            ))}
          </View>
        </View>
      )}
      {data.integrationId && (
        <Text
          style={{
            fontSize: 14,
            marginTop: 20,
            color: theme[11],
            opacity: 0.7,
            textAlign: "center",
          }}
        >
          This item is synced with another third-party application.
        </Text>
      )}
    </View>
  );
};

export default function Page() {
  const theme = useColor("mint");
  const breakpoints = useResponsiveBreakpoints();
  const { height } = useWindowDimensions();
  const params = useLocalSearchParams();
  const { data, isLoading, error } = useSWR([
    "published",
    { id: params.entity },
  ]);

  const contextValue = useMemo(() => ({ data }), [data]);
  if (!params.entity || error) return <ErrorPage />;

  return (
    <PublishedEntityContext.Provider value={contextValue}>
      <ColorThemeProvider setHTMLAttributes theme={theme}>
        {!isLoading && !data?.name ? (
          <ErrorPage />
        ) : (
          <ScrollView
            centerContent
            style={{ backgroundColor: theme[2], height }}
            contentContainerStyle={{
              padding: breakpoints.md ? 50 : 20,
              alignItems: "center",
              paddingTop: 100,
            }}
          >
            {(isLoading || data?.name) && <Header />}
            {data?.name ? (
              <Info />
            ) : isLoading ? (
              <Spinner color={theme[9]} />
            ) : (
              <ErrorPage />
            )}
          </ScrollView>
        )}
      </ColorThemeProvider>
    </PublishedEntityContext.Provider>
  );
}

