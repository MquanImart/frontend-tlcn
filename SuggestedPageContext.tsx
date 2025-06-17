import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyPhoto } from './src/interface/interface_reference';
import restClient from './src/shared/services/RestClient';

interface OutstandingProps{
    _id: string;
    name: string;
    avt: MyPhoto;
    score?: number;
}

interface SuggestedContextProps {
  suggestedPageCF: OutstandingProps[] | null;
  suggestedPageCB: OutstandingProps[] | null;
  suggestedPageMonth: OutstandingProps[] | null;
  fetchSuggested: () => Promise<void>;
}

const SuggestedContext = createContext<SuggestedContextProps>({
  suggestedPageCF: null,
  suggestedPageCB: null,
  suggestedPageMonth: null,
  fetchSuggested: async () => {},
});

export const SuggestedProvider = ({ children }: { children: React.ReactNode }) => {
  const [suggestedPageCF, setSuggestedPageCF] = useState<OutstandingProps[] | null>(null);
  const [suggestedPageCB, setSuggestedPageCB] = useState<OutstandingProps[] | null>(null);
  const [suggestedPageMonth, setSuggestedPageMonth] = useState<OutstandingProps[] | null>(null);

  const fetchSuggested = async () => {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) return;

    try {
      const CFAPI = restClient.apiClient.service(`apis/ai/suggested-page-CF`);
      const resultCF = await CFAPI.get(userId);
      if (resultCF.success) setSuggestedPageCF(resultCF.data);

      const CBAPI = restClient.apiClient.service(`apis/ai/suggested-page-CB`);
      const resultCB = await CBAPI.get(userId);
      if (resultCB.success) {
        const result = resultCB.data.map((item: { page: OutstandingProps }) => item.page);
        setSuggestedPageCB(result);
      }

      const now = new Date();
      const month = now.getMonth() + 1;
      const MonthAPI = restClient.apiClient.service(`apis/ai/suggested-page-month/${userId}`);
      const resultMonth = await MonthAPI.find({ month });
      if (resultMonth.success) {
        const result = resultMonth.data.map((item: { page: OutstandingProps }) => item.page);
        setSuggestedPageMonth(result);
      }
    } catch (err) {
      console.error('Lỗi fetchSuggested:', err);
    }
  };

  return (
    <SuggestedContext.Provider
      value={{ suggestedPageCF, suggestedPageCB, suggestedPageMonth, fetchSuggested }}
    >
      {children}
    </SuggestedContext.Provider>
  );
};

// Custom hook
export const useSuggestedPages = () => useContext(SuggestedContext);
