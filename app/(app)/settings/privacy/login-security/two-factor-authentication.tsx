import { SettingsLayout } from "@/components/settings/layout";
import { settingStyles } from "@/components/settings/settingsStyles";
import { useUser } from "@/context/useUser";
import { Button, ButtonText } from "@/ui/Button";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { router } from "expo-router";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";

export default function Page() {
  const { session } = useUser();
  const { data, error } = useSWR(["user/2fa/setup"]);

  return (
    <SettingsLayout>
      <View style={{ flexDirection: "row" }}>
        <Button
          variant="outlined"
          text="Login security"
          icon="arrow_back_ios"
          onPress={() => router.back()}
        />
      </View>
      {!data ? (
        error ? (
          <ErrorAlert />
        ) : (
          <Spinner />
        )
      ) : (
        <View style={{ marginTop: 30 }}>
          <Text style={settingStyles.title}>Two-factor authentication</Text>
          <Text
            style={{
              marginTop: 5,
              opacity: 0.6,
              fontSize: 20,
              marginBottom: 20,
            }}
          >
            2FA is an extra layer of security for your account. Scan the QR code
            below with an authenticator app to get started, and enter the code
            it gives you.
          </Text>
          <View
            style={{
              alignItems: "center",
              marginTop: 30,
              gap: 50,
              flexDirection: "row",
            }}
          >
            <View>
              <Image
                source={{ uri: data.qr }}
                style={{ width: 200, height: 200, borderRadius: 5 }}
              />
              <Button
                style={{ marginVertical: 5 }}
                onPress={async () => {
                  await Clipboard.setStringAsync(data.secret);

                  Toast.show({
                    type: "success",
                    text1: "Copied setup key!",
                    text2: "Paste it into your authenticator app.",
                  });
                }}
              >
                <ButtonText>Can't scan?</ButtonText>
              </Button>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TextField
                keyboardType="number-pad"
                variant="filled+outlined"
                placeholder="Enter code"
                style={{
                  fontSize: 20,
                  textAlign: "center",
                  fontFamily: "body_900",
                  height: 60,
                }}
              />
              <Button
                style={{
                  height: 60,
                  borderRadius: 10,
                }}
              >
                <Icon>arrow_forward_ios</Icon>
              </Button>
            </View>
          </View>
        </View>
      )}
    </SettingsLayout>
  );
}
