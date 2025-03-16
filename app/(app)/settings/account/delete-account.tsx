import { settingStyles } from "@/components/settings/settingsStyles";
import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import SettingsScrollView from "@/ui/SettingsScrollView";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import Turnstile from "@/ui/turnstile";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import Toast from "react-native-toast-message";

function SubmitButton({ watch, submit, loading }) {
  const captcha = watch("captcha");
  return (
    <Button
      onPress={submit}
      variant={captcha ? "filled" : "outlined"}
      height={60}
      isLoading={loading || !captcha}
    >
      <ButtonText>Done</ButtonText>
      <Icon>east</Icon>
    </Button>
  );
}

export default function Page() {
  const { signOut } = useSession();
  const { sessionToken, session } = useUser();
  const [loading, setLoading] = useState(false);
  const { control, watch, handleSubmit } = useForm({
    defaultValues: {
      reason: "",
      feedback: "",
      alternative: "",
      satisfaction: "",
      email: session.user.email,
      captcha: "",
    },
  });
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const t = await sendApiRequest(
        sessionToken,
        "DELETE",
        "user/delete-account",
        {},
        {
          body: JSON.stringify(data),
        }
      );
      if (t.success) signOut();
      else throw new Error("Something went wrong");
    } catch (error) {
      Toast.show({ type: "error" });
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <SettingsScrollView>
      <View style={{ flexDirection: "row", marginBottom: 20 }}>
        <Button
          variant="outlined"
          onPress={() => router.push("/settings/account")}
        >
          <Icon>west</Icon>
          <ButtonText>Never mind!</ButtonText>
        </Button>
      </View>

      <Text style={settingStyles.title}>We're heartbroken to see you go.</Text>
      <Text style={{ fontSize: 20 }} weight={200}>
        Since we're still a small productivity app, we want you to give us your
        honest feedback on why you're leaving.
      </Text>

      <Text style={settingStyles.heading}>Why are you leaving us?</Text>
      <Controller
        control={control}
        name="reason"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <>
            {[
              "Dysperse is too confusing",
              "There's too many bugs",
              "I don't like the design",
              "I'm concerned about privacy",
              "Lack of integrations",
              "Not enough features",
              "Something else",
            ].map((reason) => (
              <View
                key={reason}
                style={{ flexDirection: "row", marginLeft: -10 }}
              >
                <Button
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                  height={40}
                  onPress={() => onChange(reason)}
                >
                  <Icon>
                    {value === reason
                      ? "radio_button_checked"
                      : "radio_button_unchecked"}
                  </Icon>
                  <ButtonText>{reason}</ButtonText>
                </Button>
              </View>
            ))}
          </>
        )}
      />

      <Text style={settingStyles.heading}>Tell us a bit more...</Text>
      <Controller
        control={control}
        name="feedback"
        rules={{ required: true, minLength: 50 }}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <TextField
            multiline
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            style={{ height: 100, borderColor: error ? "red" : undefined }}
            variant="filled+outlined"
            placeholder="Anything specific? Please type 50 characters or more"
          />
        )}
      />
      <Text style={settingStyles.heading}>
        How will you stay productive without Dysperse?
      </Text>
      <Controller
        control={control}
        name="alternative"
        rules={{ required: true, minLength: 10 }}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <TextField
            multiline
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            style={{ height: 70, borderColor: error ? "red" : undefined }}
            variant="filled+outlined"
            placeholder="What app or system will you use instead? What do you like about it?"
          />
        )}
      />
      <Text style={settingStyles.heading}>
        What did you like about Dysperse?
      </Text>
      <Controller
        control={control}
        name="satisfaction"
        rules={{ required: true, minLength: 10 }}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <TextField
            multiline
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            style={{ height: 70, borderColor: error ? "red" : undefined }}
            variant="filled+outlined"
            placeholder="Anything you'll miss? Let us know what you loved the most."
          />
        )}
      />

      <Text style={settingStyles.heading}>One last step</Text>
      <Text>Let's make sure you're not a bot</Text>
      <View style={{ width: 300 }}>
        <Controller
          control={control}
          name="captcha"
          render={({ field: { onChange } }) => (
            <Turnstile setToken={onChange} />
          )}
        />
      </View>
      <View
        style={{
          borderColor: "#e04154",
          borderWidth: 2,
          borderRadius: 20,
          padding: 20,
          marginTop: 20,
        }}
      >
        <Text
          style={{ fontSize: 40, color: "#e04154", fontFamily: "serifText800" }}
          weight={900}
        >
          Are you sure?
        </Text>
        <Text
          style={{ fontSize: 20, color: "#e04154", marginTop: 5 }}
          weight={400}
        >
          - Any templates you've published will be lost.{"\n"}- Links you've
          shared with others will no longer work.{"\n"}- Integrations with
          third-party services will be disconnected.{"\n"}
        </Text>
      </View>
      <View style={{ marginTop: 20 }}>
        <SubmitButton
          loading={loading}
          watch={watch}
          submit={handleSubmit(onSubmit)}
        />
      </View>
    </SettingsScrollView>
  );
}

