import { ContentWrapper } from "@/components/layout/content";
import { settingsStyles } from "@/components/settings/styles";
import { useUser } from "@/context/useUser";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import dayjs from "dayjs";
import { Controller, useForm } from "react-hook-form";
import { ScrollView } from "react-native-gesture-handler";

export default function Page() {
  const theme = useColorTheme();
  const { session } = useUser();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: session?.user?.profile?.name,
      email: session?.user?.email,
      username: session?.user?.profile?.username,
      bio: session?.user?.profile?.bio,
      birthday: dayjs(session?.user?.profile?.birthday).format("MM/DD/YYYY"),
    },
  });

  return (
    <ContentWrapper>
      <ScrollView contentContainerStyle={settingsStyles.contentContainer}>
        <Text heading style={settingsStyles.heading}>
          Personal info
        </Text>
        {[
          { key: "name" },
          { key: "username" },
          { key: "bio", placeholder: "About me", multiline: true },
          { key: "email", disabled: true },
          { key: "birthday", disabled: true },
        ].map((input) => (
          <Controller
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                editable={!input.disabled}
                multiline={input.multiline}
                variant="filled"
                placeholder={
                  input.placeholder || capitalizeFirstLetter(input.key)
                }
                style={[
                  settingsStyles.input,
                  { borderColor: theme[5] },
                  input.disabled && { opacity: 0.6 },
                ]}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
              />
            )}
            disabled={input.disabled}
            name={input.key as any}
            key={input.key}
          />
        ))}
      </ScrollView>
    </ContentWrapper>
  );
}
