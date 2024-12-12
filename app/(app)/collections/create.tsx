import LabelPicker from "@/components/labels/picker";
import ContentWrapper from "@/components/layout/content";
import { createTab } from "@/components/layout/openTab";
import { useStorageContext } from "@/context/storageContext";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { Button, ButtonText } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import { EmojiPicker } from "@/ui/EmojiPicker";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Modal from "@/ui/Modal";
import Text from "@/ui/Text";
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import MenuPopover from "@/ui/MenuPopover";
import TextField from "@/ui/TextArea";
import { useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { router } from "expo-router";
import { cloneElement, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { InteractionManager, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
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
  const { data } = useSWR(["dysverse", { random: true }]);
  const isDark = useDarkMode();

  return (
    <View style={{ width: 300 }}>
      <SectionLabel text="Choose a template" icon="gesture" />
      <FlashList
        data={Array.isArray(data) ? data : []}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 10 }}>
            <Image
              source={{
                uri: `${item.preview}?isLight=${isDark ? "false" : "true"}`,
              }}
              style={{
                width: "100%",
                aspectRatio: "1200/630",
              }}
            />
          </View>
        )}
      />
    </View>
  );
}

const Scratch = ({ children }) => {
  const theme = useColorTheme();
  const ref = useRef<BottomSheetModal>(null);
  const { session, sessionToken } = useUser();
  const [loading, setLoading] = useState(false);
  const nameRef = useRef(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      emoji: "1f600",
      description: "",
      labels: [],
    },
  });

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
    } catch (err) {
      console.log(err);
      Toast.show({ type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const trigger = cloneElement(children, {
    onPress: () => {
      ref.current?.present();
      InteractionManager.runAfterInteractions(() => {
        nameRef.current?.focus({ preventScroll: true });
      });
    },
  });

  return (
    <>
      {trigger}
      <Modal sheetRef={ref} animation="SCALE">
        <View
          style={[
            styles.containerContent,
            { alignSelf: "center", padding: 20 },
          ]}
        >
          <Text
            weight={900}
            style={{
              fontSize: 25,
              color: theme[11],
            }}
          >
            New collection
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: 20,
            }}
          >
            <View style={styles.section}>
              <Text variant="eyebrow">Icon</Text>
              <Controller
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <EmojiPicker setEmoji={onChange}>
                    <IconButton variant="filled" size={80}>
                      <Emoji emoji={value} size={50} />
                    </IconButton>
                  </EmojiPicker>
                )}
                name="emoji"
              />
            </View>
            <View
              style={{
                flexDirection: "column",
                gap: 20,
                flex: 1,
              }}
            >
              <View style={[styles.section, { flex: 1 }]}>
                <Text variant="eyebrow">Labels</Text>
                <Controller
                  control={control}
                  name="labels"
                  render={({ field: { onChange, value } }) => (
                    <LabelPicker
                      multiple
                      hideBack
                      autoFocus={false}
                      label={value}
                      setLabel={onChange}
                      onClose={() => {}}
                    >
                      <Button
                        height={80}
                        style={{
                          borderWidth: 2,
                          borderColor: theme[7],
                          borderStyle: "dashed",
                        }}
                        variant="outlined"
                      >
                        <ButtonText weight={900} style={{ fontSize: 20 }}>
                          {value.length === 0
                            ? "Tap to select"
                            : value.length + " selected"}
                        </ButtonText>
                      </Button>
                    </LabelPicker>
                  )}
                />
              </View>
              <View style={[styles.section]}>
                <Text variant="eyebrow">Name</Text>
                <Controller
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { onChange, value } }) => (
                    <TextField
                      variant="filled+outlined"
                      inputRef={nameRef}
                      placeholder={`${
                        session?.user?.profile?.name?.split(" ")?.[0]
                      }'s collection`}
                      value={value}
                      onChangeText={onChange}
                      weight={900}
                      style={{
                        height: 60,
                        borderRadius: 99,
                        fontSize: 20,
                        ...(errors.name && { borderColor: "red" }),
                      }}
                    />
                  )}
                  name="name"
                />
              </View>
              <Button
                height={80}
                variant="filled"
                onPress={handleSubmit(onSubmit)}
                isLoading={loading}
              >
                <ButtonText weight={900} style={{ fontSize: 20 }}>
                  Done
                </ButtonText>
                <Icon>check</Icon>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

function AiCollectionInput({ input, setInput }) {
  const theme = useColorTheme();
  const [placeholder, setPlaceholder] = useState(0);
  const placeholders = [
    "a trip for the summer...",
    "my school assignments...",
    "a workout routine for this month...",
    "a checklist for a camping trip",
    "a plan for my self-care routine",
    "a roadmap for learning a new language",
    "a meal prep plan for this week",
    "a shopping list for the week",
    "my action plan for career advancement",
  ];

  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.6,
    transform: [{ translateY: translateY.value }],
    pointerEvents: "none",
    padding: 10,
    paddingLeft: 17,
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
        }}
      >
        <TextField
          onChangeText={setInput}
          style={{
            height: "100%",
            borderRadius: 10,
            paddingLeft: 10,
            fontStyle: input ? undefined : "italic",
            flex: 1,
          }}
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
  const theme = useColorTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginVertical: 10,
      }}
    >
      <Icon bold style={{ opacity: 0.6 }} size={22}>
        {icon}
      </Icon>
      <Text variant="eyebrow">{text}</Text>
    </View>
  );
}

function AiCollection() {
  const theme = useColorTheme();
  const [input, setInput] = useState("");

  return (
    <>
      <SectionLabel text="Sidekick AI" icon="raven" />
      <View
        style={{
          backgroundColor: theme[3],
          flexDirection: "row",
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <View style={{ padding: 5, paddingRight: 0 }}>
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
        <AiCollectionInput input={input} setInput={setInput} />
        <View style={{ padding: 5 }}>
          <IconButton
            icon="magic_button"
            backgroundColors={{
              default: theme[input ? 10 : 4],
              hovered: theme[input ? 11 : 5],
              pressed: theme[input ? 12 : 6],
            }}
            variant="filled"
            disabled={!input}
            style={{ borderRadius: 10 }}
            iconStyle={input && { color: theme[2] }}
          />
        </View>
      </View>
    </>
  );
}

function StartFromScratch() {
  return (
    <View style={{ marginTop: 20 }}>
      <SectionLabel text="Start from scratch" icon="gesture" />
    </View>
  );
}

function CreateCollection() {
  const theme = useColorTheme();

  return (
    <View style={{ flex: 1 }}>
      <AiCollection />
      <StartFromScratch />
    </View>
  );
}

function Header() {
  const theme = useColorTheme();
  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/home");
  };
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
      }}
    >
      <Text
        style={{
          fontFamily: "serifText800",
          fontSize: 30,
          color: theme[11],
        }}
      >
        Create a collection
      </Text>
      <IconButton
        icon="close"
        variant="outlined"
        size={50}
        onPress={handleBack}
      />
    </View>
  );
}

export default function Page() {
  const theme = useColorTheme();
  const { isReached } = useStorageContext();

  useEffect(() => {
    if (isReached) router.replace("/home");
  }, []);

  return (
    <ContentWrapper style={{ padding: 40 }}>
      <Header />
      <View style={{ flexDirection: "row", gap: 30 }}>
        <CreateCollection />
        <Templates />
      </View>
    </ContentWrapper>
  );
}
