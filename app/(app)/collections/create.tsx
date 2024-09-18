import LabelPicker from "@/components/labels/picker";
import ContentWrapper from "@/components/layout/content";
import { createTab } from "@/components/layout/openTab";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import { EmojiPicker } from "@/ui/EmojiPicker";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Modal from "@/ui/Modal";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColor, useDarkMode } from "@/ui/color";
import { ColorThemeProvider, useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { cloneElement, memo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  InteractionManager,
  Linking,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
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

const Header = memo(() => {
  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  return (
    <View style={styles.headerContainer}>
      <IconButton size={55} variant="outlined" onPress={handleBack}>
        <Icon>arrow_back_ios_new</Icon>
      </IconButton>
    </View>
  );
});

function Templates() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { data, error } = useSWR(["dysverse", { random: true }]);
  const isDark = useDarkMode();

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        data={["new", "dysverse", ...(Array.isArray(data) ? data : [])]}
        contentContainerStyle={{
          padding: 20,
          paddingHorizontal: 20,
          paddingTop: 0,
        }}
        ListHeaderComponent={() => (
          <View style={{}}>
            <Header />
            <View
              style={{
                padding: 30,
                paddingHorizontal: breakpoints.md ? 50 : 20,
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text variant="eyebrow">New collection</Text>
              <Text
                style={{
                  fontSize: 40,
                  textAlign: "center",
                  color: theme[11],
                }}
              >
                Choose a template
              </Text>
            </View>
          </View>
        )}
        numColumns={breakpoints.md ? 3 : 1}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 5,
              flex: 1,
            }}
          >
            <Button
              onPress={() => {
                if (item === "new") return;
                if (item === "dysverse")
                  return Linking.openURL("https://dysperse.com/templates");
                Linking.openURL(`https://dysperse.com/templates/${item.id}`);
              }}
              style={{
                backgroundColor: isDark ? "hsl(0, 0%, 20%)" : "hsl(0, 0%, 90%)",
                width: "100%",
                flexDirection: "column",
                padding: 0,
                borderRadius: 15,
                height: "auto",
                minHeight: "auto",
                maxHeight: "auto",
                justifyContent: "flex-start",
              }}
              containerStyle={{
                flex: 1,
                height: "auto",
                minHeight: "auto",
                maxHeight: "auto",
                borderRadius: 15,
                aspectRatio: "1200/630",
              }}
              variant="filled"
            >
              {item === "dysverse" ? (
                <View
                  style={{
                    width: "100%",
                    aspectRatio: "1200/630",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                    gap: 10,
                  }}
                >
                  <Icon filled>category</Icon>
                  <ButtonText style={{ fontSize: 20 }} weight={900}>
                    Browse the Dysverse
                  </ButtonText>
                </View>
              ) : item === "new" ? (
                <Scratch>
                  <Pressable
                    style={{
                      width: "100%",
                      aspectRatio: "1200/630",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "row",
                      gap: 10,
                    }}
                  >
                    <Icon filled>add_circle</Icon>
                    <ButtonText style={{ fontSize: 20 }} weight={900}>
                      Start from scratch
                    </ButtonText>
                  </Pressable>
                </Scratch>
              ) : (
                <Image
                  source={{
                    uri: `${item.preview}?isLight=${isDark ? "false" : "true"}`,
                  }}
                  style={{
                    width: "100%",
                    aspectRatio: "1200/630",
                  }}
                />
              )}
            </Button>
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

export default function Page() {
  const theme = useColor("gray");
  const isDark = useDarkMode();

  return (
    <ColorThemeProvider theme={theme}>
      <ContentWrapper noPaddingTop>
        <LinearGradient
          colors={["transparent", `hsl(0, 0%, ${isDark ? 15 : 95}%)`]}
          style={{ width: "100%", flex: 1 }}
        >
          <Templates />
        </LinearGradient>
      </ContentWrapper>
    </ColorThemeProvider>
  );
}

