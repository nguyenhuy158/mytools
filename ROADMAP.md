# ToolHub Enhancement Roadmap 🚀

Bản lộ trình nâng cấp và tích hợp các công cụ mới vào hệ sinh thái **ToolHub**. Các công cụ được đánh giá dựa trên mức độ ảnh hưởng đến trải nghiệm người dùng (UX) và hiệu suất phát triển (DX).

---

## 🏗️ Core & Infrastructure (Nền tảng)

| Công cụ | Mô tả | Độ ưu tiên | Trạng thái |
| :--- | :--- | :--- | :--- |
| **Vite PWA Plugin** | Biến ToolHub thành ứng dụng cài đặt được, hỗ trợ chạy **Offline**. Đây là tính năng sống còn cho một bộ công cụ tiện ích. | ⭐⭐⭐ | ✅ Đã hoàn thành |
| **kBar (Command Palette)** | Thanh lệnh `Cmd + K` giúp tìm kiếm và chuyển đổi giữa các công cụ (JSON, 2048, Snake) ngay lập tức. | ⭐⭐⭐ | ✅ Đã hoàn thành |
| **Biome** | Thay thế ESLint/Prettier bằng Rust tool cực nhanh, giúp giữ code sạch và nhất quán. | ⭐⭐ | 📋 Chờ thực hiện |
| **Nuqs** | Quản lý state của công cụ qua URL một cách an toàn (Type-safe), giúp chia sẻ link cấu hình công cụ dễ dàng. | ⭐⭐ | ✅ Đã hoàn thành |

---

## ✨ User Experience & Aesthetic (Trải nghiệm & Thẩm mỹ)

| Công cụ | Mô tả | Độ ưu tiên | Trạng thái |
| :--- | :--- | :--- | :--- |
| **Framer Motion** | Thêm các hiệu ứng chuyển trang mượt mà và animation cho các mini-games (Snake, 2048). | ⭐⭐ | 📋 Chờ thực hiện |
| **Rough.js** | Tạo "Sketchy Mode" (giao diện vẽ tay) cho các công cụ, mang tới sự thú vị và khác biệt so với các web tool phổ thông. | ⭐ | 📋 Chờ thực hiện |
| **Sonner (Updated)** | Thay thế toast cũ bằng **Sonner**: Hỗ trợ stacking (xếp chồng), vuốt để đóng, rich colors và promise API. Mang lại cảm giác mượt mà ("Premium feel") vượt trội so với các thư viện toast truyền thống. | ⭐ | ✅ Đã có (Cần tối ưu) |

---

## 🤖 Smart Tools & AI (Trí tuệ nhân tạo)

| Công cụ | Mô tả | Độ ưu tiên | Trạng thái |
| :--- | :--- | :--- | :--- |
| **Transformers.js** | Tích hợp AI chạy 100% tại trình duyệt cho các tool Word/Image processing mà không vi phạm chính sách "Privacy-first". | ⭐⭐ | 📋 Chờ thực hiện |
| **Cloudflare Workers AI** | Sử dụng sức mạnh Edge Computing cho các tác vụ AI nặng hơn (Llama 3, Image Gen). | ⭐ | 📋 Chờ thực hiện |

---

## 📅 Timeline Dự kiến

1. **Giai đoạn 1 (Quick Wins):** Tích hợp `kBar` và `Vite PWA`.
2. **Giai đoạn 2 (Polish):** Chuyển đổi qua `Biome` và thêm `Nuqs` cho `JSON Tools`.
3. **Giai đoạn 3 (Premium):** Animation với `Framer Motion` và thử nghiệm `Transformers.js`.

---
*Ghi chú: Độ ưu tiên ⭐⭐⭐ (Bắt buộc), ⭐⭐ (Nên có), ⭐ (Khuyến khích).*
