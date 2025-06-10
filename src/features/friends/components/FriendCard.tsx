import { MyPhoto } from "@/src/interface/interface_reference";
import { MenuStackParamList } from "@/src/shared/routes/MenuNavigation";
import { SearchStackParamList } from "@/src/shared/routes/SearchNavigation";
import timeAgo from "@/src/shared/utils/TimeAgo";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors'; // Ensure this import is correct
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackNavigationProp } from "@react-navigation/stack";
import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface FriendCardProps {
    _id: string;
    name: string;
    img: MyPhoto[];
    sameFriends?: number;
    sameGroups?:  number;
    aboutMe: string;
    sendDate?: number;
    button: () => React.JSX.Element;
    profile?: boolean;
}

type NavigationProp = NativeStackNavigationProp<MenuStackParamList>;
type ProfileNavigationProp = StackNavigationProp<SearchStackParamList>;

const FriendCard = ({_id, name, img, sameFriends, sameGroups, aboutMe, sendDate, button, profile}: FriendCardProps) => {
    useTheme(); // Ensures dynamic colors are available
    const menuNavigation = useNavigation<NavigationProp>();
    const profileNavigation = useNavigation<ProfileNavigationProp>();

    const goToProfile = () => {
      if (profile){
        profileNavigation.navigate('MyProfile', {
          screen: 'Profile',
          params: { userId: _id },
        });
      } else {
        menuNavigation.navigate('MyProfile', {
          screen: 'Profile',
          params: { userId: _id },
        });
      }
    };

    return (
        <View key={`view-${_id}`} style={[
            styles.container,
            {
                backgroundColor: Color.backgroundSecondary,
                shadowColor: Color.shadow,
            }
        ]}>
            <View style={styles.boxImages}>
                <Image
                    style={styles.images}
                    source={ img && img.length > 0 && img[0].url ? {uri: img[0].url} : require("@/src/assets/images/default/default_user.png")}
                />
            </View>
            <View style={styles.boxContent}>
                <TouchableOpacity
                    style={styles.boxTilte}
                    onPress={goToProfile}
                >
                    {/* Apply dynamic text color */}
                    <Text style={[styles.title, { color: Color.textPrimary }]}>{name}</Text>
                    {/* Apply dynamic text color */}
                    <Text style={[styles.textDate, { color: Color.textSecondary }]}>{sendDate ? timeAgo(sendDate) : ""}</Text>
                </TouchableOpacity>
                <View style={styles.boxSame}>
                    {/* Apply dynamic text color */}
                    {sameFriends !== undefined && <Text style={[styles.textSame, { color: Color.textSecondary }]}>{sameFriends} bạn chung</Text>}
                    {/* Apply dynamic text color */}
                    {sameGroups !== undefined && <Text style={[styles.textSame, { color: Color.textSecondary }]}>{sameGroups} nhóm chung</Text>}
                </View>
                {/* Apply dynamic text color */}
                <Text style={[styles.content, { color: Color.textPrimary }]} numberOfLines={2} ellipsizeMode="tail">{aboutMe}</Text>
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
        // backgroundColor and shadowColor are now applied inline in the component's style prop
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
        fontSize: 17,
        // color is applied inline
    },
    textDate: {
        fontSize: 8,
        // color is applied inline
    },
    boxSame: {
        flexDirection: 'row'
    },
    textSame: {
        fontSize: 10,
        paddingRight: 10,
        // color is applied inline
    },
    content: {
        fontSize: 12,
        // color is applied inline
    }
})

export default FriendCard;