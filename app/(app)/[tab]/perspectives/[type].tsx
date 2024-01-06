import { ContentWrapper } from "@/components/layout/content";
import { Avatar } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: 100,
    alignItems: "center",
    gap: 10,
  },
  headerText: {
    fontSize: 50,
    textAlign: "center",
  },
});

export default function Page() {
  const theme = useColorTheme();

  return (
    <ContentWrapper noPaddingTop>
      <ScrollView>
        <LinearGradient
          style={styles.headerContainer}
          colors={[theme[4], theme[1]]}
        >
          <Avatar
            size={70}
            style={{ borderRadius: 25 }}
            icon="check"
            iconProps={{ size: 40 }}
          />
          <Text style={styles.headerText} heading>
            Tasks
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
              gap: 20,
            }}
          >
            <TextField
              style={{
                flex: 1,
                height: 60,
                borderWidth: 1,
                borderColor: theme[5],
                paddingHorizontal: 25,
                borderRadius: 99,
              }}
              placeholder="Search..."
            />
            <Button variant="outlined" style={{ height: 60 }}>
              <Icon>filter_list</Icon>
              <ButtonText>Filter</ButtonText>
            </Button>
          </View>
        </LinearGradient>
        <Text>Todo: Stream</Text>
      </ScrollView>
    </ContentWrapper>
  );
}
