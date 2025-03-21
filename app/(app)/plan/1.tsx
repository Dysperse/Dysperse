import { useBadgingService } from "@/context/BadgingProvider";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSharedValue } from "react-native-reanimated";
import { styles } from ".";

const TaskInput = ({ control }) => {
  const theme = useColorTheme();
  const focus = useSharedValue(0);

  return (
    <Controller
      name="name"
      control={control}
      render={({ field: { onChange, value } }) => (
        <>
          <TextField
            onChangeText={onChange}
            style={{
              paddingVertical: 13,
              shadowRadius: 0,
              fontSize: 20,
              borderWidth: 0,
              backgroundColor: theme[5],
              marginBottom: 10,
              marginTop: 15,
            }}
            placeholder="Type here…"
            value={value}
            onFocus={() => (focus.value = 1)}
            onBlur={() => (focus.value = 0)}
            weight={900}
            variant="filled+outlined"
          />
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 15,
            }}
          >
            {[
              { emoji: "1F6CF", text: "Make my bed" },
              { emoji: "1F3C3", text: "Exercise" },
              { emoji: "2615", text: "Coffee" },
              { emoji: "1F9F9", text: "Organize my space" },
              { emoji: "1F4DA", text: "Read a book" },
              { emoji: "1F3B5", text: "Listen to music" },
            ].map(({ emoji, text }) => (
              <Button
                chip
                key={text}
                large
                backgroundColors={{
                  default: theme[5],
                  hovered: theme[6],
                  pressed: theme[7],
                }}
                onPress={() => onChange(text)}
              >
                <Emoji emoji={emoji} />
                <ButtonText style={{ marginLeft: 5 }}>{text}</ButtonText>
              </Button>
            ))}
          </View>
        </>
      )}
    />
  );
};

const SubmitButton = ({ watch, handleSubmit }) => {
  const { sessionToken } = useUser();
  const name = watch("name");
  const badgingService = useBadgingService();

  const onSubmit = (values) => {
    sendApiRequest(
      sessionToken,
      "POST",
      "space/entity",
      {},
      {
        body: JSON.stringify({
          ...values,
          start: new Date().toISOString(),
          pinned: false,
          labelId: null,
          type: "TASK",
          collectionId: null,
        }),
      }
    ).then(() => {
      badgingService.current.mutate();
    });
    router.push("/plan/2");
  };
  const theme = useColorTheme();

  return (
    <Button
      onPress={handleSubmit(onSubmit)}
      disabled={!name}
      height={70}
      containerStyle={{ marginTop: "auto" }}
      backgroundColors={
        name
          ? {
              default: theme[9],
              hovered: theme[10],
              pressed: theme[11],
            }
          : {
              default: theme[7],
              hovered: theme[7],
              pressed: theme[7],
            }
      }
    >
      <ButtonText
        style={[styles.buttonText, { color: theme[name ? 1 : 10] }]}
        weight={900}
      >
        Continue
      </ButtonText>
      <Icon style={{ color: theme[name ? 1 : 10] }} bold>
        arrow_forward_ios
      </Icon>
    </Button>
  );
};

export default function Page() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  const { control, watch, handleSubmit } = useForm({
    defaultValues: { name: "" },
  });

  return (
    <LinearGradient
      colors={[theme[2], theme[3], theme[4], theme[5], theme[6]]}
      style={{ flex: 1 }}
    >
      <KeyboardAwareScrollView
        centerContent
        contentContainerStyle={{
          padding: breakpoints.md ? 50 : 30,
          maxWidth: 700,
          width: "100%",
          marginHorizontal: "auto",
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={{
            fontSize: 35,
            color: theme[11],
            marginTop: "auto",
            fontFamily: "serifText700",
          }}
          weight={900}
        >
          Let's start simple.
        </Text>
        <Text style={{ opacity: 0.6, marginTop: 5, color: theme[11] }}>
          What's the easiest thing you can do today?
        </Text>
        <TaskInput control={control} />
        <SubmitButton handleSubmit={handleSubmit} watch={watch} />
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
}

