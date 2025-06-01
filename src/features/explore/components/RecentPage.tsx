import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { FlatList, } from "react-native-gesture-handler";
import IconPage from "./IconPage";
import getColor from "@/src/styles/Color";
import { HistoryPage } from "@/src/interface/interface_flex";

interface RecentPagePops {
    recent: HistoryPage[] | null;
}
const RecentPage = ({recent} : RecentPagePops) => {

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Đã xem gần đây</Text>
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
            <View style={{height: 110, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator/></View>
            )}
        </View>
    )
}

const Color = getColor();
const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Color.mainColor1,
        marginTop: 20,
        paddingHorizontal: 20,
    },
    listItem: {
        alignSelf: 'center',
        width: '100%',
    }
})
export default RecentPage;