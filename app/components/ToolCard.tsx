import { Link } from "react-router";
import type { LucideIcon } from "lucide-react";

interface ToolCardProps {
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

export function ToolCard({ name, description, href, icon: Icon, color }: ToolCardProps) {
  return (
    <Link
      to={href}
      className="group relative bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-800"
    >
      <div className={`h-2 absolute top-0 left-0 right-0 ${color}`} />
      <div className="p-6">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4 text-white shadow-lg`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {name}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
    </Link>
  );
}
