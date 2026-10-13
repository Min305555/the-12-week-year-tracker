# Yêu cầu sản phẩm — THE 12-WEEK YEAR TRACKER

## Mục tiêu

Chuyển file Excel **Min Min THE 12-WEEK YEAR TRACKER October 2026 (1).xlsx** thành một website tương tác, triển khai trên Vercel. Website giúp lập kế hoạch theo năm thành các chu kỳ 12 tuần, theo dõi thường xuyên các mục tiêu quan trọng và tính mức độ hoàn thành dựa trên checklist.

## Thông tin dự án

- **Tên website:** THE 12-WEEK YEAR TRACKER
- **Nền tảng triển khai mong muốn:** Vercel
- **Tài khoản đăng nhập dự kiến:** được quản lý riêng trong cấu hình xác thực, không lưu trong repository
- **Workbook nguồn:** `Min Min THE 12-WEEK YEAR TRACKER October 2026 (1).xlsx`
- **Thư mục dự án:** `D:\a.person_project`

> Mật khẩu không được lưu trong mã nguồn, file Markdown, Git hay dữ liệu website dạng văn bản thuần. Cấu hình xác thực bằng cơ chế bảo mật phù hợp và lưu bí mật trong Vercel Environment Variables hoặc nhà cung cấp xác thực. Nếu mật khẩu đã được chia sẻ trong hội thoại hoặc tài liệu, nên đổi trước khi đưa website lên mạng.

## Yêu cầu chức năng

### 1. Kế hoạch theo năm và chu kỳ 12 tuần

- Cho phép tạo và xem kế hoạch cho một năm.
- Chia năm thành các chu kỳ 12 tuần, có ngày bắt đầu và kết thúc rõ ràng.
- Cho phép quản lý nhiều chu kỳ 12 tuần trong cùng một năm.
- Giữ dữ liệu lịch sử để xem lại các chu kỳ trước.

### 2. Mục tiêu quan trọng

- Tạo, sửa, lưu trữ và xem các mục tiêu quan trọng cho từng chu kỳ.
- Mỗi mục tiêu có thể có mô tả, kết quả mong muốn và các hoạt động/checklist hỗ trợ.
- Theo dõi tiến độ mục tiêu xuyên suốt chu kỳ 12 tuần.

### 3. Checklist và mức độ hoàn thành

- Cho phép đánh dấu hoàn thành các hoạt động theo tuần (và theo ngày nếu phù hợp với workbook).
- Tự động tính tỷ lệ hoàn thành từ các mục checklist đã hoàn thành.
- Hiển thị tiến độ cho từng mục tiêu, từng tuần và toàn chu kỳ.
- Quy tắc tính tỷ lệ cần được xác định sau khi khảo sát workbook, bao gồm cách xử lý mục có trọng số hoặc mục không áp dụng nếu có.

### 4. Lưu trữ và đồng bộ Excel

- Khởi tạo dữ liệu từ workbook hiện có và bảo toàn dữ liệu, công thức, định dạng cần thiết.
- Các thay đổi trên website phải được lưu bền vững và cập nhật ngược vào file Excel theo yêu cầu đồng bộ hai chiều.
- Xác định nơi lưu workbook và cách website truy cập file khi triển khai trên Vercel; không giả định website trên Vercel có thể ghi trực tiếp vào file cục bộ trên máy người dùng.
- Thiết kế cách xử lý khi website và Excel cùng được chỉnh sửa, tránh ghi đè âm thầm.
- Có sao lưu trước khi cập nhật workbook và lịch sử thay đổi/khả năng phục hồi phù hợp.
- Chốt cơ chế đồng bộ sau khi kiểm tra cấu trúc thật của workbook và nơi lưu file (ví dụ lưu trữ đám mây hoặc quy trình import/export nếu đồng bộ trực tiếp không khả thi).

### 5. Đăng nhập và quyền truy cập

- Website cần xác thực người dùng; tài khoản dự kiến sử dụng email được quản lý riêng trong cấu hình xác thực, không lưu trong repository.
- Chỉ người được phép mới xem hoặc sửa kế hoạch.
- Bí mật xác thực phải được lưu an toàn, không commit vào repository và không ghi trong file này.

## Triển khai trên Vercel

- Xác định framework và cấu trúc ứng dụng sau khi khảo sát nội dung thư mục dự án.
- Cấu hình biến môi trường và thông tin kết nối cần thiết trên Vercel.
- Kiểm tra luồng đăng nhập, tạo/sửa mục tiêu, checklist, phép tính tiến độ và đồng bộ dữ liệu trên bản preview trước khi triển khai chính thức.
- Thiết lập sao lưu và quy trình khôi phục dữ liệu.

## Workflow dự kiến

