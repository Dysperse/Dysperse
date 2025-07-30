import { useCollectionContext } from "@/components/collections/context";
import { CollectionMenuLayout } from "@/components/collections/menus/layout";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import OtpInput from "@/ui/OtpInput";
import Text from "@/ui/Text";
import { router } from "expo-router";
import { useState } from "react";
import { StatusBar, View } from "react-native";
import Toast from "react-native-toast-message";

function Content() {
  const { session } = useSession();
  const { data, mutate } = useCollectionContext();
  useHotkeys("esc", () => router.back());
  const breakpoints = useResponsiveBreakpoints();
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
            pinCode: typeof r === "boolean" || r ? r : code,
          }),
        }
      );
      await mutate();
      router.dismissAll();
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
        <View style={{ paddingHorizontal: 20, flex: 1 }}>
          <Text
            style={{
              textAlign: breakpoints.md ? "center" : "left",
              marginBottom: 20,
            }}
          >
            We'll require a password to open this collection. Shared users must
            enter it too.
            {"\n\n"}
            Labeled tasks may still show in other collections. Unlabeled ones
            stay hidden.
          </Text>

          <OtpInput
            type="numeric"
            containerGap={10}
            onTextChange={(text) => setCode(text)}
            onFilled={(text) => handleSubmit(text)}
          />

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
        </View>
      )}
    </>
  );
}

export default function Page() {
  return (
    <CollectionMenuLayout title="PIN code">
      <StatusBar barStyle="dark-content" />
      <Content />
    </CollectionMenuLayout>
  );
}

