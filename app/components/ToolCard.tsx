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
      className="group relative bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-3xl shadow-lg hover:shadow-2xl hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 overflow-hidden border border-white/20 dark:border-white/10"
    >
      <div className={`h-1 absolute top-0 left-0 right-0 ${color}`} />
      <div className="p-6">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4 text-white shadow-2xl`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {name}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          {description}
        </p>
      </div>
    </Link>
  );
}
