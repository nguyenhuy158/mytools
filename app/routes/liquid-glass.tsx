import React, { useState, useMemo } from "react";

interface DataPoint {
  label: string;
  value: number;
  color: string;
}

const LiquidGlass: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartData: DataPoint[] = useMemo(
    () => [
      { label: "Python", value: 92, color: "from-blue-400 to-blue-600" },
      { label: "TypeScript", value: 85, color: "from-cyan-400 to-cyan-600" },
      { label: "React", value: 88, color: "from-indigo-400 to-indigo-600" },
      { label: "Cloudflare", value: 78, color: "from-orange-400 to-orange-600" },
      { label: "Design", value: 82, color: "from-pink-400 to-pink-600" },
    ],
    []
  );

  return (
    <div className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Animated gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="relative z-10 px-6 py-20 md:px-12">
        {/* Header Section */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-4 bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent animate-fade-in">
            Liquid Glass
          </h1>
          <p className="text-lg md:text-xl text-gray-300 font-light tracking-wide">
            Frosted Elegance Meets Modern Design
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Glass Card 1 - Stats Overview */}
          <div className="group cursor-pointer h-full">
            <div className="relative h-full backdrop-blur-2xl bg-white/10 dark:bg-white/5 rounded-[24px] border border-white/30 dark:border-white/10 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden">
              {/* Inner glow effect */}
              <div className="absolute inset-0 rounded-[24px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-[24px]"></div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-light text-white tracking-tight">
                    Performance Matrix
                  </h2>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                </div>

                <div className="space-y-5">
                  {chartData.map((item, index) => (
                    <div
                      key={index}
                      className="group/item"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-light text-gray-200 tracking-wide">
                          {item.label}
                        </span>
                        <span className="text-sm font-light text-cyan-300">
                          {item.value}%
                        </span>
                      </div>
                      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/20">
                        <div
                          className={`h-full bg-gradient-to-r ${item.color} transition-all duration-500 rounded-full shadow-lg`}
                          style={{
                            width: `${hoveredIndex === index ? item.value + 5 : item.value}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Glass Card 2 - Feature Showcase */}
          <div className="group cursor-pointer h-full">
            <div className="relative h-full backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 dark:from-white/5 dark:to-white/[0.02] rounded-[24px] border border-white/30 dark:border-white/10 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden">
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              <div className="relative z-10">
                <h2 className="text-2xl font-light text-white tracking-tight mb-8">
                  Design System
                </h2>

                <div className="space-y-4">
                  {[
                    { icon: "✨", title: "Ultra-Glossy", desc: "Translucent layers" },
                    { icon: "🌊", title: "Fluid Motion", desc: "Smooth animations" },
                    { icon: "🎨", title: "Vibrant Gradients", desc: "Dynamic colors" },
                    { icon: "🔮", title: "Frosted Glass", desc: "Deep blur effect" },
                  ].map((feature, idx) => (
                    <div key={idx} className="group/feature">
                      <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20">
                        <span className="text-2xl mt-1">{feature.icon}</span>
                        <div>
                          <p className="font-medium text-white text-sm tracking-wide">
                            {feature.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {feature.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wide Glass Card - Visualization */}
        <div className="max-w-6xl mx-auto group cursor-pointer">
          <div className="relative backdrop-blur-2xl bg-white/10 dark:bg-white/5 rounded-[24px] border border-white/30 dark:border-white/10 p-8 md:p-12 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden">
            {/* Inner border highlight */}
            <div className="absolute inset-0 rounded-[24px] border border-white/20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative z-10">
              <h2 className="text-3xl font-light text-white tracking-tight mb-2">
                Liquid Glass Aesthetic
              </h2>
              <p className="text-gray-300 text-sm font-light mb-8 tracking-wide">
                Crafted with precision for modern macOS-inspired experiences
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    label: "Transparency",
                    value: "95%",
                    desc: "Ultra-clear glassmorphism",
                  },
                  { label: "Blur Depth", value: "32px", desc: "Frosted backdrop" },
                  { label: "Border Radius", value: "24px", desc: "Smooth corners" },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    <p className="text-xs font-light text-gray-400 tracking-widest uppercase mb-2">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-light text-cyan-300 mb-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500">{stat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom accent cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {[
            {
              gradient: "from-pink-500/40 to-rose-500/40",
              title: "Minimalist Layout",
              text: "Clean, spacious design philosophy",
            },
            {
              gradient: "from-blue-500/40 to-indigo-500/40",
              title: "Apple-Style Typography",
              text: "Elegant fonts and careful spacing",
            },
          ].map((card, idx) => (
            <div key={idx} className="group cursor-pointer">
              <div className="relative backdrop-blur-2xl bg-gradient-to-br from-white/8 to-white/5 dark:from-white/4 dark:to-white/[0.02] rounded-[24px] border border-white/20 dark:border-white/10 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div
                  className={`absolute inset-0 rounded-[24px] bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                ></div>
                <div className="relative z-10">
                  <h3 className="text-lg font-light text-white mb-2 tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-300 font-light">
                    {card.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        /* Smooth scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default LiquidGlass;
