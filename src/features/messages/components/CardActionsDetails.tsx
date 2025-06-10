import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { FlatList } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialIcons";


interface ButtonActionsProps {
    text: string;
    onPress: () => void;
    showIcon: boolean;
}

interface CardActionsDetailsProps {
    label: string;
    buttons: ButtonActionsProps[];
}
const CardActionsDetails = ({label, buttons} : CardActionsDetailsProps) => {
    useTheme();
    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: Color.textPrimary }]}>{label}</Text>
            {buttons.map((item, index) =>
                <TouchableOpacity key={index} style={[styles.cardActions, { backgroundColor: Color.backgroundSecondary, shadowColor: Color.shadow }]} onPress={item.onPress}>
                    <Text style={[styles.textActions, { color: Color.textPrimary }]}>{item.text}</Text>
                    {item.showIcon?<Icon name={"arrow-forward-ios"} size={20} color={Color.textSecondary}/>:<View style={styles.boxIcon}/>}
                </TouchableOpacity>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignSelf: 'center'
    },
    label: {
        fontSize: 15,
        fontWeight: '500',
        margin: 20,
    },
    cardActions: {
        padding: 15,
        marginVertical: 2, marginHorizontal: 20,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 2,
    },
    textActions: {
        fontSize: 15
    },
    boxIcon: {
        width: 20
    }
})

export {CardActionsDetails, ButtonActionsProps};