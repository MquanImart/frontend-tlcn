import { Trip } from "@/src/interface/interface_detail";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { LocationRoute } from "../directions/interfaceAPIRoute";

const useTrip = (tripId: string) => {

    const [trip, setTrip] = useState<Trip | null>(null);

    const getTrip = async () => {
        const userId = await AsyncStorage.getItem("userId");
        if (userId){
          const mapAPI = restClient.apiClient.service(`apis/trips`);
          const result = await mapAPI.get(tripId);
          if (result.success){
            setTrip(result.data);
          }
        }
    }

    const updateTrip = async (id: string, data: Trip) => {  
        const userId = await AsyncStorage.getItem("userId");
        if (userId){
          const mapAPI = restClient.apiClient.service(`apis/trips`);
          const result = await mapAPI.patch(id, {
            name: data.name,
            startAddress: data.startAddress,
            listAddress: data.listAddress,
            endAddress: data.endAddress
          })
          if (result.success){
            setTrip(result.data);
          }
        }
    }

    const addNewLocation = async (id: string, newLocation: LocationRoute) => {  
        const userId = await AsyncStorage.getItem("userId");
        if (userId){
          const mapAPI = restClient.apiClient.service(`apis/trips/${id}/locations`);
          const result = await mapAPI.create({
            displayName: newLocation.displayName?newLocation.displayName : "Không xác định",
            latitude: newLocation.latitude,
            longitude: newLocation.longitude,
            address: newLocation.address?newLocation.address:"Không xác định"
          })
          if (result.success){
            return result.data;
          }
        }
        return null;
    }

    const deleteLocation = async (id: string, locationId: string) => {  
      const userId = await AsyncStorage.getItem("userId");
      if (userId){
        const mapAPI = restClient.apiClient.service(`apis/trips/${id}/locations`);
        const result = await mapAPI.delete({locationId: locationId})
        if (result.success){
          return true;
        }
      }
      return false;
    }

    const changePosition = async (id: string, locationId1: string | undefined, locationId2: string | undefined) => {  
      const userId = await AsyncStorage.getItem("userId");
      if (userId && locationId1 && locationId2){
        const mapAPI = restClient.apiClient.service(`apis/trips/${id}/locations`);
        const result = await mapAPI.updateQuery({locationId1: locationId1, locationId2: locationId2})
        if (result.success){
          return true;
        }
      }
      return false;
    }

    const changeListTrip = (newTrip: Trip) => {
      if (trip){
        setTrip({
          ...trip,
          listAddress: newTrip.listAddress
        });
      }
    }

    return {
        trip, getTrip,
        setTrip,
        updateTrip,
        addNewLocation,
        deleteLocation,
        changePosition,
        changeListTrip
    }
}

export default useTrip;