import { MyPhoto } from "@/src/interface/interface_reference";
import { MenuStackParamList } from "@/src/shared/routes/MenuNavigation";
import timeAgo from "@/src/shared/utils/TimeAgo";
import getColor from "@/src/styles/Color";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image, Text, View, StyleSheet, TouchableOpacity } from "react-native"

const Color = getColor();

export interface FriendCardProps {
    _id: string;
    name: string;
    img: MyPhoto[];
    sameFriends?: number;
    sameGroups?:  number;
    aboutMe: string;
    sendDate?: number;
    button: () => React.JSX.Element;
}

type NavigationProp = NativeStackNavigationProp<MenuStackParamList>;

const FriendCard = ({_id, name, img, sameFriends, sameGroups, aboutMe, sendDate, button}: FriendCardProps) => {
    const navigation = useNavigation<NavigationProp>();

    const goToProfile = () => {
      navigation.navigate('MyProfile', {
        screen: 'Profile',
        params: { userId: _id },
      });
    };

    return (
        <View key={`view-${_id}`} style={styles.container}>
            <View style={styles.boxImages}>
                <Image style={styles.images} source={ img.length > 0 ? {uri: img[0].url} : require("@/src/assets/images/default/default_user_male.png")}/>
            </View>
            <View style={styles.boxContent}>
                <TouchableOpacity style={styles.boxTilte} 
                    onPress={goToProfile}
                >
                    <Text style={styles.title}>{name}</Text>
                    <Text style={styles.textDate}>{sendDate?timeAgo(sendDate) :""}</Text>
                </TouchableOpacity>
                <View style={styles.boxSame}>
                    {sameFriends !== undefined && <Text style={styles.textSame}>{sameFriends} bạn chung</Text>}
                    {sameGroups !== undefined && <Text style={styles.textSame}>{sameGroups} nhóm chung</Text>}
                </View>
                <Text style={styles.content} numberOfLines={2} ellipsizeMode="tail">{aboutMe}</Text>
                {button()}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignSelf: 'center',
        borderRadius: 10,
        paddingVertical: 10,
        backgroundColor: Color.backGround,
        shadowColor: Color.white_contrast,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    boxImages: {
        paddingHorizontal: 10,
    },
    images: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    boxContent: {
        width: '65%',
        justifyContent: 'space-between',
        paddingRight: 10,
    },
    boxTilte: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        fontWeight: 'bold',
        fontSize: 17
    },
    textDate: {
        fontSize: 8
    },
    boxSame: {
        flexDirection: 'row'
    },
    textSame: {
        fontSize: 10,
        paddingRight: 10,
    },
    content: {
        fontSize: 12
    }
})

export default FriendCard;