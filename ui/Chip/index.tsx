import { useUser } from "@/context/useUser";
import { StyleProp, TextProps, TextStyle, ViewStyle } from "react-native";
import { Button, DButtonProps } from "../Button";
import { useColor } from "../color";
import { useColorTheme } from "../color/theme-provider";
import Icon from "../Icon";
import IconButton from "../IconButton";
import Text from "../Text";

interface ChipProps extends DButtonProps {
  icon?: React.ReactNode;
  label?: React.ReactNode;
  onPress?: () => void;
  outlined?: boolean;
  style?: StyleProp<ViewStyle> | ((props: any) => StyleProp<ViewStyle>);
  iconPosition?: "before" | "after";
  dense?: boolean;
  disabled?: boolean;
  color?: string;
  textStyle?: StyleProp<TextStyle>;
  textProps?: TextProps;
  colorTheme?: string;
  textWeight?: number;
  iconStyle?: StyleProp<TextStyle>;
  onDismiss?: () => void;
}

export default function Chip(props: ChipProps) {
  const { session } = useUser();
  const colorScheme = useColorTheme();

  const specifiedTheme = useColor(
    props.colorTheme || session?.user?.profile?.theme || "mint"
  );

  const theme = props.colorTheme ? specifiedTheme : colorScheme;

  return (
    <Button
      disabled={props.disabled}
      variant={props.outlined ? "outlined" : "filled"}
      height={props.dense ? 30 : 35}
      style={[
        {
          ...(props.icon && { paddingRight: props.dense ? 7 : 12 }),
          gap: props.dense ? 5 : 10,
        },
      ]}
      {...props}
    >
      {typeof props.label === "string" ? (
        <Text
          style={[
            {
              color: props.color || theme[11],
              ...(props.dense && { fontSize: 13 }),
            },
            props.textStyle,
          ]}
          weight={props.textWeight as any}
          {...props.textProps}
        >
          {props.label}
        </Text>
      ) : (
        props.label
      )}
      {props.iconPosition === "after" &&
        (typeof props.icon === "string" ? (
          <Icon>{props.icon}</Icon>
        ) : (
          props.icon
        ))}

      {props.onDismiss && (
        <IconButton
          onPress={(e) => {
            e.stopPropagation();
            props.onDismiss();
          }}
          icon="close"
          iconStyle={{ color: props.color || theme[11] }}
          style={{ marginRight: -5 }}
          size={props.dense ? 20 : 33}
        />
      )}
    </Button>
  );
}

