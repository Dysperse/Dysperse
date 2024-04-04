import { useSignupContext } from "@/app/auth/sign-up";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Controller } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export const taskInputStyles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
  },
  check: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 30,
    height: 30,
    margin: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
});

export const TaskInput = ({ form, index }) => {
  const theme = useColorTheme();

  return (
    <View
      style={[
        taskInputStyles.container,
        { backgroundColor: theme[2], borderColor: theme[5] },
      ]}
    >
      <View style={[taskInputStyles.check, { borderColor: theme[6] }]} />
      <Controller
        rules={{
          validate: (v) => v.find((t) => t.trim().length === 0),
        }}
        control={form.control}
        name="tasks"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <TextField
            value={value[index]}
            onChangeText={(s) => {
              const t = value;
              t[parseInt(index)] = s;
              onChange(t);
            }}
            placeholder={`Task #${index + 1}`}
            style={[
              { flex: 1, height: "100%", shadowRadius: 0 },
              error && { borderColor: "red" },
            ]}
          />
        )}
      />
    </View>
  );
};

export const TaskCreator = ({ form }) => {
  const theme = useColorTheme();
  const { handleNext } = useSignupContext();

  return (
    <ScrollView
      centerContent
      style={{
        flex: 1,
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 30,
          marginBottom: 10,
          color: theme[11],
          marginTop: "auto",
        }}
        weight={900}
      >
        Your very first tasks
      </Text>
      <Text
        style={{
          fontSize: 20,
          color: theme[11],
          opacity: 0.7,
        }}
      >
        Create three tasks you would like to complete today
      </Text>
      <View style={{ marginTop: 20 }}>
        {[...Array(3).keys()].map((index) => (
          <TaskInput form={form} index={index} key={index} />
        ))}
      </View>
      <Button
        onPress={handleNext}
        variant="filled"
        style={{ height: 60, marginTop: "auto" }}
      >
        <ButtonText weight={700} style={{ fontSize: 20 }}>
          Next
        </ButtonText>
        <Icon>arrow_forward</Icon>
      </Button>
    </ScrollView>
  );
};
