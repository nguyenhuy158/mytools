import { useState, useEffect } from "react";

export function OnlineUsers() {
    // Initial random count between 3 and 15
    const [count, setCount] = useState(3);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setCount(Math.floor(Math.random() * 12) + 3);

        const interval = setInterval(() => {
            // Randomly fluctuate by -1, 0, or +1, keeping within bounds
            setCount(prev => {
                const change = Math.floor(Math.random() * 3) - 1; 
                let next = prev + change;
                if (next < 2) next = 2;
                if (next > 30) next = 30;
                return next;
            });
        }, 8000); // Change every 8 seconds

        return () => clearInterval(interval);
    }, []);

    if (!mounted) return null;

    return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
            <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">{count}</span>
        </div>
    );
}
