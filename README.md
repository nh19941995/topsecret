# Hoàn Công AI

Ứng dụng tĩnh tiếng Việt quản lý hồ sơ xây dựng bằng cây tương tác. Yêu cầu Node.js 20 trở lên, không cần cài thư viện.

Sau khi clone repo, mở terminal trong thư mục repo và chạy:

```sh
npm start
```

Mở http://127.0.0.1:5173 bằng Chrome hoặc Edge desktop. Có thể chạy trực tiếp `node serve.cjs` nếu không dùng npm.

Mã giao diện nằm trong `dist/` và có thể được phục vụ bởi dịch vụ hosting tĩnh qua HTTPS. Đẩy mã lên Git chỉ lưu mã nguồn; muốn có URL web cần cấu hình dịch vụ hosting riêng. Không đưa thư mục hồ sơ thật hoặc API key vào repo.

## Bắt đầu

1. Chọn **Kết nối thư mục**. Thư mục trống tạo dự án mới; thư mục có `du-an.json` mở dự án hiện có.
2. Sửa tên/mã dự án từ nút tên dự án ở thanh bên.
3. Chọn **Cấu hình AI**, nhập endpoint tương thích OpenAI Responses, model và API key. Khóa chỉ giữ trong bộ nhớ phiên. Có thể bỏ qua AI và nhập thủ công.
4. **Tải hồ sơ lên**, chọn file, phân tích và kiểm tra thông tin trước khi xác nhận. Chỉ lúc phân tích, nội dung mới được gửi tới nhà cung cấp AI. API được gọi trực tiếp từ trình duyệt; endpoint phải hỗ trợ CORS.
5. **Thêm vật liệu** tạo ba nút chấp thuận, lấy mẫu, thí nghiệm. Nghiệm thu phụ thuộc kết quả của tất cả vật liệu.
6. Sao chép toàn bộ thư mục dự án để chuyển máy; chọn lại thư mục trên máy mới. Xuất JSON chỉ xuất dữ liệu chỉ mục, không bao gồm tài liệu gốc.

## Dữ liệu

`du-an.json` chứa cấu trúc cây, thông tin hồ sơ, lịch sử, đường dẫn tương đối và SHA-256 tài liệu. File gốc được sao chép vào thư mục theo nhóm với tên duy nhất, không di chuyển/xóa bản gốc. File trùng nội dung bị từ chối. Dữ liệu ban đầu là minh họa, không phải hồ sơ pháp lý thực tế. Không lưu hồ sơ dự án trên máy chủ hosting.

## Kiểm tra

Chạy `npm test` (kiểm tra cú pháp và quy tắc phụ thuộc/timeline).

Đã kiểm tra giao diện desktop, màn hình hẹp và chuyển trạng thái timeline qua trình duyệt. Chưa kiểm thử API thực tế vì chưa có khóa người dùng. Luồng đọc/ghi File System Access cần quyền thư mục do người dùng cấp và trình duyệt hỗ trợ. Không hỗ trợ chỉnh sửa đồng thời một thư mục từ nhiều cửa sổ/máy. Quy trình khởi tạo là mẫu, cần đối chiếu yêu cầu thực tế của dự án.

API tài liệu: https://developers.openai.com/api/docs/guides/file-inputs
