import { Page, Ticket } from "@/src/interface/interface_reference";
import restClient from "@/src/shared/services/RestClient";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

const ticketsClient = restClient.apiClient.service("apis/tickets");
const pagesClient = restClient.apiClient.service("apis/pages");

const usePageTickets = (page: Page, role: string, updatePage: () => void) => {
  const [ticketList, setTicketList] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [canManageTickets, setCanManageTickets] = useState<boolean>(false);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      if (!page.listTicket || page.listTicket.length === 0) {
        console.log("No tickets found for page:", page._id);
        setTicketList([]);
        setLoading(false);
        return;
      }

      console.log("Fetching tickets for IDs:", page.listTicket);

      const fetchedTickets = await Promise.all(
        page.listTicket.map(async (ticketId) => {
          try {
            const response = await ticketsClient.get(ticketId);
            if (response.success && response.data && !response.data._destroy) {
              return response.data;
            }
            console.log(`Ticket ${ticketId} is deleted or not found`);
            return null;
          } catch (error) {
            console.error(`❌ Error fetching ticket ${ticketId}:`, error);
            return null;
          }
        })
      );

      const validTickets = fetchedTickets.filter((ticket): ticket is Ticket => ticket !== null);
      console.log("Fetched valid tickets:", validTickets.map(t => ({ _id: t._id, name: t.name })));
      setTicketList(validTickets);
    } catch (error) {
      console.error("❌ Error fetching tickets:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách vé.");
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (ticket: Omit<Ticket, "_id">) => {
    try {
      const ticketData = { ...ticket, pageId: page._id };
      console.log("Creating ticket with data:", ticketData);
      const response = await ticketsClient.create(ticketData);

      if (response.success) {
        console.log("Created ticket:", response.data);
        await fetchTicket(); // Refresh local ticket list
        updatePage(); // Refresh page object
        Alert.alert("Thành công", "Vé đã được tạo.");
      } else {
        console.error("❌ Error creating ticket:", response.message);
        Alert.alert("Lỗi", response.message || "Không thể tạo vé.");
      }
    } catch (error: any) {
      console.error("❌ Error sending create ticket request:", error.message || error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tạo vé. Vui lòng thử lại.");
    }
  };

  const deleteTicket = async (ticketId: string) => {
    try {
      console.log("Deleting ticket:", ticketId);
      const ticketResponse = await ticketsClient.remove(ticketId);

      if (!ticketResponse.success) {
        console.error("❌ Error deleting ticket:", ticketResponse.message);
        Alert.alert("Lỗi", ticketResponse.message || "Không thể xóa vé.");
        return;
      }

      await fetchTicket(); // Refresh local ticket list
      updatePage(); // Refresh page object
      Alert.alert("Thành công", "Vé đã được xóa.");
    } catch (error: any) {
      console.error("❌ Error deleting ticket:", error.message || error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi xóa vé. Vui lòng thử lại.");
    }
  };

  const handleDeleteTicket = (ticketId: string) => {
    Alert.alert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa vé này?", [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", onPress: () => deleteTicket(ticketId), style: "destructive" },
    ]);
  };

  useEffect(() => {
    setCanManageTickets(role === "isAdmin" || role === "isOwner");
  }, [role]);

  useEffect(() => {
    fetchTicket();
  }, [page]);

  return {
    ticketList,
    loading,
    createTicket,
    deleteTicket,
    canManageTickets,
    handleDeleteTicket,
  };
};

export default usePageTickets;