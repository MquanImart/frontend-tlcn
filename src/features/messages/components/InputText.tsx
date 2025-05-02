import getColor from "@/src/styles/Color";
import { TextInput, View, StyleSheet, TouchableOpacity } from "react-native"

const Color = getColor();

interface InputTextProps {
    text: string; 
    setText: (value: string) => void;
}
const InputText = ({ text, setText } : InputTextProps) => {

    return (
        <View style={styles.container}>
            <TextInput style={styles.textInput}
                value={text}
                placeholder="Tin nhắn..."
                placeholderTextColor={Color.textColor3}
                onChangeText={(text) => {setText(text)}}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '65%',
        height: 40,
        backgroundColor: Color.backGround1,
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