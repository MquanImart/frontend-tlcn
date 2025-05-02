import { ActivityIndicator, Text, View, StyleSheet, FlatList, ScrollView } from "react-native"
import useOutstanding from "./useOutstanding";
import { useEffect } from "react";
import CardPage from "../../components/CardPage";
import getColor from "@/src/styles/Color";

interface OutstandingProps {
    handleScroll: (event: { nativeEvent: { contentOffset: { y: any; }; }; }) => void;
}
const Outstanding = ({handleScroll} : OutstandingProps) => {
    const { suitablePages, sugOfMonth, 
        getAllPage, handleNavigateToPage 
    } = useOutstanding();

    useEffect(() => {
        getAllPage();
    }, []);

    return (
        <ScrollView style={styles.container} onScroll={handleScroll}>
            <View style={[styles.listContent, styles.shadow]}>
                <Text style={styles.label}>Đề xuất cho bạn</Text>
                {suitablePages ? (
                <FlatList
                  data={suitablePages}
                  keyExtractor={(item, index) => index.toString()}
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  style={styles.listPage}
                  renderItem={({ item }) => (
                    <View style={{ marginRight: 12 }}>
                    <CardPage 
                      images={item.avt ? item.avt : "https://picsum.photos/200"} 
                      name={item.name} 
                      country={"Viet Nam"} 
                      distance={2.3} 
                      size={{
                        width: 150,
                        height: 200
                      }}
                      onPress={() => handleNavigateToPage(item._id)}
                    />
                    </View>
                  )}
                />
                ): (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator/></View>
                )}
            </View>
            <View style={[styles.listContent, styles.shadow]}>
                <Text style={styles.label}>Nổi bật trong tháng</Text>
                {sugOfMonth ? (
                <FlatList
                  data={sugOfMonth}
                  keyExtractor={(item, index) => index.toString()}
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  style={styles.listPage}
                  renderItem={({ item }) => (
                    <View style={{ marginRight: 12 }}>
                    <CardPage 
                      images={item.avt ? item.avt : "https://picsum.photos/200"} 
                      name={item.name} 
                      country={"Viet Nam"} 
                      distance={2.3} 
                      size={{
                        width: 150,
                        height: 200
                      }}
                      onPress={() => handleNavigateToPage(item._id)}
                    />
                    </View>
                  )}
                />
                ): (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator/></View>
                )}
            </View>
        </ScrollView>
    )
}

const Color = getColor();
const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 520
    },
    listContent: {
        width: '96%',
        height: 260,
        backgroundColor: Color.white_homologous,
        marginHorizontal: "2%",
        marginVertical: 10,
        borderRadius: 20
    },
    shadow: {
        shadowColor: "#000", // Màu bóng
        shadowOffset: {
          width: 0, // Đổ bóng theo chiều ngang
          height: 4, // Đổ bóng theo chiều dọc
        },
        shadowOpacity: 0.3, // Độ mờ của bóng (0 - 1)
        shadowRadius: 4.65, // Độ mờ viền của bóng
        elevation: 8, // Dùng cho Android (giá trị càng cao bóng càng đậm)
    },
    label: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Color.mainColor1,
        paddingHorizontal: 20,
        marginVertical: 10,
    },
    listPage: {
        width: '90%',
        height: 200,
        alignSelf: 'center'
    }
})

export default Outstanding;