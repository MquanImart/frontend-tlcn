import { MyPhoto } from "@/src/interface/interface_reference";
import { ExploreStackParamList } from "@/src/shared/routes/ExploreNavigation";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type NavigationProps = StackNavigationProp<ExploreStackParamList, 'Discovery'>;
interface IconPageProps {
    avt: MyPhoto;
    name: string;
    _id: string;
}

const IconPage = ({avt, name, _id}: IconPageProps) => {
    useTheme();
    const navigation = useNavigation<NavigationProps>();
    const handleNavigateToPage = async (pageId: string) => {
      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        navigation.navigate("PageNavigation", {
          screen: "PageScreen",
          params: {
            pageId,
            currentUserId: userId,
          },
        });
      }
    };

    return (
        <TouchableOpacity style={styles.container}
            onPress={() => handleNavigateToPage(_id)}
        >
            <View style={[styles.boxImages, { borderColor: Color.mainColor2 }]}>
                <Image style={styles.images} source={{uri: avt.url}}/>
            </View>
            <Text
                style={[styles.textName, { color: Color.mainColor2 }]}
                numberOfLines={1}
                ellipsizeMode="tail"
            >
                {name}
            </Text>
        </TouchableOpacity>
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
    },
    images: {
        width: 50, height: 50,
        borderRadius: 50,
    },
    textName: {
        maxWidth: 60,
        fontSize: 10,
        fontWeight: '600',
        marginVertical: 5
    }
})
export default IconPage;