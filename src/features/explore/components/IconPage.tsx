import { MyPhoto } from "@/src/interface/interface_reference";
import getColor from "@/src/styles/Color";
import { View, Text, StyleSheet, Image } from "react-native";

const Color = getColor();

interface IconPageProps {
    avt: MyPhoto;
    name: string;
}
const IconPage = ({avt, name}: IconPageProps) => {

    return (
        <View style={styles.container}>
            <View style={styles.boxImages}>
                <Image style={styles.images} source={{uri: avt.url}}/>
            </View>
            <Text style={styles.textName} numberOfLines={1} ellipsizeMode="tail">{name}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 110, width: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
    },
    boxImages: {
        width: 60, height: 60,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Color.mainColor2
    },
    images: {
        width: 50, height: 50,
        borderRadius: 50,
    },
    textName: {
        color: Color.mainColor1,
        maxWidth: 60,
        fontSize: 10,
        fontWeight: '600',
        marginVertical: 5
    }
})
export default IconPage;

