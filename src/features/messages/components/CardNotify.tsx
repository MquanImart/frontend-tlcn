import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons";

interface CardNotifyProps {
    text: string;
    onPress?: () => void;
    keyText?: string;
    ischoose?: boolean;
}

const CardNotify = ({text, onPress, ischoose} : CardNotifyProps) => {
    useTheme();
    return (
        <TouchableOpacity style={styles.cardActions} onPress={onPress}>
            <Text style={styles.textActions}>{text}</Text>
            <Icon 
                name={ischoose? "radio-button-on": "radio-button-off"} 
                size={24} color={Color.white_contrast} 
            />  
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    cardActions: {
        width: '90%',
        alignSelf: 'center',
        padding: 10, 
        marginVertical: 5,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: Color.backGround,
        shadowColor: '#000',
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

export {CardNotify, CardNotifyProps};