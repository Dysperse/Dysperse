import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Button } from "@/ui/Button";
import ErrorAlert from "@/ui/Error";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { useRoute } from "@react-navigation/native";
import { Linking, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";
import { Navbar } from "../../panel";

export function WordOfTheDayScreen() {
  const theme = useColorTheme();
  const { params } = useRoute();
  const { data, error } = useSWR(["user/focus-panel/word-of-the-day"]);

  const cardStyles = {
    backgroundColor: theme[3],
    padding: 20,
    paddingBottom: 10,
    borderRadius: 20,
    marginTop: 10,
  };

  const handleAudio = async () => {
    // const soundObject = new Audio.Sound();
    // try {
    //   await soundObject.loadAsync({ uri: data.audio.url });
    //   await soundObject.playAsync();
    // } catch (error) {
    //   console.log("Error playing audio", error);
    // }

    Linking.openURL(data.audio.url);
  };

  return (
    <>
      <Navbar title="Word of the Day" widgetId={params.id} />
      {data ? (
        <ScrollView
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ padding: 5 }}>
            <Text
              style={{ fontFamily: "serifText800", fontSize: 40 }}
              numberOfLines={1}
            >
              {capitalizeFirstLetter(data.word)}
            </Text>
            <Text
              weight={700}
              style={{ opacity: 0.7, marginTop: 5 }}
              numberOfLines={1}
            >
              {data.partOfSpeech} &nbsp;&bull; &nbsp;
              <Text>{data.pronunciation}</Text>
            </Text>
            <MarkdownRenderer>{data.definition}</MarkdownRenderer>
          </View>
          <Button
            containerStyle={{ marginTop: 10 }}
            height={50}
            variant="filled"
            onPress={() => Linking.openURL(data.link)}
            icon="north_east"
            iconPosition="end"
            text="Open in Merriam-Webster"
          />
          <Button
            containerStyle={{ marginTop: 10 }}
            height={50}
            variant="filled"
            onPress={handleAudio}
            icon="north_east"
            iconPosition="end"
            text="Open as podcast"
          />
          <View style={cardStyles}>
            <Text variant="eyebrow">In a sentence</Text>
            <MarkdownRenderer>{data.exampleSentence}</MarkdownRenderer>
          </View>
          <View style={cardStyles}>
            <Text variant="eyebrow">Examples</Text>
            <MarkdownRenderer>{data.examples}</MarkdownRenderer>
          </View>
          <View style={cardStyles}>
            <Text variant="eyebrow">Did you know!?</Text>
            <MarkdownRenderer>{data.didYouKnow}</MarkdownRenderer>
          </View>
        </ScrollView>
      ) : (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            padding: 20,
          }}
        >
          {error ? <ErrorAlert /> : <Spinner />}
        </View>
      )}
    </>
  );
}
