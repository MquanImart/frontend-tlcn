import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Text, TextInput, TouchableOpacity, View, StyleSheet } from "react-native";


interface CSearchProps {
    handleSearch: () => void;
    handleChange: (value: string) => void;
    text: string;
}
const CSearch = ({ text, handleChange, handleSearch } : CSearchProps) => {
    useTheme(); 
    return (
        <View style={[styles.container, { backgroundColor: Color.backgroundSecondary }]}>
            <TextInput
                placeholder="Nhập từ khóa tìm kiếm"
                value={text}
                placeholderTextColor={Color.textTertiary}
                style={[styles.textInput, { color: Color.textPrimary }]}
                onChangeText={handleChange}
            />
            <TouchableOpacity onPress={handleSearch}>
                <Text style={[styles.textButton, { color: Color.textPrimary }]}>Tìm</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        top: 10,
        width: '90%',
        alignSelf: 'center',
        borderRadius: 32,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    textInput: {
        width: '70%',
        height: 50,
        padding: 10,
    },
    textButton: {
        fontWeight: 'bold',
        paddingHorizontal: 10
    }
})

export default CSearch;