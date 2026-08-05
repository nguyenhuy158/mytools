/**
 * The showcase list behind /projects.
 *
 * This is the only file to edit when a product is added, renamed or retired —
 * the page and the live status check both read from here.
 */

export interface Project {
  /** Stable id; also the key used by the live status endpoint. */
  id: string;
  name: string;
  /** Public URL. Must be absolute — it is fetched for the status check. */
  url: string;
  /** One line on what it does, shown on the card. */
  tagline: string;
  /** A few sentences of detail, shown under the tagline. */
  description: string;
  /** Shown as pills on the card. */
  tech: string[];
  /** Optional screenshot/preview image. Falls back to a generated tile. */
  image?: string;
  /** Tailwind gradient classes for the fallback tile. */
  accent: string;
  /** Rough state, so retired work can stay listed honestly. */
  status: "live" | "wip" | "archived";
  /** Year work started, for the timeline ordering. */
  since?: string;
  /** Hand-maintained highlights, e.g. "21 pages", "5k+ users". */
  highlights?: string[];
  /** Skip the uptime ping for sites that block it. */
  skipStatusCheck?: boolean;
}

export const PROJECTS: Project[] = [
  {
    id: "toolhub",
    name: "ToolHub",
    url: "https://huyab.click",
    tagline: "Bộ công cụ web dùng hằng ngày, chạy trên Cloudflare edge",
    description:
      "Hơn 20 trang công cụ: chuyển đổi kiểu chữ, JSON, so sánh văn bản, " +
      "lịch âm dương, đọc số thành chữ, cùng vài game. Hỗ trợ tiếng Việt, " +
      "PWA dùng offline được, và dùng được trực tiếp từ terminal qua curl.",
    tech: ["React Router v7", "Cloudflare Workers", "Tailwind v4", "i18next"],
    image: "/projects/toolhub.png",
    accent: "from-blue-500 to-indigo-600",
    status: "live",
    since: "2025",
    highlights: ["21 trang", "CLI qua curl", "EN/VI"],
  },
  {
    id: "chiakeo",
    name: "Chia kèo",
    url: "https://chiakeo.huyab.click",
    tagline: "Tính tiền nhóm: ai ứng, ai chịu, ai chuyển cho ai",
    description:
      "Ghi khoản chi và khoản thu của một cuộc đi chơi, chia đều hoặc chỉ " +
      "định người chịu, rồi gợi ý cách chuyển tiền ít giao dịch nhất. Xuất " +
      "ảnh tổng kết PNG hoặc bản chữ để dán vào Zalo/Messenger, kèm QR " +
      "VietQR để cả nhóm quét một lần. Có danh bạ người hay đi chung, đính " +
      "kèm ảnh hóa đơn, thùng rác phục hồi được, và MCP token để trợ lý AI " +
      "đọc lại các cuộc chia.",
    tech: ["React + Vite", "PWA", "VietQR", "Google OAuth", "MCP"],
    image: "/projects/chiakeo.png",
    accent: "from-amber-500 to-orange-600",
    status: "live",
    since: "2026",
    highlights: ["Ảnh tổng kết PNG", "QR chuyển khoản", "MCP token"],
  },
  {
    id: "techcoop-status",
    name: "TechCoop Service Status",
    url: "https://tc.huyab.click",
    tagline: "Trang trạng thái công khai cho các dịch vụ production",
    description:
      "Theo dõi uptime của 5 dịch vụ production và công bố sự cố cho người " +
      "dùng: farmlink, farmhub, invoices, dichvu.farmnet và sale.farmgate. " +
      "Dựng trên Better Stack, trỏ qua subdomain riêng.",
    tech: ["Better Stack", "Uptime monitoring", "Custom domain"],
    image: "/projects/techcoop-status.png",
    accent: "from-emerald-500 to-teal-600",
    status: "live",
    since: "2026",
    highlights: ["5 dịch vụ", "Lịch sử sự cố 90 ngày"],
  },
];

/**
 * Placeholder entries live here until the real ones are supplied, so the page
 * never ships invented numbers or fake products. Move them into PROJECTS
 * above — with real values — as they become available.
 */
export const PROJECT_TEMPLATE: Project = {
  id: "ten-du-an",
  name: "Tên dự án",
  url: "https://example.com",
  tagline: "Một câu nói dự án này làm gì",
  description: "Vài câu mô tả chi tiết hơn: giải quyết vấn đề gì, cho ai.",
  tech: ["Tech 1", "Tech 2"],
  accent: "from-emerald-500 to-teal-600",
  status: "live",
  since: "2026",
  highlights: [],
};