1. Khảo sát workbook: sheets, cấu trúc, công thức, định dạng và quy tắc hiện tại.
2. Xác định cách tổ chức năm, chu kỳ 12 tuần, mục tiêu, checklist và công thức hoàn thành.
3. Chốt kiến trúc lưu dữ liệu và đồng bộ website ↔ Excel phù hợp với Vercel.
4. Thiết kế các màn hình chính và luồng sử dụng.
5. Xây dựng phiên bản đầu với dữ liệu thử/bản sao workbook.
6. Kiểm chứng đọc/ghi hai chiều, tính tiến độ, xác thực, xử lý lỗi và sao lưu.
7. Triển khai preview trên Vercel, rà soát rồi mới phát hành.

## Tiến độ bản giao diện đầu tiên

- [x] Tạo `index.html`, `styles.css` và `app.js` cho giao diện tracker tương tác.
- [x] Bố trí chu kỳ, tuần, mục tiêu, chỉ số nỗ lực/kết quả và checklist Kế hoạch/Thực tế.
- [x] Tính điểm tuần theo số đầu việc Thực tế chia cho số đầu việc Kế hoạch; điểm chu kỳ là trung bình 12 tuần, theo công thức trong workbook.
- [x] Hỗ trợ nhập tracker từ Excel, lưu cục bộ trên trình duyệt và tải bản Excel xuất ra.
- [ ] Hoàn tất triển khai trên Vercel: file đã được đưa vào luồng Vercel Drop, nhưng cần đăng nhập tài khoản Vercel trước khi tạo deployment.
- [ ] Thiết lập xác thực thật và lưu trữ phía máy chủ để dữ liệu có thể bảo vệ và đồng bộ giữa các thiết bị.
- [ ] Hoàn thiện đồng bộ ngược vào workbook gốc; hiện nút xuất tạo một bản Excel mới và không tự sửa file gốc.

> Bản giao diện tĩnh chưa có đăng nhập bảo mật hoặc đồng bộ máy chủ. Không nhập dữ liệu riêng tư vào deployment công khai cho đến khi xác thực và kho dữ liệu phía máy chủ được cấu hình.

### Phản hồi giao diện đã áp dụng

- [x] Tăng cỡ chữ và chuyển sang font hệ thống hỗ trợ tiếng Việt để tránh lỗi font khi không tải được font ngoài.
- [x] Yêu cầu nhập ngày bắt đầu chu kỳ trước khi tạo mục tiêu; tự tính ngày kết thúc và khoảng ngày của đủ 12 tuần.
- [x] Cho phép thêm nhiều đầu việc và chọn tuần hạn ngay trong form tạo/chỉnh sửa mục tiêu.
- [x] Bổ sung thao tác xóa mục tiêu có xác nhận.
- [x] Làm mới bố cục theo phong cách planner ấm, dịu và có điểm nhấn; dùng Be Vietnam Pro với font hệ thống dự phòng cho tiếng Việt.
- [x] Chỉnh khung chu kỳ và các thẻ để nằm gọn trong lề; chuẩn hóa khoảng cách và tăng cỡ chữ nhỏ.
- [x] Bỏ các trường bắt buộc ở form mục tiêu và đầu việc; cho phép lưu mục tiêu chưa đặt tên hoặc chưa có đầu việc.

## Câu hỏi cần quyết định trong các bước tiếp theo

- Chu kỳ 12 tuần bắt đầu từ ngày nào; có tuần đệm để tổng kết/nghỉ giữa các chu kỳ không?
- Checklist được chấm theo ngày, tuần hay cả hai?
- Tỷ lệ hoàn thành dùng số mục hoàn thành trên tổng số mục, hay có trọng số?
- Workbook có phải là nơi lưu chuẩn, hay website là nơi lưu chuẩn và Excel là bản đồng bộ?
- File Excel sẽ được lưu ở đâu để website Vercel cập nhật được file gốc?
- Website chỉ dành cho một tài khoản hay cần hỗ trợ thêm người dùng?

## Trạng thái

- [x] Ghi nhận tên website, nền tảng triển khai và tài khoản dự kiến.
- [x] Ghi nhận nhu cầu kế hoạch năm, chu kỳ 12 tuần, mục tiêu và checklist.
- [x] Ghi nhận yêu cầu đồng bộ hai chiều với Excel và các điểm cần chốt.
- [ ] Khảo sát workbook và cấu trúc thư mục dự án.
- [ ] Chốt quy tắc chu kỳ, checklist và cách tính tiến độ.
- [ ] Chốt nơi lưu dữ liệu và cơ chế đồng bộ phù hợp với Vercel.
- [ ] Thiết kế, xây dựng, kiểm chứng và triển khai website.

