import { Link } from "react-router";
import { FileJson, FileDiff } from "lucide-react";

export default function ITToolsLanding() {
  const tools = [
    {
      name: "JSON Tools",
      description: "Format, minify, and validate JSON data.",
      href: "/it/json-tools",
      icon: FileJson,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      name: "Text Diff",
      description: "Compare text differences side by side.",
      href: "/it/text-diff",
      icon: FileDiff,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            IT Tools
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-lg">
            Essential tools for developers and IT professionals.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              to={tool.href}
              className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow group"
            >
              <div className={`w-12 h-12 ${tool.bgColor} rounded-xl flex items-center justify-center mb-4 ${tool.color}`}>
                <tool.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tool.name}
              </h3>
              <p className="text-slate-500 dark:text-gray-400 leading-relaxed">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
