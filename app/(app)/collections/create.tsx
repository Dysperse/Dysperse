import { ContentWrapper } from "@/components/layout/content";
import { useUser } from "@/context/useUser";
import { Button, ButtonText } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import { EmojiPicker } from "@/ui/EmojiPicker";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { router } from "expo-router";
import { memo } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
  headerContainer: { padding: 20 },
  container: {
    marginVertical: "auto",
    alignItems: "center",
    flex: 1,
  },
  containerContent: {
    width: "100%",
    maxWidth: 400,
    gap: 20,
    padding: 20,
  },
  section: {
    gap: 5,
  },
  helper: {
    marginTop: -20,
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
        <Icon>close</Icon>
      </IconButton>
    </View>
  );
});

export default function Page() {
  const { session } = useUser();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      emoji: "1f600",
    },
  });

  const theme = useColorTheme();

  return (
    <ContentWrapper>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.containerContent}>
          <Text heading style={{ fontSize: 50 }}>
            New collection
          </Text>
          <Text style={styles.helper}>
            Collections provide a seamless and structured way to view items by
            selected labels.
          </Text>
          <Text variant="eyebrow">Icon</Text>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <EmojiPicker emoji={value} setEmoji={onChange}>
                <IconButton
                  style={{
                    borderStyle: "dashed",
                    borderWidth: 2,
                    width: 100,
                    height: 100,
                    borderColor: theme[7],
                  }}
                >
                  <Emoji emoji={value} size={50} />
                </IconButton>
              </EmojiPicker>
            )}
            name="emoji"
          />
          <View style={styles.section}>
            <Text variant="eyebrow">Name</Text>
            <TextField
              variant="filled+outlined"
              style={{
                fontSize: 20,
                paddingHorizontal: 20,
                paddingVertical: 10,
              }}
              placeholder={`${session?.user?.profile?.name}'s collection`}
            />
          </View>
          <View style={styles.section}>
            <Text variant="eyebrow">Labels</Text>
            <TextField
              variant="filled+outlined"
              style={{
                fontSize: 20,
                paddingHorizontal: 20,
                paddingVertical: 10,
              }}
              placeholder="Add labels"
              editable={false}
            />
          </View>
          <Button style={{ height: 80 }} variant="filled">
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
