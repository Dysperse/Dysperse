import { SettingsLayout } from "@/components/settings/layout";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { Button } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import { EmojiPicker } from "@/ui/EmojiPicker";
import ErrorAlert from "@/ui/Error";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import { Linking, StyleSheet, View, useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useSWR from "swr";

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 20,
    paddingTop: 0,
    marginTop: -20,
  },
});
const Intro = ({ integration }) => {
  const theme = useColorTheme();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <View
          style={{
            transform: [{ rotate: "-10deg" }],
            width: 100,
            height: 100,
            backgroundColor: theme[1],
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: theme[6],
          }}
        >
          <Logo size={80} />
        </View>
        <Image
          source={{ uri: integration.icon }}
          style={{
            borderRadius: 20,
            width: 100,
            height: 100,
            transform: [{ rotate: "10deg" }],
          }}
        />
      </View>
      <View style={{ paddingHorizontal: 20, alignItems: "center", gap: 5 }}>
        <Text style={{ textAlign: "center", fontSize: 30 }} weight={700}>
          Dysperse + {integration.name}
        </Text>
        <Text weight={300} style={{ textAlign: "center", opacity: 0.7 }}>
          {integration.description}
        </Text>
      </View>
    </View>
  );
};

const LabelCustomizer = ({ handleSubmit, status, setSlide }) => {
  const { getValues, control, setValue } = useFormContext();
  const { data, error } = useSWR([
    "space/integrations/get-labels",
    { ...getValues().params, integration: getValues().integration },
  ]);

  useEffect(() => {
    if (data?.error) {
      setSlide(1);
      Toast.show({
        type: "error",
        text1: "Couldn't find any labels",
        text2: "Check if you entered everything correctly",
      });
    } else {
      setValue("labels", data);
    }
  }, [data, setSlide, setValue]);

  return (
    <>
      <Text style={{ opacity: 0.6, marginBottom: 10 }}>
        We created some labels for you. Customize them if you want.
      </Text>
      {data ? (
        <Controller
          control={control}
          name="labels"
          render={({ field: { onChange, value } }) =>
            value?.length > 0 && (
              <>
                {data.map((label, index) => (
                  <ListItemButton
                    key={`${label?.id}-${index}`}
                    variant="filled"
                    disabled
                    style={{ marginBottom: 10 }}
                  >
                    <EmojiPicker
                      emoji={value[index]?.emoji || label.emoji}
                      setEmoji={(emoji) => {
                        const newLabels = [...value];
                        newLabels[index].emoji = emoji;
                        onChange(newLabels);
                      }}
                    >
                      <IconButton variant="filled" size={30}>
                        <Emoji emoji={value[index]?.emoji || label?.emoji} />
                      </IconButton>
                    </EmojiPicker>
                    <TextField
                      value={value[index]?.name || label?.name}
                      onChangeText={(text) => {
                        const newLabels = [...value];
                        newLabels[index].name = text;
                        onChange(newLabels);
                      }}
                      style={{ flex: 1 }}
                    />
                  </ListItemButton>
                ))}
                <View style={[styles.footer, { marginTop: "auto" }]}>
                  <Button
                    large
                    isLoading={status === "loading"}
                    iconPosition="end"
                    variant="filled"
                    icon="done"
                    text="Finish setup"
                    onPress={handleSubmit}
                  />
                </View>
              </>
            )
          }
        />
      ) : error ? (
        <ErrorAlert />
      ) : (
        <Spinner style={{ marginBottom: "auto" }} />
      )}
    </>
  );
};

const Outro = ({ integration, submit, setSlide }) => {
  const supportsLabelMapping = integration.supportsLabelMapping;
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleClick = async () => {
    try {
      setStatus("loading");
      await submit();
    } finally {
      setStatus("success");
    }
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        paddingHorizontal: 20,
      }}
      contentContainerStyle={{
        justifyContent: "center",
        minHeight: "100%",
      }}
    >
      {status !== "success" ? (
        <>
          <Text
            style={{
              width: "100%",
              fontSize: 30,
              marginBottom: 10,
              marginTop: "auto",
            }}
            weight={700}
          >
            Almost there...
          </Text>
          {supportsLabelMapping ? (
            <LabelCustomizer
              status={status}
              handleSubmit={handleClick}
              setSlide={setSlide}
            />
          ) : (
            <Text
              style={{
                width: "100%",
                marginBottom: 20,
                opacity: 0.8,
                fontSize: 20,
              }}
            >
              Tap the button below to finish connecting {integration.name}.
            </Text>
          )}
        </>
      ) : (
        <>
          <View style={{ marginVertical: "auto", paddingHorizontal: 20 }}>
            <Text
              style={{ width: "100%", fontSize: 30, marginBottom: 10 }}
              weight={700}
            >
              Success!
            </Text>
            <Text
              style={{
                width: "100%",
                marginBottom: 20,
                opacity: 0.8,
                fontSize: 20,
              }}
            >
              {integration.name} is now connected to your account. You'll see
              stuff from {integration.name} in your tasks.
            </Text>
          </View>
          <View style={styles.footer}>
            <Button
              large
              iconPosition="end"
              variant="filled"
              icon="done"
              text="Finish setup"
              onPress={() => router.replace("/settings/space/integrations")}
            />
          </View>
        </>
      )}
    </ScrollView>
  );
};

