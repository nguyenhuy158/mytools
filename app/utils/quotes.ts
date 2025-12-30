export interface Quote {
  id: string;
  en: string;
  vi: string;
  source?: string;
}

export const quotes: Quote[] = [
  {
    id: "1",
    en: "The only way to do great work is to love what you do.",
    vi: "Cách duy nhất để làm việc tuyệt vời là yêu thích những gì bạn làm.",
    source: "Steve Jobs",
  },
  {
    id: "2",
    en: "Innovation distinguishes between a leader and a follower.",
    vi: "Sự đổi mới phân biệt giữa một nhà lãnh đạo và một người theo sau.",
    source: "Steve Jobs",
  },
  {
    id: "3",
    en: "Life is what happens when you're busy making other plans.",
    vi: "Cuộc sống là những gì xảy ra khi bạn đang bận rộn lên kế hoạch khác.",
    source: "John Lennon",
  },
  {
    id: "4",
    en: "The future belongs to those who believe in the beauty of their dreams.",
    vi: "Tương lai thuộc về những người tin vào vẻ đẹp của những giấc mơ của họ.",
    source: "Eleanor Roosevelt",
  },
  {
    id: "5",
    en: "It is during our darkest moments that we must focus to see the light.",
    vi: "Chính trong những lúc tối tăm nhất của chúng ta mà chúng ta phải tập trung để thấy ánh sáng.",
    source: "Aristotle",
  },
  {
    id: "6",
    en: "Do not save what is left after spending; instead spend what is left after saving.",
    vi: "Đừng tiết kiệm thứ gì còn lại sau khi chi tiêu, hãy chi tiêu thứ gì còn lại sau khi tiết kiệm.",
    source: "Warren Buffett",
  },
];

export function getRandomQuote(): Quote {
  return quotes[Math.floor(Math.random() * quotes.length)];
}
