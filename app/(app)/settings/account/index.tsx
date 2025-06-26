import { settingStyles } from "@/components/settings/settingsStyles";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { ProfilePicture } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import ConfirmationModal from "@/ui/ConfirmationModal";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import SettingsScrollView from "@/ui/SettingsScrollView";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { cloneElement, useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Platform, View } from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { Section } from "../tasks";

export const pickImageAsync = async (setLoading, onChange) => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      presentationStyle: ImagePicker.UIImagePickerPresentationStyle.POPOVER,
    });

    if (!result.canceled) {
      setLoading(true);

      // convert to File
      const blob = await fetch(result.assets[0].uri).then((r) => r.blob());
      const form = new FormData();

      form.append(
        "source",
        new File([blob], "filename", {
          type: "image/png",
          lastModified: new Date().getTime(),
        })
      );

      const res = await fetch("https://api.dysperse.com/upload", {
        method: "POST",
        body: form,
      }).then((res) => res.json());

      console.log(res);

      onChange(res.image.display_url);
    } else {
      // alert("You did not select any image.");
    }
  } catch (e) {
    console.error("Error picking image:", e);
    Toast.show({ type: "error" });
  } finally {
    setLoading(false);
  }
};

function EmailSection({ children }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const { session, mutate, sessionToken } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: session.user.email,
      token: "",
    },
  });

  const sheetRef = useRef<BottomSheetModal>(null);

  const onSubmit = async (values) => {
    if (!values.token) {
      try {
        setIsLoading(true);
        const data = await sendApiRequest(
          sessionToken,
          "POST",
          "user/account/email",
          {
            email: values.email,
          }
        );
        if (data.error) {
          Toast.show({ type: "error", text1: data.error });
          return;
        }
        setIsVerifying(true);
        sheetRef.current.present();
      } catch (e) {
        Toast.show({ type: "error" });
      } finally {
        setIsLoading(false);
      }

      return;
    }

    try {
      setIsLoading(true);
      const data = await sendApiRequest(
        sessionToken,
        "PUT",
        "user/account/email",
        {
          token: values.token,
        }
      );
      if (data.error) {
        Toast.show({
          type: "error",
          text1: "Incorrect code. Please try again",
        });
        return;
      }
      sheetRef.current.close();
      Toast.show({ type: "success", text1: "Email updated!" });
      mutate((d) => ({ ...d, user: { ...d.user, email: values.email } }), {
        revalidate: false,
      });
    } catch (e) {
      Toast.show({ type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = useCallback(() => sheetRef.current?.close(), []);
  const trigger = cloneElement(children, {
    onPress: () => {
      sheetRef.current?.present();
    },
  });

  return (
    <>
      {trigger}
      <BottomSheet
        onClose={handleClose}
        snapPoints={[400]}
        sheetRef={sheetRef}
        disableBackdropPressToClose={isVerifying}
        enableContentPanningGesture={!isVerifying}
        enableHandlePanningGesture={!isVerifying}
      >
        <BottomSheetScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 30 }}
        >
          {!isVerifying ? (
            <>
              <Text style={{ fontSize: 25, fontFamily: "serifText700" }}>
                Change your email
              </Text>
              <Text style={{ marginBottom: 20, marginTop: 10 }}>
                Enter a new email to update your account. If you use Google or
                Apple to sign in, make sure it matches your Google or Apple
                email.
              </Text>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Invalid email",
                  },
                }}
                render={({ field: { value, onChange } }) => (
                  <>
                    <TextField
                      bottomSheet
                      style={{ flex: 1, height: 50 }}
                      editable={!isLoading}
                      onSubmitEditing={handleSubmit(onSubmit, () =>
                        Toast.show({
                          type: "error",
                          text1: "Please enter an email",
                        })
                      )}
                      defaultValue={value}
                      onChangeText={onChange}
                      variant={"filled+outlined"}
                    />
                    <Button
                      iconPosition="end"
                      disabled={session.user.email === value}
                      isLoading={isLoading}
                      text="Update"
                      large
                      bold
                      containerStyle={{ marginTop: 20 }}
                      variant="filled"
                      onPress={handleSubmit(onSubmit, () =>
                        Toast.show({
                          type: "error",
                          text1: "Please enter an email",
                        })
                      )}
                    />
                    <Button
                      text="Cancel"
                      large
                      containerStyle={{ marginTop: 10 }}
                      variant="outlined"
                      onPress={() => sheetRef.current.close()}
                    />
                  </>
                )}
              />
            </>
          ) : (
            <>
              <Text style={{ fontSize: 25, fontFamily: "serifText700" }}>
                Verify your email
              </Text>
              <Text style={{ marginBottom: 20, marginTop: 10 }}>
                We sent a verification email to your new email address. Please
                enter the code to confirm your new email.
              </Text>
              <Controller
                name="token"
                control={control}
                rules={{
                  required: true,
                  minLength: 8,
                }}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    placeholder="Verification code"
                    variant="filled+outlined"
                    bottomSheet
                    style={{ flex: 1, height: 50 }}
                    editable={!isLoading}
                    onSubmitEditing={handleSubmit(onSubmit, () =>
                      Toast.show({
                        type: "error",
                        text1: "Please enter a code",
                      })
                    )}
                    defaultValue=""
                    onChangeText={onChange}
                    autoComplete="new-password"
                  />
                )}
              />
              <Button
                isLoading={isLoading}
                text="Confirm"
                large
                bold
                containerStyle={{ marginTop: 20 }}
                variant="filled"
                disabled={isLoading}
                onPress={handleSubmit(onSubmit, () =>
                  Toast.show({ type: "error", text1: "Please enter a code" })
                )}
              />
              <Button
                text="Back"
                large
                containerStyle={{ marginTop: 10 }}
                variant="outlined"
                onPress={() => {
                  setIsVerifying(false);
                }}
              />
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </>
  );
}

