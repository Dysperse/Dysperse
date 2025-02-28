import Content from "@/components/layout/content";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import Logo from "@/ui/logo";
import Text from "@/ui/Text";
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { MenuButton } from "../home";

function BrowserPreview() {
  const theme = useColorTheme();
  return (
    <View
      style={{
        borderRadius: 20,
        aspectRatio: "16/9",
        padding: 15,
        width: "100%",
        backgroundColor: theme[2],
      }}
    >
      <View style={{ flexDirection: "row", gap: 4 }}>
        {["#ff506c", "#ffbd44", "#00ca4e"].map((c) => (
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 99,
              backgroundColor: c,
            }}
            key={c}
          />
        ))}
      </View>

      <View style={{ flexDirection: "row", marginTop: 20, flex: 1 }}>
        <View style={{ width: 150, marginTop: 4 }}>
          <Logo size={30} />
          <View
            style={{
              height: 30,
              flexDirection: "row",
              gap: 5,
              marginTop: 10,
              marginRight: 15,
            }}
          >
            <View
              style={{ flex: 1, borderRadius: 10, backgroundColor: theme[3] }}
            />
            <View
              style={{ flex: 1, borderRadius: 10, backgroundColor: theme[3] }}
            />
          </View>
          {[...new Array(4)].map((_, t) => (
            <View
              key={t}
              style={{
                height: 40,
                borderRadius: 10,
                marginRight: 15,
                marginTop: t == 3 ? "auto" : 10,
                marginBottom: t == 3 ? 3 : 0,
                backgroundColor: theme[3],
              }}
            />
          ))}
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: theme[3],
            borderRadius: 20,
          }}
        ></View>
      </View>
    </View>
  );
}

export default function Page() {
  const theme = useColorTheme();

  return (
    <Content>
      <MenuButton gradient />
      <ScrollView>
        <LinearGradient
          colors={[theme[2], theme[3], theme[1]]}
          style={{
            height: 300,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontSize: 30,
              fontFamily: "serifText700",
              marginBottom: 10,
              color: theme[11],
            }}
          >
            Hey there, welcome aboard!
          </Text>
          <Text
            style={{ textAlign: "center", color: theme[11], fontSize: 24 }}
            weight={400}
          >
            Here's the gist of how{" "}
            <Text style={{ verticalAlign: "middle" }}>
              <Logo size={34} />
            </Text>{" "}
            works
          </Text>
        </LinearGradient>

        <View
          style={{
            maxWidth: 900,
            marginVertical: 30,
            paddingHorizontal: 20,
            marginHorizontal: "auto",
            width: "100%",
          }}
        >
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
            {[
              {
                icon: "note_stack_add",
                text: "Create tasks by voice, forwarding emails, or typing it out",
              },
              { arrow: true },
              {
                icon: "tag",
                text: "Group similar tasks together by assigning them labels",
              },
              { arrow: true },
              {
                icon: "folder_open",
                text: "Arrange labels into as many collections as you want",
              },
              { arrow: true },
              {
                icon: "visibility",
                text: "View collections through different perspectives",
              },
            ].map((c) =>
              c.arrow ? (
                <Icon bold style={{ alignSelf: "center", opacity: 0.3 }}>
                  east
                </Icon>
              ) : (
                <View
                  key={c.text}
                  style={{
                    flex: 1,
                    backgroundColor: addHslAlpha(theme[3], 0.5),
                    borderRadius: 20,
                    padding: 20,
                  }}
                >
                  <Icon
                    size={40}
                    bold
                    style={{ marginBottom: 10, opacity: 0.8 }}
                  >
                    {c.icon}
                  </Icon>
                  <Text
                    style={{
                      color: theme[11],
                      opacity: 0.8,
                      fontSize: 20,
                    }}
                    weight={500}
                  >
                    {c.text}
                  </Text>
                </View>
              )
            )}
          </View>
          <BrowserPreview />
          <Text
            style={{
              fontSize: 20,
              textAlign: "center",
              marginTop: 30,
              color: theme[11],
              opacity: 0.6,
            }}
            weight={700}
          >
            Imagine your everyday browser, but for productivity
          </Text>
          <Text
            style={{
              fontSize: 17,
              textAlign: "center",
              marginTop: 10,
              color: theme[11],
              opacity: 0.6,
            }}
            weight={500}
          >
            Create tabs for collections that matter the most
          </Text>
        </View>
      </ScrollView>
    </Content>
  );
}
