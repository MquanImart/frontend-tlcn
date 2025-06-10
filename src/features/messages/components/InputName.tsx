import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { View, StyleSheet, TextInput } from "react-native"

interface NameMessagesProps {
    name: string;
    setName: (value: string) => void;
    refInput: React.RefObject<TextInput | null>;
}

const InputName = ({refInput, name, setName} : NameMessagesProps) => {
    useTheme(); // This hook ensures the Color object is updated based on the current theme
    const handleTextChange = (text: string) => {
        setName(text);
    };
    return (
        <View style={styles.container}>
            <View style={[
                styles.boxName,
                {
                    backgroundColor: Color.backgroundTertiary, // Dynamic background for the input box
                    borderColor: Color.border // Dynamic border color
                }
            ]}>
                <TextInput
                    ref={refInput}
                    value={name}
                    style={[
                        styles.inputName,
                        { color: Color.textPrimary } // Dynamic text color for the input
                    ]}
                    placeholder="Tên nhóm"
                    placeholderTextColor={Color.textTertiary} // Using textTertiary for placeholder
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
        borderRadius: 32,
        justifyContent: 'center',
        paddingHorizontal: 20,
        borderWidth: 0.5
    },
    inputName: {
        flex: 1, // Allows the TextInput to take up available space
        fontSize: 16, // Added a default font size
    }
})

export default InputName;