export const getRole = (groupData, currentUserId) => {
    if (!groupData) return "Guest";
  
    if (currentUserId === groupData?.idCreater?.id) {
      return "Owner"; // Người tạo nhóm
    }
  
    if (groupData?.Administrators?.some((admin) => admin.id === currentUserId)) {
      return "Admin"; // Quản trị viên
    }
  
    if (groupData?.members?.some((member) => member.id === currentUserId)) {
      return "Member"; // Thành viên đã được chấp nhận
    }
  
    return "Guest"; // Không thuộc nhóm
  };
  