function TwoFactorAuthSection() {
  const { session, sessionToken, mutate } = useUser();
  const isEnabled = session.user.twoFactorSecret;

  return (
    <ListItemButton disabled>
      <ListItemText
        primary="Two-factor auth"
        secondary="We'll require an annoying code every time you login"
      />
      <ConfirmationModal
        title="Disable 2FA?"
        secondary="Your account won't be as secure anymore. Are you sure?"
        height={440}
        onSuccess={async () => {
          if (isEnabled) {
            await sendApiRequest(sessionToken, "DELETE", "user/2fa/setup");
            mutate(
              (d) => ({
                ...d,
                user: { ...d.user, twoFactorSecret: null },
              }),
              {
                revalidate: false,
              }
            );
          } else {
            router.push("/settings/login/account/two-factor-authentication");
          }
        }}
        disabled={!isEnabled}
      >
        <Button height={40} variant="filled">
          <ButtonText>Enable{isEnabled && "d"}</ButtonText>
          <Icon>{isEnabled ? "check" : "arrow_forward_ios"}</Icon>
        </Button>
      </ConfirmationModal>
    </ListItemButton>
  );
}

function NameSection({ children, onChange }) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const { session } = useUser();
  const [loading, setLoading] = useState(false);
  const nameRef = useRef<string>(session.user.profile.name || "");

  const trigger = cloneElement(children, {
    onPress: () => sheetRef.current?.present(),
  });

  return (
    <>
      {trigger}
      <BottomSheet
        onClose={() => sheetRef.current?.close()}
        snapPoints={[220]}
        sheetRef={sheetRef}
      >
        <View style={{ padding: 20 }}>
          <Text
            style={{
              fontSize: 25,
              marginBottom: 10,
              fontFamily: "serifText700",
            }}
          >
            Change your name
          </Text>
          <TextField
            placeholder="Name"
            variant="filled+outlined"
            bottomSheet
            autoFocus={Platform.OS !== "web"}
            style={{ height: 50 }}
            editable={!loading}
            onChangeText={(e) => (nameRef.current = e)}
            defaultValue={nameRef.current}
            autoComplete="name"
          />
          <Button
            isLoading={loading}
            text="Save"
            large
            bold
            containerStyle={{ marginTop: 10 }}
            variant="filled"
            onPress={async () => {
              setLoading(true);
              await onChange("name", nameRef.current);
              setLoading(false);
              sheetRef.current?.close();
            }}
          />
        </View>
      </BottomSheet>
    </>
  );
}

