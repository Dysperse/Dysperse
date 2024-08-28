import { settingStyles } from "@/components/settings/settingsStyles";
import { useUser } from "@/context/useUser";
import { Button } from "@/ui/Button";
import TextField from "@/ui/TextArea";
import base64 from "@hexagon/base64";
import { Base64URLString } from "@simplewebauthn/typescript-types";
import * as Application from "expo-application";
import React from "react";
import { Platform, ScrollView, Text, View } from "react-native";
import * as passkey from "react-native-passkeys";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ! taken from https://github.com/MasterKale/SimpleWebAuthn/blob/e02dce6f2f83d8923f3a549f84e0b7b3d44fa3da/packages/browser/src/helpers/bufferToBase64URLString.ts
/**
 * Convert the given array buffer into a Base64URL-encoded string. Ideal for converting various
 * credential response ArrayBuffers to string for sending back to the server as JSON.
 *
 * Helper method to compliment `base64URLStringToBuffer`
 */
export function bufferToBase64URLString(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = "";

  for (const charCode of bytes) {
    str += String.fromCharCode(charCode);
  }

  const base64String = btoa(str);

  return base64String.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

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
export function base64UrlToString(base64urlString: Base64URLString): string {
  return base64.toString(base64urlString, true);
}

const bundleId = Application.applicationId?.split(".").reverse().join(".");
const rp = {
  id: Platform.select({
    web: undefined,
    ios: bundleId,
    android: bundleId?.replaceAll("_", "-"),
  }),
  name: "ReactNativePasskeys",
} satisfies PublicKeyCredentialRpEntity;

// Don't do this in production!
const challenge = bufferToBase64URLString(utf8StringToBuffer("fizz"));

export default function App() {
  const insets = useSafeAreaInsets();
  const { session } = useUser();

  const [result, setResult] = React.useState();
  const [creationResponse, setCreationResponse] = React.useState<
    NonNullable<Awaited<ReturnType<typeof passkey.create>>>["response"] | null
  >(null);

  const [credentialId, setCredentialId] = React.useState("");

  const createPasskey = async () => {
    try {
      const json = await passkey.create({
        rp,
        user: {
          id: bufferToBase64URLString(utf8StringToBuffer(session.user.id)),
          displayName: session.user.profile.name,
          name: session.user.profile.name,
        },
        challenge,
        pubKeyCredParams: [
          {
            type: "public-key",
            alg: -7,
          },
          {
            type: "public-key",
            alg: -257,
          },
        ],
        timeout: 60000,
        excludeCredentials: [],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          residentKey: "preferred",
          requireResidentKey: true,
          userVerification: "required",
        },
        attestation: "direct",
        hints: ["client-device", "security-key"],
        extensions: {
          credProps: true,
        },
      });

      console.log("creation json -", json);

      if (json?.rawId) setCredentialId(json.rawId);
      if (json?.response) setCreationResponse(json.response);

      setResult(json);
    } catch (e) {
      console.error("create error", e);
    }
  };

  const authenticatePasskey = async () => {
    const json = await passkey.get({
      rpId: rp.id,
      challenge,
      ...(credentialId && {
        allowCredentials: [{ id: credentialId, type: "public-key" }],
      }),
    });

    console.log("authentication json -", json);

    setResult(json);
  };

  const writeBlob = async () => {
    console.log("user credential id -", credentialId);
    if (!credentialId) {
      alert(
        "No user credential id found - large blob requires a selected credential"
      );
      return;
    }

    const json = await passkey.get({
      rpId: rp.id,
      challenge,
      extensions: {
        largeBlob: {
          write: bufferToBase64URLString(
            utf8StringToBuffer("Hey its a private key!")
          ),
        },
      },
      ...(credentialId && {
        allowCredentials: [{ id: credentialId, type: "public-key" }],
      }),
    });

    console.log("add blob json -", json);

    const written = json?.clientExtensionResults?.largeBlob?.written;
    if (written) alert("This blob was written to the passkey");

    setResult(json);
  };

  const readBlob = async () => {
    const json = await passkey.get({
      rpId: rp.id,
      challenge,
      extensions: { largeBlob: { read: true } },
      ...(credentialId && {
        allowCredentials: [{ id: credentialId, type: "public-key" }],
      }),
    });

    console.log("read blob json -", json);

    const blob = json?.clientExtensionResults?.largeBlob?.blob;
    if (blob) alert("This passkey has blob", base64UrlToString(blob));

    setResult(json);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <Text style={settingStyles.title}>Passkeys</Text>
        <Text>
          Passkeys are {passkey.isSupported() ? "Supported" : "Not Supported"}
        </Text>
        {credentialId && <Text>User Credential ID: {credentialId}</Text>}
        <View>
          <Button onPress={createPasskey}>
            <Text>Create</Text>
          </Button>
          <Button onPress={authenticatePasskey}>
            <Text>Authenticate</Text>
          </Button>
          {creationResponse && (
            <Button
              onPress={() => {
                alert(
                  "Public Key",
                  creationResponse?.getPublicKey() as Uint8Array
                );
              }}
            >
              <Text>Get PublicKey</Text>
            </Button>
          )}
        </View>
        {result && (
          <TextField
            style={{ flex: 1 }}
            variant="filled+outlined"
            value={JSON.stringify(result, null, 2)}
            multiline
          />
        )}
      </ScrollView>
    </View>
  );
}
