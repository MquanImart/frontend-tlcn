import { ChatStackParamList } from "@/src/shared/routes/MessageNavigation";
import getColor from "@/src/styles/Color";
import { StackNavigationProp } from "@react-navigation/stack";
import { Image, Text, View, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native"
import { SearchConversations } from "../containers/list-messages/useListMessages";
import { useNavigation } from "@react-navigation/native";

const Color = getColor();
type ChatNavigationProp = StackNavigationProp<ChatStackParamList, "ListMessages">;

export interface CardMessagesProps {
    cardData: SearchConversations;
}

const CardSearch = ({cardData}: CardMessagesProps) => {
    const navigation = useNavigation<ChatNavigationProp>();

    if (!cardData) return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator/></View>
    return (
        <TouchableOpacity style={styles.container} onPress={() => {navigation.navigate("BoxChat", {conversationId: cardData.conversationId})}}>
            <View style={styles.mainContent}>
                <Image source={{uri: cardData.avt}} style={styles.images}/>
                <View style={styles.content}>
                    <Text style={styles.name}>{cardData.name}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

    },
    images: {
        width: 50, height: 50,
        borderRadius: 50
    },
    mainContent: {
        width: '90%',
        flexDirection: 'row',
        alignItems: 'center'
    },
    content: {
        width: '90%',
        paddingHorizontal: 10,
        justifyContent: 'space-between'
    },
    name: {
        fontSize: 17
    }
})

export default CardSearch;