import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { blueA } from "@/themes";
import { Avatar, ProfilePicture } from "@/ui/Avatar";
import { useColorTheme } from "@/ui/color/theme-provider";
import IconButton from "@/ui/IconButton";
import Logo from "@/ui/logo";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Markdown from "react-native-markdown-display";
import Toast from "react-native-toast-message";

export const Assistant = ({ params }) => {
  const { session, sessionToken } = useUser();
  const theme = useColorTheme();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      message: "",
    },
  });

  const sendMessage = async ({ message }) => {
    try {
      setLoading(true);

      setMessages((m) => [
        ...m,
        {
          role: "user",
          message,
        },
      ]);

      reset();

      const data = await sendApiRequest(sessionToken, "POST", "ai/assistant", {
        input: message,
      });
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          message: data.response,
        },
      ]);
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An error occurred while sending the message",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <Text variant="eyebrow">Assistant</Text>
        {messages.length > 0 && (
          <TouchableOpacity
            style={{
              paddingHorizontal: 10,
            }}
            onPress={() => setMessages([])}
          >
            <Text style={{ opacity: 0.6, color: theme[11] }}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      <View
        style={{
          backgroundColor: theme[2],
          borderWidth: 1,
          borderColor: theme[5],
          marginVertical: 10,
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        <FlatList
          inverted
          centerContent={messages.length === 0}
          contentContainerStyle={{
            padding: 10,
            borderRadius: 10,
            marginTop: 10,
            height: 300,
            gap: 20,
          }}
          data={messages.slice().reverse()}
          renderItem={({ item, index }) => (
            <View
              style={[
                {
                  flexDirection: item.role === "user" ? "row-reverse" : "row",
                  gap: 10,
                  alignItems: item.role === "bot" ? "flex-end" : "flex-start",
                },
                index === messages.length - 1 && { marginBottom: 20 },
              ]}
            >
              <View>
                {item.role === "bot" ? (
                  <Avatar size={30}>
                    <Logo size={25} />
                  </Avatar>
                ) : (
                  <ProfilePicture
                    name={session.user.profile.name}
                    image={session.user.profile.picture}
                    size={30}
                  />
                )}
              </View>
              <View
                style={[
                  {
                    paddingHorizontal: 20,
                    borderRadius: 20,
                    maxWidth: 200,
                    height: "auto",
                  },
                  item.role === "user" && {
                    marginLeft: "auto",
                    backgroundColor: theme[9],
                  },
                  item.role === "bot" && {
                    marginRight: "auto",
                    backgroundColor: theme[4],
                  },
                ]}
              >
                <Markdown
                  style={{
                    body: {
                      fontFamily: "body_400",
                      fontSize: 15,
                      color: theme[12],
                    },
                    link: { color: blueA.blueA9 },
                    code_inline: {
                      backgroundColor: theme[5],
                      color: theme[12],
                      padding: 2,
                      borderWidth: 1,
                      borderColor: theme[7],
                      borderRadius: 5,
                    },
                    code_block: {
                      backgroundColor: theme[5],
                      color: theme[12],
                      padding: 5,
                      borderWidth: 1,
                      borderColor: theme[7],
                      borderRadius: 5,
                    },
                    image: {
                      borderRadius: 20,
                      overflow: "hidden",
                      objectFit: "cover",
                    },
                    blockquote: {
                      borderLeftColor: theme[9],
                      borderLeftWidth: 3,
                      paddingHorizontal: 20,
                      backgroundColor: "transparent",
                      marginVertical: 10,
                    },
                    bullet_list_icon: {
                      width: 5,
                      height: 5,
                      borderRadius: 99,
                      backgroundColor: theme[9],
                      color: "transparent",
                      marginTop: 8,
                    },
                    ordered_list_icon: {
                      color: theme[11],
                    },
                  }}
                >
                  {item.message}
                </Markdown>
              </View>
            </View>
          )}
          ListFooterComponent={() => (
            <View
              style={{
                alignItems: "center",
                gap: 10,
                marginTop: 20,
              }}
            >
              <Avatar
                icon="experiment"
                size={40}
                style={{ borderRadius: 15 }}
              />
              <Text
                style={{
                  textAlign: "center",
                  color: theme[11],
                  opacity: 0.6,
                  fontSize: 12,
                  fontStyle: "italic",
                }}
              >
                Dysperse AI is a work in progress, and it might say things which
                don't represent our values.
              </Text>
            </View>
          )}
          ListHeaderComponent={
            loading && (
              <View
                style={{ alignItems: "center", gap: 10, flexDirection: "row" }}
              >
                <Avatar size={30}>
                  <Logo size={25} />
                </Avatar>
                <Spinner />
              </View>
            )
          }
          keyExtractor={(item, i) => i.toString()}
        />
        <Controller
          name="message"
          control={control}
          render={({ field: { onChange, value } }) => (
            <View
              style={{
                borderWidth: 1,
                borderColor: theme[4],
                flexDirection: "row",
                backgroundColor: theme[3],
              }}
            >
              <TextField
                placeholder="Message"
                value={value}
                onChangeText={onChange}
                style={{
                  flex: 1,
                  paddingHorizontal: 15,
                  height: 45,
                  shadowRadius: 0,
                }}
                blurOnSubmit={false}
                onSubmitEditing={handleSubmit(sendMessage)}
              />
              <IconButton
                icon="send"
                size={45}
                onPress={handleSubmit(sendMessage)}
              />
            </View>
          )}
        />
      </View>
    </View>
  );
};
