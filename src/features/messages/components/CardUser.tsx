import { MyPhoto } from "@/src/interface/interface_reference";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Image } from 'expo-image';
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

export interface CardUserProps {
    _id: string;
    avt: MyPhoto | null;
    name: string;
    selected?: boolean;
    onPress: () => void;
    icon?: string;
    radio: boolean;
}
const CardUser = ({_id, avt, name, selected, onPress, icon, radio} : CardUserProps) => {
    useTheme();
    const [isChoose, setIsChoose] = useState<boolean>(false);

    const handlePress = () => {
        setIsChoose(!isChoose);
        onPress();
    }

    const handlePressIcon = () => {
        setIsChoose(!isChoose);
        onPress();
    }

    useEffect(()=> {
        if (selected !== undefined){
            setIsChoose(selected);
        }
    }, [selected]);

    return (
        <TouchableOpacity style={[styles.container, { backgroundColor: Color.backgroundSecondary }]} onPress={handlePress}>
            <View style={styles.boxContent}>
                <Image source={avt?{uri:avt.url} : require('@/src/assets/images/default/default_user.png')} style={styles.images}/>
                <Text style={[styles.text, { color: Color.textPrimary }]}>{name}</Text>
            </View>
            {radio && <TouchableOpacity style={styles.radio} onPress={handlePressIcon}>
                <Icon
                    name={icon?icon: (isChoose? "radio-button-on": "radio-button-off")}
                    size={24} color={Color.mainColor2}
                />
            </TouchableOpacity>}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderRadius: 8, 
        marginVertical: 4 
    },
    boxContent: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    images: {
        width: 50, height: 50,
        borderRadius: 50
    },
    text: {
        paddingHorizontal: 20
    },
    radio: {

    }
})
export default CardUser;