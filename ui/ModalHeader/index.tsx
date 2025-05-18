import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useBottomSheet } from "@gorhom/bottom-sheet";
import { View } from "react-native";
import IconButton from "../IconButton";
import Text from "../Text";

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  noPaddingTop?: boolean;
}

export default function ModalHeader(props: ModalHeaderProps) {
  const { forceClose } = useBottomSheet();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 20,
        paddingTop: props.noPaddingTop ? 10 : 20,
        alignItems: "center",
      }}
    >
      <View>
        <Text style={{ fontSize: props.subtitle ? 18 : 20 }} weight={900}>
          {props.title}
        </Text>
        {props.subtitle && (
          <Text style={{ opacity: 0.6 }} weight={300}>
            {props.subtitle}
          </Text>
        )}
      </View>
      <IconButton
        icon="close"
        size={props.subtitle ? 40 : undefined}
        onPress={() =>
          forceClose(
            breakpoints.md
              ? undefined
              : { overshootClamping: true, stiffness: 400 }
          )
        }
        variant="filled"
      />
    </View>
  );
}
