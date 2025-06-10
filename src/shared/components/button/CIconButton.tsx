import { ReactNode } from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import ConvertDimension from "../../utils/ConvertDimension";

interface CIconButtonProps {
    label?: string;
    icon: ReactNode;
    onSubmit: () => void;
    style: {
        width?: number | string;
        height?: number | string;
        backColor?: string;
        textColor?: string;
        fontSize?: number;
        fontWeight?: | "100"| "200"| "300"| "400"| "500"| "600"| "700"| "800"| "900"| 100| 200| 300| 400| 500| 600| 700| 800| 900| "normal"| "bold"| undefined;    
        radius?: number;
        flex_direction?: "row" | "column";
        shadow?: boolean;
        justifyContent?: "flex-start" | 'center'
    }
}

const CIconButton = ({label, icon, onSubmit, style} : CIconButtonProps) => {

    const defaultStyles = {
        width: style.width || "100%",
        height: style.height || "auto",
        backColor: style.backColor || "#fff",
        textColor: style.textColor || "#000",
        fontSize: style.fontSize || 15,
        fontWeight: style.fontWeight || "normal",
        radius: style.radius || 10,
        flex_direction: style.flex_direction || "row",
        shadow: style.shadow || false,
        justifyContent: style.justifyContent || 'center'

    };

    return (
        <TouchableOpacity 
            style={[styles.container, {
                width: ConvertDimension(defaultStyles.width),
                height: ConvertDimension(defaultStyles.height),
                backgroundColor: defaultStyles.backColor,
                borderRadius: defaultStyles.radius,
                flexDirection: defaultStyles.flex_direction,
                justifyContent: defaultStyles.justifyContent,
                alignItems: "center",
            }, defaultStyles.shadow && styles.shadow]}

            onPress={onSubmit}
        >
            {icon}
            {label && 
            <Text 
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
                color: defaultStyles.textColor, 
                fontSize: defaultStyles.fontSize,
                fontWeight: defaultStyles.fontWeight
            }}
            >
                {label}
            </Text>}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    shadow: {
        shadowColor: "#000", // Màu bóng
        shadowOffset: {
          width: 0, // Đổ bóng theo chiều ngang
          height: 4, // Đổ bóng theo chiều dọc
        },
        shadowOpacity: 0.3, // Độ mờ của bóng (0 - 1)
        shadowRadius: 4.65, // Độ mờ viền của bóng
        elevation: 8, // Dùng cho Android (giá trị càng cao bóng càng đậm)
    }
})
export default CIconButton;