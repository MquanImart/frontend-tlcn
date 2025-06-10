import ConvertDimension from "@/src/shared/utils/ConvertDimension";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Image } from 'expo-image';
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CardExploreProps {
    images: string;
    name: string;
    country: string;
    size: {
        width: number | string;
        height: number | string;
    },
    onPress: () => void;
}

const CardExplore = ({images, name, country, size, onPress} : CardExploreProps) => {
    useTheme();
    return (
        <TouchableOpacity style={[styles.container, 
            {width: ConvertDimension(size.width), height: ConvertDimension(size.height)}]}
            onPress={onPress}
        >
            <Image style={styles.images} source={{uri: images}} />
            <LinearGradient
              colors={['rgba(75, 22, 76, 0)', 'rgba(75, 22, 76, 1)']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.boxContent}>
                <Text style={styles.textName}>{name}</Text>
                <Text style={styles.textCountry}>{country}</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        borderWidth: 5,
        borderColor: Color.mainColor2,
        overflow: 'hidden',
    },
    filterImages: {
        width: '100%',
        height: '100%',      
    },
    images: {
        width: '100%',
        height: '100%',
    },
    boxContent: {
        width: '100%',
        height: 80,
        position: 'absolute',
        bottom: 10,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    boxDistance: {
        paddingVertical: 5, paddingHorizontal: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 1,
        borderRadius: 20
    },
    textDistance: {
        color: Color.white_white,
    },
    textName: {
        color: Color.white_white,
        fontSize: 25,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    textCountry: {
        color: Color.white_white,
        textTransform: 'uppercase',
        letterSpacing: 8,
        fontWeight: '500',
        textAlign: 'center',
        paddingLeft: 8,
    }
})

export default CardExplore;