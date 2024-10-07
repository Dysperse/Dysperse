import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Emoji from "@/ui/Emoji";
import { EmojiPicker } from "@/ui/EmojiPicker";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import { StyleSheet, View, useWindowDimensions } from "react-native";
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
            backgroundColor: theme[3],
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

const LabelCustomizer = ({
  handleSubmit,
  connectedIntegration,
  status,
  setSlide,
}) => {
  const theme = useColorTheme();
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
    } else setValue("labels", data);
  }, [data, setSlide, setValue]);

  return (
    <>
      <Text style={{ opacity: 0.6, marginBottom: 10 }}>
        We found some labels for you. Customize them if you want.
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
                    variant={label.id ? "filled" : "outlined"}
                    disabled
                    style={{ marginBottom: 15 }}
                  >
                    <EmojiPicker
                      setEmoji={(emoji) => {
                        const newLabels = [...value];
                        newLabels[index].emoji = emoji;
                        onChange(newLabels);
                      }}
                    >
                      <IconButton
                        variant="outlined"
                        size={50}
                        style={{ borderColor: theme[6] }}
                      >
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
                      style={{
                        flex: 1,
                        fontSize: 20,
                        minWidth: 10,
                      }}
                      weight={600}
                    />
                    {label.id && (
                      <Icon style={{ marginRight: 10 }}>check_circle</Icon>
                    )}
                  </ListItemButton>
                ))}
                <View style={[styles.footer, { marginTop: "auto" }]}>
                  <Button
                    large
                    containerStyle={{ marginTop: 20 }}
                    isLoading={status === "loading"}
                    iconPosition="end"
                    variant="filled"
                    icon="done"
                    text={connectedIntegration ? "Save" : "Finish setup"}
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

