import { ChatStackParamList } from "@/src/shared/routes/MessageNavigation";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Image } from 'expo-image';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SearchConversations } from "../containers/list-messages/useListMessages";

type ChatNavigationProp = StackNavigationProp<ChatStackParamList, "ListMessages">;

export interface CardMessagesProps {
    cardData: SearchConversations;
}

const CardSearch = ({cardData}: CardMessagesProps) => {
    useTheme();

    const navigation = useNavigation<ChatNavigationProp>();

    if (!cardData) return (
      <View style={[styles.loadingContainer, { backgroundColor: Color.backgroundSecondary }]}>
        <ActivityIndicator size="small" color={Color.mainColor2}/>
      </View>
    );

    return (
        <TouchableOpacity style={[styles.container, { backgroundColor: Color.backgroundSecondary }]} onPress={() => {navigation.navigate("BoxChat", {conversationId: cardData.conversationId})}}>
            <View style={styles.mainContent}>
                <Image source={cardData.avt ? {uri: cardData.avt?.url} : (
                    cardData.type === 'group'? require('@/src/assets/images/default/default_group_message.png'):
                    cardData.type === 'private'? require('@/src/assets/images/default/default_user.png'):
                    require('@/src/assets/images/default/default_page.jpg')
                )} style={styles.images}/>
                <View style={styles.content}>
                    <Text style={[styles.name, { color: Color.textPrimary }]}>{cardData.name}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 8,
        marginVertical: 4,
    },
    loadingContainer: {
        width: '100%',
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 70,
    },
    images: {
        width: 50,
        height: 50,
        borderRadius: 25
    },
    mainContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    content: {
        flex: 1,
        paddingHorizontal: 10,
        justifyContent: 'space-between'
    },
    name: {
        fontSize: 17
    }
});

export default CardSearch;