import Directions from "@/src/features/maps/containers/directions/Directions";
import { LocationRoute } from "@/src/features/maps/containers/directions/interfaceAPIRoute";
import CustomMap from "@/src/features/maps/containers/Map";
import RealDirections from "@/src/features/maps/containers/realtime-directions/RealDirections";
import ListSaveLocation from "@/src/features/maps/containers/saved/ListSaved";
import ListTrip from "@/src/features/maps/containers/trip/ListTrip";
import Trip from "@/src/features/maps/containers/trip/Trip";
import { createStackNavigator } from "@react-navigation/stack";

export interface Location {
  latitude: number;
  longitude: number;
  displayName: string;
}

export type MapStackParamList = {
  CustomMap: undefined;
  Directions: {start?: Location, end?: Location};
  ListTrip: undefined;
  Trip: {tripId: string};
  Realtime: {locations: LocationRoute[]};
};

const Stack = createStackNavigator<MapStackParamList>();

export function MapNavigation() {
return (
    <Stack.Navigator initialRouteName="CustomMap" screenOptions={{
       headerShown: false,
    }}>
        <Stack.Screen name="CustomMap" component={CustomMap} />
        <Stack.Screen name="Directions" component={Directions} />
        <Stack.Screen name="ListTrip" component={ListTrip} />
        <Stack.Screen name="Trip" component={Trip} />
        <Stack.Screen name="Realtime" component={RealDirections}/>
    </Stack.Navigator>
);
}