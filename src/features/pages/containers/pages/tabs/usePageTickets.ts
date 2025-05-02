import { useState, useEffect } from "react";
import { Page, Ticket } from "@/src/interface/interface_reference";
import restClient from "@/src/shared/services/RestClient";
import { Alert } from "react-native";

const ticketsClient = restClient.apiClient.service("apis/tickets");
const pagesClient = restClient.apiClient.service("apis/pages")

const usePageTickets = (page: Page, role: string) => {
  const [ticketList, setTicketList] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [canManageTickets, setCanManageTickets] = useState<boolean>(false);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      if (!page.listTicket || page.listTicket.length === 0) {
        setLoading(false);
        return;
      }

      const fetchedTickets = await Promise.all(
        page.listTicket.map(async (ticketId) => {
          const response = await ticketsClient.get(ticketId);
          return response.success ? response.data : null;
        })
      );

      const validTickets = fetchedTickets.filter((ticket) => ticket !== null);
      setTicketList(validTickets);
    } catch (error) {
      console.error("❌ Lỗi khi lấy vé:", error);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (ticket: Omit<Ticket, "_id">) => {
    try {
      const ticketData = { ...ticket, pageId: page._id };
      const response = await ticketsClient.create(ticketData);
  
      if (response.success) {
        setTicketList(response.data.updatedPage.listTicket);
        Alert.alert("Thành công", "Vé đã được tạo.");
      } else {
        console.error("Lỗi khi tạo vé:", response.message);
        Alert.alert("Lỗi", response.message || "Không thể tạo vé.");
      }
    } catch (error: any) {
      console.error("Lỗi khi gửi yêu cầu tạo vé:", error.message || error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tạo vé. Vui lòng thử lại.");
    }
  };

  const deleteTicket = async (ticketId: string) => {
    try {

      // Bước 1: Xóa vé qua API DELETE
      const ticketResponse = await ticketsClient.remove(ticketId);

      if (!ticketResponse.success) {
        console.error("❌ Lỗi khi xóa vé:", ticketResponse.message);
        Alert.alert("Lỗi", ticketResponse.message || "Không thể xóa vé.");
        return;
      }

      const pageUpdateData = {
        $pull: { listTicket: ticketId }, 
      };
      const pageResponse = await pagesClient.patch(page._id, pageUpdateData);

      if (pageResponse.success) {
        setTicketList((prevTickets) => prevTickets.filter((ticket) => ticket._id !== ticketId));
        Alert.alert("Thành công", "Vé đã được xóa.");
      } else {
        console.error("❌ Lỗi khi cập nhật Page:", pageResponse.message);
        Alert.alert("Lỗi", "Xóa vé thành công nhưng không thể cập nhật Page: " + pageResponse.message);
      }
    } catch (error: any) {
      console.error("❌ Lỗi khi xóa vé hoặc cập nhật Page:", error.message || error);
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
    handleDeleteTicket
  };
};

export default usePageTickets;
