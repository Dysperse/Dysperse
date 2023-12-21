import { View } from "react-native";
import Text, { DTextProps } from "../Text";

interface DListItemTextProps extends DTextProps {
  primary: React.ReactNode;
  primaryProps?: DTextProps;
  secondary?: React.ReactNode;
  secondaryProps?: DTextProps;
}

export default function ListItemText(props: DListItemTextProps) {
  return (
    <View style={{ gap: 3 }}>
      <Text weight={600} {...props.primaryProps}>
        {props.primary}
      </Text>
      {props.secondary && (
        <Text style={{ opacity: 0.6, fontSize: 13 }} {...props.secondaryProps}>
          {props.secondary}
        </Text>
      )}
    </View>
  );
}
