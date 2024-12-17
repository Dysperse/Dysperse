import { COLLECTION_VIEWS } from "@/components/layout/command-palette/list";
import { createTab } from "@/components/layout/openTab";
import { useStorageContext } from "@/context/storageContext";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import { EmojiPicker } from "@/ui/EmojiPicker";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import MenuPopover from "@/ui/MenuPopover";
import Modal from "@/ui/Modal";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { addHslAlpha, useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { useBottomSheet } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { router } from "expo-router";
import { cloneElement, forwardRef, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import useSWR from "swr";

const styles = StyleSheet.create({
  headerContainer: { padding: 0 },
  container: {
    marginVertical: "auto",
    alignItems: "center",
    flex: 1,
  },
  containerContent: {
    width: "100%",
    maxWidth: 900,
    gap: 20,
    padding: 20,
    paddingHorizontal: 50,
  },
  section: {
    gap: 5,
  },
  helper: {
    fontSize: 20,
    marginTop: -17,
    opacity: 0.6,
  },
});

function Templates() {
  return (
    <View>
      <SectionLabel text="Choose a template" icon="web_stories" />
      <Button
        variant="outlined"
        text="Explore the #dysverse"
        icon="north_east"
        iconPosition="end"
        height={50}
        containerStyle={{ borderRadius: 10 }}
        textStyle={{ fontFamily: "body_600" }}
        onPress={() => Linking.openURL("https://dysperse.com/templates")}
      />
    </View>
  );
}

const Scratch = () => {
  const theme = useColorTheme();
  const { session, sessionToken } = useUser();
  const [loading, setLoading] = useState(false);
  const nameRef = useRef(null);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      emoji: "270C",
      description: "",
      labels: [],
    },
  });

  const name = watch("name");
  const { forceClose } = useBottomSheet();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const { id } = await sendApiRequest(
        sessionToken,
        "POST",
        "space/collections",
        {},
        {
          body: JSON.stringify(data),
        }
      );

      await createTab(sessionToken, {
        slug: `/[tab]/collections/[id]/[type]`,
        params: { type: "kanban", id },
      });
      forceClose({ duration: 1 });
    } catch (err) {
      console.log(err);
      Toast.show({ type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          gap: 5,
          padding: 5,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: theme[4],
          alignItems: "center",
        }}
      >
        <View style={styles.section}>
          <Controller
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <EmojiPicker setEmoji={onChange}>
                <IconButton
                  variant="filled"
                  size={35}
                  style={{ borderRadius: 10 }}
                >
                  <Emoji emoji={value} size={26} />
                </IconButton>
              </EmojiPicker>
            )}
            name="emoji"
          />
        </View>
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <TextField
              inputRef={nameRef}
              placeholder={`${
                session?.user?.profile?.name?.split(" ")?.[0]
              }'s collection`}
              value={value}
              onSubmitEditing={handleSubmit(onSubmit)}
              onChangeText={onChange}
              weight={600}
              placeholderTextColor={addHslAlpha(theme[11], 0.6)}
              style={{
                flex: 1,
                paddingHorizontal: 7,
                boxShadow: "none",
                ...(errors.name && { borderColor: "red" }),
              }}
            />
          )}
          name="name"
        />
        <IconButton
          onPress={handleSubmit(onSubmit)}
          icon={loading ? <Spinner /> : "east"}
          backgroundColors={{
            default: theme[name && !loading ? 10 : 5],
            hovered: theme[name && !loading ? 11 : 6],
            pressed: theme[name && !loading ? 12 : 7],
          }}
          disabled={!name || loading}
          variant="filled"
          style={{ borderRadius: 10, opacity: 1 }}
          iconStyle={name && { color: theme[2] }}
        />
      </View>
    </>
  );
};