const HelperText = ({ helper, index }) => {
  const theme = useColorTheme();
  return (
    <View
      key={helper}
      style={{
        flexDirection: "row",
        gap: 15,
        width: "100%",
        marginBottom: 15,
      }}
    >
      <View
        style={{
          width: 25,
          height: 25,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderRadius: 99,
          borderColor: theme[6],
        }}
      >
        <Text style={{ color: theme[11], fontSize: 12 }}>{index + 1}</Text>
      </View>
      <View style={{ flex: 1, paddingTop: 2 }}>
        <Text key={helper} style={{ color: theme[11], fontSize: 14 }}>
          {helper}
        </Text>
      </View>
    </View>
  );
};

const ParamSlide = ({ slide, currentSlide }) => {
  const { control } = useFormContext();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
      }}
    >
      <Text
        style={{ width: "100%", fontSize: 30, marginBottom: 20 }}
        weight={700}
      >
        Step #{currentSlide}
      </Text>
      {slide.helper.map((helper, index) => (
        <HelperText key={helper} helper={helper} index={index} />
      ))}
      <Controller
        rules={{ required: slide.required }}
        control={control}
        name={`params.${slide.id}`}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            variant="filled"
            style={{
              width: "100%",
              marginTop: 20,
            }}
            placeholder={slide.name}
          />
        )}
      />
    </View>
  );
};

const SlideProgressBar = ({ slide, length }) => {
  const { width: windowWidth } = useWindowDimensions();
  const theme = useColorTheme();
  const width = useSharedValue(0);

  const widthStyle = useAnimatedStyle(() => {
    return {
      width: withSpring((windowWidth / length) * width.value, {
        damping: 30,
        overshootClamping: false,
        restDisplacementThreshold: 0.1,
        restSpeedThreshold: 0.1,
        stiffness: 400,
      }),
    };
  });

  useEffect(() => {
    width.value = slide;
  }, [slide, width]);

  return (
    <Animated.View
      style={[
        widthStyle,
        {
          marginTop: -2,
          height: 2,
          zIndex: 2,
          backgroundColor: theme[11],
          shadowColor: theme[11],
          borderRadius: 10,
          shadowRadius: 10,
        },
      ]}
    />
  );
};

export default function Page() {
  const theme = useColorTheme();
  const { session } = useSession();
  const { name } = useLocalSearchParams();
  const [slide, setSlide] = useState(0);

  const { data } = useSWR(
    name ? ["space/integrations/about", { id: name }] : null
  );

  const { data: integrations } = useSWR(["space/integrations"]);

  const handleBack = () => {
    if (slide === 0) router.replace("/settings/space/integrations");
    else setSlide(slide - 1);
  };

  const methods = useForm({
    defaultValues: {
      integration: name,
      params: {
        ...(data &&
          Object.fromEntries(
            data?.authorization?.params?.map((p) => [p.id, ""])
          )),
      },
      ...(data?.supportLabelMapping && { labels: [] }),
    },
  });

  const { handleSubmit, getValues } = methods;

  const handleOpen = () => {
    if (isConnected) {
      return;
    }
    if (slide === 0) setSlide(1);
    if (data.authorization.type === "oauth2")
      Linking.openURL(
        `${process.env.EXPO_PUBLIC_API_URL}/space/integrations/redirect?session=${session}&id=${name}`
      );
    else if (data.authorization.type === "params") {
      const values = getValues();
      if (
        data.authorization.params[slide - 1]?.required &&
        !values.params[data.authorization.params[slide - 1].id]
      )
        return Toast.show({
          type: "error",
          text1: "This field is required",
        });

      setSlide(slide + 1);
    }
  };

  const insets = useSafeAreaInsets();
  const isConnected = integrations?.find((i) => i.integration.name === name);

  const slidesLength =
    data?.authorization.params.length +
    (data?.authorization.type === "oauth2"
      ? 1
      : 1 + data?.authorization.params.length);

  const onSubmit = async (values) => {
    try {
      await sendApiRequest(
        session,
        "POST",
        "space/integrations/connect",
        {},
        {
          body: JSON.stringify({ ...values, createIntegration: true }),
        }
      );
    } catch (e) {
      console.error(e);
      Toast.show({ type: "error" });
    }
  };

  return (
    <FormProvider {...methods}>
      <SettingsLayout hideBack>
        <View
          style={{
            flexDirection: "row",
            borderBottomColor: theme[6],
            borderBottomWidth: 2,
            height: 80 + insets.top,
            paddingTop: insets.top,
            alignItems: "center",
            paddingHorizontal: 10,
            zIndex: 1,
            backgroundColor: theme[1],
          }}
        >
          <IconButton
            icon="arrow_back_ios_new"
            onPress={handleBack}
            size={55}
          />
        </View>

        <SlideProgressBar slide={slide + 1} length={slidesLength} />

        {data ? (
          <View style={{ flex: 1 }}>
            {slide === 0 && <Intro integration={data} />}
            {slide > 0 && slide <= data.authorization.params.length && (
              <ParamSlide
                currentSlide={slide}
                slide={data.authorization.params[slide - 1]}
              />
            )}
            {slide === slidesLength - 1 ? (
              <Outro
                setSlide={setSlide}
                integration={data}
                submit={handleSubmit(onSubmit)}
              />
            ) : (
              <View style={[styles.footer, { paddingHorizontal: 20 }]}>
                <Button
                  large
                  variant={isConnected ? "outlined" : "filled"}
                  icon={isConnected ? "check" : "arrow_forward_ios"}
                  iconPosition="end"
                  iconSize={30}
                  text={
                    isConnected ? "Connected" : slide === 0 ? "Connect" : "Next"
                  }
                  onPress={handleOpen}
                />
              </View>
            )}
          </View>
        ) : (
          <View
            style={{
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Spinner />
          </View>
        )}
      </SettingsLayout>
    </FormProvider>
  );
}
