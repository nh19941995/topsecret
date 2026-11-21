# Template chung cho diagram hồ sơ xây dựng

## 1. Thành phần và ý nghĩa

| Thành phần | Vai trò | Có trạng thái riêng? |
| --- | --- | --- |
| Dự án | Gốc của diagram, chứa cấu hình và dữ liệu | Tổng hợp từ các giai đoạn |
| Giai đoạn | Chuẩn bị, Thi công, Hoàn công | Tính từ các bước bắt buộc |
| Bước hồ sơ | Một việc có tiêu chí hoàn tất rõ ràng | Có: chưa có, chờ duyệt, có điều kiện, hoàn tất, không đạt |
| Tài liệu | Chứng cứ cho một bước; có file gốc và metadata | Không đồng nhất với trạng thái bước |
| Quan hệ phụ thuộc | Bước A phải hoàn tất trước B | Điều kiện bắt buộc |
| Quy tắc ngày | So sánh một ngày của B với một ngày của A | Có thể bắt buộc hoặc chỉ nhắc |
| Cảnh báo | Kết quả đánh giá dữ liệu hiện tại | Tính lại, không lưu như sự thật độc lập |
| Bố cục | Giai đoạn và thứ tự thẻ | Không phải thứ tự phê duyệt |

Diagram hiển thị theo cây phân cấp, nhưng quan hệ nghiệp vụ là đồ thị có hướng: một phòng thí nghiệm có thể phục vụ nhiều vật liệu; một biên bản nghiệm thu có thể cần nhiều kết quả thí nghiệm. Không nhân bản hồ sơ phòng thí nghiệm cho mỗi nhánh vật liệu chỉ để vẽ thành cây.

## 2. Bộ loại bước dùng lại

1. **Trình duyệt**: năng lực, nhân sự, thiết bị, biện pháp.
2. **Chấp thuận**: văn bản chấp thuận nhà cung cấp, vật liệu, phòng thí nghiệm.
3. **Lấy mẫu**: biên bản lấy mẫu cho một đối tượng cụ thể.
4. **Thí nghiệm**: kết quả kiểm tra mẫu.
5. **Nghiệm thu**: công việc, bộ phận hoặc hạng mục.
6. **Bản vẽ hoàn công**: hồ sơ xác nhận hiện trạng đã thi công.
7. **Bàn giao**: bộ hồ sơ và biên bản bàn giao.
8. **Công việc khác**: bước đặc thù do dự án bổ sung.

Đây là bộ khung để cấu hình, không phải một danh mục pháp lý áp dụng tự động cho mọi dự án. Người quản lý quyết định bước nào bắt buộc theo yêu cầu dự án.

## 3. Một bước cần những gì?

```json
{
  "id": "sample_mesh_lot_a",
  "name": "Lấy mẫu lưới thép — lô A",
  "type": "sampling",
  "stage": 1,
  "required": true,
  "order": 4,
  "folder": "02_ThiCong/LuoiThep/LoA/LayMau",
  "deps": ["material", "lab"],
  "dateRules": [
    {
      "sourceId": "material",
      "sourceField": "date",
      "targetField": "date",
      "relation": "after",
      "days": 0,
      "blocking": true
    }
  ]
}
```

`stage`: 0 = chuẩn bị, 1 = thi công, 2 = hoàn công. ID ổn định khi đổi tên hoặc di chuyển. `folder` là đường dẫn tương đối; di chuyển thẻ sang giai đoạn khác không tự chuyển các file đã lưu. `order` chỉ dùng để vẽ.

Ngày và hồ sơ thực tế nằm trong dữ liệu dự án: `date` (ngày văn bản), `startDate`, `dueDate`, `completedAt`, `status`, `files`, `code`, `issuer`, `note`. Không mang các giá trị này vào template.

## 4. Quy tắc phụ thuộc và ngày tháng

- `deps`: tất cả bước được tham chiếu phải đáp ứng điều kiện hoàn tất. Từ chối phụ thuộc bản thân, tham chiếu không tồn tại và vòng lặp A → B → A.
- `relation: after`: ngày đích ≥ ngày nguồn + số ngày.
- `relation: before`: ngày đích ≤ ngày nguồn − số ngày.
- `days: 0`: cho phép cùng ngày. `days: 1`: phải cách ít nhất một ngày lịch; chưa có lịch làm việc/ngày nghỉ.
- Ngày so sánh được chọn độc lập: ngày văn bản, ngày bắt đầu, hạn hoàn thành hoặc ngày hoàn tất.
- `blocking: true`: thiếu ngày hoặc sai thứ tự sẽ ngăn bước được tính là hoàn tất.
- `blocking: false`: hiển thị nhắc việc, không ngăn hoàn tất.
- Ngày bắt đầu sau hạn hoàn thành là dữ liệu lịch không hợp lệ và chặn hoàn tất.
- Đổi ngày của hồ sơ nguồn sẽ đánh giá lại các bước liên quan và timeline.

