import { Page } from "@/src/interface/interface_reference";

export const getUserRole = (page: Page, userId: string) => {
    if (page.idCreater === userId) {
      return "isOwner"; // ✅ Chủ sở hữu Page
    }
  
    if (page.listAdmin?.some((admin) => admin.idUser === userId && admin.state === "accepted" ) ) {
      return "isAdmin"; 
    }

    if (page.follower?.includes(userId)) {
        return "isFollower"; 
    }
    
    return "isViewer";
};
  