import ContentWrapper from "@/components/layout/content";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { View } from "react-native";

export default function Page() {
  const theme = useColorTheme();

  return (
    <ContentWrapper>
      <View
        style={{
          flex: 1,
          maxWidth: 500,
          marginHorizontal: "auto",
          width: "100%",
          padding: 20,
          paddingTop: 0,
        }}
      >
        <View
          style={{
            paddingVertical: 35,
            justifyContent: "center",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Avatar icon="upload" size={60} iconProps={{ size: 40 }} />
          <Text
            style={{
              marginTop: 8,
              fontFamily: "serifText800",
              fontSize: 30,
            }}
          >
            Import tasks
          </Text>
          <Text style={{ opacity: 0.6 }}>
            Paste any text here and we'll to convert it into tasks!
          </Text>
        </View>

        <TextField
          variant="filled+outlined"
          multiline
          style={{
            flex: 1,
            fontFamily: "mono",
            paddingHorizontal: 20,
            paddingVertical: 20,
          }}
          placeholder="Paste anything here..."
        />
        <Button
          large
          bold
          text="Continue"
          iconPosition="end"
          icon="east"
          variant="filled"
          containerStyle={{ marginTop: 10 }}
        />
      </View>
    </ContentWrapper>
  );
}
