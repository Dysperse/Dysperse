import { memo } from "react";
import { StyleSheet, View } from "react-native";
import Text, { DTextProps } from "../Text";

interface DListItemTextProps extends DTextProps {
  primary: React.ReactNode;
  primaryProps?: DTextProps;
  secondary?: React.ReactNode;
  secondaryProps?: DTextProps;
  truncate?: boolean;
}

const styles = StyleSheet.create({
  base: { gap: 3, flex: 1 },
  secondary: { opacity: 0.6, fontSize: 14 },
});

function ListItemText(props: DListItemTextProps) {
  return (
    <View style={[styles.base, props.style]}>
      <Text
        weight={600}
        {...props.primaryProps}
        numberOfLines={props.truncate ? 1 : undefined}
      >
        {props.primary}
      </Text>
      {props.secondary && (
        <Text
          style={styles.secondary}
          {...props.secondaryProps}
          numberOfLines={props.truncate ? 1 : undefined}
        >
          {props.secondary}
        </Text>
      )}
    </View>
  );
}

export default memo(ListItemText);