Trạng thái nhập là “Đã hoàn tất” vẫn có thể chưa được hệ thống tính hoàn tất nếu còn thiếu quan hệ phụ thuộc hoặc quy tắc ngày bắt buộc. Tắt hiển thị cảnh báo không loại bỏ quy tắc này. Một bước không bắt buộc trong giai đoạn vẫn phải hoàn tất nếu bước khác chỉ rõ nó là điều kiện phụ thuộc.

## 5. Template mẫu

```text
Dự án
├─ Chuẩn bị
│  ├─ Năng lực nhà thầu
│  ├─ Nhân sự thi công
│  └─ Phòng thí nghiệm
├─ Thi công
│  ├─ Chấp thuận vật liệu [Tên]
│  ├─ Lấy mẫu vật liệu [Tên / lô]
│  ├─ Thí nghiệm vật liệu [Tên / lô]
│  └─ Nghiệm thu công việc [Hạng mục]
└─ Hoàn công
   ├─ Bản vẽ hoàn công [Hạng mục]
   └─ Hồ sơ bàn giao
```

Mẫu JSON có thể nhập nằm tại `dist/templates/common-workflow.json`. Chín ID gốc được giữ để tương thích dữ liệu và luồng vật liệu hiện tại; có thể đổi tên, loại, giai đoạn, thứ tự, điều kiện và tính bắt buộc, cũng như thêm nhiều bước mới. Không có chức năng xóa chín ID gốc trong phiên bản này.

Với vật liệu nhiều lô, tạo bước lấy mẫu/thí nghiệm riêng cho từng lô; giữ chấp thuận vật liệu dùng chung khi phù hợp. Với nhiều hạng mục, tạo bước nghiệm thu và bản vẽ riêng, liên kết đúng kết quả liên quan. Hệ thống hiện chưa tự suy ra mã lô/hạng mục, phạm vi chứng nhận phòng thí nghiệm, tiêu chuẩn hoặc tần suất lấy mẫu; những điều kiện đó cần được người dùng cấu hình/kiểm tra.

## 6. Giao diện thiết kế

- Bật **Thiết kế quy trình** để mở thư viện loại bước.
- Kéo loại bước vào tiêu đề/vùng giai đoạn hoặc trước một thẻ để thêm bước.
- Kéo thẻ sang giai đoạn khác hoặc trước thẻ khác để sắp xếp; ngày và quan hệ không tự đổi theo vị trí.
- Bấm thẻ để chỉnh cấu hình. Có thể dùng bàn phím: bấm loại bước để thêm, chọn giai đoạn và thứ tự trong form.
- Trong **Ngày tháng**, chọn lịch của bước; trong **Ràng buộc**, thêm một hoặc nhiều phép so sánh.
- Cấu hình cảnh báo: sắp đến hạn, quá hạn, sai thứ tự ngày, thiếu ngày và thiếu hồ sơ phụ thuộc; đặt số ngày nhắc trước.
- Cảnh báo chỉ hiển thị trong ứng dụng, chưa gửi thông báo nền, email hay SMS.

## 7. Tái sử dụng và bảo toàn dữ liệu

Template lưu cấu trúc, quy tắc, thư mục tương đối và tùy chọn cảnh báo. Không xuất trạng thái xử lý, file gốc, mã văn bản, đơn vị ban hành, ngày thực tế, ghi chú hoặc khóa API. Tên bước vẫn được xuất, vì vậy cần kiểm tra tên trước khi chia sẻ mẫu.

Nhập mẫu phải chọn một dự án trống, chưa có thông tin hồ sơ, rồi xem lại và bấm áp dụng. Không tự thay thế hồ sơ đang dùng. Dữ liệu cũ được bổ sung cấu hình mới khi đọc; dự án đã có `workflowVersion: 2` giữ nguyên thiết kế tùy chỉnh khi mở lại.

## 8. Các giới hạn cần phân biệt

- Timeline là mức độ hoàn thiện hồ sơ, không quyết định tiến độ thi công thực tế.
- Cấu hình AI hiện chỉ trích xuất thông tin văn bản theo luồng cũ; quy tắc/lịch mới do người dùng cấu hình, chưa được AI tự sinh.
- Kiểm tra ngày theo từng quy tắc và phát hiện vòng lặp phụ thuộc; chưa giải bài toán mọi tổ hợp quy tắc ngày có khả thi về mặt lịch hay không.
- Thiết kế kéo thả hiện lưu giai đoạn/thứ tự, chưa có tọa độ tự do hoặc thao tác kéo dây nối. Quan hệ được chọn trong bảng cấu hình bước.
