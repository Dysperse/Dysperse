import { settingStyles } from "@/components/settings/settingsStyles";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { omit } from "@/helpers/omit";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar, ProfilePicture } from "@/ui/Avatar";
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
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import Animated, { BounceInLeft } from "react-native-reanimated";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { pickImageAsync } from "./profile";

function Section({ children }: any) {
  const theme = useColorTheme();
  return (
    <View
      style={{
        borderRadius: 20,
        borderWidth: 1,
        padding: 5,
        marginTop: 5,
        borderColor: theme[5],
      }}
    >
      {children}
    </View>
  );
}
function SpaceStorage({ data }: { data: any }) {
  const theme = useColorTheme();

  return (
    <>
      <Section>
        <ListItemButton disabled style={{ backgroundColor: "transparent" }}>
          <ListItemText
            style={{ paddingVertical: 20 }}
            primaryProps={{
              style: { textAlign: "center", fontSize: 25 },
              weight: 900,
            }}
            secondaryProps={{
              style: { textAlign: "center", fontSize: 20, opacity: 0.5 },
            }}
            primary={`${-~(
              (data.storage?.used / data.storage?.limit) *
              100
            )}% used`}
            secondary={`${-~(data.storage?.limit - data.storage?.used)}/${
              data.storage?.limit
            } credits left`}
          />
        </ListItemButton>
        <View
          style={{
            width: "100%",
            height: 5,
            borderRadius: 99,
            backgroundColor: theme[4],
            overflow: "hidden",
          }}
        >
          <Animated.View
            entering={BounceInLeft.duration(700).overshootClamping(0)}
            style={{
              width: `${-~((data.storage?.used / data.storage?.limit) * 100)}%`,
              height: "100%",
              marginLeft: -15,
              backgroundColor: theme[9],
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            {data.storage?.inTrash > 0 && (
              <View
                style={{
                  width: `${-~(
                    (data.storage?.inTrash / data.storage?.limit) *
                    100
                  )}%`,
                  height: "100%",
                  backgroundColor: theme[8],
                  marginLeft: "auto",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 99,
                }}
              />
            )}
          </Animated.View>
        </View>
        <View
          style={{
            marginVertical: 10,
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
          }}
        >
          {[
            { name: "tasks", icon: "task_alt" },
            { name: "integrations", icon: "interests" },
            { name: "labels", icon: "label" },
            { name: "collections", icon: "shapes" },
          ].map(({ name, icon }) => (
            <ListItemButton key={name} disabled style={{ width: "50%" }}>
              <Avatar icon={icon} size={40} />
              <ListItemText
                primary={`${~~parseInt(
                  (
                    (data.storage?.breakdown?.[name] / data.storage?.limit) *
                    100
                  ).toFixed(2)
                )}%`}
                secondary={`${capitalizeFirstLetter(name)}`}
              />
            </ListItemButton>
          ))}
        </View>
      </Section>
    </>
  );
}

function EmailSection() {
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
      <Text style={settingStyles.heading}>Email</Text>
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
                style={{ flex: 1 }}
                editable={!isLoading}
                onSubmitEditing={handleSubmit(onSubmit, () =>
                  Toast.show({ type: "error", text1: "Please enter an email" })
                )}
                variant="filled+outlined"
                {...omit(["ref"], field)}
              />
              <IconButton
                disabled={session.user.email === field.value}
                icon={isLoading ? <Spinner size={24} /> : "check"}
                size={40}
                variant="filled"
                onPress={handleSubmit(onSubmit, () =>
                  Toast.show({ type: "error", text1: "Please enter an email" })
                )}
                style={{ borderWidth: 1, borderColor: theme[5] }}
              />
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
            height={60}
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
  const breakpoints = useResponsiveBreakpoints();
  const { session, sessionToken, mutate } = useUser();
  const isEnabled = session.user.twoFactorSecret;

  return (
    <View
      style={{
        flexDirection: breakpoints.md ? "row" : "column",
        alignItems: "center",
        gap: 20,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={settingStyles.heading}>Two-Factor Authentication</Text>
        <Text style={{ opacity: 0.6 }}>
          Two-factor authentication (2FA) is an extra layer of security for your
          account. You can choose to receive 2FA codes via SMS or an
          authenticator app.
        </Text>
      </View>
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
        <Button
          height={60}
          containerStyle={
            breakpoints.md ? { marginTop: 30 } : { width: "100%" }
          }
          variant="filled"
        >
          <ButtonText>Enable{isEnabled && "d"}</ButtonText>
          <Icon>{isEnabled ? "check" : "arrow_forward_ios"}</Icon>
        </Button>
      </ConfirmationModal>
    </View>
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
        marginTop: 20,
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
      >
        <View style={{ top: 80, position: "absolute", left: 30 }}>
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
      </LinearGradient>
      <View
        style={{
          paddingHorizontal: 30,
          pointerEvents: editing ? undefined : "none",
          position: "relative",
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
            marginTop: -5,
          }}
          onPress={() => setEditing((e) => !e)}
        />
        <View style={{ marginTop: 20 }} />
        {editing && <Text variant="eyebrow">Name</Text>}
        <TextField
          defaultValue={session.user.profile.name}
          weight={900}
          variant={editing ? "filled+outlined" : undefined}
          editable={editing}
          onBlur={(e) => editing && onChange("name", e.nativeEvent.text)}
          style={{ fontSize: 40, color: theme[12] }}
        />
        {editing && (
          <Text variant="eyebrow" style={eyebrowStyles}>
            Username
          </Text>
        )}
        <TextField
          value={
            session.user.username
              ? `@${session.user.username}`
              : session.user.email
          }
          variant={editing ? "filled+outlined" : undefined}
          weight={900}
          editable={editing}
          style={{
            fontSize: 20,
            opacity: 0.6,
            color: theme[12],
          }}
        />
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
              style={{ marginVertical: 5 }}
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
              style={{ marginVertical: 5 }}
              placeholder="What's your birthday?"
            />
          </>
        )}
      </View>
    </View>
  );
}

function PasskeysSection() {
  const breakpoints = useResponsiveBreakpoints();
  const handlePress = () => router.replace("/settings/account/passkeys");

  return (
    <View
      style={{
        flexDirection: breakpoints.md ? "row" : "column",
        alignItems: "center",
        gap: 20,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={settingStyles.heading}>Passkeys</Text>
        <Text style={{ opacity: 0.6 }}>
          Passkeys are a much more faster and secure way to login to your
          account. Log in with Face ID, Touch ID, or a security key.
        </Text>
      </View>
      <Button
        height={60}
        containerStyle={breakpoints.md ? { marginTop: 30 } : { width: "100%" }}
        variant="filled"
        onPress={handlePress}
      >
        <ButtonText>Edit</ButtonText>
        <Icon>arrow_forward_ios</Icon>
      </Button>
    </View>
  );
}

export default function Page() {
  const { session, sessionToken, mutate } = useUser();
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
          <Text style={settingStyles.heading} weight={700}>
            Storage
          </Text>
          <SpaceStorage data={data} />
          <EmailSection />
          <TwoFactorAuthSection />
          <PasskeysSection />
        </>
      ) : error ? (
        <ErrorAlert />
      ) : (
        <Text>Loading...</Text>
      )}
    </SettingsScrollView>
  );
}