function AiCollectionInput({ input, setInput, handleSubmit }) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const [placeholder, setPlaceholder] = useState(0);

  const placeholders = [
    "a trip for the summer...",
    "my school assignments...",
    "a workout routine for this month...",
    "a checklist for a camping trip...",
    "a plan for my self-care routine...",
    "a roadmap for learning a new language...",
    "a meal prep plan for this week...",
    "a shopping list for the week...",
    "my action plan for career advancement...",
  ];

  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.6,
    transform: [{ translateY: translateY.value }],
    pointerEvents: "none",
    padding: 10,
    paddingLeft: breakpoints.md ? 9 : 15,
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    justifyContent: "center",
  }));

  useEffect(() => {
    const r = () => {
      // Animate upwards until it's hidden
      translateY.value = withTiming(-50, { duration: 300 }, () => {
        // Reset instantly to the bottom (off-screen)
        translateY.value = 50; // Move to the bottom immediately
        runOnJS(() => {
          setPlaceholder((prevIndex) => (prevIndex + 1) % placeholders.length);
        })();

        // Animate upwards and fade in again
        translateY.value = withTiming(0, { duration: 300 });
      });
    };

    const intervalId = setInterval(r, 3500);

    return () => {
      clearInterval(intervalId);
    };
  }, [placeholders.length, translateY, setPlaceholder]);

  return (
    <View
      style={{
        position: "relative",
        flex: 1,
        height: "100%",
        overflow: "hidden",
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          padding: 5,
          paddingLeft: breakpoints.md ? 2 : 5,
        }}
      >
        <TextField
          onChangeText={setInput}
          style={{
            height: "100%",
            borderRadius: 10,
            paddingLeft: 7,
            boxShadow: "none",
            fontStyle: input ? undefined : "italic",
            flex: 1,
          }}
          onSubmitEditing={handleSubmit}
        />
      </View>
      {!input && (
        <Animated.View style={animatedStyle}>
          <Text style={{ color: theme[11] }} weight={600}>
            {placeholders[placeholder]}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

function SectionLabel({ text, icon }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 10,
      }}
    >
      <Icon bold style={{ opacity: 0.6 }} size={22}>
        {icon}
      </Icon>
      <Text variant="eyebrow">{text}</Text>
    </View>
  );
}

function AiCollection({ aiPrompt, setSlide }) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (input) {
      aiPrompt.current = input;
      setSlide("AI");
    }
  };

  return (
    <View>
      <SectionLabel text="Sidekick AI" icon="raven" />
      <View
        style={{
          backgroundColor: theme[3],
          flexDirection: breakpoints.md ? "row" : "column",
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <View
          style={{
            padding: 5,
            paddingRight: 0,
            width: breakpoints.md ? undefined : "100%",
            alignItems: breakpoints.md ? undefined : "flex-start",
          }}
        >
          <MenuPopover
            options={[
              { text: "Help me organize" },
              { text: "Help me plan" },
            ].map((t) => ({
              ...t,
              callback: () => Toast.show({ text1: t.text }),
            }))}
            trigger={
              <Button
                textStyle={{ fontFamily: "body_600" }}
                icon="expand_more"
                text="Help me organize"
                iconPosition="end"
                buttonStyle={{ gap: 0 }}
                style={{ marginRight: -5 }}
              />
            }
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            height: breakpoints.md ? "100%" : undefined,
            flex: breakpoints.md ? 1 : undefined,
            alignItems: "center",
            width: !breakpoints.md ? "100%" : undefined,

            borderTopWidth: breakpoints.md ? 0 : 1,
            borderTopColor: breakpoints.md ? undefined : theme[5],
          }}
        >
          <AiCollectionInput
            handleSubmit={handleSubmit}
            input={input}
            setInput={setInput}
          />
          <View style={{ padding: 5, paddingRight: 8 }}>
            <IconButton
              icon="magic_button"
              backgroundColors={{
                default: theme[input ? 10 : 5],
                hovered: theme[input ? 11 : 6],
                pressed: theme[input ? 12 : 7],
              }}
              disabled={!input}
              onPress={handleSubmit}
              variant="filled"
              style={{ borderRadius: 10, opacity: 1 }}
              iconStyle={input && { color: theme[2] }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

function StartFromScratch() {
  return (
    <View>
      <SectionLabel text="Start from scratch" icon="gesture" />
      <Scratch />
    </View>
  );
}

function Header({ title }) {
  const theme = useColorTheme();
  const { forceClose } = useBottomSheet();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 15,
      }}
    >
      <Text
        style={{
          fontFamily: "serifText800",
          fontSize: 30,
          color: theme[11],
        }}
      >
        {title}
      </Text>
      <IconButton
        icon="close"
        variant="outlined"
        size={40}
        onPress={() => forceClose({ duration: 1 })}
      />
    </View>
  );
}

