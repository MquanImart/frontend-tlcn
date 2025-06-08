import Directions from "@/src/features/maps/containers/directions/Directions";
import { LocationRoute } from "@/src/features/maps/containers/directions/interfaceAPIRoute";
import { Location } from "@/src/features/maps/containers/directions/interfaceLocation";
import CustomMap from "@/src/features/maps/containers/Map";
import RealDirections from "@/src/features/maps/containers/realtime-directions/RealDirections";
import ListTrip from "@/src/features/maps/containers/trip/ListTrip";
import Trip from "@/src/features/maps/containers/trip/Trip";
import { createStackNavigator } from "@react-navigation/stack";

export type MapStackParamList = {
  CustomMap:  {
      lat: number;
      long: number;
  } | undefined;
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