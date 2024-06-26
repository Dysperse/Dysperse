import LabelPicker from "@/components/labels/picker";
import ContentWrapper from "@/components/layout/content";
import { createTab } from "@/components/layout/openTab";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { Button, ButtonText } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import { EmojiPicker } from "@/ui/EmojiPicker";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { router } from "expo-router";
import { memo, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { InteractionManager, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const styles = StyleSheet.create({
  headerContainer: { padding: 20 },
  container: {
    marginVertical: "auto",
    alignItems: "center",
    flex: 1,
  },
  containerContent: {
    width: "100%",
    maxWidth: 500,
    gap: 20,
    padding: 20,
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
  const insets = useSafeAreaInsets();

  return (
    <ContentWrapper noPaddingTop style={{ paddingTop: insets.top }}>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.containerContent}>
          <Text weight={900} style={{ fontSize: 40 }}>
            New collection
          </Text>
          <Text style={styles.helper} weight={300}>
            Collections provide a seamless and structured way to view items by
            selected labels.
          </Text>
          <View style={{ flexDirection: "row", gap: 20 }}>
            <View style={styles.section}>
              <Text variant="eyebrow">Icon</Text>
              <Controller
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <EmojiPicker setEmoji={onChange}>
                    <IconButton
                      style={{
                        borderStyle: "dashed",
                        borderWidth: 2,
                        width: 80,
                        height: 80,
                        borderColor: theme[7],
                      }}
                    >
                      <Emoji emoji={value} size={50} />
                    </IconButton>
                  </EmojiPicker>
                )}
                name="emoji"
              />
            </View>
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
                  placeholder={`${session?.user?.profile?.name}'s collection`}
                  value={value}
                  onChangeText={onChange}
                  style={{
                    ...(errors.name && { borderColor: "red" }),
                  }}
                />
              )}
              name="name"
            />
          </View>
          <View style={styles.section}>
            <Text variant="eyebrow">Description</Text>
            <Controller
              control={control}
              rules={{ required: false }}
              render={({ field: { onChange, value } }) => (
                <TextField
                  variant="filled+outlined"
                  multiline
                  style={{ minHeight: 100 }}
                  placeholder="What's this collection about? (Optional)"
                  value={value}
                  onChangeText={onChange}
                />
              )}
              name="description"
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
      </ScrollView>
    </ContentWrapper>
  );
}
