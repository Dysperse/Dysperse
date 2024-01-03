import { View } from "react-native";
import Text, { DTextProps } from "../Text";

interface DListItemTextProps extends DTextProps {
  primary: React.ReactNode;
  primaryProps?: DTextProps;
  secondary?: React.ReactNode;
  secondaryProps?: DTextProps;
  truncate?: boolean;
}

export default function ListItemText(props: DListItemTextProps) {
  return (
    <View style={[{ gap: 3, flex: 1 }, props.style]}>
      <Text
        weight={600}
        {...props.primaryProps}
        numberOfLines={props.truncate ? 1 : undefined}
      >
        {props.primary}
      </Text>
      {props.secondary && (
        <Text
          style={{ opacity: 0.6, fontSize: 14 }}
          {...props.secondaryProps}
          numberOfLines={props.truncate ? 1 : undefined}
        >
          {props.secondary}
        </Text>
      )}
    </View>
  );
}
