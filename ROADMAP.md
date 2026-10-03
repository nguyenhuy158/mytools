# ToolHub Enhancement Roadmap 🚀

Bản lộ trình nâng cấp và tích hợp các công cụ mới vào hệ sinh thái **ToolHub**. Các công cụ được đánh giá dựa trên mức độ ảnh hưởng đến trải nghiệm người dùng (UX) và hiệu suất phát triển (DX).

---

## 🏗️ Core & Infrastructure (Nền tảng)

| Công cụ | Mô tả | Độ ưu tiên | Trạng thái |
| :--- | :--- | :--- | :--- |
| **Vite PWA Plugin** | Biến ToolHub thành ứng dụng cài đặt được, hỗ trợ chạy **Offline**. Đây là tính năng sống còn cho một bộ công cụ tiện ích. | ⭐⭐⭐ | ✅ Đã hoàn thành |
| **kBar (Command Palette)** | Thanh lệnh `Cmd + K` giúp tìm kiếm và chuyển đổi giữa các công cụ (JSON, Notes, Pomodoro) ngay lập tức. | ⭐⭐⭐ | ✅ Đã hoàn thành |
| **Biome** | Thay thế ESLint/Prettier bằng Rust tool cực nhanh, giúp giữ code sạch và nhất quán. | ⭐⭐ | 📋 Chờ thực hiện |
| **Nuqs** | Quản lý state của công cụ qua URL một cách an toàn (Type-safe), giúp chia sẻ link cấu hình công cụ dễ dàng. | ⭐⭐ | ✅ Đã hoàn thành |
| **Global Search** | Tìm kiếm toàn cục nội dung trong các tools (ví dụ: tìm note, tìm key json) thông qua `Cmd + K`. | ⭐ | 📋 Chờ thực hiện |

---

## ✨ User Experience & Aesthetic (Trải nghiệm & Thẩm mỹ)

| Công cụ | Mô tả | Độ ưu tiên | Trạng thái |
| :--- | :--- | :--- | :--- |
| **Framer Motion** | Thêm các hiệu ứng chuyển trang mượt mà và animation cho các công cụ. | ⭐⭐ | 📋 Chờ thực hiện |
| **Rough.js** | Tạo "Sketchy Mode" (giao diện vẽ tay) cho các công cụ, mang tới sự thú vị và khác biệt so với các web tool phổ thông. | ⭐ | 📋 Chờ thực hiện |
| **Sonner (Updated)** | Thay thế toast cũ bằng **Sonner**: Hỗ trợ stacking (xếp chồng), vuốt để đóng, rich colors và promise API. Mang lại cảm giác mượt mà ("Premium feel") vượt trội so với các thư viện toast truyền thống. | ⭐ | ✅ Đã hoàn thành (Done) |

---

## 🛠️ Tool Expansion (Mở rộng công cụ)

| Công cụ | Mô tả | Độ ưu tiên | Trạng thái |
| :--- | :--- | :--- | :--- |
| **JWT Debugger** | Giải mã, verify và debug JWT Token trực quan. Hỗ trợ highlight màu sắc từng phần (Header/Payload). | ⭐⭐ | 📋 Chờ thực hiện |
| **Cron Visualizer** | Tạo và giải thích biểu thức Cron (Cron expressions) bằng giao diện đồ họa dễ hiểu. | ⭐⭐ | 📋 Chờ thực hiện |
| **UUID/ID Generator** | Tạo nhanh UUID v4, v7, NanoID, CUID... hỗ trợ copy hàng loạt. | ⭐ | 📋 Chờ thực hiện |
| **Regex Tester** | Kiểm tra và giải thích biểu thức chính quy (Regex) trực quan. | ⭐⭐ | 📋 Chờ thực hiện |
| **Color & Contrast** | Chuyển đổi hệ màu (HEX/RGB/HSL) & kiểm tra độ tương phản (A11y). | ⭐⭐ | 📋 Chờ thực hiện |
| **QR Code Generator** | Tạo mã QR tùy chỉnh logo, màu sắc ngay tại trình duyệt. | ⭐⭐ | 📋 Chờ thực hiện |
| **PDF Tools** | Ghép, tách, nén file PDF xử lý 100% tại trình duyệt (Privacy-first). | ⭐ | ✅ Đã hoàn thành |

---

## 🤖 Smart Tools & AI (Trí tuệ nhân tạo)

| Công cụ | Mô tả | Độ ưu tiên | Trạng thái |
| :--- | :--- | :--- | :--- |
| **Transformers.js** | Tích hợp AI chạy 100% tại trình duyệt cho các tool Word/Image processing mà không vi phạm chính sách "Privacy-first". | ⭐⭐ | ✅ Đã hoàn thành |
| **Cloudflare Workers AI** | Sử dụng sức mạnh Edge Computing cho các tác vụ AI nặng hơn (Llama 3, Image Gen). | ⭐ | 📋 Chờ thực hiện |
| **AI Note Assistant** | Tự động tóm tắt, sửa lỗi chính tả và suggest tags cho ghi chú (Notes) sử dụng Gemini Flash/Gemma. | ⭐⭐ | 📋 Chờ thực hiện |
| **Smart SQL Formatter** | Format SQL query phức tạp và giải thích ý nghĩa query bằng AI. | ⭐ | 📋 Chờ thực hiện |

---

## 📅 Timeline Dự kiến

1. **Giai đoạn 1 (Quick Wins):** Tích hợp `kBar`, `Vite PWA` và `Sonner` (Done).
2. **Giai đoạn 2 (Polish):** Chuyển đổi qua `Biome`, thêm `Nuqs` và triển khai bộ công cụ `Dev Utils` (JWT, Cron).
3. **Giai đoạn 3 (Intelligence):** Tích hợp `Cloudflare AI` cho Notes và Image Tools.
4. **Giai đoạn 4 (Visuals):** Nâng cấp UI với `Framer Motion` và `Rough.js`.

---
*Ghi chú: Độ ưu tiên ⭐⭐⭐ (Bắt buộc), ⭐⭐ (Nên có), ⭐ (Khuyến khích).*
