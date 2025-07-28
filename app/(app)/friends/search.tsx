import { IndeterminateProgressBar } from "@/components/IndeterminateProgressBar";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Keyboard, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useDebounce } from "use-debounce";

export default function Page() {
  const theme = useColorTheme();
  const { sessionToken } = useUser();
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 500);

  const [data, setData] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const [requestLoading, setRequestLoading] = useState(false);

  const handleSearch = useCallback(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) return setData([]);
    setLoading(true);
    sendApiRequest(sessionToken, "GET", "user/profile", {
      many: "true",
      query: debouncedQuery,
    }).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [debouncedQuery, setData, sessionToken]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  return (
    <View
      style={{
        paddingTop: 80,
        paddingHorizontal: 25,
        flex: 1,
        paddingBottom: 20,
        gap: 10,
      }}
    >
      <Text
        style={{
          fontFamily: "serifText700",
          fontSize: 30,
        }}
      >
        Search
      </Text>
      <TextField
        variant="filled"
        style={{
          height: 60,
          paddingHorizontal: 20,
          textAlign: "center",
          borderRadius: 99,
          fontSize: 18,
          marginTop: -5,
        }}
        weight={800}
        placeholder="Find by email or name..."
        onChangeText={setQuery}
      />

      <KeyboardAvoidingView
        style={{
          backgroundColor: theme[3],
          borderRadius: 30,
          overflow: "hidden",
          flex: 1,
        }}
        behavior="padding"
      >
        {isLoading && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              zIndex: 99,
              height: 5,
            }}
          >
            <IndeterminateProgressBar height={5} />
          </View>
        )}
        <FlatList
          data={data}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <ListItemButton
              onPress={() => {
                Keyboard.dismiss();
                setSelected(item.email === selected ? null : item.email);
              }}
              variant="filled"
            >
              <ListItemText
                primary={item.profile?.name || item.email}
                secondary={item.profile?.name && item.email}
              />
              {selected === item.email && (
                <Icon filled bold>
                  check_circle
                </Icon>
              )}
            </ListItemButton>
          )}
          keyExtractor={(item) => item.email}
        />
      </KeyboardAvoidingView>
      {selected && (
        <Button
          variant="filled"
          isLoading={requestLoading}
          onPress={async () => {
            setRequestLoading(true);
            await sendApiRequest(
              sessionToken,
              "POST",
              "user/friends",
              {},
              {
                body: JSON.stringify({
                  email: selected,
                }),
              }
            );
            if (router.canGoBack()) router.back();
            else router.replace("/friends");
          }}
          text="Add friend"
          large
          bold
          icon="east"
          iconPosition="end"
        />
      )}
    </View>
  );
}
