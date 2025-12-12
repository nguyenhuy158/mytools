import { useTranslation } from "react-i18next";
import { CheckCircle2, Circle, Clock, Construction, Hammer, Lightbulb } from "lucide-react";

export default function Roadmap() {
  const { t } = useTranslation();

  const roadmapItems = [
    {
      status: "done",
      title: "Core Tools",
      items: [
        { name: "JSON Formatter/Minifier", desc: "Format and validate JSON data", link: "/json-tools" },
        { name: "Text Diff Checker", desc: "Compare text differences", link: "/text-diff" },
        { name: "Pomodoro Timer", desc: "Productivity timer with custom settings", link: "/pomodoro" },
        { name: "Calendar & Events", desc: "Lunar calendar and event tracking", link: "/calendar" },
        { name: "Tet Countdown", desc: "Countdown to Vietnamese New Year", link: "/" },
      ]
    },
    {
      status: "planned",
      title: "Developer Tools (Sắp tới)",
      items: [
        { name: "QR Code Generator", desc: "Create QR codes for URLs and text" },
        { name: "Password Generator", desc: "Secure random password creator" },
        { name: "Base64 Converter", desc: "Encode and decode Base64 strings" },
        { name: "Hash Calculator", desc: "MD5, SHA-1, SHA-256 hash generation" },
      ]
    },
    {
      status: "idea",
      title: "Utilities & Lifestyle (Ý tưởng)",
      items: [
        { name: "Markdown Preview", desc: "Live markdown editor and preview" },
        { name: "Unit Converter", desc: "Convert length, weight, temperature" },
        { name: "Image Converter", desc: "Convert image formats client-side" },
        { name: "Internet Speed Test", desc: "Basic download speed check" },
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "planned": return <Hammer className="w-5 h-5 text-blue-500" />;
      case "idea": return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      default: return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done": return "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800";
      case "planned": return "border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800";
      case "idea": return "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800";
      default: return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Project Roadmap
          </h1>
          <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
            Hành trình phát triển và các tính năng sắp tới
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {roadmapItems.map((category, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col h-full">
              <div className={`px-6 py-4 border-b ${getStatusColor(category.status)} flex items-center gap-2`}>
                {getStatusIcon(category.status)}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  {category.title}
                </h3>
              </div>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700 flex-1">
                {category.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <h4 className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          {item.name}
                          {category.status === 'done' && item.link && (
                            <a href={item.link} className="text-xs font-normal text-blue-600 hover:text-blue-500 hover:underline">
                              (Open)
                            </a>
                          )}
                        </h4>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-200 dark:border-gray-700 text-center">
          <Construction className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bạn có ý tưởng mới?</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Chúng tôi luôn lắng nghe ý kiến đóng góp để phát triển bộ công cụ hữu ích hơn.
          </p>
        </div>
      </div>
    </div>
  );
}
