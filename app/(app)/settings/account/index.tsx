import { settingStyles } from "@/components/settings/settingsStyles";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { omit } from "@/helpers/omit";
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
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";

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

      onChange(res.image.display_url);
    } else {
      alert("You did not select any image.");
    }
  } catch (e) {
    Toast.show({ type: "error" });
  } finally {
    setLoading(false);
  }
};

function EmailSection({ editing }) {
  const theme = useColorTheme();
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

  return (
    <>
      <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
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
          render={({ field }) => (
            <>
              <TextField
                style={{ flex: 1, marginTop: 3, color: theme[12] }}
                editable={!isLoading}
                onSubmitEditing={handleSubmit(onSubmit, () =>
                  Toast.show({ type: "error", text1: "Please enter an email" })
                )}
                variant={editing ? "filled+outlined" : "default"}
                {...omit(["ref"], field)}
              />
              {editing && (
                <Button
                  iconPosition="end"
                  disabled={session.user.email === field.value}
                  icon={isLoading ? <Spinner size={24} /> : "east"}
                  text="Update"
                  variant="outlined"
                  onPress={handleSubmit(onSubmit, () =>
                    Toast.show({
                      type: "error",
                      text1: "Please enter an email",
                    })
                  )}
                />
              )}
            </>
          )}
        />
      </View>

      <BottomSheet onClose={handleClose} snapPoints={[400]} sheetRef={sheetRef}>
        <BottomSheetScrollView contentContainerStyle={{ padding: 30 }}>
          <Text weight={800} style={{ fontSize: 30 }}>
            Verify your email
          </Text>
          <Text style={{ marginVertical: 10, fontSize: 20, opacity: 0.7 }}>
            We sent a verification email to your new email address. Please enter
            the code to confirm your new email.
          </Text>
          <Controller
            name="token"
            control={control}
            rules={{
              required: true,
              minLength: 8,
            }}
            render={({ field }) => (
              <TextField
                placeholder="Verification code"
                variant="filled+outlined"
                {...omit(["ref"], field)}
              />
            )}
          />
          <Button
            height={40}
            containerStyle={{ marginTop: 10 }}
            variant="filled"
            isLoading={isLoading}
            onPress={handleSubmit(onSubmit, () =>
              Toast.show({ type: "error", text1: "Please enter a code" })
            )}
          >
            <ButtonText weight={700} style={{ fontSize: 20 }}>
              Confirm
            </ButtonText>
            <Icon>check</Icon>
          </Button>
        </BottomSheetScrollView>
      </BottomSheet>
    </>
  );
}

function AccountMenuTrigger({ text }: any) {
  return (
    <Button variant="filled">
      <ButtonText>{text}</ButtonText>
      <Icon>expand_more</Icon>
    </Button>
  );
}

function TwoFactorAuthSection() {
  const { session, sessionToken, mutate } = useUser();
  const isEnabled = session.user.twoFactorSecret;

  return (
    <ListItemButton
      disabled
      onPress={() =>
        router.replace("/settings/account/two-factor-authentication")
      }
    >
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
            router.replace("/settings/login/account/two-factor-authentication");
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

function ProfileBanner() {
  const { session, sessionToken, mutate } = useUser();
  const theme = useColorTheme();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = async (key, value) => {
    try {
      sendApiRequest(
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

  const eyebrowStyles = {
    marginTop: editing ? 20 : 10,
    marginBottom: editing ? 2 : 0,
  };

  return (
    <View
      style={{
        borderRadius: 20,
        backgroundColor: theme[3],
        overflow: "hidden",
        marginTop: 10,
        marginBottom: 20,
        paddingBottom: 20,
      }}
    >
      <LinearGradient
        colors={[theme[9], theme[5]]}
        style={{
          padding: 30,
          height: 140,
          marginBottom: 20,
        }}
      />
      <View style={{ top: 80, position: "absolute", left: 30, zIndex: 99 }}>
        <ProfilePicture
          name={session?.user?.profile?.name || "--"}
          image={session?.user?.profile?.picture}
          size={90}
        />
        {editing && (
          <View
            style={{
              backgroundColor: addHslAlpha(theme[12], 0.8),
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
        )}
      </View>
      <View
        style={{
          paddingHorizontal: 30,
        }}
      >
        <IconButton
          size={50}
          icon={editing ? "check" : "edit"}
          variant={editing ? "outlined" : undefined}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            margin: 10,
            zIndex: 99,
            marginTop: -5,
          }}
          onPress={() => setEditing((e) => !e)}
        />
        <View
          style={{
            pointerEvents: editing ? undefined : "none",
          }}
        >
          <View style={{ marginTop: 20 }} />
          {editing && <Text variant="eyebrow">Name</Text>}
          <TextField
            defaultValue={session.user.profile.name}
            weight={700}
            variant={editing ? "filled+outlined" : undefined}
            editable={editing}
            onBlur={(e) => editing && onChange("name", e.nativeEvent.text)}
            style={{
              marginVertical: 5,
              fontSize: 30,
              opacity: 1,
              color: theme[12],
              fontFamily: "serifText800",
            }}
          />
          {editing && (
            <Text variant="eyebrow" style={eyebrowStyles}>
              Username
            </Text>
          )}
          {(editing || session.user.username) && (
            <TextField
              value={session.user.username ? `@${session.user.username}` : ""}
              variant={editing ? "filled+outlined" : undefined}
              editable={editing}
              style={{
                fontSize: 20,
                opacity: 0.6,
                marginBottom: 10,
                color: theme[12],
              }}
            />
          )}
          <Text variant="eyebrow" style={eyebrowStyles}>
            Email
          </Text>
          <EmailSection editing={editing} />
          {(editing || session.user.profile.bio) && (
            <>
              <Text variant="eyebrow" style={eyebrowStyles}>
                About me
              </Text>
              <TextField
                variant={editing ? "filled+outlined" : undefined}
                multiline
                onBlur={(e) => onChange("bio", e.nativeEvent.text)}
                defaultValue={session.user.profile.bio}
                style={{ marginVertical: 5, color: theme[12] }}
                numberOfLines={1}
                placeholder="Tell the world about yourself <3"
              />
            </>
          )}
          {(editing || session.user.profile.birthday) && (
            <>
              <Text variant="eyebrow" style={eyebrowStyles}>
                Birthday
              </Text>
              <TextField
                value={dayjs(session.user.profile.birthday).format("MMMM Do")}
                style={{ marginVertical: 5, color: theme[12] }}
                placeholder="What's your birthday?"
              />
            </>
          )}
        </View>
      </View>
    </View>
  );
}

function PasskeysSection() {
  const handlePress = () => router.replace("/settings/account/passkeys");

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
      onPress={() => router.replace("/settings/account/delete-account")}
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

export default function Page() {
  const { session } = useUser();
  const { data, error } = useSWR(
    session?.space ? ["space", { spaceId: session?.space?.space?.id }] : null
  );

  return (
    <SettingsScrollView>
      <Text style={settingStyles.title}>Account</Text>
      {data ? (
        <>
          <Text style={settingStyles.heading} weight={700}>
            Profile
          </Text>
          <ProfileBanner />
          <PasskeysSection />
          <TwoFactorAuthSection />
          <BetaTesterSection />
          <DeleteAccountSection />
        </>
      ) : error ? (
        <ErrorAlert />
      ) : (
        <Text>Loading...</Text>
      )}
    </SettingsScrollView>
  );
}

