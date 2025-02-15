import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import ErrorAlert from "@/ui/Error";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { View } from "react-native";
import useSWR from "swr";

export default function WordOfTheDay({ navigation, menuActions, widget }) {
  const { data, error } = useSWR(["user/focus-panel/word-of-the-day"]);
  const theme = useColorTheme();

  return (
    <View>
      <Text variant="eyebrow" style={{ marginBottom: 7 }}>
        Word of the day
      </Text>
      <Button
        variant="outlined"
        height="auto"
        backgroundColors={{
          default: theme[2],
          pressed: theme[4],
          hovered: theme[3],
        }}
        borderColors={{
          default: theme[5],
          pressed: theme[5],
          hovered: theme[5],
        }}
        containerStyle={{ borderRadius: 20 }}
        style={{
          flexDirection: "column",
          gap: 0,
          borderRadius: 20,
          padding: 15,
          paddingHorizontal: 15,
          paddingBottom: 5,
          alignItems: data ? undefined : "center",
        }}
        onPress={() => navigation.navigate("Word of the day")}
      >
        {data ? (
          <>
            <Text
              style={{
                fontFamily: "serifText700",
                fontSize: 30,
                color: theme[11],
              }}
              numberOfLines={1}
            >
              {capitalizeFirstLetter(data.word)}
            </Text>
            <Text
              weight={700}
              style={{ opacity: 0.7, marginTop: 5, color: theme[11] }}
              numberOfLines={1}
            >
              {data.partOfSpeech} &nbsp;&bull; &nbsp;
              <Text style={{ color: theme[11] }}>{data.pronunciation}</Text>
            </Text>
            <MarkdownRenderer color={theme[11]}>
              {data.definition}
            </MarkdownRenderer>
          </>
        ) : error ? (
          <ErrorAlert />
        ) : (
          <Spinner />
        )}
      </Button>
    </View>
  );
}

