import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Button, ButtonText } from "@/ui/Button";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { Pressable, View } from "react-native";
import useSWR from "swr";
import { useFocusPanelContext } from "../../context";
import { widgetMenuStyles } from "../../widgetMenuStyles";

export default function WordOfTheDay({ navigation, menuActions, params }) {
  const theme = useColorTheme();
  const { panelState, setPanelState, collapseOnBack } = useFocusPanelContext();
  const { data, error } = useSWR(["user/focus-panel/word-of-the-day"]);

  return panelState === "COLLAPSED" ? (
    <IconButton
      size={85}
      icon="book"
      onPress={() => {
        navigation.navigate("Word of the day");
        setPanelState("OPEN");
        if (panelState === "COLLAPSED") collapseOnBack.current = true;
      }}
      variant="filled"
      style={{ borderRadius: 20 }}
    />
  ) : (
    <View>
      <MenuPopover
        options={menuActions}
        trigger={
          <Button style={widgetMenuStyles.button} dense>
            <ButtonText weight={800} style={widgetMenuStyles.text}>
              Word of the day
            </ButtonText>
            <Icon style={{ color: theme[11] }}>expand_more</Icon>
          </Button>
        }
      />
      <Pressable
        style={({ pressed, hovered }) => ({
          padding: 20,
          backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
          borderRadius: 20,
          paddingBottom: data ? 10 : undefined,
          alignItems: data ? undefined : "center",
        })}
        onPress={() => navigation.navigate("Word of the day")}
      >
        {data ? (
          <>
            <Text
              style={{ fontFamily: "serifText800", fontSize: 30 }}
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
          </>
        ) : error ? (
          <ErrorAlert />
        ) : (
          <Spinner />
        )}
      </Pressable>
    </View>
  );
}

