import { useCollectionContext } from "@/components/collections/context";
import { CollectionMenuLayout } from "@/components/collections/menus/layout";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { Button } from "@/ui/Button";
import OtpInput from "@/ui/OtpInput";
import Text from "@/ui/Text";
import { router } from "expo-router";
import { useState } from "react";
import Toast from "react-native-toast-message";

function Content() {
  const { session } = useSession();
  const { data } = useCollectionContext();
  useHotkeys("esc", () => router.back());
  const [code, setCode] = useState(data.pinCode || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (r) => {
    setLoading(true);
    try {
      await sendApiRequest(
        session,
        "PUT",
        "space/collections",
        {},
        {
          body: JSON.stringify({
            id: data.id,
            pinCode: typeof r === "boolean" ? r : code,
          }),
        }
      );
      Toast.show({
        type: "success",
        text1: "PIN code " + (typeof r === "boolean" ? "removed" : "set"),
      });
    } catch (e) {
      Toast.show({ type: "error" });
      console.log(e);
    }
    router.back();
  };

  return (
    <>
      {data.pinCode ? (
        <Button
          icon="lock"
          text="Remove password"
          variant="filled"
          onPress={() => handleSubmit(false)}
          bold
          large
          containerStyle={{
            marginTop: 20,
          }}
        />
      ) : (
        <>
          <Text
            style={{
              textAlign: "center",
              marginBottom: 20,
            }}
            weight={300}
          >
            Dysperse will ask you for a password when you open this collection.
            Users whom you share this collection with will also need to enter
            the password.
          </Text>
          <OtpInput type="numeric" onTextChange={(text) => setCode(text)} />

          <Button
            isLoading={loading}
            icon="lock"
            text="Set password"
            variant="filled"
            disabled={code.toString().length < 6}
            onPress={handleSubmit}
            bold
            large
            containerStyle={{
              marginTop: 20,
              opacity: code.toString().length < 6 ? 0.5 : 1,
            }}
          />

          <Text
            style={{
              textAlign: "center",
              marginTop: 20,
            }}
            weight={300}
          >
            Heads up! Tasks can still be viewed if labels in this collection
            exist in other ones. Unlabeled ones will still be hidden.
          </Text>
        </>
      )}
    </>
  );
}

export default function Page() {
  return (
    <CollectionMenuLayout title="PIN code">
      <Content />
    </CollectionMenuLayout>
  );
}