function AiSlide({ aiPrompt, setSlide }) {
  const theme = useColorTheme();
  const isDark = useDarkMode();
  const { data, error, mutate } = useSWR(
    [
      "ai/collection-template",
      {},
      process.env.EXPO_PUBLIC_API_URL,
      {
        method: "POST",
        body: JSON.stringify({ text: `Help me organize: ${aiPrompt.current}` }),
      },
    ],
    { revalidateOnFocus: false }
  );

  return (
    <View style={{ padding: 30, paddingTop: 10 }}>
      {data ? (
        <View>
          <Image
            source={`https://og.dysperse.com/json?${new URLSearchParams({
              json: JSON.stringify({
                ...data,
                baseColor: theme[9]
                  .replace("hsl(", "")
                  .split(",")
                  .slice(0, 2)
                  .join(", "),
              }),
              hideLogo: "true",
              isLight: isDark ? "false" : "true",
            })}`}
            style={{
              width: "100%",
              aspectRatio: 1.91,
              marginBottom: 20,
              borderRadius: 10,
              backgroundColor: theme[5],
            }}
          />
          <Text variant="eyebrow" style={{ marginBottom: 5 }}>
            Type
          </Text>

          <ListItemButton
            variant="filled"
            style={{ marginBottom: 20 }}
            disabled
          >
            <Icon>{COLLECTION_VIEWS[data.defaultView]?.icon}</Icon>
            <ListItemText
              primary={capitalizeFirstLetter(data.defaultView)}
              secondary={COLLECTION_VIEWS[data.defaultView]?.description}
            />
          </ListItemButton>

          <Text variant="eyebrow" style={{ marginBottom: 10 }}>
            Labels
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: 5,
              flexWrap: "wrap",
            }}
          >
            {data.labels.map((label) => (
              <Chip
                dense
                key={label}
                label={label.name}
                icon={<Emoji emoji={label.emoji} size={20} />}
              />
            ))}
          </View>

          <View
            style={{
              marginVertical: 10,
              marginTop: 20,
              flexDirection: "row",
              gap: 10,
            }}
          >
            <IconButton
              icon="west"
              variant="outlined"
              size={60}
              onPress={() => setSlide("HOME")}
            />
            <Button
              onPress={() => {
                Toast.show({ type: "info", text1: "Coming soon!" });
              }}
              text="Continue"
              icon="east"
              variant="filled"
              height={60}
              iconPosition="end"
              containerStyle={{ flex: 1 }}
            />
          </View>
          <Text
            style={{
              textAlign: "center",
              opacity: 0.6,
              marginBottom: -10,
            }}
          >
            You can always customize this later
          </Text>
        </View>
      ) : error ? (
        <ErrorAlert />
      ) : (
        <Spinner />
      )}
    </View>
  );
}

export const CreateCollectionModal = forwardRef(
  ({ children }: { children?: any }, ref: any) => {
    const { isReached } = useStorageContext();
    const { session } = useUser();

    const aiPrompt = useRef(null);
    const [slide, setSlide] = useState<"HOME" | "AI">("HOME");

    const trigger = cloneElement(children || <Pressable />, {
      onPress: () => ref.current.present(),
    });

    useEffect(() => {
      if (isReached) router.replace("/home");
    }, []);

    return (
      <>
        {trigger}
        <Modal sheetRef={ref} animation="SCALE" maxWidth={600}>
          <View style={{ padding: 30, paddingBottom: 0 }}>
            <Header
              title={slide === "HOME" ? "Create a collection" : "Sidekick AI"}
            />
          </View>
          {slide === "AI" ? (
            <AiSlide aiPrompt={aiPrompt} setSlide={setSlide} />
          ) : (
            <View style={{ padding: 30, gap: 25, paddingTop: 15 }}>
              {session.user.betaTester && (
                <AiCollection aiPrompt={aiPrompt} setSlide={setSlide} />
              )}
              <StartFromScratch />
              <Templates />
            </View>
          )}
        </Modal>
      </>
    );
  }
);

