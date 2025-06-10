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
    boderColor?: string; // Tên thuộc tính này nên là borderColor để nhất quán
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
    borderColor?: string; // Đã thêm borderColor để tương thích tốt hơn với boderColor
    shadow?: boolean;
  };
  children?: React.ReactNode;
}

const CButton = ({ label, onSubmit, disabled = false, style, children }: CButtonProps) => {
  const defaultStyles = {
    // Nếu style?.width được cung cấp, sử dụng nó. Ngược lại, không đặt width để button tự co giãn.
    width: style?.width !== undefined ? style.width : undefined,
    height: style?.height || "auto",
    backColor: style?.backColor || "#fff",
    textColor: style?.textColor || "#000",
    // Ưu tiên borderColor nếu có, nếu không thì dùng boderColor
    borderColor: style?.borderColor || style?.boderColor || "#fff",
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
            flexWrap: 'wrap', // Cho phép children text xuống dòng
          }}
        >
          {children}
        </Text>
      );
    }
    return children; 
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: defaultStyles.width !== undefined ? ConvertDimension(defaultStyles.width) : undefined,
          height: ConvertDimension(defaultStyles.height),
          backgroundColor: defaultStyles.backColor,
          borderColor: defaultStyles.borderColor,
          borderWidth: defaultStyles.borderWidth,
          borderRadius: defaultStyles.radius,
          flexDirection: defaultStyles.flex_direction,
          justifyContent: "center",
          alignItems: "center",
          opacity: disabled ? 0.6 : 1,
          paddingHorizontal: ConvertDimension(20), 
          minWidth: ConvertDimension(50),
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
          flexWrap: 'wrap', 
          textAlign: 'center', 
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