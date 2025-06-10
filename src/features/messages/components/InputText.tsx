import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { TextInput, View, StyleSheet, TouchableOpacity } from "react-native"

interface InputTextProps {
    text: string;
    setText: (value: string) => void;
}
const InputText = ({ text, setText } : InputTextProps) => {
    useTheme(); 
    return (
        <View style={[styles.container, { backgroundColor: Color.backgroundTertiary }]}>
            <TextInput
                style={[styles.textInput, { color: Color.textPrimary }]}
                value={text}
                placeholder="Tin nhắn..."
                placeholderTextColor={Color.textTertiary} 
                onChangeText={(text) => {setText(text)}}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '65%',
        height: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 50,
        paddingHorizontal: 10,
    },
    textInput: {
        width: '80%',
        height: 40,
    }
})

export default InputText;