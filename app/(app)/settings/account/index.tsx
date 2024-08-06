import { settingStyles } from "@/components/settings/settingsStyles";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { omit } from "@/helpers/omit";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar } from "@/ui/Avatar";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import ConfirmationModal from "@/ui/ConfirmationModal";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import MenuPopover from "@/ui/MenuPopover";
import SettingsScrollView from "@/ui/SettingsScrollView";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import Animated, { BounceInLeft } from "react-native-reanimated";
import Toast from "react-native-toast-message";
import useSWR from "swr";

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
            { name: "notes", icon: "sticky_note_2" },
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

function TasksSettings({ updateUserSettings }: any) {
  const { mutate, session } = useUser();

  const theme = useColorTheme();
  const showComingSoon = () =>
    Toast.show({ type: "info", text1: "Coming soon!" });

  return !session?.user ? null : (
    <>
      <Text style={settingStyles.heading} weight={700}>
        Tasks
      </Text>
      <View
        style={{
          gap: 10,
          marginTop: 5,
          padding: 10,
          borderWidth: 1,
          borderColor: theme[5],
          borderRadius: 25,
        }}
      >
        <ListItemButton disabled onPress={() => {}}>
          <ListItemText
            primary="Week start"
            secondary="This setting affects recurring tasks"
          />
          <MenuPopover
            trigger={AccountMenuTrigger({
              text: capitalizeFirstLetter(
                session?.user?.weekStart?.toLowerCase()
              ),
            })}
            options={[{ text: "Sunday" }, { text: "Monday" }].map((e) => ({
              ...e,
              selected: e.text.toUpperCase() === session.user.weekStart,
              callback: () =>
                updateUserSettings("weekStart", e.text.toUpperCase()),
            }))}
          />
        </ListItemButton>
        <ListItemButton disabled onPress={() => {}}>
          <ListItemText
            primary="Time display"
            secondary="Choose how times are displayed in the app"
          />
          <MenuPopover
            trigger={AccountMenuTrigger({ text: "12 hour" })}
            options={[{ text: "12 hour" }, { text: "24 hour" }].map((e) => ({
              ...e,
              selected: session.user.militaryTime
                ? e.text === "24 hour"
                : e.text === "12 hour",
              callback: () =>
                updateUserSettings("militaryTime", !session.user.militaryTime),
            }))}
          />
        </ListItemButton>
        <ListItemButton disabled onPress={() => {}}>
          <ListItemText
            primary="Maps provider"
            secondary="Locations will open in this app"
          />
          <MenuPopover
            trigger={AccountMenuTrigger({ text: "Apple Maps" })}
            options={[
              { text: "Google Maps", value: "GOOGLE" },
              { text: "Apple Maps", value: "APPLE" },
            ].map((e) => ({
              ...e,
              selected: e.value === session.user.mapsProvider,
              callback: () => updateUserSettings("militaryTime", e.value),
            }))}
          />
        </ListItemButton>
        <ListItemButton
          onPress={() =>
            updateUserSettings("vanishMode", !session.user.vanishMode)
          }
        >
          <ListItemText
            primary="Vanish mode"
            secondary="Delete completed tasks after 14 days"
          />
          <Icon
            style={{ opacity: session.user.vanishMode ? 1 : 0.6 }}
            size={40}
          >
            toggle_{session.user.vanishMode ? "on" : "off"}
          </Icon>
        </ListItemButton>
        <ListItemButton onPress={showComingSoon}>
          <ListItemText
            primary="Enable working hours"
            secondary="Set the hours you're available during the day."
          />
          <Icon style={{ opacity: 0.6 }} size={40}>
            toggle_off
          </Icon>
        </ListItemButton>
        <ListItemButton
          onPress={() =>
            updateUserSettings("privateTasks", !session.user.privateTasks)
          }
        >
          <ListItemText
            primary="Private tasks by default"
            secondary="New tasks are private by default"
          />
          <Icon
            size={40}
            style={{
              opacity: session.user.privateTasks ? 1 : 0.6,
            }}
          >
            toggle_{session.user.privateTasks ? "on" : "off"}
          </Icon>
        </ListItemButton>
      </View>
    </>
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
            router.push("/settings/login/account/two-factor-authentication");
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

function GoalsSettings({ updateUserSettings }: { updateUserSettings: any }) {
  const { session } = useUser();
  return (
    <>
      <Text style={settingStyles.heading} weight={700}>
        Goals
      </Text>
      <Section>
        <ListItemButton disabled>
          <ListItemText
            primary="Daily task goal"
            secondary="How many tasks you want to complete daily?"
          />
          <MenuPopover
            trigger={AccountMenuTrigger({
              text: `${session.user.dailyStreakGoal} tasks`,
            })}
            options={[
              { text: "3 tasks" },
              { text: "5 tasks" },
              { text: "10 tasks" },
            ].map((e) => ({
              ...e,
              selected:
                session.user.dailyStreakGoal === parseInt(e.text.split(" ")[0]),
              callback: () =>
                updateUserSettings(
                  "dailyStreakGoal",
                  parseInt(e.text.replace(" tasks", ""))
                ),
            }))}
          />
        </ListItemButton>
        <ListItemButton disabled>
          <ListItemText
            primary="Weekly task goal"
            secondary="How many tasks you want to complete weekly?"
          />
          <MenuPopover
            trigger={AccountMenuTrigger({
              text: `${session.user.weeklyStreakGoal} tasks`,
            })}
            options={[
              { text: "10 tasks" },
              { text: "15 tasks" },
              { text: "20 tasks" },
              { text: "30 tasks" },
              { text: "50 tasks" },
            ].map((e) => ({
              ...e,
              selected:
                session.user.weeklyStreakGoal ===
                parseInt(e.text.split(" ")[0]),
              callback: () =>
                updateUserSettings(
                  "weeklyStreakGoal",
                  parseInt(e.text.replace(" tasks", ""))
                ),
            }))}
          />
        </ListItemButton>
      </Section>
    </>
  );
}

export default function Page() {
  const { session, sessionToken, mutate } = useUser();
  const { data, error } = useSWR(
    session?.space ? ["space", { spaceId: session?.space?.space?.id }] : null
  );

  const updateUserSettings = (key, value) => {
    try {
      mutate(
        (prev) => ({
          ...prev,
          user: { ...prev.user, [key]: value },
        }),
        { revalidate: false }
      );

      sendApiRequest(
        sessionToken,
        "PUT",
        "user/account",
        {},
        {
          body: JSON.stringify({
            [key]: value,
          }),
        }
      );

      Toast.show({ type: "success", text1: "Saved!" });
    } catch (e) {
      console.error(e);
      Toast.show({ type: "error" });
    }
  };

  return (
    <SettingsScrollView>
      <Text style={settingStyles.title}>Account</Text>
      {data ? (
        <>
          <Text style={settingStyles.heading} weight={700}>
            Storage
          </Text>
          <SpaceStorage data={data} />
          <TasksSettings data={data} updateUserSettings={updateUserSettings} />
          <GoalsSettings updateUserSettings={updateUserSettings} />
          <EmailSection />
          <TwoFactorAuthSection />
        </>
      ) : error ? (
        <ErrorAlert />
      ) : (
        <Text>Loading...</Text>
      )}
    </SettingsScrollView>
  );
}
