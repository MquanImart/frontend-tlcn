import CButton from "@/src/shared/components/button/CButton"
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { View, StyleSheet } from "react-native"

export interface ButtonFriendsProps {
    actions: (() => void)[];
    label: string[];
}

export const ButtonActions = ({actions, label} : ButtonFriendsProps) => {
    useTheme()
    const width = label.length > 1 ? "48%" : "96%";

    return (
        <View style={styles.container}>
            {actions.map((item, index) => (
                <CButton
                    key={index}
                    label={label[index]}
                    onSubmit={item}
                    style={{
                        width: width,
                        height: 35,
                        backColor: Color.mainColor2,
                        textColor: Color.textOnMain2, 
                        fontSize: 13,
                        // Thêm các thuộc tính mặc định khác của CButton nếu cần thiết, ví dụ:
                        fontWeight: "bold", // Ví dụ
                        radius: 8, // Ví dụ
                        flex_direction: "row", // Ví dụ
                    }}
                />
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around'
    }
})