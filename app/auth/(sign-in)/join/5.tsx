import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import DropdownMenu from "@/ui/DropdownMenu";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useDidUpdate } from "@/utils/useDidUpdate";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Linking, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSignupContext } from "../_layout";

export const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const useDebouncedValue = (inputValue, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(inputValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, delay]);

  return debouncedValue;
};

function Content() {
  const theme = useColorTheme();
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const params = useLocalSearchParams();
  const store = useSignupContext();
  const red = useColor("red");
  const breakpoints = useResponsiveBreakpoints();

  const [email, setEmail] = useState(store.email || "");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [birthday, setBirthday] = useState(null);

  const [allowMarketingEmails, setAllowMarketingEmails] = useState(
    store.allowMarketingEmails
  );

  const [profileExists, setProfileExists] = useState<
    "empty" | "loading" | "error" | "available" | "taken"
  >(store.email ? "available" : "empty");

  useDidUpdate(() => {
    store.password = password;
    store.confirmPassword = passwordConfirm;
    store.allowMarketingEmails = allowMarketingEmails;
    store.birthday = birthday;
  }, [store, password, passwordConfirm, allowMarketingEmails, birthday]);

  useEffect(() => {
    if (store.appleAuthFillPassword && password === "") {
      const randomSecurePassword = generateRandomString(50);
      setPassword(randomSecurePassword);
      setPasswordConfirm(randomSecurePassword);
    }
  }, [store.appleAuthFillPassword, password]);

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

  const enabled =
    email.trim() &&
    validateEmail(email) &&
    password.trim() &&
    password === passwordConfirm &&
    password.length >= 8 &&
    dayjs(birthday).isValid();

  return (
    <View
      style={{
        padding: 20,
        paddingTop: 115,
        paddingHorizontal: 30,
        flex: 1,
        justifyContent: "center",
      }}
    >
      <Animated.View entering={FadeIn.delay(300)}>
        <Text variant="eyebrow">5/5</Text>
        <Text
          style={{
            fontFamily: "serifText700",
            fontSize: breakpoints.md ? 40 : 30,
            marginTop: 10,
            color: theme[11],
          }}
        >
          One last thing...
        </Text>
      </Animated.View>
      <Animated.View entering={FadeIn.delay(600)}>
        <Text
          style={{
            opacity: 0.4,
            fontSize: breakpoints.md ? 25 : 20,
            marginTop: 5,
            marginBottom: 15,
            color: theme[11],
          }}
          weight={600}
        >
          Just a little more details to finish up.
        </Text>
      </Animated.View>
      <Animated.View
        entering={FadeIn.delay(900)}
        style={{ gap: 10, marginTop: 10 }}
      >
        {!store.prefilledEmail && <Text variant="eyebrow">Email</Text>}
        {!store.prefilledEmail && (
          <TextField
            inputMode="email"
            variant="filled"
            placeholder="barackobama@gmail.com"
            onChangeText={(t) => {
              setEmail(t);
              store.email = t;
            }}
            autoComplete="email"
            defaultValue={store.email}
          />
        )}
        {email !== "" &&
          profileExists !== "empty" &&
          !(store.prefilledEmail && profileExists === "available") && (
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
        <ListItemButton
          onPress={() => setAllowMarketingEmails(!allowMarketingEmails)}
          variant="filled"
        >
          <ListItemText
            primary="I want to receive annoying newsletters"
            secondary="We promise they're once a month and actually useful"
          />
          <Icon size={40}>toggle_{allowMarketingEmails ? "on" : "off"}</Icon>
        </ListItemButton>
        {!store.appleAuthFillPassword && (
          <View
            style={{
              marginTop: 30,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text variant="eyebrow">Password</Text>
            <Text style={{ color: red[9] }}>
              {password.length < 8
                ? ` — ${8 - password.length} more characters`
                : ""}
            </Text>
          </View>
        )}
        {!store.appleAuthFillPassword && (
          <TextField
            secureTextEntry
            variant="filled"
            placeholder="Pick something strong"
            onChangeText={setPassword}
            autoComplete="new-password"
            defaultValue={store.password}
          />
        )}
        {!store.appleAuthFillPassword && (
          <TextField
            secureTextEntry
            variant="filled"
            placeholder="Retype what you just entered above"
            onChangeText={setPasswordConfirm}
            autoComplete="new-password"
            defaultValue={store.confirmPassword}
          />
        )}
      </Animated.View>
      <Animated.View
        entering={FadeIn.delay(1200)}
        style={{
          marginTop: 30,
          marginBottom: 10,
          flexDirection: "row",
          gap: 10,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text variant="eyebrow">Birthday</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <DropdownMenu
            options={Array.from({ length: 12 }, (_, i) => ({
              text:
                dayjs().month(i).format("MMMM").charAt(0).toUpperCase() +
                dayjs().month(i).format("MMMM").slice(1),
              value: i,
              selected: birthday && dayjs(birthday).month() === i,
              onPress: () => {
                const current = birthday ? dayjs(birthday) : dayjs();
                setBirthday(current.month(i).toDate());
              },
            }))}
            scrollable
            horizontalPlacement="center"
            containerStyle={{ height: 250 }}
          >
            <Button
              variant="filled"
              text={birthday ? dayjs(birthday).format("MMMM") : "Month"}
            />
          </DropdownMenu>
          <DropdownMenu
            options={(() => {
              const month = birthday ? dayjs(birthday).month() : 0;
              const daysInMonth = dayjs().month(month).daysInMonth();
              return Array.from({ length: daysInMonth }, (_, i) => ({
                text: (i + 1).toString(),
                value: i + 1,
                selected: birthday && dayjs(birthday).date() === i + 1,
                onPress: () => {
                  const current = birthday ? dayjs(birthday) : dayjs();
                  setBirthday(current.date(i + 1).toDate());
                },
              }));
            })()}
            scrollable
            horizontalPlacement="right"
            containerStyle={{ maxHeight: 250 }}
          >
            <Button
              variant="filled"
              text={birthday ? dayjs(birthday).format("D") : "Day"}
            />
          </DropdownMenu>
        </View>
      </Animated.View>
      <Animated.View
        entering={FadeIn.delay(1400)}
        style={{ marginTop: 20, flexDirection: "row", gap: 10 }}
      >
        <Button
          height={65}
          variant="filled"
          text="Finish"
          containerStyle={[!enabled && { opacity: 0.6 }, { flex: 1 }]}
          icon="check"
          iconPosition="end"
          bold
          disabled={!enabled}
          onPress={() => {
            router.push({
              pathname: "/auth/join/6",
              params: { ...params },
            });
          }}
        />
      </Animated.View>
      <Animated.View entering={FadeIn.delay(1600)}>
        <Text
          style={{
            textAlign: "center",
            opacity: 0.7,
            marginTop: 20,
            width: "100%",
            marginHorizontal: "auto",
            maxWidth: 300,
          }}
        >
          By creating an account, you're 13+ and also agree with our{" "}
          <Text
            style={{ color: "#007AFF", textDecorationLine: "underline" }}
            onPress={() => {
              Linking.openURL("https://blog.dysperse.com/terms-of-service");
              setHasReadTerms(true);
            }}
          >
            terms
          </Text>{" "}
          and{" "}
          <Text
            style={{
              color: "#007AFF",
              textDecorationLine: "underline",
            }}
            onPress={() => {
              Linking.openURL("https://blog.dysperse.com/privacy-policy");
              setHasReadTerms(true);
            }}
          >
            privacy policy
          </Text>{" "}
          which nobody ever really reads.{" "}
          {hasReadTerms
            ? "\n\n Wow, you actually read them? You're a legend."
            : ""}
        </Text>
      </Animated.View>
    </View>
  );
}

export default function Page() {
  return (
    <KeyboardAwareScrollView>
      <Content />
    </KeyboardAwareScrollView>
  );
}

