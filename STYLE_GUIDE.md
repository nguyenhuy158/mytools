# Website Style Guide

<!-- AI_GUIDELINES:START -->
## AI Assistant Guidelines

When generating code or designing UI components for this project, you **MUST** follow these strict rules:

1.  **Tailwind CSS Only:** Use Tailwind CSS utility classes for all styling. Do not create new CSS files or `style` blocks unless explicitly instructed.
2.  **Dark Mode Compliance:** All components must support dark mode by default.
    -   **Base Background:** `bg-white` (light) / `dark:bg-gray-950` (dark).
    -   **Base Text:** `text-gray-900` (light) / `dark:text-gray-100` (dark).
    -   Use `dark:` modifier for all color-related properties.
3.  **Mobile-First:** Write classes for mobile screens first, then use breakpoints (`sm:`, `md:`, `lg:`) for larger screens.
4.  **Typography:** Rely on the default font stack ("Inter"). Do not introduce new fonts.
5.  **Simplicity:** Prefer standard Tailwind colors and spacing. Avoid arbitrary values (e.g., `w-[123px]`) unless necessary for pixel-perfect requirements.
<!-- AI_GUIDELINES:END -->

This document outlines the style conventions and principles used in this project to ensure consistency and maintainability.
Tài liệu này mô tả các quy ước và nguyên tắc về phong cách được sử dụng trong dự án này để đảm bảo tính nhất quán và dễ bảo trì.

---

## English

## 1. CSS Framework

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling. Tailwind is a utility-first CSS framework that provides low-level utility classes to build custom designs directly in your markup.

### Tailwind Configuration

This project uses the default Tailwind CSS configuration, with some minor customizations defined in `app/app.css`.

## 2. Dark Mode

The website supports dark mode. Styles for dark mode are defined using Tailwind's `dark:` variants.

**Example:**
```html
<div class="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
  Your content
</div>
```

## 3. Typography

The primary font used in the project is "Inter" (or system fallback fonts).

**Defined in `app/app.css`:**
```css
@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif,
    "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}
```

Use Tailwind's utility classes to control text size, weight, and color.

**Example:**
```html
<h1 class="text-4xl font-bold">Large Heading</h1>
<p class="text-base text-gray-700 dark:text-gray-300">Paragraph text</p>
```

## 4. Colors

The project primarily uses Tailwind CSS's default color palette. Specific colors for background and text in dark mode are defined in `app/app.css`:

*   **Light Background:** `bg-white`
*   **Dark Background:** `dark:bg-gray-950`
*   **Light Text:** `text-gray-900` (default)
*   **Dark Text:** `dark:text-gray-100`

For more color options, refer to the [Tailwind CSS Colors documentation](https://tailwindcss.com/docs/customizing-colors).

## 5. General Principles

*   **Mobile-first:** Design and develop with a mobile-first mindset, then scale up for larger screen sizes.
*   **Responsive Design:** Use Tailwind's responsive utilities (e.g., `sm:`, `md:`, `lg:`) to ensure layouts adapt across different devices.
*   **Consistency:** Strive to use existing Tailwind utility classes rather than writing new custom CSS.
*   **Readability:** Keep markup clean and easy to understand.

## 6. Extension and Customization

If additional custom styles not available in Tailwind are needed, you can:

*   **Use Custom CSS:** Add custom CSS to `app/app.css` or other CSS files imported there.
*   **Extend Tailwind Configuration:** If you need to extend the color palette, typography, or other utilities, you will need to create a `tailwind.config.js` file and configure it.

By adhering to these guidelines, we can maintain a consistent and manageable codebase.

---

## Tiếng Việt (Vietnamese)

## 1. Framework CSS

Dự án này sử dụng [Tailwind CSS](https://tailwindcss.com/) để tạo kiểu. Tailwind là một framework CSS utility-first, cung cấp các lớp tiện ích cấp thấp để xây dựng các thiết kế tùy chỉnh trực tiếp trong markup của bạn.

### Cấu hình Tailwind

Dự án này sử dụng cấu hình Tailwind CSS mặc định, với một số tùy chỉnh nhỏ được định nghĩa trong `app/app.css`.

## 2. Chế độ tối (Dark Mode)

Website hỗ trợ chế độ tối. Các kiểu cho chế độ tối được định nghĩa bằng cách sử dụng các biến thể `dark:` của Tailwind.

**Ví dụ:**
```html
<div class="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
  Nội dung của bạn
</div>
```

## 3. Kiểu chữ (Typography)

Phông chữ chính được sử dụng trong dự án là "Inter" (hoặc các phông chữ dự phòng hệ thống).

**Định nghĩa trong `app/app.css`:**
```css
@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif,
    "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}
```

Sử dụng các lớp tiện ích của Tailwind để kiểm soát kích thước, trọng lượng và màu sắc của văn bản.

**Ví dụ:**
```html
<h1 class="text-4xl font-bold">Tiêu đề lớn</h1>
<p class="text-base text-gray-700 dark:text-gray-300">Đoạn văn bản</p>
```

## 4. Màu sắc

Dự án chủ yếu sử dụng bảng màu mặc định của Tailwind CSS. Các màu cụ thể cho nền và văn bản trong chế độ tối được định nghĩa trong `app/app.css`:

*   **Nền sáng:** `bg-white`
*   **Nền tối:** `dark:bg-gray-950`
*   **Văn bản sáng:** `text-gray-900` (mặc định)
*   **Văn bản tối:** `dark:text-gray-100`

Để biết thêm các tùy chọn màu sắc, hãy tham khảo [tài liệu Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors).

## 5. Nguyên tắc chung

*   **Mobile-first:** Thiết kế và phát triển với tư duy ưu tiên thiết bị di động trước, sau đó mở rộng cho các kích thước màn hình lớn hơn.
*   **Responsive Design:** Sử dụng các tiện ích responsive của Tailwind (ví dụ: `sm:`, `md:`, `lg:`) để đảm bảo bố cục thích ứng trên các thiết bị khác nhau.
*   **Tính nhất quán:** Cố gắng sử dụng các lớp tiện ích hiện có của Tailwind thay vì viết CSS tùy chỉnh mới.
*   **Khả năng đọc:** Giữ cho markup dễ đọc và dễ hiểu.

## 6. Mở rộng và tùy chỉnh

Nếu cần thêm các kiểu tùy chỉnh không có sẵn trong Tailwind, bạn có thể:

*   **Sử dụng CSS tùy chỉnh:** Thêm CSS tùy chỉnh vào `app/app.css` hoặc các tệp CSS khác được nhập vào đó.
*   **Mở rộng cấu hình Tailwind:** Nếu cần mở rộng bảng màu, kiểu chữ hoặc các tiện ích khác, bạn sẽ cần tạo một tệp `tailwind.config.js` và định cấu hình nó.

Bằng cách tuân thủ các nguyên tắc này, chúng ta có thể duy trì một codebase nhất quán và dễ quản lý.
