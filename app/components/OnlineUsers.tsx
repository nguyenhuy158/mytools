import { useState, useEffect, useRef } from "react";

export function OnlineUsers() {
    const [count, setCount] = useState(0);
    const [mounted, setMounted] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        setMounted(true);

        // Connect to WebSocket for real-time user count
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/api/online-counter/ws`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("Connected to online counter");
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "count") {
                    setCount(data.count);
                }
            } catch (error) {
                console.error("Failed to parse message:", error);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.onclose = () => {
            console.log("Disconnected from online counter");
        };

        // Send periodic ping to keep connection alive
        const pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: "ping" }));
            }
        }, 30000);

        return () => {
            clearInterval(pingInterval);
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    if (!mounted) return null;

    return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 dark:bg-white/10 backdrop-blur-sm border border-white/20 dark:border-white/10">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
            <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">{count}</span>
        </div>
    );
}
