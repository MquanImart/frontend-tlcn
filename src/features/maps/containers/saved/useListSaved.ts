import restClient from "@/src/shared/services/RestClient";
import { useState } from "react";
import { ILocation } from "../interfaceSaved";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useListSaved = () => {
    const [savedLocations, setSavedLocations] = useState<ILocation[]>([]);

    const getSavedLocation = async () => {
        const userId = await AsyncStorage.getItem("userId");
        if (userId){
          const mapAPI = restClient.apiClient.service(`apis/users/${userId}/saved-locations`);
          const result = await mapAPI.find({})
          if (result.success){
            setSavedLocations(result.savedLocations);
          }
        }
    }

    const deleteLocation = async (savedId: string) => {
        const userId = await AsyncStorage.getItem("userId");
        if (userId){
          const mapAPI = restClient.apiClient.service(`apis/users/${userId}/delete-saved-location`);
          const result = await mapAPI.delete({savedId: savedId})
          if (result.success){
            setSavedLocations(savedLocations.filter(saved => saved._id !== savedId));
          }
        }
    }

    return {
        savedLocations,
        getSavedLocation, deleteLocation,
    }
}

export default useListSaved;