function ProfileBanner() {
  const { session, sessionToken, mutate } = useUser();
  const theme = useColorTheme();
  const [loading, setLoading] = useState(false);

  const onChange = async (key, value) => {
    try {
      await sendApiRequest(
        sessionToken,
        "PUT",
        "user/profile",
        {},
        {
          body: JSON.stringify({ [key]: value }),
        }
      );
      mutate(
        (oldData) => ({
          ...oldData,
          user: {
            ...oldData.user,
            profile: { ...oldData.user.profile, [key]: value },
          },
        }),
        { revalidate: false }
      );
      Toast.show({ type: "success", text1: "Saved!" });
    } catch (e) {
      Toast.show({ type: "error" });
    }
  };

  return (
    <View>
      <ListItemButton>
        <ListItemText primary="Profile picture" />
        <View style={{ width: 60, height: 60, marginLeft: "auto" }}>
          <ProfilePicture
            name={session?.user?.profile?.name || "--"}
            image={session?.user?.profile?.picture}
            size={60}
          />
          <View
            style={{
              backgroundColor: addHslAlpha(theme[12], 0.5),
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              borderRadius: 99,
              alignItems: "center",
              justifyContent: "center",
              bottom: 0,
            }}
          >
            {loading ? (
              <Spinner color={theme[1]} />
            ) : (
              <IconButton
                onPress={() =>
                  pickImageAsync(setLoading, (e) => onChange("picture", e))
                }
                icon="upload"
                iconStyle={{ color: theme[1] }}
                iconProps={{ bold: true }}
              />
            )}
          </View>
        </View>
      </ListItemButton>
      <NameSection onChange={onChange}>
        <ListItemButton>
          <ListItemText primary="Name" secondary={session.user.profile.name} />
          <Icon>arrow_forward_ios</Icon>
        </ListItemButton>
      </NameSection>
      <EmailSection>
        <ListItemButton>
          <ListItemText primary="Email" secondary={session.user.email} />
          <Icon>arrow_forward_ios</Icon>
        </ListItemButton>
      </EmailSection>
      <ListItemButton disabled>
        <ListItemText
          primary="Birthday"
          secondary={dayjs(session.user.profile.birthday).format("MMMM Do")}
        />
      </ListItemButton>
    </View>
  );
}

function PasskeysSection() {
  const handlePress = () => router.push("/settings/account/passkeys");

  return (
    <ListItemButton onPress={handlePress}>
      <ListItemText
        primary="Passkeys"
        secondary="Lazy to remember your password? Use your device lock screen to login"
      />
      <Icon>arrow_forward_ios</Icon>
    </ListItemButton>
  );
}

function DeleteAccountSection() {
  return (
    <ListItemButton
      onPress={() => router.push("/settings/account/delete-account")}
    >
      <ListItemText
        primary="Delete my account"
        secondary="View options to have your data permanently deleted"
      />
      <Icon>arrow_forward_ios</Icon>
    </ListItemButton>
  );
}

function BetaTesterSection() {
  const { session, sessionToken, mutate } = useUser();
  const isBetaTester = session?.user?.betaTester;

  const handleSave = () => {
    sendApiRequest(
      sessionToken,
      "PUT",
      "user/account",
      {},
      {
        body: JSON.stringify({
          betaTester: !isBetaTester,
        }),
      }
    );
    mutate(
      (d) => ({
        ...d,
        user: {
          ...d.user,
          betaTester: !isBetaTester,
        },
      }),
      { revalidate: false }
    );
  };

  return (
    <ListItemButton onPress={handleSave}>
      <ListItemText
        primary="Beta features"
        secondary={
          isBetaTester
            ? "So you like living on the edge, huh?"
            : "Try out unstable features before they're released to the public"
        }
      />
      <Icon size={40}>{isBetaTester ? "toggle_on" : "toggle_off"}</Icon>
    </ListItemButton>
  );
}

function ResetHintsButton() {
  const { sessionToken, mutate } = useUser();

  const handleSave = () => {
    try {
      sendApiRequest(
        sessionToken,
        "PUT",
        "user/account",
        {},
        {
          body: JSON.stringify({
            hintsViewed: [],
          }),
        }
      );
      Toast.show({ type: "success", text1: "Hints reset!" });
      mutate(
        (d) => ({
          ...d,
          user: {
            ...d.user,
            hintsViewed: [],
          },
        }),
        { revalidate: false }
      );
    } catch (e) {
      Toast.show({ type: "error" });
    }
  };

  return (
    <ListItemButton onPress={handleSave}>
      <ListItemText
        primary="Reset hints"
        secondary="already forgot how to use dysperse? wow..."
      />
      <Icon>arrow_forward_ios</Icon>
    </ListItemButton>
  );
}

export default function Page() {
  const { session } = useUser();
  const { data, error } = useSWR(
    session?.space ? ["space", { spaceId: session?.space?.space?.id }] : null
  );

  return (
    <SettingsScrollView>
      <Text style={[settingStyles.title]}>Account</Text>
      {data ? (
        <>
          <Text style={settingStyles.heading} weight={700}>
            Profile
          </Text>
          <Section>
            <ProfileBanner />
          </Section>
          <Text style={settingStyles.heading} weight={700}>
            Security
          </Text>
          <Section>
            <PasskeysSection />
            <TwoFactorAuthSection />
          </Section>
          <Text style={settingStyles.heading} weight={700}>
            Other
          </Text>
          <Section>
            <BetaTesterSection />
            <ResetHintsButton />
            <DeleteAccountSection />
          </Section>
        </>
      ) : error ? (
        <ErrorAlert />
      ) : (
        <Text>Loading...</Text>
      )}
    </SettingsScrollView>
  );
}

