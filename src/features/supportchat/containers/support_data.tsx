const travelSocialNetwork: string = `
MẠNG XÃ HỘI DU LỊCH TÍCH HỢP CÔNG NGHỆ AI

Giới thiệu
Đây là Ứng dụng VieWay là ứng dụng mạng xã hội du lịch tích hợp công nghệ AI được phát triển bởi nhóm sinh viên Nguyễn Bảo Quốc, Phan Minh Quân, và Vũ Hoàng Gia Bảo tại Trường Đại học Sư phạm Kỹ thuật TP.HCM. Mục tiêu là tạo ra một nền tảng kết nối người dùng, chia sẻ thông tin du lịch, và cá nhân hóa trải nghiệm du lịch tại Việt Nam.

Tính cấp thiết
Bối cảnh: Ngành du lịch Việt Nam phục hồi mạnh mẽ sau Covid-19, dự kiến đón 17,6 triệu khách quốc tế năm 2024 (98% mức trước dịch). Tổng doanh thu du lịch 2022 đạt 495 nghìn tỷ đồng, vượt 23% kế hoạch.
Vấn đề: Lượng khách quốc tế chưa đạt mức trước dịch (18 triệu năm 2019). Cá nhân hóa trải nghiệm du lịch là yếu tố then chốt để thu hút du khách.
Giải pháp: Phát triển mạng xã hội du lịch tích hợp AI để:Cá nhân hóa đề xuất điểm đến, dịch vụ dựa trên sở thích người dùng.Tăng cường tương tác, chia sẻ thông tin du lịch.
Dự kiến: 24 triệu khách du lịch trực tuyến vào 2025 (tăng 25% so với 2020).
Vai trò AI: Tự động hóa, phân tích dữ liệu lớn, kiểm duyệt nội dung, đề xuất lộ trình, nâng cao trải nghiệm người dùng.

Tính năng chính
- Xác thực và quản lý người dùng: Đăng nhập, đăng ký, quên mật khẩu, cập nhật hồ sơ cá nhân.
- Quản lý bài viết: Đăng, tìm kiếm, chỉnh sửa, xóa bài viết du lịch; thích, bình luận, chia sẻ.
- AI kiểm duyệt nội dung: Lọc bài viết không liên quan đến du lịch hoặc chứa nội dung nhạy cảm (text và ảnh).
- Nhắn tin và kết nối: Nhắn tin trực tiếp, tạo nhóm, tham gia nhóm du lịch, chatbot hỗ trợ trả lời câu hỏi.
- Trang điểm đến: Xem thông tin, bài viết, hình ảnh, thời tiết, bản đồ của các điểm du lịch nổi tiếng.
- Tìm kiếm và đề xuất: Nhận diện địa điểm qua hình ảnh, đề xuất lộ trình du lịch, tìm kiếm người dùng/nhóm/bài viết.
- Tích hợp bản đồ và thời tiết: Xem bản đồ, chỉ đường, thông tin thời tiết theo địa điểm.

 Công nghệ sử dụng
- Backend: Node.js + Express.js (API RESTful), MongoDB (cơ sở dữ liệu NoSQL).
- Frontend: React Native (ứng dụng di động cho Android và iOS), TypeScript.
- Bảo mật: JSON Web Token (JWT) để xác thực và bảo vệ dữ liệu.
- AI:Kiểm duyệt nội dung: FastText, LSTM, GRU (text); Cloud Vision (hình ảnh).Gợi ý bài viết: Thuật toán Collaborative Filtering.Chatbot: Gemini 1.5 Flash (trả lời nhanh, chi phí thấp).Phân tích ngôn ngữ: PhoBERT (NLP tiếng Việt).
- Hoàn thiện mạng xã hội du lịch với giao diện di động thân thiện.
- Tích hợp AI để nâng cao trải nghiệm người dùng, từ đề xuất cá nhân hóa đến hỗ trợ thông tin du lịch.
- Đáp ứng nhu cầu chia sẻ, kết nối, và khám phá du lịch tại Việt Nam.

Hướng dẫn sử dụngĐăng nhập: Giao diện Đăng nhập --> Nhập email, mật khẩu --> Nhấn Đăng nhập.
Đăng ký: Giao diện Đăng nhập --> Nhấn “Đăng ký” --> Nhập email, mật khẩu --> Điền thông tin cá nhân, căn cước --> Chọn sở thích --> Xác nhận.
Xem hồ sơ: Đăng nhập --> Menu (tabbar) --> Nhấn tên của bạn.
Cập nhật hồ sơ: Đăng nhập --> Menu (tabbar) --> Nhấn tên của bạn --> Icon bánh răng --> Thay đổi thông tin --> Xác nhận.
Quản lý tài khoản: Menu (tabbar) --> Biểu tượng cài đặt --> Chọn Màn hình/Riêng tư/Cá nhân --> Thay đổi tùy chọn.
Quên mật khẩu: Giao diện Đăng nhập --> Nhấn “Quên mật khẩu” --> Nhập email --> Gửi mã OTP --> Nhập OTP --> Đổi mật khẩu --> Xác nhận.
Đăng xuất: Bảng tin --> Menu (tabbar) --> Nhấn “Đăng xuất” --> Xác nhận.
Xem bài viết/reels: Đăng nhập --> Bảng tin --> Xem danh sách bài viết/reels.
Tìm kiếm: Bảng tin --> Icon kính lúp --> Nhập tên/#hashtag --> Nhấn kính lúp.
Chỉnh sửa bài viết/reels: Bảng tin --> Dấu 3 chấm (bài viết) --> Chọn Chỉnh sửa --> Thay đổi nội dung --> Lưu.
Xóa bài viết/reels: Bảng tin --> Dấu 3 chấm (bài viết) --> Chọn Xóa bài viết --> Xác nhận.
Tạo bài viết/reels: Bảng tin --> Bong bóng “+” --> Chọn ảnh/video, hashtag --> Chọn phạm vi --> Đăng bài.
Tương tác bài viết/reels: Bảng tin --> Nhấn trái tim (thích) --> Nhấn bình luận --> Viết bình luận.
Duyệt bài viết/reels: Hệ thống tự kiểm tra nội dung --> Hiển thị hoặc từ chối.
Xem bộ sưu tập: Bảng tin --> Menu (tabbar) --> Bộ sưu tập --> Xem ảnh/video/bài viết.
Tạo bộ sưu tập: Bảng tin --> Menu (tabbar) --> Bộ sưu tập --> Bài viết --> Tạo bộ sưu tập --> Nhập tên --> Xác nhận.
Nhắn tin: Bảng tin --> Biểu tượng nhắn tin (header) --> Chọn hộp thoại --> Nhập tin nhắn/ảnh/video --> Gửi.
Tạo nhóm: Bảng tin --> Biểu tượng nhắn tin (header) --> Nhấn “+” --> Tạo nhóm --> Chọn thành viên, đặt tên --> Tạo.
Kết bạn: Bảng tin --> Menu (tabbar) --> Bạn bè --> Gợi ý --> Nhấn Kết bạn --> Gửi yêu cầu.
Quản lý bạn bè: Bảng tin --> Menu (tabbar) --> Bạn bè --> Tất cả bạn bè --> Hủy kết bạn/Xem trang cá nhân.
Quản lý nhóm: Bảng tin --> Menu (tabbar) --> Nhóm --> Nhóm đã tạo --> Quản lý bài viết/quy định/thành viên/phê duyệt.
Xem/tương tác bài viết trong nhóm: Bảng tin --> Menu (tabbar) --> Nhóm --> Bảng tin nhóm --> Thích/Bình luận.
Nhắn với chatbox: Bảng tin --> Bubble chat (phải màn hình) --> Nhập nội dung --> Gửi.
Xem điểm du lịch trong tỉnh: Bảng tin --> Khám phá (tabbar) --> Chọn tỉnh/thành phố --> Xem bài viết/trang du lịch.
Tạo trang: Bảng tin --> Menu (tabbar) --> Du lịch --> Tạo page --> Điền thông tin --> Tạo page.
Xem trang du lịch: Bảng tin --> Khám phá --> Chọn tỉnh/thành phố --> Nhấn trang du lịch --> Xem thông tin/bài viết/vé.
Xem thời tiết: Bảng tin --> Khám phá --> Chọn tỉnh/thành phố --> Nhấn trang du lịch --> Icon thời tiết --> Xem chi tiết.
Xem bản đồ: Bảng tin --> Khám phá --> Chọn tỉnh/thành phố --> Nhấn trang du lịch --> Nhấn bản đồ --> Xem/Only đường.
Tìm kiếm người dùng/nhóm: Bảng tin --> Icon kính lúp --> Nhập tên --> Nhấn kính lúp.
Tìm kiếm bài viết: Bảng tin --> Icon kính lúp --> Nhập #hashtag --> Nhấn kính lúp.
Xem bản đồ (tổng quát): Bảng tin --> Menu (tabbar) --> Icon Bản đồ --> Tìm kiếm/Lưu/Chỉ đường/Tạo chuyến đi.
Xem thời tiết (tổng quát): Bảng tin --> Menu (tabbar) --> Icon Thời tiết --> Tìm tỉnh/thành phố --> Xem chi tiết.`;

export default travelSocialNetwork;