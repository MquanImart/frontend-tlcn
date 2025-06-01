import getColor from "@/src/styles/Color";
import { View, StyleSheet, TextInput } from "react-native"

const Color = getColor();

interface NameMessagesProps {
    name: string; 
    setName: (value: string) => void;
    refInput: React.RefObject<TextInput | null>;
}

const InputName = ({refInput, name, setName} : NameMessagesProps) => {

    const handleTextChange = (text: string) => {
      setName(text);
    };
    return (
        <View style={styles.container}>
            <View style={styles.boxName}>
                <TextInput
                    ref={refInput}
                    value={name}
                    style={styles.inputName}
                    placeholder="Tên nhóm"
                    placeholderTextColor={Color.textColor3}
                    onChangeText={handleTextChange}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10
    },
    boxName: {
        width: '90%',
        height: 50,
        backgroundColor: Color.white_homologous,
        borderRadius: 32,
        justifyContent: 'center',
        paddingHorizontal: 20,
        borderWidth: 0.5
    },
    inputName: {

    }
})

export default InputName;