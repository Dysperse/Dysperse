import { ContentWrapper } from "@/components/layout/content";
import { settingsStyles } from "@/components/settings/styles";
import themes from "@/components/themes.json";
import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import { Menu } from "@/ui/Menu";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { cloneElement, memo, useCallback, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 20,
  },
  button: { height: 80 },
  themeCardIcon: { textAlign: "center", marginBottom: 10 },
  cardTitle: { fontSize: 25 },
  cardDescription: { textAlign: "center", opacity: 0.7, maxWidth: 200 },
});
const themePickerStyles = StyleSheet.create({
  title: { textAlign: "center", fontSize: 50 },
  description: { height: 70, opacity: 0.6, textAlign: "center" },
  container: { alignItems: "center", height: "100%" },
  icon: { marginTop: "auto" },
  button: { height: 80, width: "100%" },
  hexagonList: { marginTop: "auto" },
  buttonText: { fontSize: 20 },
  hexagonButton: {
    alignItems: "center",
    paddingHorizontal: 10,
    justifyContent: "center",
  },
});

const HexagonButton = memo(function HexagonButton({
  theme,
  selected,
  setSelectedTheme,
}: {
  theme: string;
  selected: boolean;
  setSelectedTheme: (s) => void;
}) {
  const colors = useColor(theme as any, useColorScheme() === "dark");
  const handlePress = () => {
    setSelectedTheme(theme);
  };
  const { width } = useWindowDimensions();

  return (
    <Pressable
      onPress={handlePress}
      style={[themePickerStyles.hexagonButton, { width: width - 150 }]}
    >
      <Icon style={{ color: colors[11] }} size={width - 150} filled={selected}>
        hexagon
      </Icon>
    </Pressable>
  );
});

function ThemePicker({ children }) {
  const ref = useRef<BottomSheetModal>(null);
  const [selectedTheme, setSelectedTheme] = useState("violet");
  const colors = useColor(selectedTheme as any, useColorScheme() === "dark");

  const theme = {
    ...themes[selectedTheme],
    colors,
  };

  const { session } = useSession();
  const handleOpen = useCallback(() => ref.current?.present(), []);
  const trigger = cloneElement(children, { onPress: handleOpen });
  const handleClose = useCallback(() => ref.current?.close(), []);

  const [loading, setLoading] = useState(false);

  const handleSelect = async () => {
    try {
      setLoading(true);
      await sendApiRequest(
        session,
        "PUT",
        "user/profile",
        {},
        {
          body: JSON.stringify({
            color: selectedTheme,
          }),
        }
      );
      handleClose();
      setLoading(false);
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Something went wrong. Please try again later",
      });
      setLoading(false);
    }
  };
  const { height, width } = useWindowDimensions();

  return (
    <>
      {trigger}
      <BottomSheet
        sheetRef={ref}
        snapPoints={[height - 20]}
        onClose={handleClose}
        backgroundStyle={{
          backgroundColor: theme.colors[4],
        }}
        handleIndicatorStyle={{
          backgroundColor: theme.colors[8],
        }}
      >
        <View style={themePickerStyles.container}>
          <Text variant="eyebrow" style={{ color: theme.colors[11] }}>
            #{theme.key.toString().padStart(2, "0")}
          </Text>
          <FlatList
            showsHorizontalScrollIndicator={false}
            snapToAlignment={"center"}
            snapToInterval={width - 150}
            viewabilityConfig={{ itemVisiblePercentThreshold: 90 }}
            decelerationRate={0}
            pagingEnabled
            style={themePickerStyles.hexagonList}
            horizontal
            data={Object.keys(themes)}
            renderItem={({ item }) => (
              <HexagonButton
                setSelectedTheme={setSelectedTheme}
                theme={item}
                key={item}
                selected={selectedTheme === item}
              />
            )}
          />
          <View
            style={{
              padding: 20,
              gap: 20,
              width: "100%",
              alignItems: "center",
            }}
          >
            <Text heading style={themePickerStyles.title}>
              {theme.name}
            </Text>
            <Text style={themePickerStyles.description}>
              {theme.description}
            </Text>
            <Button
              style={[
                themePickerStyles.button,
                { backgroundColor: theme.colors[3] },
              ]}
              variant="filled"
              onPress={handleSelect}
              isLoading={loading}
            >
              <ButtonText
                weight={900}
                style={[
                  themePickerStyles.buttonText,
                  { color: theme.colors[11] },
                ]}
              >
                Select
              </ButtonText>
            </Button>
          </View>
        </View>
      </BottomSheet>
    </>
  );
}

export default function Page() {
  const theme = useColorTheme();
  const { session } = useUser();
  const themeText = themes[session?.user?.profile?.theme || "violet"];

  return (
    <ContentWrapper>
      <ScrollView contentContainerStyle={settingsStyles.contentContainer}>
        <Text heading style={settingsStyles.heading}>
          Appearance
        </Text>
        <ThemePicker>
          <TouchableOpacity>
            <Pressable style={[styles.card, { borderColor: theme[5] }]}>
              <Text variant="eyebrow">Color</Text>
              <View style={{ alignItems: "center", marginVertical: 10 }}>
                <Icon style={styles.themeCardIcon} size={150}>
                  hexagon
                </Icon>
                <Text
                  style={[styles.cardTitle, { marginTop: -20 }]}
                  weight={900}
                >
                  {themeText.name}
                </Text>
                <Text style={styles.cardDescription}>
                  {themeText.description}
                </Text>
              </View>
            </Pressable>
          </TouchableOpacity>
        </ThemePicker>
        <Menu
          trigger={
            <TouchableOpacity>
              <View style={[styles.card, { borderColor: theme[5] }]}>
                <Text variant="eyebrow">Theme</Text>
                <Text style={styles.cardTitle} weight={900}>
                  {session?.user?.profile?.darkMode ? "Dark" : "Light"}
                </Text>
              </View>
            </TouchableOpacity>
          }
          height={[320]}
        >
          <View style={{ padding: 10, gap: 10, paddingTop: 0 }}>
            {["dark", "light", "system"].map((button) => (
              <Button
                variant={
                  session.user.profile.darkMode === button
                    ? "filled"
                    : "outlined"
                }
                style={styles.button}
                key={button}
              >
                <ButtonText style={{ fontSize: 20 }} weight={900}>
                  {capitalizeFirstLetter(button)}
                </ButtonText>
              </Button>
            ))}
          </View>
        </Menu>
      </ScrollView>
    </ContentWrapper>
  );
}
