import { pickImageAsync } from "@/app/(app)/settings/customization/profile";
import {
  useDebouncedValue,
  useSignupContext,
  validateEmail,
} from "@/app/auth/sign-up";
import { sendApiRequest } from "@/helpers/api";
import { ProfilePicture } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import { Menu } from "@/ui/Menu";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { Controller } from "react-hook-form";
import { Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
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

const MonthPicker = ({ value, onChange, trigger }) => {
  const ref = useRef(null);
  const theme = useColorTheme();
  return (
    <Menu trigger={trigger} height={[400]} menuRef={ref}>
      <BottomSheetScrollView>
        {months.map((month) => (
          <Pressable
            key={month}
            onPress={() => {
              ref.current.close();
              setTimeout(() => {
                onChange(months.indexOf(month) + 1);
              }, 1000);
            }}
            style={{
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: theme[5],
            }}
          >
            <Text>{month}</Text>
          </Pressable>
        ))}
      </BottomSheetScrollView>
    </Menu>
  );
};

export const Profile = ({ form }) => {
  const theme = useColorTheme();
  const { watch, control } = form;
  const name = watch("name");
  const email = watch("email");
  const { handleNext } = useSignupContext();

  const [loading, setLoading] = useState(false);
  const [profileExists, setProfileExists] = useState<
    "empty" | "loading" | "error" | "available" | "taken"
  >("empty");

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
    <ScrollView
      style={{
        flex: 1,
      }}
      contentContainerStyle={{
        padding: 20,
      }}
    >
      <Text
        style={{ fontSize: 30, marginBottom: 10, color: theme[11] }}
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
      >
        Productivity profiles are a great way to instantly share collections and
        gather availability.
      </Text>
      <View style={{ gap: 20, marginTop: 20, flexDirection: "row" }}>
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
                  onPress={() => {
                    pickImageAsync(setLoading, onChange);
                  }}
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
          <Text variant="eyebrow" style={{ marginBottom: 5 }}>
            Email
          </Text>
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
                placeholder="hello@dysperse.com"
              />
            )}
            name="email"
          />
          {email !== "" && profileExists !== "empty" && (
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
                    loading: "Checking if this email is available...",
                    error: "An error occurred while checking this email.",
                    available: "This email is available.",
                    taken: "This email is already taken.",
                  }[profileExists]
                }
              </Text>
            </View>
          )}
          <Text variant="eyebrow" style={{ marginBottom: 5, marginTop: 20 }}>
            Birthday
          </Text>
          <Controller
            control={control}
            rules={{
              required: true,
              validate: (v) => dayjs(v.join("-"), "YYYY-M-D", true).isValid(),
            }}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                }}
              >
                <MonthPicker
                  value={value}
                  onChange={(t) => {
                    const v = value;
                    v[1] = t;
                    onChange(v);
                  }}
                  trigger={
                    <Pressable style={{ width: "33.33%" }}>
                      <TextField
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
                <TextField
                  value={value[2]}
                  variant="filled+outlined"
                  placeholder="Date"
                  style={[{ width: "100%" }, error && { borderColor: "red" }]}
                  onChangeText={(t) => {
                    const v = value;
                    v[2] = t;
                    onChange(v);
                  }}
                />
                <TextField
                  value={value[0]}
                  variant="filled+outlined"
                  placeholder="Year"
                  style={[{ width: "100%" }, error && { borderColor: "red" }]}
                  onChangeText={(t) => {
                    const v = value;
                    v[0] = t;
                    onChange(v);
                  }}
                />
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
                style={{ marginBottom: 10 }}
                placeholder="Tell the world about yourself <3"
              />
            )}
          />
        </View>
      </View>
      <Button
        onPress={handleNext}
        variant="filled"
        style={[
          { marginTop: 30, height: 60 },
          profileExists !== "available" && { opacity: 0.6 },
        ]}
        disabled={profileExists !== "available"}
      >
        <ButtonText weight={900} style={{ fontSize: 20 }}>
          Next
        </ButtonText>
      </Button>
    </ScrollView>
  );
};
