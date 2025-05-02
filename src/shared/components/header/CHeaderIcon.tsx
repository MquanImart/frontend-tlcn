import getColor from "@/src/styles/Color";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons";

const Color = getColor();

interface HeaderMessagesProps {
    label: string;
    IconLeft: string;
    onPressLeft: () => void;
    IconRight?: string;
    onPressRight?: () => void;
    textRight?: string;
    borderIcon?: boolean;
}

const CHeaderIcon = ({label, IconLeft, onPressLeft, IconRight, onPressRight, textRight, borderIcon}: HeaderMessagesProps) => {

    return (
        <View style={styles.container}>
            <TouchableOpacity style={[styles.buttonIcon, borderIcon&&styles.borderIcon]} onPress={onPressLeft}>
                <Icon name={IconLeft} size={24} color={Color.white_contrast} />
            </TouchableOpacity>
            <Text style={styles.label}>{label}</Text>
            {(IconRight || textRight) ? <TouchableOpacity style={[styles.buttonIcon, borderIcon&&styles.borderIcon]} onPress={onPressRight}>
                {IconRight && <Icon name={IconRight} size={24} color={Color.mainColor1} />}
                {textRight && <Text style={styles.textIcon}>{textRight}</Text>}
            </TouchableOpacity> : <View style={styles.placeHolder}/>}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginTop: 40,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: '5%'
    },
    buttonIcon: {
        padding: 5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 25,
        fontWeight: 'bold'
    },
    textIcon: {
        paddingHorizontal: 5,
        color: Color.mainColor1
    },
    borderIcon: {
        borderWidth: 0.5,
        borderRadius: 50,
        borderColor: Color.textColor3
    },
    placeHolder: {
        width: 20
    }
})

export default CHeaderIcon;