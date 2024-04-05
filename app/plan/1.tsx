import { taskInputStyles } from "@/components/signup/TaskCreator";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { styles } from ".";

const TaskInput = ({ control }) => {
  const theme = useColorTheme();
  const focus = useSharedValue(0);
  const textStyles = useAnimatedStyle(
    () => ({
      opacity: withSpring(focus.value ? 0.6 : 0),
      color: theme[11],
      marginTop: withSpring(focus.value ? -5 : -20, {
        overshootClamping: true,
      }),
    }),
    [focus]
  );

  const AnimatedText = Animated.createAnimatedComponent(Text);

  return (
    <View
      style={[
        taskInputStyles.container,
        {
          backgroundColor: theme[2],
          borderColor: theme[5],
          marginVertical: 10,
        },
      ]}
    >
      <View style={[taskInputStyles.check, { borderColor: theme[6] }]} />
      <View style={{ flex: 1 }}>
        <Controller
          name="name"
          control={control}
          render={({ field: { onChange } }) => (
            <TextField
              onChangeText={onChange}
              style={{ paddingVertical: 13, shadowRadius: 0 }}
              placeholder="Type here..."
              onFocus={() => (focus.value = 1)}
              onBlur={() => (focus.value = 0)}
            />
          )}
        />
        <AnimatedText
          style={[
            textStyles,
            { fontSize: 12, color: theme[11], marginBottom: 5 },
          ]}
        >
          💡 Keep it simple, from making your bed to drinking a glass of water.
        </AnimatedText>
      </View>
    </View>
  );
};

const SubmitButton = ({ watch, handleSubmit }) => {
  const { sessionToken } = useUser();
  const name = watch("name");
  const onSubmit = (values) => {
    sendApiRequest(
      sessionToken,
      "POST",
      "space/entity",
      {},
      {
        body: JSON.stringify({
          ...values,
          due: new Date().toISOString(),
          pinned: false,
          labelId: null,
          type: "TASK",
          collectionId: null,
        }),
      }
    );
    router.push("/plan/2");
  };
  const theme = useColorTheme();

  return (
    <Button
      onPress={handleSubmit(onSubmit)}
      disabled={!name}
      style={({ pressed, hovered }) => [
        styles.button,
        {
          backgroundColor: name
            ? theme[pressed ? 11 : hovered ? 10 : 9]
            : theme[7],
          marginTop: "auto",
        },
      ]}
    >
      <ButtonText style={[styles.buttonText, { color: theme[name ? 1 : 10] }]}>
        Next
      </ButtonText>
      <Icon style={{ color: theme[name ? 1 : 10] }} bold>
        east
      </Icon>
    </Button>
  );
};

export default function Page() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  const { control, watch, handleSubmit } = useForm({
    defaultValues: {
      name: "",
    },
  });

  return (
    <LinearGradient
      colors={[theme[1], theme[2], theme[3], theme[4], theme[5], theme[6]]}
      style={{ flex: 1 }}
    >
      <ScrollView
        centerContent
        contentContainerStyle={{
          padding: breakpoints.md ? 50 : 20,
          maxWidth: 700,
          width: "100%",
          marginHorizontal: "auto",
        }}
      >
        <Text
          style={{ fontSize: 35, color: theme[11], marginTop: "auto" }}
          weight={900}
        >
          Let's start simple.
        </Text>
        <Text style={{ fontSize: 20, opacity: 0.6, color: theme[11] }}>
          What's the easiest thing you can do today?
        </Text>
        <TaskInput control={control} />
        <SubmitButton handleSubmit={handleSubmit} watch={watch} />
      </ScrollView>
    </LinearGradient>
  );
}
