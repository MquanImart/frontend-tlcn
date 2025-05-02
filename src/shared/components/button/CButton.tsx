import { TouchableOpacity, StyleSheet, Text, View } from "react-native";
import ConvertDimension from "../../utils/ConvertDimension";

interface CButtonProps {
  label: string;
  onSubmit: () => void;
  disabled?: boolean;
  style?: {
    width?: number | string;
    height?: number | string;
    backColor?: string;
    textColor?: string;
    boderColor?: string;
    fontSize?: number;
    fontWeight?:
      | "100"
      | "200"
      | "300"
      | "400"
      | "500"
      | "600"
      | "700"
      | "800"
      | "900"
      | 100
      | 200
      | 300
      | 400
      | 500
      | 600
      | 700
      | 800
      | 900
      | "normal"
      | "bold"
      | undefined;
    radius?: number;
    flex_direction?: "row" | "column";
    borderWidth?: number;
    borderColor?: string;
    shadow?: boolean;
  };
  children?: React.ReactNode;
}

const CButton = ({ label, onSubmit, disabled = false, style, children }: CButtonProps) => {
  const defaultStyles = {
    width: style?.width || "100%",
    height: style?.height || "auto",
    backColor: style?.backColor || "#fff",
    textColor: style?.textColor || "#000",
    borderColor: style?.borderColor || "#fff",
    fontSize: style?.fontSize || 15,
    fontWeight: style?.fontWeight || "normal",
    radius: style?.radius || 10,
    flex_direction: style?.flex_direction || "row",
    borderWidth: style?.borderWidth || 0,
    shadow: style?.shadow || false,
  };

  // Hàm render children, bọc trong <Text> nếu là chuỗi
  const renderChildren = () => {
    if (typeof children === "string") {
      return (
        <Text
          style={{
            color: defaultStyles.textColor,
            fontSize: defaultStyles.fontSize,
            fontWeight: defaultStyles.fontWeight,
          }}
        >
          {children}
        </Text>
      );
    }
    return children; // Nếu không phải chuỗi, render trực tiếp (như ActivityIndicator)
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: ConvertDimension(defaultStyles.width),
          height: ConvertDimension(defaultStyles.height),
          backgroundColor: defaultStyles.backColor,
          borderColor: defaultStyles.borderColor,
          borderWidth: defaultStyles.borderWidth,
          borderRadius: defaultStyles.radius,
          flexDirection: defaultStyles.flex_direction,
          justifyContent: "center",
          alignItems: "center",
          opacity: disabled ? 0.6 : 1,
        },
        defaultStyles.shadow && styles.shadow,
      ]}
      onPress={onSubmit}
      disabled={disabled}
    >
      <Text
        style={{
          color: defaultStyles.textColor,
          fontSize: defaultStyles.fontSize,
          fontWeight: defaultStyles.fontWeight,
          marginRight: children ? 5 : 0,
        }}
      >
        {label}
      </Text>
      {renderChildren()} 
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});

export default CButton;