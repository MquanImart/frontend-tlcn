import { MyPhoto } from "@/src/interface/interface_flex";
import getColor from "@/src/styles/Color";
import { Text, TouchableOpacity, View, StyleSheet, Image } from "react-native";

const Color = getColor();

interface PreviewImagesProps {
    handleSelected: (_id: string) => void;
    src: MyPhoto[];
}

const PreviewImages = ({ handleSelected, src }: PreviewImagesProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.boxTitle}>
                <TouchableOpacity>
                </TouchableOpacity>
            </View>
            <View style={styles.boxImages}>
                {src.reduce((rows: MyPhoto[][], item, index) => {
                    if (index % 3 === 0) rows.push([]); // Chia mỗi hàng có 3 ảnh
                    rows[rows.length - 1].push(item);
                    return rows;
                }, []).map((row, rowIndex) => (
                    <View style={styles.row} key={rowIndex}>
                        {row.map((item) => (
                            <TouchableOpacity key={item._id} style={styles.item} onPress={() => handleSelected(item._id)}>
                                <Image source={{ uri: item.url }} style={styles.image} />
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 'auto', // Chiều cao tự động theo số lượng ảnh
    },
    boxTitle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    textViewAll: {
        color: Color.textColor3,
        fontSize: 14,
    },
    boxImages: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2, // Khoảng cách giữa các hàng
    },
    item: {
        width: '33%', // Mỗi ảnh chiếm 1/3 hàng
        height: 200, // Điều chỉnh chiều cao ảnh
        gap: 1,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
});

export default PreviewImages;
