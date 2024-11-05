import { styles } from "@/components/home/styles";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { hslToHex } from "@/helpers/hslToHex";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { router } from "expo-router";
import { useCallback } from "react";
import { ImageBackground, Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { HOME_PATTERNS } from "../../app/(app)/home";

export function EditWallpaper() {
  const theme = useColorTheme();
  const { session, sessionToken, mutate } = useUser();
  const selectedPattern = session?.user?.profile?.pattern || "none";

  const handlePatternSelect = useCallback(
    async (pattern) => {
      mutate(
        (d) => ({
          ...d,
          user: {
            ...d.user,
            profile: {
              ...d.user.profile,
              pattern,
            },
          },
        }),
        {
          revalidate: false,
        }
      );
      await sendApiRequest(
        sessionToken,
        "PUT",
        "user/profile",
        {},
        {
          body: JSON.stringify({
            pattern,
          }),
        }
      );
    },
    [sessionToken, mutate]
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={{ fontSize: 40, marginVertical: 20 }} weight={800}>
        Customize
      </Text>
      <Text variant="eyebrow">Color</Text>
      <Button
        onPress={() => router.push("/settings/customization/appearance")}
        variant="outlined"
        height={60}
        containerStyle={{
          marginVertical: 10,
          marginBottom: 40,
        }}
        style={{
          paddingHorizontal: 40,
        }}
      >
        <ButtonText style={{ fontSize: 17 }}>Open settings</ButtonText>
      </Button>
      <Text variant="eyebrow">Pattern</Text>
      {
        <View style={styles.patternContainer}>
          <Pressable
            onPress={() => handlePatternSelect("none")}
            style={[
              styles.patternCard,
              {
                backgroundColor: theme[1],
                borderColor: theme[selectedPattern === "none" ? 9 : 5],
              },
            ]}
          >
            <Icon size={30}>do_not_disturb_on</Icon>
          </Pressable>
          {HOME_PATTERNS.map((pattern) => {
            const hslValues = theme[9]
              .replace("hsl", "")
              .replace("(", "")
              .replace(")", "")
              .replaceAll("%", "")
              .split(",")
              .map(Number) as [number, number, number];

            const uri = `${
              process.env.EXPO_PUBLIC_API_URL
            }/pattern?color=%23${hslToHex(...hslValues)}&pattern=${pattern}`;

            return (
              <Pressable
                key={pattern}
                onPress={() => {
                  handlePatternSelect(pattern);
                }}
                style={[
                  styles.patternCard,
                  {
                    backgroundColor: theme[1],
                    borderColor: theme[selectedPattern === pattern ? 9 : 5],
                  },
                ]}
              >
                {selectedPattern === pattern && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon
                      style={{
                        width: 40,
                        marginLeft: -10,
                        fontSize: 40,
                        borderRadius: 999,
                      }}
                    >
                      check
                    </Icon>
                  </View>
                )}
                <ImageBackground
                  source={{
                    uri: uri,
                  }}
                  style={{ flex: 1, alignItems: "center", width: "100%" }}
                  resizeMode="repeat"
                />
              </Pressable>
            );
          })}
        </View>
      }
    </ScrollView>
  );
}
