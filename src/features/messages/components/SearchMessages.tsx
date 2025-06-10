import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { View, StyleSheet, TextInput } from "react-native"

interface SearchMessagesProps {
    search: string;
    setSearch: (value: string) => void;
    setIsSearch: (value: boolean) => void;
    refInput: React.RefObject<TextInput | null>;
}

const SearchMessages = ({refInput, search, setSearch, setIsSearch} : SearchMessagesProps) => {
    useTheme();
    const focusTextInput = () => {
        setIsSearch(true);
    };

    const handleTextChange = (text: string) => {
      setSearch(text);
    };

    return (
        <View style={styles.container}>
            <View style={[styles.boxSearch, { backgroundColor: Color.backgroundTertiary }]}>
                <TextInput
                    ref={refInput}
                    value={search}
                    style={[styles.inputSearch, { color: Color.textPrimary }]}
                    placeholder="Tìm kiếm người liên hệ"
                    placeholderTextColor={Color.textTertiary}
                    onFocus={focusTextInput}
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
    boxSearch: {
        width: '90%',
        height: 50,
        borderRadius: 32,
        justifyContent: 'center',
        paddingHorizontal: 20
    },
    inputSearch: {
        flex: 1,
        fontSize: 16,
    }
})

export default SearchMessages;