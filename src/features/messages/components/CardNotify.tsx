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
        <TouchableOpacity
            style={[
                styles.cardActions,
                { backgroundColor: ischoose ? Color.mainColor2 : Color.backgroundSecondary },
            ]}
            onPress={onPress}
        >
            <Text
                style={[
                    styles.textActions,
                    { color: ischoose ? Color.textOnMain1 : Color.textPrimary }
                ]}
            >
                {text}
            </Text>
            <Icon
                name={ischoose ? "radio-button-on" : "radio-button-off"}
                size={24}
                color={ischoose ? Color.textOnMain1 : Color.textPrimary}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardActions: {
        width: '90%',
        alignSelf: 'center',
        padding: 15,
        marginVertical: 8,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    textActions: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
        marginRight: 10,
    },
    boxIcon: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export {CardNotify, CardNotifyProps};