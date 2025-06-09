import { CollectionStackParamList } from "@/src/shared/routes/CollectionNavigation";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface CollectionsCardProps {
    _id:string;
    name: string;
    img: string;
}

type CollectionsNavigationProp = StackNavigationProp<CollectionStackParamList, "Collections">;

const CollectionsCard = ({_id, name, img} : CollectionsCardProps) => {
    useTheme();
    const navigation = useNavigation<CollectionsNavigationProp>();

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={()=> {navigation.navigate("DetailsCollections", { collectionId: _id });}}>
                <Image style={styles.images} source={{uri: img}} resizeMode="cover"/>
            </TouchableOpacity>
            <View style={styles.boxTitle}>
                <Text style={styles.title}>{name}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Color.white
    },
    images: {
        width: '100%',
        height: 100,
        borderRadius: 10
    },
    boxTitle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10
    },
    title: {
        fontWeight: '500',
        fontSize: 15
    },
    form: {

        position: "absolute",
        bottom: 10, right: 30,
        backgroundColor: Color.white,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    itemForm: {
        padding: 10,
        width: 120,
        justifyContent: "center",
        alignItems: 'center'
    },
    textForm: {
        fontWeight: '400'
    },
    line: {
        width: '100%',
        borderTopWidth: 0.5
    }
})


export default CollectionsCard;