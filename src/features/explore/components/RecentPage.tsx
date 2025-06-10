import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { FlatList, } from "react-native-gesture-handler";
import IconPage from "./IconPage";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { HistoryPage } from "@/src/interface/interface_flex";

interface RecentPagePops {
    recent: HistoryPage[] | null;
}
const RecentPage = ({recent} : RecentPagePops) => {
    useTheme();
    return (
        <View style={styles.container}>
            <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: Color.mainColor2, // Màu chữ động
                marginTop: 20,
                paddingHorizontal: 20,
            }}>Đã xem gần đây</Text>
            {recent ? (<FlatList
              style={styles.listItem}
              data={recent}
              renderItem={({item}) => 
                <IconPage avt={item.idPage.avt} name={item.idPage.name} _id={item.idPage._id}/>
            }
              keyExtractor={(item) => item.idPage._id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
            ) : (
            <View style={{height: 110, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator color={Color.mainColor2}/></View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    listItem: {
        alignSelf: 'center',
        width: '100%',
    }
})
export default RecentPage;