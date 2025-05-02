import { CLocation, Trip } from "@/src/interface/interface_detail";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";

const useListTrip = () => {

    const [trips, setTrips] = useState<Trip[] | null>(null);

    const getListTrip = async () => {
      const userId = await AsyncStorage.getItem("userId");
      if (userId){
        const mapAPI = restClient.apiClient.service(`apis/users/${userId}/trips`);
        const result = await mapAPI.find({})
        if (result.success){
          setTrips(result.trips);
        }
      }
    }

    const createTrip = async (name: string, startLocation: CLocation, endLocation: CLocation) => {
      const userId = await AsyncStorage.getItem("userId");
      if (userId && name !== ""){
        const mapAPI = restClient.apiClient.service(`apis/users/${userId}/trips`);
        const result = await mapAPI.create({
          name: name,
          startAddress: {
              displayName: startLocation.displayName,
              latitude: startLocation.latitude,
              longitude: startLocation.longitude,
              address: startLocation.address
          },
          endAddress: {
              displayName: endLocation.displayName,
              latitude: endLocation.latitude,
              longitude: endLocation.longitude,
              address: endLocation.address
          }
        })
        if (result.success){
          if (trips){
            setTrips([
              ...trips,
              result.trip
            ])
          }
        }
      }
    }

    const deleteTrip = async (id: string) => {
      const userId = await AsyncStorage.getItem("userId");
      if (userId){
        const mapAPI = restClient.apiClient.service(`apis/trips`);
        const result = await mapAPI.remove(id);
        if (result.success){
          if (trips){
            setTrips(trips.filter(trip => trip._id !== id));
          }
        }
      }
    }

    return {
        trips,
        getListTrip,
        createTrip,
        deleteTrip
    }
}

export default useListTrip;