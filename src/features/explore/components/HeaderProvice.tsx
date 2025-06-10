import { ExploreStackParamList } from "@/src/shared/routes/ExploreNavigation";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { TouchableOpacity, View, StyleSheet } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons";

type ExploreNavigation = StackNavigationProp<ExploreStackParamList, "Discovery">;

const HeaderProvice = () => {
    useTheme();
    const navigation = useNavigation<ExploreNavigation>();
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={() => {navigation.goBack()}}>
                <Icon name={"chevron-left"} size={30} color={Color.white_white}/>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        position: 'absolute',
        top: 50,
        zIndex: 10
    },
    button: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)'
    },
    textButton: {
        paddingLeft: 10,
        color: Color.white_homologous
    }
})

export default HeaderProvice;