import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import { DatePicker } from "@/ui/DatePicker";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useDidUpdate } from "@/utils/useDidUpdate";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Keyboard, Linking, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSignupContext } from "../_layout";

export const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

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
  const breakpoints = useResponsiveBreakpoints();

  const [email, setEmail] = useState("");
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
  }, [store, email, password, passwordConfirm, allowMarketingEmails, birthday]);

  const debouncedEmail = useDebouncedValue(email, 500);

  const pickerRef = useRef(null);

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
        {!store.email && <Text variant="eyebrow">Email</Text>}
        {!store.email && (
          <TextField
            inputMode="email"
            variant="filled"
            placeholder="barackobama@gmail.com"
            onChangeText={(t) => {
              setEmail(t);
              store.email = t;
            }}
            autoComplete="email"
          />
        )}
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
        <Text variant="eyebrow" style={{ marginTop: 30 }}>
          Password
          {password.length < 8
            ? ` — ${8 - password.length} more characters`
            : ""}
        </Text>
        <TextField
          secureTextEntry
          variant="filled"
          placeholder="Pick something strong"
          onChangeText={setPassword}
          autoComplete="new-password"
        />
        <TextField
          secureTextEntry
          variant="filled"
          placeholder="Retype what you just entered above"
          onChangeText={setPasswordConfirm}
          autoComplete="new-password"
        />
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
        <DatePicker
          value={{
            date: birthday,
            dateOnly: true,
          }}
          setValue={(v) => setBirthday(v.date ? dayjs(v.date) : null)}
          ref={pickerRef}
          ignoreYear
          ignoreTime
        />
        <Button
          variant="filled"
          text={birthday ? dayjs(birthday).format("MMMM Do") : "Pick a date"}
          icon="calendar_today"
          onPress={() => pickerRef.current.present()}
        />
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
    <ScrollView onScrollBeginDrag={Keyboard.dismiss}>
      <Content />
    </ScrollView>
  );
}

