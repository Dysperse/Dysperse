import { forwardRef } from "react";
import Modal from "../Modal";

export const RecurrencePicker = forwardRef(
  ({ value, setValue }: { value: any; setValue: any }, ref: any) => {
    return (
      <Modal sheetRef={ref} animation="SCALE">
        test
      </Modal>
    );
  }
);
