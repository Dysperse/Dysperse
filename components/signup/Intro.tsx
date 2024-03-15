import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Controller } from "react-hook-form";
import { KeyboardAvoidingView, StyleSheet, View } from "react-native";
import { useSignupContext } from "../../app/auth/sign-up";

const introStyles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: "auto",
    maxWidth: "100%",
    borderRadius: 20,
    width: 300,
  },
});
export const Intro = ({ form }) => {
  const { handleNext } = useSignupContext();
  const theme = useColorTheme();
  const { control } = form;

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
      <Icon size={60} style={{ marginBottom: 10, marginTop: "auto" }}>
        waving_hand
      </Icon>
      <Text
        style={{ fontSize: 30, color: theme[11], textAlign: "center" }}
        weight={900}
      >
        Welcome&nbsp;to #dysperse.
      </Text>
      <Text
        style={{
          color: theme[11],
          marginTop: 5,
          opacity: 0.7,
          fontSize: 20,
          textAlign: "center",
        }}
      >
        Let's make productivity work for you.
      </Text>
      <View style={[introStyles.inputContainer, { backgroundColor: theme[3] }]}>
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
    </KeyboardAvoidingView>
  );
};
