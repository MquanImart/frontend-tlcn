import React, { useState, forwardRef } from "react";
import { TextInput, StyleSheet, View, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import ConvertDimension from "@/src/shared/utils/ConvertDimension";

interface CustomInputProps {
    placeholder: string;
    onChangeText?: (text: string) => void;
    secureTextEntry?: boolean;
    value?: string;
    style: {
        width?: number | string;
        height?: number | string;
        backColor?: string;
        textColor?: string;
        fontSize?: number;
        fontWeight?: "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900" | "normal" | "bold";
        radius?: number;
        borderColor?: string;
    };
    isPasswordInput?: boolean;
    returnKeyType?: "next" | "done";
    onSubmitEditing?: () => void;
}

// Sử dụng forwardRef để truyền ref từ component cha
const CInput = forwardRef<TextInput, CustomInputProps>(
    ({ placeholder, onChangeText, style, isPasswordInput, value, returnKeyType, onSubmitEditing }, ref) => {
        const [isPasswordVisible, setPasswordVisible] = useState(false);
        const [inputPlaceholder, setInputPlaceholder] = useState(placeholder);

        const togglePasswordVisibility = () => {
            setPasswordVisible(!isPasswordVisible);
        };

        const defaultStyles = {
            width: style.width || "100%",
            height: style.height || "auto",
            textColor: style?.textColor || "#000",
            fontSize: style?.fontSize || 16,
            fontWeight: style?.fontWeight || "normal",
            radius: style?.radius || 10,
            borderColor: style?.borderColor || "#d1a6e6",
        };

        return (
            <View style={[styles.container, { borderColor: defaultStyles.borderColor, borderRadius: defaultStyles.radius }]}>
                <TextInput
                    ref={ref}
                    style={[
                        styles.input,
                        {
                            width: ConvertDimension(defaultStyles.width),
                            height: ConvertDimension(defaultStyles.height),
                            color: defaultStyles.textColor,
                            fontSize: defaultStyles.fontSize,
                            fontWeight: defaultStyles.fontWeight,
                            backgroundColor: "#fff",
                            borderColor: "#fff"
                        },
                    ]}
                    placeholder={inputPlaceholder}
                    onFocus={() => setInputPlaceholder("")}
                    onBlur={() => setInputPlaceholder(value ? "" : placeholder)}
                    placeholderTextColor="#000"
                    secureTextEntry={isPasswordInput && !isPasswordVisible}
                    onChangeText={onChangeText}
                    value={value}
                    returnKeyType={returnKeyType}
                    onSubmitEditing={onSubmitEditing}
                />
                {isPasswordInput && (
                    <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconContainer}>
                        <Icon name={isPasswordVisible ? "visibility" : "visibility-off"} size={24} color="#DD88CF" />
                    </TouchableOpacity>
                )}
            </View>
        );
    }
);

// Thêm displayName cho component
CInput.displayName = "CInput";

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    input: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderRadius: 25,
        backgroundColor: "#f5f5f5",
        paddingHorizontal: 5,
        fontSize: 16,
        color: "#000",
    },
    iconContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
});

export default CInput;