import { pickImageAsync } from "@/app/(app)/settings/account/profile";
import {
  useDebouncedValue,
  useSignupContext,
  validateEmail,
} from "@/app/auth/sign-up";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { ProfilePicture } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import MenuPopover from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { Controller } from "react-hook-form";
import { KeyboardAvoidingView, Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MonthPicker = ({ onChange, trigger }) => {
  const ref = useRef(null);
  return (
    <MenuPopover
      trigger={trigger}
      menuRef={ref}
      scrollViewStyle={{ height: 240 }}
      options={months.map((month) => ({
        text: month,
        callback: () => {
          ref.current.close();
          onChange(months.indexOf(month) + 1);
        },
      }))}
    />
  );
};

export const Profile = ({ form }) => {
  const theme = useColorTheme();
  const { watch, control } = form;
  const name = watch("name");
  const email = watch("email");
  const { handleNext } = useSignupContext();
  const insets = useSafeAreaInsets();
  const breakpoints = useResponsiveBreakpoints();

  const isGoogle = watch("isGoogle");

  const [loading, setLoading] = useState(false);
  const [profileExists, setProfileExists] = useState<
    "empty" | "loading" | "error" | "available" | "taken"
  >(isGoogle ? "available" : "empty");

  const debouncedEmail = useDebouncedValue(email, 500);

  useEffect(() => {
    try {
      if (!validateEmail(debouncedEmail)) return setProfileExists("empty");
      setProfileExists("loading");
      sendApiRequest("", "GET", "user/profile", {
        email: debouncedEmail,
        basic: true,
      }).then((data) => {
        setProfileExists(data.error ? "available" : "taken");
      });
    } catch (e) {
      setProfileExists("error");
    }
  }, [debouncedEmail]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView
        style={{
          flex: 1,
        }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.top + insets.bottom + 20,
        }}
      >
        <Text
          style={{
            fontSize: 40,
            marginBottom: 5,
            color: theme[11],
            fontFamily: "serifText800",
          }}
          weight={900}
        >
          Create a profile
        </Text>
        <Text
          style={{
            color: theme[11],
            opacity: 0.7,
            fontSize: 20,
            marginBottom: 20,
          }}
          weight={300}
        >
          Others will see this when you interact with them.
        </Text>
        <View
          style={{
            gap: 20,
            marginTop: 20,
            flexDirection: breakpoints.md ? "row" : "column",
          }}
        >
          <View>
            <Text variant="eyebrow" style={{ marginBottom: 5 }}>
              Picture
            </Text>
            <Controller
              control={control}
              name="picture"
              render={({ field: { value, onChange } }) => (
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: theme[5],
                    backgroundColor: theme[2],
                    padding: 10,
                    borderRadius: 20,
                    width: 130,
                  }}
                >
                  <ProfilePicture
                    size={100}
                    style={{ marginBottom: 10 }}
                    name={name || ""}
                    image={value}
                  />
                  <Button
                    variant="filled"
                    onPress={() => pickImageAsync(setLoading, onChange)}
                    isLoading={loading}
                  >
                    <Icon>upload</Icon>
                    <ButtonText>Upload</ButtonText>
                  </Button>
                </View>
              )}
            />
          </View>
          <View style={{ flex: 1 }}>
            {!isGoogle && (
              <Text variant="eyebrow" style={{ marginBottom: 5 }}>
                Email
              </Text>
            )}
            {!isGoogle && (
              <Controller
                control={control}
                rules={{
                  required: true,
                  validate: (v) => validateEmail(v),
                }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextField
                    onBlur={onBlur}
                    onChangeText={(n) => {
                      if (validateEmail(debouncedEmail))
                        setProfileExists("loading");
                      onChange(n);
                    }}
                    value={value || ""}
                    variant="filled+outlined"
                    style={{ flex: 1 }}
                    placeholder="hello@dysperse.com"
                  />
                )}
                name="email"
              />
            )}
            {email !== "" && profileExists !== "empty" && !isGoogle && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  padding: 10,
                  backgroundColor: theme[5],
                  borderRadius: 99,
                  justifyContent: "center",
                  marginTop: 5,
                }}
              >
                {profileExists === "loading" && (
                  <Spinner color={theme[11]} size={15} />
                )}
                <Text style={{ color: theme[11] }}>
                  {
                    {
                      empty: "",
                      loading: "Checking if this email is available…",
                      error: "An error occurred while checking this email.",
                      available: "This email is available.",
                      taken: "This email is already taken.",
                    }[profileExists]
                  }
                </Text>
              </View>
            )}
            <Text
              variant="eyebrow"
              style={{ marginBottom: 5, marginTop: isGoogle ? 0 : 20 }}
            >
              Birthday
            </Text>
            <Controller
              control={control}
              rules={{
                required: true,
                validate: (v) => dayjs(v.join("-"), "YYYY-M-D", true).isValid(),
              }}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <View
                  style={{
                    flexDirection: "row",
                    gap: 10,
                  }}
                >
                  <MonthPicker
                    onChange={(t) => {
                      const v = value;
                      v[1] = t;
                      onChange(v);
                    }}
                    trigger={
                      <Pressable
                        style={{
                          width: 120,
                          flex: 1,
                        }}
                      >
                        <TextField
                          editable={false}
                          value={months[value[1] - 1]}
                          variant="filled+outlined"
                          placeholder="MMMM"
                          style={[
                            { width: "100%", pointerEvents: "none" },
                            error && { borderColor: "red" },
                          ]}
                        />
                      </Pressable>
                    }
                  />
                  <View style={{ flex: 1 }}>
                    <TextField
                      value={value[2]}
                      variant="filled+outlined"
                      placeholder="Date"
                      style={[
                        { width: "100%" },
                        error && { borderColor: "red" },
                      ]}
                      onChangeText={(t) => {
                        const v = value;
                        v[2] = t;
                        onChange(v);
                      }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextField
                      value={value[0]}
                      variant="filled+outlined"
                      placeholder="Year"
                      style={[
                        { width: "100%" },
                        error && { borderColor: "red" },
                      ]}
                      onChangeText={(t) => {
                        const v = value;
                        v[0] = t;
                        onChange(v);
                      }}
                    />
                  </View>
                </View>
              )}
              name="birthday"
            />
            <Text variant="eyebrow" style={{ marginBottom: 5, marginTop: 20 }}>
              Bio
            </Text>
            <Controller
              control={control}
              name="bio"
              render={({ field }) => (
                <TextField
                  multiline
                  onChangeText={field.onChange}
                  value={field.value}
                  variant="filled+outlined"
                  style={{
                    marginBottom: 10,
                    height: 120,
                    textAlignVertical: "top",
                  }}
                  placeholder="Tell the world about yourself <3"
                />
              )}
            />

            <View>
              <Controller
                control={control}
                name="allowMarketingEmails"
                render={({ field: { value, onChange } }) => (
                  <ListItemButton
                    variant="outlined"
                    onPress={() => onChange(!value)}
                  >
                    <ListItemText
                      primary="Stay updated with our latest news and updates"
                      secondary="We'll only send updates once a month!"
                    />

                    <Icon
                      size={30}
                      style={{
                        opacity: value ? 1 : 0.5,
                      }}
                    >
                      toggle_{value ? "on" : "off"}
                    </Icon>
                  </ListItemButton>
                )}
              />
            </View>
          </View>
        </View>
        <Button
          onPress={handleNext}
          variant="filled"
          height={60}
          containerStyle={{ marginTop: 15 }}
          style={[profileExists !== "available" && { opacity: 0.6 }]}
          disabled={profileExists !== "available"}
        >
          <ButtonText weight={900} style={{ fontSize: 20 }}>
            Next
          </ButtonText>
          <Icon>arrow_forward</Icon>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

