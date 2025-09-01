import { toast } from "sonner-native";

export const showErrorToast = () =>
  toast.error("Something went wrong", {
    description: "Please try again later.",
  });
