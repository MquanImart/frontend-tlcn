import { MyPhoto } from "@/src/interface/interface_flex";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"; 

interface PreviewImagesProps {
    handleSelected: (_id: string) => void;
    src: MyPhoto[];
}

const PreviewImages = ({ handleSelected, src }: PreviewImagesProps) => {
    useTheme()
    return (
        <View style={styles.container}>
            <View style={styles.boxTitle}>
                <TouchableOpacity>
                </TouchableOpacity>
            </View>
            <View style={styles.boxImages}>
                {src.reduce((rows: MyPhoto[][], item, index) => {
                    if (index % 3 === 0) rows.push([]); 
                    rows[rows.length - 1].push(item);
                    return rows;
                }, []).map((row, rowIndex) => (
                    <View style={styles.row} key={rowIndex}>
                        {row.map((item) => (
                            <TouchableOpacity key={item._id} style={[styles.item, { backgroundColor: Color.background }]} onPress={() => handleSelected(item._id)}>
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
        height: 'auto',
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
        marginBottom: 2, 
    },
    item: {
        width: '33%', 
        height: 200,
        gap: 1,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
});

export default PreviewImages;