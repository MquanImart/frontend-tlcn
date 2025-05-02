import { useState, useEffect } from "react";
import { Address } from "@/src/interface/interface_reference";
import restClient from "@/src/shared/services/RestClient";

const addessesClient = restClient.apiClient.service("apis/addresses");

const useLocationInfo = (addressId: string) => {
  const [address, setAddress] = useState<Address | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); 

  const getAddress = async () => {
    if (!addressId) {
      setError("Không có addressId được cung cấp");
      setLoading(false);
      return;
    }

    try {
      const response = await addessesClient.get(addressId);
      if (response.success) {
        setAddress(response.data);
      } else {
        setError(response.messages || "Không thể tải địa chỉ");
      }
    } catch (err) {
      setError("Lỗi khi lấy dữ liệu địa chỉ");
      console.error("Error fetching address:", err);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    setLoading(true); 
    getAddress();
  }, [addressId]);

  return {
    address,
    error,
    loading, 
  };
};

export default useLocationInfo;