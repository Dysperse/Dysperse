import { GoogleAuth } from "@/app/auth/sign-in";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Controller } from "react-hook-form";
import { KeyboardAvoidingView, View } from "react-native";
import { useSignupContext } from "../../app/auth/sign-up";

export const Intro = ({ form }) => {
  const { handleNext } = useSignupContext();
  const theme = useColorTheme();
  const { control, setValue } = form;

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <Text
        style={[
          {
            marginTop: "auto",
            fontSize: 50,
            width: "100%",
            lineHeight: 50,
            paddingTop: 10,
            marginBottom: 15,
            fontFamily: "serifText800",
            textAlign: "center",
          },
        ]}
      >
        Welcome to #dysperse.
      </Text>
      <Text
        style={{
          opacity: 0.5,
          fontSize: 20,
          marginBottom: 10,
          textAlign: "center",
        }}
      >
        Let's make you feel at home.
      </Text>
      <View
        style={{
          gap: 15,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 10,
          marginBottom: "auto",
          maxWidth: "100%",
          borderRadius: 20,
          width: 300,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            backgroundColor: theme[3],
            alignItems: "center",
            width: "100%",
            borderRadius: 99,
          }}
        >
          <Controller
            rules={{ required: true, validate: (v) => v.trim().length > 0 }}
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                <TextField
                  defaultValue={value}
                  onChangeText={onChange}
                  blurOnSubmit={false}
                  style={{
                    flex: 1,
                    height: "100%",
                    shadowRadius: 0,
                    paddingHorizontal: 20,
                  }}
                  weight={800}
                  onSubmitEditing={handleNext}
                  placeholder="What's your name?"
                />
                <IconButton
                  disabled={!value.trim()}
                  onPress={handleNext}
                  size={55}
                  icon="arrow_forward"
                />
              </>
            )}
            name="name"
          />
        </View>
        <GoogleAuth
          signup
          onSuccess={(res) => {
            setValue("name", res.name);
            setValue("email", res.email);
            setValue("picture", res.picture);
            handleNext();
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

