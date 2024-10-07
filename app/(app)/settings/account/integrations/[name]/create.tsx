import { GoogleAuth } from "@/app/auth/sign-in";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { Button } from "@/ui/Button";
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
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
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

const Outro = ({
  setConnectedSuccess,
  connectedIntegration,
  integration,
  submit,
  setSlide,
}) => {
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

          <Button
            large
            variant="filled"
            text="Connect"
            onPress={handleClick}
            containerStyle={{ marginBottom: "auto" }}
          />
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

function OauthRedirect({ integration, setSlide, onSubmit }) {
  const { setValue, handleSubmit } = useFormContext();

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
          marginVertical: "auto",
        }}
        weight={700}
      >
        Tap the button below to open {integration.name}. You'll be redirected to
        another page to complete the setup.
      </Text>
      <GoogleAuth
        getRefreshToken
        additionalScopes={integration.authorization.scopes}
        redirectPath="space/integrations/settings/google-calendar/auth"
        onNewAccount={(e) => {
          console.log(JSON.stringify(e));
          if (e.account && e.tokens) {
            setValue("params", {
              account: JSON.parse(e.account),
              tokens: JSON.parse(e.tokens),
            });
            handleSubmit(onSubmit)();
          }
        }}
      />
    </View>
  );
}

export default function Page() {
  const { session } = useSession();
  const { name } = useLocalSearchParams();
  const [slide, setSlide] = useState(0);

  const { data: integrationData } = useSWR(
    `${
      process.env.NODE_ENV === "development"
        ? "/integrations.json"
        : "https://app.dysperse.com/integrations.json"
    }`,
    (t) => fetch(t).then((t) => t.json())
  );

  const data = integrationData?.find((i) => i.slug === name);

  const { data: integrations } = useSWR(["space/integrations"]);

  const connectedIntegration = integrations?.find(
    (i) => i.integration.name === name
  );

  const methods = useForm({
    defaultValues: {
      type: data.id,
      name: data.slug,
      params: {},
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

  const [connectedSuccess, setConnectedSuccess] = useState(false);

  const slidesLength =
    (data?.authorization?.params?.length || 0) +
    (data?.authorization.type === "GoogleOAuth2"
      ? 2
      : 1 + data?.authorization?.params?.length);

  const onSubmit = async (values) => {
    try {
      setSlide(-1);
      const { id } = await sendApiRequest(
        session,
        "POST",
        "space/integrations",
        {},
        {
          body: JSON.stringify(values),
        }
      );

      if (id)
        router.replace(`/settings/account/integrations/${values.name}/${id}`);
      else throw new Error("Couldn't connect");
    } catch (e) {
      setSlide(0);
      console.error(e);
      Toast.show({ type: "error" });
    }
  };

  return (
    <FormProvider {...methods}>
      {data ? (
        <View
          style={[
            { flex: 1 },
            slide === -1 && {
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          {slide === -1 && <Spinner />}
          {slide === 0 && <Intro integration={data} />}

          {slide === 1 && data.authorization.type === "GoogleOAuth2" && (
            <OauthRedirect
              onSubmit={onSubmit}
              setSlide={setSlide}
              integration={data}
            />
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
          data.authorization.type !== "GoogleOAuth2" ? (
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
            slide !== -1 &&
            !(data.authorization.type === "GoogleOAuth2" && slide === 1) && (
              <View style={[styles.footer, { paddingHorizontal: 20 }]}>
                <Button
                  large
                  variant="filled"
                  icon="arrow_forward_ios"
                  iconPosition="end"
                  height={50}
                  text={slide === 0 ? "Connect" : "Next"}
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
    </FormProvider>
  );
}

