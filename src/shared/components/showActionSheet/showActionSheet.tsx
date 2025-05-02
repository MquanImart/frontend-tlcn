import { ActionSheetIOS } from "react-native";

type ActionSheetOption = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

export const showActionSheet = (
  options: ActionSheetOption[],
  cancelLabel: string = "Hủy"
) => {
  // Mảng chứa label và callback
  const actionLabels = [cancelLabel, ...options.map((option) => option.label)];
  const destructiveIndex = options.findIndex((option) => option.destructive) + 1;
  const cancelButtonIndex = 0;

  ActionSheetIOS.showActionSheetWithOptions(
    {
      options: actionLabels,
      destructiveButtonIndex: destructiveIndex >= 1 ? destructiveIndex : undefined,
      cancelButtonIndex,
    },
    (buttonIndex) => {
      if (buttonIndex === cancelButtonIndex) return;
      const selectedOption = options[buttonIndex - 1];
      selectedOption?.onPress();
    }
  );
};