const Outro = ({
  setConnectedSuccess,
  connectedIntegration,
  integration,
  submit,
  setSlide,
}) => {
  const supportsLabelMapping = integration.supportsLabelMapping;
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleClick = async () => {
    try {
      setStatus("loading");
      await submit();
      setConnectedSuccess(true);
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
              paddingTop: 50,
            }}
            weight={700}
          >
            Almost there...
          </Text>
          {supportsLabelMapping ? (
            <LabelCustomizer
              status={status}
              handleSubmit={handleClick}
              connectedIntegration={connectedIntegration}
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
              onPress={() => router.replace("/settings/account/integrations")}
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
  const theme = useColorTheme();
  const width = useSharedValue(0);

  const widthStyle = useAnimatedStyle(() => ({
    width: withSpring(
      `${((parseInt(slide) || 0) / (parseInt(length) || 1)) * 100}%`,
      {
        damping: 30,
        stiffness: 400,
      }
    ),
  }));

  useEffect(() => {
    width.value = slide;
  }, [slide, width]);

  return (
    <View style={{ backgroundColor: theme[6] }}>
      <Animated.View
        style={[
          widthStyle,
          {
            height: 2,
            backgroundColor: theme[11],
            // shadowColor: theme[11],
            // shadowOffset: { height: 2, width: 0 },
            // borderRadius: 10,
            // shadowRadius: 20,
          },
        ]}
      />
    </View>
  );
};

function OauthRedirect({ integration }) {
  const { session } = useSession();
  const handleOpen = () =>
    WebBrowser.openAuthSessionAsync(
      `${process.env.EXPO_PUBLIC_API_URL}/space/integrations/redirect?session=${session}&id=${integration.slug}`,
      // `${process.env.EXPO_PUBLIC_API_URL}/settings/space/integrations/${integration.slug}/redirect`
      Linking.createURL(
        `/settings/account/integrations/${integration.slug}/redirect`
      )
    );

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: 20,
          padding: 20,
          textAlign: "center",
          marginTop: "auto",
        }}
        weight={700}
      >
        Tap the button below to open {integration.name}. You'll be redirected to
        another page to complete the setup.
      </Text>
      <Button
        variant="filled"
        onPress={handleOpen}
        height={60}
        containerStyle={{ marginTop: "auto", width: "100%" }}
      >
        <ButtonText style={{ fontSize: 20 }}>
          Connect {integration.name}
        </ButtonText>
        <Icon>open_in_new</Icon>
      </Button>
    </View>
  );
}

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
    if (slide === 0) router.replace("/settings/account/integrations");
    else setSlide(slide - 1);
  };

  const { height } = useWindowDimensions();
  const connectedIntegration = integrations?.find(
    (i) => i.integration.name === name
  );

  const methods = useForm({
    defaultValues: {
      integration: name,
      id: connectedIntegration?.integration?.id,
      ...(data?.authorization?.params && {
        params: {
          ...Object.fromEntries(
            data?.authorization?.params?.map((p) => [p.id, ""])
          ),
          ...(connectedIntegration && connectedIntegration.integration?.params),
        },
      }),
      ...(data?.supportLabelMapping && { labels: [] }),
    },
  });
  const { handleSubmit, getValues } = methods;

  const handleOpen = () => {
    if (slide === 0) setSlide(1);
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

  const [connectedSuccess, setConnectedSuccess] = useState(false);

  const slidesLength =
    (data?.authorization?.params?.length || 0) +
    (data?.authorization.type === "oauth2"
      ? 2
      : 1 + data?.authorization?.params?.length);

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

  const breakpoints = useResponsiveBreakpoints();

  return (
    <FormProvider {...methods}>
      <View
        style={[
          { flex: 1, paddingBottom: insets.bottom, backgroundColor: theme[2] },
          breakpoints.md && {
            borderWidth: 1,
            borderRadius: 20,
            borderColor: theme[6],
            overflow: "hidden",
            marginTop: 50,
            height: height - 60,
          },
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            height: 80 + insets.top,
            paddingTop: insets.top,
            alignItems: "center",
            paddingHorizontal: 10,
            zIndex: 1,
            backgroundColor: theme[2],
          }}
        >
          <ConfirmationModal
            onSuccess={handleBack}
            title="Exit setup?"
            secondary="This integration will not be created"
            height={350}
            disabled={slide !== 0}
          >
            <IconButton
              icon="arrow_back_ios_new"
              onPress={handleBack}
              size={55}
              disabled={connectedSuccess}
            />
          </ConfirmationModal>
        </View>

        <SlideProgressBar slide={slide + 1} length={slidesLength + 1} />

        {data ? (
          <View style={{ flex: 1 }}>
            {slide === 0 && <Intro integration={data} />}
            {slide === 1 && data.authorization.type === "oauth2" && (
              <OauthRedirect integration={data} />
            )}
            {slide > 0 && slide <= data.authorization?.params?.length && (
              <FormProvider {...methods}>
                <ParamSlide
                  currentSlide={slide}
                  slide={data.authorization.params[slide - 1]}
                />
              </FormProvider>
            )}
            {slide === slidesLength - 1 &&
            data.authorization.type !== "oauth2" ? (
              <FormProvider {...methods}>
                <Outro
                  setConnectedSuccess={setConnectedSuccess}
                  connectedIntegration={connectedIntegration}
                  setSlide={setSlide}
                  integration={data}
                  submit={handleSubmit(onSubmit)}
                />
              </FormProvider>
            ) : (
              !(data.authorization.type === "oauth2" && slide === 1) && (
                <View style={[styles.footer, { paddingHorizontal: 20 }]}>
                  {connectedIntegration && slide === 0 && (
                    <ConfirmationModal
                      onSuccess={async () => {
                        try {
                          await sendApiRequest(
                            session,
                            "DELETE",
                            "space/integrations",
                            { id: connectedIntegration.integration.id }
                          );
                          router.replace("/settings/account/integrations");
                        } catch (e) {
                          console.error(e);
                          Toast.show({ type: "error" });
                        }
                      }}
                      title="Remove connection?"
                      secondary="Tasks already created will not be deleted, but you won't see any new ones"
                      height={350}
                    >
                      <Button
                        variant="outlined"
                        icon="delete"
                        text="Remove connection"
                        containerStyle={{ marginBottom: 10 }}
                        height={50}
                      />
                    </ConfirmationModal>
                  )}
                  <Button
                    large
                    variant="filled"
                    icon="arrow_forward_ios"
                    iconPosition="end"
                    height={50}
                    text={
                      connectedIntegration
                        ? "Edit connection"
                        : slide === 0
                        ? "Connect"
                        : "Next"
                    }
                    onPress={handleOpen}
                  />
                </View>
              )
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
      </View>
    </FormProvider>
  );
}

