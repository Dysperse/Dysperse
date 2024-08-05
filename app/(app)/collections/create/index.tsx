import LabelPicker from "@/components/labels/picker";
import { createTab } from "@/components/layout/openTab";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import { EmojiPicker } from "@/ui/EmojiPicker";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { memo, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  InteractionManager,
  Linking,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import useSWR from "swr";

const styles = StyleSheet.create({
  headerContainer: { padding: 20 },
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
  const { data, error } = useSWR(["dysverse", { random: true }]);

  return (
    <View>
      <View style={styles.containerContent}>
        <Text weight={900} style={{ fontSize: 25 }}>
          For you
        </Text>
      </View>
      <FlatList
        horizontal
        data={data}
        contentContainerStyle={{
          padding: 20,
          paddingHorizontal: 50,
          gap: 10,
          paddingTop: 0,
        }}
        style={{
          marginTop: -10,
        }}
        renderItem={({ item }) => (
          <Button
            height={200}
            onPress={() => {
              Linking.openURL(`https://dysperse.com/templates/${item.id}`);
            }}
            style={{
              width: 300,
              flexDirection: "column",
              padding: 0,
              justifyContent: "flex-start",
            }}
            containerStyle={{ borderRadius: 5 }}
            variant="filled"
            backgroundColors={{
              default: addHslAlpha(theme[9], 0.1),
              hovered: addHslAlpha(theme[9], 0.15),
              pressed: addHslAlpha(theme[9], 0.2),
            }}
          >
            <Image
              source={{ uri: item.preview }}
              style={{
                width: "100%",
                aspectRatio: "1200/630",
                borderRadius: 5,
              }}
            />
            <ButtonText weight={900}>{item.name}</ButtonText>
          </Button>
        )}
      />
    </View>
  );
}

export default function Page() {
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

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      nameRef.current?.focus({ preventScroll: true });
    });
  }, []);

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

  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <View style={{ backgroundColor: theme[1], flex: 1 }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[theme[3], theme[4]]} style={{ width: "100%" }}>
          <Header />
          <Templates />
        </LinearGradient>
        <View style={{ width: "100%", padding: 50, gap: 20 }}>
          <Text weight={900} style={{ fontSize: 25 }}>
            Start from scratch
          </Text>
          <View style={[styles.containerContent, { alignSelf: "center" }]}>
            <View
              style={{
                flexDirection: !breakpoints.md ? "column" : "row",
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
        </View>
      </ScrollView>
    </View>
  );
}
