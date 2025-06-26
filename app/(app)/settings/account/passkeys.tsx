import { settingStyles } from "@/components/settings/settingsStyles";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import ErrorAlert from "@/ui/Error";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import SettingsScrollView from "@/ui/SettingsScrollView";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { base64 } from "@hexagon/base64";
import { Base64URLString } from "@simplewebauthn/typescript-types";
import dayjs from "dayjs";
import * as Application from "expo-application";
import React, { useState } from "react";
import { Platform, View } from "react-native";
import * as passkey from "react-native-passkeys";
import Toast from "react-native-toast-message";
import useSWR from "swr";

export function bufferToBase64URLString(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = "";

  for (const charCode of bytes) {
    str += String.fromCharCode(charCode);
  }

  const base64String = btoa(str);

  return base64String.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

const bundleId = Application.applicationId?.split(".").reverse().join(".");
export const rp = {
  id: Platform.select({
    web: undefined,
    // "go.dysperse.com",
    ios: bundleId,
    android: bundleId?.replaceAll("_", "-"),
  }),
  name: "Dysperse",
} satisfies PublicKeyCredentialRpEntity;

// ! taken from https://github.com/MasterKale/SimpleWebAuthn/blob/e02dce6f2f83d8923f3a549f84e0b7b3d44fa3da/packages/browser/src/helpers/utf8StringToBuffer.ts
/**
 * A helper method to convert an arbitrary string sent from the server to an ArrayBuffer the
 * authenticator will expect.
 */
export function utf8StringToBuffer(value: string): ArrayBuffer {
  return new TextEncoder().encode(value);
}

/**
 * Decode a base64url string into its original string
 */

function CreatePasskey({ mutate }) {
  const { session, sessionToken } = useUser();
  const [loading, setLoading] = useState(false);

  const [credentialId, setCredentialId] = useState("");

  const createPasskey = async () => {
    try {
      const { challenge } = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/login/passkeys`
      ).then((res) => res.json());

      const json = await passkey.create({
        challenge,
        rp,
        user: {
          id: session.user.id,
          displayName: session.user.profile.name,
          name: session.user.profile.name,
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" },
          { alg: -257, type: "public-key" },
        ],
        timeout: 60000,
        excludeCredentials: [],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          residentKey: "preferred",
          requireResidentKey: false,
          userVerification: "required",
        },
        attestation: "direct",
      });

      if (json?.rawId) setCredentialId(json.rawId);
      // if (json?.response) setCreationResponse(json.response);

      Toast.show({
        type: "success",
        text1: "You're almost there!",
        text2: "Please confirm one more time to complete the process.",
      });

      const result = await passkey.get({
        rpId: rp.id,
        challenge,
        ...(credentialId && {
          allowCredentials: [{ id: credentialId, type: "public-key" }],
        }),
      });

      const res = {
        ...json,
        response: {
          ...json.response,
          authenticatorData: result.response.authenticatorData,
        },
      };

      setLoading(true);

      const verificationData = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/login/passkeys`,
        {
          method: "POST",
          body: JSON.stringify({
            challenge,
            response: res,
            publicKey: bufferToBase64URLString(
              (json as any).response?.getPublicKey()
            ),
          }),
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      ).then((res) => res.json());

      if (verificationData.store)
        mutate((o) => [verificationData.store, ...o], { revalidate: false });

      // console.log(verificationData);

      Toast.show({ type: "success", text1: "Success!" });
      setLoading(false);
    } catch (e) {
      console.error("create error", e);
    }
  };

  return (
    <Button
      variant="filled"
      large
      bold
      containerStyle={{ width: "100%" }}
      icon="add"
      isLoading={loading}
      text="Create"
      onPress={createPasskey}
    />
  );
}
export function base64UrlToString(base64urlString: Base64URLString): string {
  return base64.toString(base64urlString, true);
}

export default function App() {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { sessionToken } = useUser();
  const { data, error, mutate } = useSWR(["user/passkeys"]);

  return (
    <SettingsScrollView>
      <View
        style={{
          flexDirection: breakpoints.md ? "row" : "column",
          justifyContent: "space-between",
          marginBottom: 20,
          alignItems: breakpoints.md ? "center" : "flex-start",
          gap: 20,
        }}
      >
        <View>
          <Text style={settingStyles.title}>Passkeys</Text>
          <Text>
            {passkey.isSupported()
              ? "Passkeys let you log in securely without passwords using your device's biometrics or PIN."
              : "Passkeys aren't supported on this device."}
          </Text>
        </View>
        <CreatePasskey mutate={mutate} />
      </View>

      <View style={{ flex: 1 }}>
        {data?.length === 0 && (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
              borderRadius: 20,
              backgroundColor: theme[3],
            }}
          >
            <Text style={{ color: theme[11] }}>No passkeys yet!</Text>
          </View>
        )}
        {data ? (
          data.map((item) => (
            <ListItemButton
              disabled
              variant="filled"
              key={item.id}
              style={{ marginBottom: 10 }}
            >
              <ListItemText
                primary={
                  <TextField
                    style={{
                      paddingHorizontal: 2,
                      paddingVertical: 2,
                      borderRadius: 2,
                    }}
                    variant="filled+outlined"
                    defaultValue={item.friendlyName}
                    onBlur={async (e) => {
                      await sendApiRequest(
                        sessionToken,
                        "PUT",
                        "user/passkeys",
                        {
                          id: item.id,
                          friendlyName: e.nativeEvent.text,
                        }
                      );
                      mutate(
                        (o) =>
                          o.map((i) =>
                            i.id === item.id
                              ? { ...i, friendlyName: e.nativeEvent.text }
                              : i
                          ),
                        { revalidate: false }
                      );
                      Toast.show({ type: "success", text1: "Saved!" });
                    }}
                  />
                }
                secondary={`Created ${dayjs(item.createdAt).fromNow()}`}
              />
              <IconButton
                icon="delete"
                onPress={async () => {
                  mutate((o) => o.filter((i) => i.id !== item.id), {
                    revalidate: false,
                  });
                  sendApiRequest(sessionToken, "DELETE", "user/passkeys", {
                    id: item.id,
                  });
                  Toast.show({ type: "success", text1: "Deleted!" });
                }}
              />
            </ListItemButton>
          ))
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
              backgroundColor: theme[3],
            }}
          >
            {error ? <ErrorAlert /> : <Spinner />}
          </View>
        )}
      </View>
    </SettingsScrollView>
  );
}

