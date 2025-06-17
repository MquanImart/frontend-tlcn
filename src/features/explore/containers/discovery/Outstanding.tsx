import { ActivityIndicator, Text, View, StyleSheet, FlatList, ScrollView } from "react-native"
import useOutstanding from "./useOutstanding";
import CardPage from "../../components/CardPage";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { useSuggestedPages } from "@/SuggestedPageContext";

interface OutstandingProps {
    handleScroll: (event: { nativeEvent: { contentOffset: { y: any; }; }; }) => void;
}
const Outstanding = ({handleScroll} : OutstandingProps) => {
    useTheme();
    const { handleNavigateToPage } = useOutstanding();
    const { suggestedPageCF, suggestedPageCB, suggestedPageMonth } = useSuggestedPages();

    const renderPageList = (data: any[] | null) => {
        if (!data) {
            return (
                <View style={styles.activityIndicatorContainer}>
                    <ActivityIndicator size="large" color={Color.mainColor2} />
                </View>
            );
        }
        return (
            <FlatList
                data={data}
                keyExtractor={(item, index) => index.toString()}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                style={styles.listPage}
                renderItem={({ item }) => (
                    <View style={{ marginRight: 12 }}>
                        <CardPage
                            images={item.avt?.url || null}
                            name={item.name}
                            country={"Viet Nam"}
                            size={{
                                width: 150,
                                height: 200
                            }}
                            onPress={() => handleNavigateToPage(item._id)}
                        />
                    </View>
                )}
            />
        );
    };

    return (
        <ScrollView style={styles.container} onScroll={handleScroll}>
            <View style={[styles.listContent, { backgroundColor: Color.backgroundSecondary }, {
                shadowColor: Color.shadow,
                shadowOffset: {
                    width: 0,
                    height: 4,
                },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
                elevation: 8,
            }]}>
                <Text style={[styles.label, { color: Color.mainColor2 }]}>Đề xuất cho bạn</Text>
                {renderPageList(suggestedPageCB)}
            </View>
            <View style={[styles.listContent, { backgroundColor: Color.backgroundSecondary }, {
                shadowColor: Color.shadow,
                shadowOffset: {
                    width: 0,
                    height: 4,
                },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
                elevation: 8,
            }]}>
                <Text style={[styles.label, { color: Color.mainColor2 }]}>Có thể bạn thích</Text>
                {renderPageList(suggestedPageCF)}
            </View>
            <View style={[styles.listContent, { backgroundColor: Color.backgroundSecondary }, {
                shadowColor: Color.shadow,
                shadowOffset: {
                    width: 0,
                    height: 4,
                },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
                elevation: 8,
            }]}>
                <Text style={[styles.label, { color: Color.mainColor2 }]}>Nổi bật trong tháng</Text>
                {renderPageList(suggestedPageMonth)}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 520,
    },
    listContent: {
        width: '96%',
        height: 260,
        marginHorizontal: "2%",
        marginVertical: 10,
        borderRadius: 20,
    },
    label: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingHorizontal: 20,
        marginVertical: 10,
    },
    listPage: {
        width: '90%',
        height: 200,
        alignSelf: 'center',
    },
    activityIndicatorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Outstanding;