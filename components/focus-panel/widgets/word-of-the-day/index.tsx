import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import DropdownMenu from "@/ui/DropdownMenu";
import ErrorAlert from "@/ui/Error";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { Linking, View } from "react-native";
import useSWR from "swr";

export default function WordOfTheDay({ small, handlePin, widget }) {
  const { data, error } = useSWR(["user/focus-panel/word-of-the-day"]);
  const theme = useColorTheme();

  return small ? (
    !data ? (
      <Spinner />
    ) : (
      <View style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
        <View>
          <Text weight={700} style={{ color: theme[11] }}>
            {data.word}
          </Text>
          <Text
            style={{
              fontSize: 11,
              opacity: 0.6,
              marginTop: -3,
              color: theme[11],
            }}
          >
            {data.pronunciation}
          </Text>
        </View>
        <Text style={{ color: theme[11], marginLeft: "auto" }}>
          {data.partOfSpeech.replace("plural", "").trim()}
        </Text>
      </View>
    )
  ) : (
    <View>
      <DropdownMenu
        containerStyle={{ marginLeft: 20, marginTop: -10, width: 250 }}
        options={[
          {
            text: widget.pinned ? "Pinned" : "Pin",
            icon: "push_pin",
            onPress: handlePin,
            selected: widget.pinned,
          },
          data && {
            text: "Open in Merriam-Webster",
            icon: "open_in_new",
            onPress: () => {
              Linking.openURL(data.link);
            },
          },
        ]}
      >
        <Button
          dense
          textProps={{ variant: "eyebrow" }}
          text="Word of the day"
          icon="expand_more"
          iconPosition="end"
          containerStyle={{
            marginBottom: 5,
            marginLeft: -10,
            marginRight: "auto",
          }}
          iconStyle={{ opacity: 0.6 }}
        />
      </DropdownMenu>
      <View
        style={{
          gap: 0,
          backgroundColor: theme[2],
          borderWidth: 1,
          borderColor: theme[5],
          borderRadius: 20,
          padding: 20,
          paddingHorizontal: 20,
          paddingBottom: 5,
          alignItems: "flex-start",
        }}
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
      </View>
    </View>
  );
}

