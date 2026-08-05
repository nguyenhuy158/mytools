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
  /**
   * URL to screenshot, when `url` itself renders nothing useful — e.g. an
   * index page that only redirects. Capture only; the card still links to
   * `url` and the uptime check still pings `url`.
   */
  shotUrl?: string;
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
  {
    id: "en-gemini",
    name: "Học Tiếng Anh cùng Gemini",
    url: "https://en.huyab.click",
    tagline: "Luyện tiếng Anh với trợ lý Gemini, có chấm phát âm",
    description:
      "Bài học theo chủ đề — chào hỏi, giới thiệu bản thân, gia đình, mua " +
      "sắm, màu sắc và quần áo — hội thoại với Gemini, chọn giọng đọc và " +
      "luyện phát âm. Có tài khoản riêng để lưu lịch sử học.",
    tech: ["React", "Gemini AI", "Text-to-speech", "Cloudflare"],
    image: "/projects/en-gemini.png",
    accent: "from-sky-500 to-blue-600",
    status: "live",
    since: "2026",
    highlights: ["Bài học theo chủ đề", "Luyện phát âm"],
  },
  {
    id: "bingo",
    name: "Bingo Vận Động",
    url: "https://bingo.huyab.click",
    tagline: "Thẻ bingo thử thách vận động cho cả team",
    description:
      "Mỗi ô là một thử thách: chạy trước 7h sáng, check-in cùng cả team, " +
      "khám phá cung đường mới, chụp ảnh với hoa lá. Người chơi chụp ảnh " +
      "để đánh dấu ô đã hoàn thành và xem hoạt động của người khác.",
    tech: ["React + Vite", "Cloudflare Pages", "Workers API"],
    image: "/projects/bingo.png",
    accent: "from-fuchsia-500 to-pink-600",
    status: "live",
    since: "2026",
    highlights: ["Check-in bằng ảnh", "Chơi theo team"],
  },
  {
    id: "caro",
    name: "Sport Caro Helper",
    url: "https://caro.huyab.click",
    tagline: "Tính kết quả và thời gian cho giải Sport Caro",
    description:
      "Công cụ kiểm tra kết quả trên bảng grid và tính thời gian theo hướng " +
      "thi đấu, cố định hàng (KM) hoặc cố định cột (pace). Đăng nhập Google " +
      "để lưu lịch sử tính toán.",
    tech: ["React", "Google OAuth", "Cloudflare"],
    image: "/projects/caro.png",
    accent: "from-lime-500 to-green-600",
    status: "live",
    since: "2026",
    highlights: ["Bảng grid", "Tính pace"],
  },
  {
    id: "zenspend",
    name: "ZenSpend",
    url: "https://anchi.huyab.click",
    tagline: "Nhập và quản lý dữ liệu tài chính cá nhân",
    description:
      "Import dữ liệu chi tiêu rồi quản lý trên một giao diện gọn, tập " +
      "trung vào việc đưa số liệu vào nhanh và xem lại trực quan.",
    tech: ["React", "Cloudflare"],
    image: "/projects/zenspend.png",
    accent: "from-teal-500 to-cyan-600",
    status: "live",
    since: "2026",
    highlights: ["Import dữ liệu"],
  },
  {
    id: "spx-tracker",
    name: "SPX Tracker",
    url: "https://shopee.huyab.click",
    tagline: "Theo dõi nhiều đơn giao hàng ở một chỗ",
    description:
      "Thêm mã vận đơn vào danh sách theo dõi và xem trạng thái giao hàng " +
      "tập trung, không phải mở từng đơn. Đăng nhập bằng Google.",
    tech: ["React", "Google OAuth", "Cloudflare"],
    image: "/projects/spx-tracker.png",
    accent: "from-orange-500 to-red-600",
    status: "live",
    since: "2026",
    highlights: ["Nhiều đơn cùng lúc"],
  },
  {
    id: "tao-danh-sach-don",
    name: "Chấm công & Tạo danh sách đơn",
    url: "https://tdtu.huyab.click",
    tagline: "Chấm công, tính lương và quản lý internship",
    description:
      "Bảng chấm công theo buổi cho từng người làm, tính lương, quản lý " +
      "internship, thống kê và lịch sử thay đổi. Có hướng dẫn sử dụng và " +
      "đổi mật khẩu ngay trong app.",
    tech: ["Cloudflare Pages", "Workers API", "JWT"],
    image: "/projects/tao-danh-sach-don.png",
    // The index page only runs a JS redirect, so it screenshots blank.
    shotUrl: "https://tdtu.huyab.click/pages/dang-nhap.html",
    accent: "from-indigo-500 to-violet-600",
    status: "live",
    since: "2026",
    highlights: ["Chấm công theo buổi", "Tính lương"],
  },
  {
    id: "dichvu-pc",
    name: "Dịch vụ PC",
    url: "https://worker.huyab.click",
    tagline: "Trang giới thiệu dịch vụ cài win và vệ sinh máy tại nhà",
    description:
      "Landing page cho dịch vụ cài Windows 10/11 kèm driver, cài phần mềm " +
      "văn phòng và đồ họa, vệ sinh máy tính tại nhà. Có danh sách dịch vụ " +
      "và thông tin liên hệ.",
    tech: ["Cloudflare Workers"],
    image: "/projects/dichvu-pc.png",
    accent: "from-slate-500 to-gray-700",
    status: "live",
    since: "2026",
    highlights: ["Landing page dịch vụ"],
  },
  {
    id: "chatroom",
    name: "Chatroom",
    url: "https://chat.huyab.click",
    tagline: "Phòng chat realtime viết bằng Python Workers",
    description:
      "Chat theo room qua WebSocket, dùng Durable Objects và Hibernation " +
      "API để giữ kết nối mà không tốn tài nguyên khi phòng đang im. Viết " +
      "bằng Python trên Cloudflare Workers.",
    tech: ["Python Workers", "WebSockets", "Durable Objects"],
    image: "/projects/chatroom.png",
    accent: "from-violet-500 to-purple-600",
    status: "live",
    since: "2026",
    highlights: ["Hibernation API", "Python trên Workers"],
  },
  {
    id: "blog-profile",
    name: "Build, Break, Learn",
    url: "https://profile.huyab.click",
    tagline: "Blog cá nhân về tool, thử nghiệm và mẹo nhỏ",
    description:
      "Nơi viết về công nghệ, công cụ, các thử nghiệm và những mẹo nhỏ dùng " +
      "được. Có mục About, Uses, Archive và tìm kiếm theo taxonomy.",
    tech: ["Static site", "Cloudflare"],
    image: "/projects/blog-profile.png",
    accent: "from-rose-500 to-pink-600",
    status: "live",
    since: "2026",
    highlights: ["Archive", "Uses page"],
  },
  {
    id: "helper-cli",
    name: "Helper CLI Docs",
    url: "https://helper.huyab.click",
    tagline: "Tài liệu cho bộ công cụ dòng lệnh Helper",
    description:
      "Trang tài liệu cho CLI nội bộ: danh sách command, option và kiểu dữ " +
      "liệu, kèm ô tìm kiếm. Dựng bằng MkDocs Material, host trên GitHub " +
      "Pages qua subdomain riêng.",
    tech: ["MkDocs Material", "GitHub Pages"],
    image: "/projects/helper-cli.png",
    accent: "from-cyan-500 to-sky-600",
    status: "live",
    since: "2026",
    highlights: ["Có search"],
  },
  {
    id: "vite-portfolio",
    name: "My Portfolio",
    url: "https://vite.huyab.click",
    tagline: "Trang portfolio cá nhân dựng bằng React + Vite",
    description:
      "Portfolio một trang, dựng bằng React và Vite, deploy lên Cloudflare " +
      "Pages.",
    tech: ["React + Vite", "Cloudflare Pages"],
    image: "/projects/vite-portfolio.png",
    accent: "from-yellow-500 to-amber-600",
    status: "live",
    since: "2026",
  },
  {
    id: "billsplitter",
    name: "BillSplitter",
    url: "https://share.huyab.click",
    tagline: "Bản chia tiền nhóm đời đầu, tiếng Anh",
    description:
      "Chia hóa đơn theo danh sách khoản chi và ma trận ai chịu khoản nào, " +
      "ra tổng cuối cùng cho từng người. Là bản tiền thân của Chia kèo, " +
      "giữ lại để đối chiếu.",
    tech: ["React", "Cloudflare Pages"],
    image: "/projects/billsplitter.png",
    accent: "from-stone-500 to-neutral-700",
    status: "archived",
    since: "2025",
    highlights: ["Assignment matrix"],
  },
  {
    id: "huyab-blog",
    name: "Huyab Blog",
    url: "https://blog.huyab.click",
    tagline: "Blog Docusaurus hai ngôn ngữ, đang dựng nội dung",
    description:
      "Blog và docs dựng bằng Docusaurus, có sẵn EN/VI. Phần khung đã chạy " +
      "nhưng nội dung vẫn còn nhiều bài mẫu, nên còn xếp là đang làm.",
    tech: ["Docusaurus", "i18n", "Cloudflare"],
    image: "/projects/huyab-blog.png",
    accent: "from-emerald-500 to-green-700",
    status: "wip",
    since: "2026",
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
