import getColor from "@/src/styles/Color";
import { View, StyleSheet, TextInput } from "react-native"

const Color = getColor();

interface SearchMessagesProps {
    search: string; 
    setSearch: (value: string) => void;
    setIsSearch: (value: boolean) => void;
    refInput: React.RefObject<TextInput>;
}

const SearchMessages = ({refInput, search, setSearch, setIsSearch} : SearchMessagesProps) => {

    const focusTextInput = () => {
        setIsSearch(true);
    };

    const unfocusTextInput = () => {
        // setIsSearch(false);
    };

    const handleTextChange = (text: string) => {
      setSearch(text);
    };
    return (
        <View style={styles.container}>
            <View style={styles.boxSearch}>
                <TextInput
                    ref={refInput}
                    value={search}
                    style={styles.inputSearch}
                    placeholder="Tìm kiếm người liên hệ"
                    placeholderTextColor={Color.textColor3}
                    onFocus={focusTextInput}
                    onChangeText={handleTextChange}
                    onBlur={unfocusTextInput}
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
        backgroundColor: Color.backGround2,
        borderRadius: 32,
        justifyContent: 'center',
        paddingHorizontal: 20
    },
    inputSearch: {

    }
})

export default SearchMessages;