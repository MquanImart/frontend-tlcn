import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Text, View, StyleSheet, TouchableOpacity } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons";

interface HeaderBoxChatProps {
    name: string;
    onPressIconLeft: () => void;
    onPressIconRight: () => void;
}
const HeaderBoxChat = ({name, onPressIconLeft, onPressIconRight} : HeaderBoxChatProps) => {
    useTheme();
    return (
        <View style={[styles.container, { backgroundColor: Color.background }]}>
            <TouchableOpacity onPress={onPressIconLeft}>
                <Icon name={"arrow-back-ios"} size={30} color={Color.textPrimary}/>
            </TouchableOpacity>
            <View style={styles.boxTitle}>
                <Text style={[styles.name, { color: Color.textPrimary }]}>{name}</Text>
            </View>
            <TouchableOpacity onPress={onPressIconRight}>
                <Icon name={"menu"} size={30} color={Color.textPrimary} />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,

    },
    boxTitle: {
        alignItems: 'center'
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold'

    },
    boxStatus: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    status: {
        width: 5, height: 5,
        borderRadius: 50,
        backgroundColor: 'green', // Consider making this dynamic too, e.g., Color.success
        marginHorizontal: 5,
    },
    textStatus: {
        fontSize: 10,
        // Consider adding dynamic color here as well, e.g., color: Color.textSecondary
    }
})

export default HeaderBoxChat;