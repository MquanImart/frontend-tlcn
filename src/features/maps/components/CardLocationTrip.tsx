import { CLocation } from "@/src/interface/interface_detail"
import CIconButton from "@/src/shared/components/button/CIconButton"
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"

interface CardLocationTripProps {
    location: CLocation;
    isChange?: boolean;
    onClick: (locationId?: string) => void;
    deletePress?: () => void;
    changePosition?: (up: boolean) => void;
}
const CardLocationTrip = ( { location, isChange = false, onClick, deletePress, changePosition } : CardLocationTripProps) => {
    useTheme();
    return(
        <TouchableOpacity
            style={[
                styles.cardCotent,
                styles.shadow,
                { backgroundColor: Color.background } 
            ]}
            onPress={() => {onClick(location._id)}}
        >
            <Text
              style={[styles.textContent, { color: Color.textPrimary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {location.displayName}
            </Text>
            { isChange && <View style={styles.boxAction}>
                <CIconButton icon={<Icon name={"arrow-upward"} size={20} color={Color.textPrimary}/>} 
                    onSubmit={() => {changePosition && changePosition(true)}}
                    style={{
                        width: 40,
                        height: 40,
                        fontSize: 13,
                        radius: 50,
                        flex_direction: 'row',
                        backColor: 'transparent', 
                        textColor: 'transparent' 
                    }}
                />
                <CIconButton icon={<Icon name={"arrow-downward"} size={20} color={Color.textPrimary}/>} 
                    onSubmit={() => {changePosition && changePosition(false)}}
                    style={{
                        width: 40,
                        height: 40,
                        fontSize: 13,
                        radius: 50,
                        flex_direction: 'row',
                        backColor: 'transparent',
                        textColor: 'transparent'
                    }}
                />
                <CIconButton icon={<Icon name={"clear"} size={20} color={Color.textPrimary}/>} 
                    onSubmit={() => {deletePress && deletePress()}}
                    style={{
                        width: 40,
                        height: 40,
                        fontSize: 13,
                        radius: 50,
                        flex_direction: 'row',
                        backColor: 'transparent',
                        textColor: 'transparent'
                    }}
                />
            </View>}
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    cardCotent: {
        width: '100%',
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
        marginVertical: 2
    },
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    textContent: {
        width: '65%',
    },
    boxAction: {
        width: 110,
        justifyContent: 'space-between',
        flexDirection: 'row',
    }
  });

export default CardLocationTrip;