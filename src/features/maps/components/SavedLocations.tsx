import CIconButton from "@/src/shared/components/button/CIconButton";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { View, StyleSheet, Text, TouchableOpacity } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons";
import { ILocation } from "../containers/interfaceSaved";

interface SavedLocationsProps {
    location: ILocation;
    deletePress: (id: string) => void;
    onPress: () => void;
}

const SavedLocations = ({ location, deletePress, onPress } : SavedLocationsProps) => {
    useTheme();
    return (
        <View style={[styles.container, { borderColor: Color.border }]}>
            <TouchableOpacity style={styles.title}
                onPress={onPress}
            >
                <Text style={[styles.namePlace, { color: Color.textPrimary }]} numberOfLines={2} ellipsizeMode="tail">
                  {location.displayName}
                </Text>
                <Text style={[styles.address, { color: Color.textSecondary }]} numberOfLines={2} ellipsizeMode="tail">
                  {location.address}
                </Text>
            </TouchableOpacity>
            <CIconButton icon={<Icon name={"clear"} size={10} color={Color.textPrimary}/>}
                onSubmit={() => {deletePress(location._id)}}
                style={{
                width: 30,
                height: 30,
                radius: 50,
                shadow: true,
                backColor: 'transparent',
                textColor: 'transparent'
            }}/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '90%',
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
    },
    title: {
        padding: 10,
        maxWidth: '90%'
    },
    namePlace: {
        fontSize: 20,
        fontWeight: '600'
    },
    address: {
        fontSize: 10,
        maxHeight: '80%'
    }
});

export default SavedLocations;