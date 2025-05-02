import getColor from "@/src/styles/Color";
import { Text, TextInput, TouchableOpacity, View, StyleSheet } from "react-native";

const Color = getColor();

interface CSearchProps {
    handleSearch: () => void;
    handleChange: (value: string) => void;
    text: string;
}
const CSearch = ({ text, handleChange, handleSearch } : CSearchProps) => {

    return (
        <View style={styles.container}>
            <TextInput
                placeholder="Nhập từ khóa tìm kiếm"
                value={text}
                placeholderTextColor={Color.textColor3}
                style={styles.textInput}
                onChangeText={handleChange}
            />
            <TouchableOpacity onPress={handleSearch}>
                <Text style={styles.textButton}>Tìm</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '90%',
        alignSelf: 'center',
        borderRadius: 32,
        backgroundColor: Color.backGround2,
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
        color: Color.textColor1,
        paddingHorizontal: 10
    }
})

export default CSearch;