import { showErrorToast } from "@/utils/errorToast";
import { BottomSheetModal, useBottomSheet } from "@gorhom/bottom-sheet";
import { cloneElement, useCallback, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { Button, ButtonText } from "../Button";
import { useColorTheme } from "../color/theme-provider";
import Modal from "../Modal";
import Text from "../Text";

export interface ConfirmationModalProps {
  children: JSX.Element;
  height?: number;
  title: string;
  secondary: string;
  onSuccess: () => void;
  disabled?: boolean;
  skipLoading?: boolean;
}

const styles = StyleSheet.create({
  container: {
    padding: 30,
    borderRadius: 25,
    gap: 10,
    shadowColor: "#000",
    shadowRadius: 20,
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 0,
      height: 10,
    },
  },
  title: {
    fontSize: 35,
    textAlign: "center",
  },
  secondary: {
    opacity: 0.6,
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  buttonText: {
    fontSize: 20,
  },
});

function ConfirmationModalButton({
  skipLoading,
  onSuccess,
}: {
  skipLoading?: boolean;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const { forceClose } = useBottomSheet();

  const handleSuccess = async () => {
    try {
      setLoading(true);
      if (skipLoading) {
        onSuccess?.();
        return setTimeout(
          () => forceClose({ overshootClamping: true, damping: 1 }),
          100
        );
      }
      await onSuccess?.();
      setTimeout(() => forceClose({ overshootClamping: true, damping: 1 }), 0);
    } catch (e) {
      showErrorToast();
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      isLoading={loading}
      height={70}
      style={[{ marginTop: "auto" }]}
      variant="filled"
      onPress={handleSuccess}
    >
      <ButtonText weight={900} style={styles.buttonText}>
        Continue
      </ButtonText>
    </Button>
  );
}

export default function ConfirmationModal(props: ConfirmationModalProps) {
  const ref = useRef<BottomSheetModal>(null);
  const theme = useColorTheme();
  const handleClose = useCallback(
    () =>
      ref.current?.forceClose({
        overshootClamping: true,
        stiffness: 400,
        damping: 20,
      }),
    []
  );

  if (props.disabled) {
    const d = cloneElement(props.children, {
      onPress: () => {
        props.onSuccess?.();
        props.children.props?.onPress?.();
      },
    });
    return d;
  }

  const handleOpen = () => ref.current?.present();
  const trigger = cloneElement(props.children, { onPress: handleOpen });

  return (
    <>
      {trigger}
      <Modal
        height="auto"
        animation="BOTH"
        onClose={handleClose}
        maxWidth={350}
        maxBackdropOpacity={0.2}
        animationConfigs={{
          overshootClamping: true,
          stiffness: 400,
          damping: 40,
        }}
        handleComponent={() => null}
        innerStyles={styles.container}
        sheetRef={ref}
      >
        <Text
          style={[
            styles.title,
            { color: theme[11], fontFamily: "serifText700" },
          ]}
        >
          {props.title}
        </Text>
        <Text weight={500} style={[styles.secondary, { color: theme[11] }]}>
          {props.secondary}
        </Text>
        <ConfirmationModalButton
          skipLoading={props.skipLoading}
          onSuccess={props.onSuccess}
        />
        <Button height={70} variant="outlined" onPress={handleClose}>
          <ButtonText weight={900} style={styles.buttonText}>
            Cancel
          </ButtonText>
        </Button>
      </Modal>
    </>
  );
}

