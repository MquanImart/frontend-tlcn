import MapView, { Marker, Polyline } from 'react-native-maps';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import useRealDirections from './useRealDirections';
import { MapStackParamList } from '@/src/shared/routes/MapNavigation';
import { RouteProp, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import CIconButton from '@/src/shared/components/button/CIconButton';

const RealDirections = () => {
    useTheme();
    const route = useRoute<RouteProp<MapStackParamList, "Realtime">>();
    const {locations} = route.params || {};
    const {
        destinations, location,
        mapRef,
        focusUserLocation,
        navigation,
        coordinates,
        handleSos
    } = useRealDirections(locations);

    return (
        <View style={{ flex: 1 }}>
          {location ? (
            <MapView
            ref={mapRef}
            style={styles.map}
            initialCamera={{
              center: {
                latitude: location.latitude,
                longitude: location.longitude,
              },
              pitch: 50,
              heading: 0,
              altitude: 500,
              zoom: 15,
            }}
            showsUserLocation={true}
            followsUserLocation={false}
          >
            {destinations.map((item, index) =>
              <Marker
              key={`marker-${index}`}
              coordinate={{
                latitude: item.latitude,
                longitude: item.longitude,
              }}
              title={`Điểm đến thứ ${index + 1}`}
            />
            )}

            {coordinates.length > 0 && (
              <Polyline coordinates={coordinates} strokeWidth={4} strokeColor={Color.mainColor2} />
            )}
          </MapView>
          ) : (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator color={Color.mainColor2}/></View>
          )}
          <View style={styles.boxAction}>
              <CIconButton icon={<Icon name={"sos"} size={30} color={Color.textPrimary} />}
                  onSubmit={() => {handleSos()}} style={{
                  width: 50,
                  height: 50,
                  backColor: Color.backgroundSecondary,
                  radius: 50,
              }}/>
              <CIconButton icon={<Icon name={"adjust"} size={30} color={Color.textPrimary} />}
                  onSubmit={() => {focusUserLocation()}} style={{
                  width: 50,
                  height: 50,
                  backColor: Color.backgroundSecondary,
                  fontWeight: "bold",
                  radius: 50,
                  flex_direction: "row",
              }}/>
              <CIconButton icon={<Icon name={"close"} size={30} color={Color.textPrimary} />}
                  onSubmit={() => {navigation.goBack()}} style={{
                  width: 50,
                  height: 50,
                  backColor: Color.backgroundSecondary,
                  radius: 50,
              }}/>
          </View>
        </View>
    )
}

const styles = StyleSheet.create({
    map: {
      flex: 1,
    },
    boxAction: {
        position: 'absolute',
        height: 200,
        bottom: 30,
        right: 10,
        paddingHorizontal: 20,
        justifyContent: 'space-around'
    }
  });

export default RealDirections;