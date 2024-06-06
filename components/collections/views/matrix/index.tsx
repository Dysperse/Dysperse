import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
  container: { flexDirection: "column", flex: 1, padding: 25, gap: 20 },
  row: { flex: 1, flexDirection: "row", gap: 20, alignItems: "center" },
  cell: { flex: 1, borderWidth: 1, borderRadius: 25, height: "100%" },
  add: {
    alignItems: "center",
    marginVertical: -25,
    height: 35,
    marginLeft: 20,
  },
});

const Cell = ({ title }) => {
  const theme = useColorTheme();

  return (
    <View
      style={[
        styles.cell,
        { backgroundColor: theme[2], borderColor: theme[5] },
      ]}
    ></View>
  );
};

const CreateTaskTrigger = () => {
  const theme = useColorTheme();
  return (
    <View style={styles.add}>
      <IconButton
        icon={<Icon style={{ color: theme[2] }}>add</Icon>}
        style={({ pressed, hovered }) => ({
          backgroundColor: theme[pressed ? 11 : hovered ? 10 : 9],
        })}
        size={35}
        variant="filled"
      />
    </View>
  );
};

const Label = ({ x, y, size }: { x?: string; y?: string; size: number }) => {
  const theme = useColorTheme();

  return (
    <Text
      variant="eyebrow"
      numberOfLines={1}
      style={
        y
          ? {
              transform: [{ rotate: "-90deg" }],
              width: size,
              marginHorizontal: -(size / 2),
              height: 20,
            }
          : {}
      }
    >
      {x || y}
    </Text>
  );
};

export function Matrix() {
  const theme = useColorTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.row, { flex: 0, justifyContent: "space-around" }]}>
        <Label size={900} x="Urgent" />
        <Label size={900} x="Less urgent" />
      </View>
      <View style={styles.row}>
        <Label size={100} y="Important" />
        <Cell title="Urgent & Important" />
        <View
          style={[
            styles.cell,
            { backgroundColor: theme[2], borderColor: theme[5] },
          ]}
        ></View>
      </View>
      <CreateTaskTrigger />
      <View style={styles.row}>
        <Label size={133} y="Less important" />
        <View
          style={[
            styles.cell,
            { backgroundColor: theme[2], borderColor: theme[5] },
          ]}
        ></View>
        <View
          style={[
            styles.cell,
            { backgroundColor: theme[2], borderColor: theme[5] },
          ]}
        ></View>
      </View>
    </View>
  );
}
