import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Upload, Download, Copy, ClipboardPaste, Crop, Palette, Trash2, Image as ImageIcon, MousePointer2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../../components/PageHeader";
import { ButtonGroup } from "../../components/ButtonGroup";
import { HistorySection } from "../../components/HistorySection";
import { useLocalStorageHistory } from "../../utils/history";

export function meta() {
  return [
    { title: "Image Tools - Edit, Crop, Color Pick" },
    { name: "description", content: "Free online image manipulation tools." },
  ];
}

type ToolMode = "view" | "crop" | "picker";

export default function ImageTools() {
  const { t } = useTranslation();
  const [image, setImage] = useState<string | null>(null);
  const [mode, setMode] = useState<ToolMode>("view");
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  const [hoverColor, setHoverColor] = useState<string | null>(null);
  const { history: colorHistory, setHistory: setColorHistory, clearHistory, removeFromHistory } = useLocalStorageHistory<string>("image-tools-color-history");
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  
  // Selection state
  const [selection, setSelection] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addToHistory = (color: string) => {
    setColorHistory(prev => {
      // Remove if exists to move to top
      const filtered = prev.filter(c => c !== color);
      return [color, ...filtered].slice(0, 20); // Keep last 20
    });
  };

  const handleClearHistory = () => {
    clearHistory();
    toast.success(t("image_tools.toast.history_cleared"));
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error(t("image_tools.toast.invalid_file"));
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setSelection(null);
        setPickedColor(null);
        setHoverColor(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const drawImage = useCallback(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        // Draw selection overlay
        if (selection && mode === "crop") {
          if (!ctx) return;
          ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Clear the selected area to show original image
          ctx.clearRect(selection.x, selection.y, selection.w, selection.h);
          ctx.drawImage(img, selection.x, selection.y, selection.w, selection.h, selection.x, selection.y, selection.w, selection.h);
          
          // Draw border
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(selection.x, selection.y, selection.w, selection.h);
        }
      };
      img.src = image;
    }
  }, [image, selection, mode]);

  useEffect(() => {
    drawImage();
  }, [drawImage]);

  const handlePaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        if (item.types.some(type => type.startsWith("image/"))) {
          const blob = await item.getType(item.types.find(type => type.startsWith("image/"))!);
          const reader = new FileReader();
          reader.onload = (event) => {
            setImage(event.target?.result as string);
            setSelection(null);
            setPickedColor(null);
            setHoverColor(null);
            toast.success(t("image_tools.toast.pasted"));
          };
          reader.readAsDataURL(blob);
          return;
        }
      }
      toast.info(t("image_tools.toast.no_image_clipboard"));
    } catch (e) {
      toast.error(t("image_tools.toast.clipboard_error"));
    }
  };

  const handleCopy = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob })
          ]);
          toast.success(t("image_tools.toast.copied"));
        }
      });
    } catch (e) {
      toast.error(t("image_tools.toast.copy_error"));
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "edited-image.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const handleCrop = () => {
    if (!selection || !canvasRef.current || !image) return;
    
    const canvas = document.createElement("canvas");
    canvas.width = selection.w;
    canvas.height = selection.h;
    const ctx = canvas.getContext("2d");
    
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, selection.x, selection.y, selection.w, selection.h, 0, 0, selection.w, selection.h);
      setImage(canvas.toDataURL("image/png"));
      setSelection(null);
      setMode("view");
      toast.success(t("image_tools.toast.cropped"));
    };
    img.src = image;
  };

  // Mouse Event Handlers
  const getCanvasCoordinates = (e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode === "crop") {
      const pos = getCanvasCoordinates(e);
      setIsDragging(true);
      setStartPos(pos);
      setSelection({ x: pos.x, y: pos.y, w: 0, h: 0 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getCanvasCoordinates(e);
    setCursorPos({ x: e.clientX, y: e.clientY });

    if (mode === "picker" && canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
            // Get color at cursor for preview
            const pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data;
            const hex = "#" + [pixel[0], pixel[1], pixel[2]].map(x => x.toString(16).padStart(2, "0")).join("");
            setHoverColor(hex);
        }
    } else {
        setHoverColor(null);
    }

    if (mode === "crop" && isDragging && startPos) {
      const w = pos.x - startPos.x;
      const h = pos.y - startPos.y;
      
      setSelection({
        x: w > 0 ? startPos.x : pos.x,
        y: h > 0 ? startPos.y : pos.y,
        w: Math.abs(w),
        h: Math.abs(h)
      });
    }
  };

  const handleMouseUp = () => {
    if (mode === "crop") {
      setIsDragging(false);
    }
  };

  const handleMouseLeave = () => {
      setHoverColor(null);
      if (mode === "crop") {
          setIsDragging(false);
      }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (mode === "picker" && canvasRef.current) {
      const pos = getCanvasCoordinates(e);
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        const pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data;
        const hex = "#" + [pixel[0], pixel[1], pixel[2]].map(x => x.toString(16).padStart(2, "0")).join("");
        setPickedColor(hex);
        addToHistory(hex);
        navigator.clipboard.writeText(hex);
        toast.success(t("image_tools.toast.color_copied", { hex }));
      }
    }
  };

  const handleClear = () => {
    setImage(null);
    setSelection(null);
    setPickedColor(null);
    setHoverColor(null);
    setMode("view");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col gap-6 h-full">
        <PageHeader
          title={t("image_tools.title")}
          description={t("image_tools.description")}
        />

        {/* Toolbar */}
        <ButtonGroup>
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Upload className="w-4 h-4" /> {t("image_tools.actions.upload")}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleUpload}
            />
            
            <button onClick={handlePaste} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
              <ClipboardPaste className="w-4 h-4" /> {t("image_tools.actions.paste")}
            </button>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2" />

            <button 
              onClick={() => setMode("view")} 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${mode === "view" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
            >
              <MousePointer2 className="w-4 h-4" /> {t("image_tools.actions.view")}
            </button>
            <button 
              onClick={() => setMode("crop")} 
              disabled={!image}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${mode === "crop" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" : "hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"}`}
            >
              <Crop className="w-4 h-4" /> {t("image_tools.actions.crop")}
            </button>
            <button 
              onClick={() => setMode("picker")} 
              disabled={!image}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${mode === "picker" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" : "hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"}`}
            >
              <Palette className="w-4 h-4" /> {t("image_tools.actions.color_picker")}
            </button>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2" />

            <button onClick={handleCopy} disabled={!image} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50 transition-colors" title={t("image_tools.actions.copy")}>
              <Copy className="w-4 h-4" />
            </button>
            <button onClick={handleDownload} disabled={!image} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50 transition-colors" title={t("image_tools.actions.download")}>
              <Download className="w-4 h-4" />
            </button>
            <button onClick={handleClear} disabled={!image} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg disabled:opacity-50 transition-colors" title={t("image_tools.actions.clear")}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </ButtonGroup>

        {/* Workspace */}
        <div className="flex-1 flex flex-col gap-6 min-h-0">
          
          {/* Main Canvas Area */}
          <div 
            ref={containerRef}
            className="flex-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center justify-center overflow-auto min-h-[400px] relative"
          >
            {image ? (
              <canvas 
                ref={canvasRef} 
                className={`max-w-full max-h-[70vh] shadow-lg ${mode === "picker" ? "cursor-none" : mode === "crop" ? "cursor-crosshair" : "cursor-default"}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
              />
            ) : (
              <div className="text-center text-gray-400">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>{t("image_tools.placeholders.empty")}</p>
              </div>
            )}
            
            {/* Hover Color Preview - Follows Cursor */}
            {hoverColor && mode === "picker" && cursorPos && (
                <div 
                    className="fixed pointer-events-none z-50 flex items-center gap-2 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-full shadow-xl border border-gray-200 dark:border-gray-700"
                    style={{ 
                        left: cursorPos.x + 20, 
                        top: cursorPos.y + 20,
                    }}
                >
                    <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600" style={{ backgroundColor: hoverColor }} />
                    <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">{hoverColor}</span>
                </div>
            )}

            {/* Color Picker Result Overlay */}
            {pickedColor && (
              <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                <div className="w-8 h-8 rounded border border-gray-200 dark:border-gray-600" style={{ backgroundColor: pickedColor }} />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-bold">HEX</span>
                  <span className="text-sm font-mono font-medium">{pickedColor}</span>
                </div>
              </div>
            )}

            {/* Crop Actions Overlay */}
            {selection && selection.w > 0 && mode === "crop" && (
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex gap-2 animate-in fade-in slide-in-from-bottom-2">
                 <button onClick={handleCrop} className="btn btn-primary btn-sm">
                   {t("image_tools.actions.apply_crop")}
                 </button>
                 <button onClick={() => setSelection(null)} className="btn btn-secondary btn-sm">
                   {t("image_tools.actions.cancel")}
                 </button>
               </div>
            )}
          </div>

          <HistorySection
            history={colorHistory}
            onRestore={(color) => {
                navigator.clipboard.writeText(color);
                toast.success(t("image_tools.toast.color_copied", { hex: color }));
            }}
            onRemove={removeFromHistory}
            onClear={handleClearHistory}
            title={t("image_tools.color_history", "Color History")}
            clearLabel={t("image_tools.actions.clear_all", "Clear All")}
            renderItem={(color) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm" style={{ backgroundColor: color }} />
                    <span className="font-mono text-sm font-medium text-gray-700 dark:text-gray-300">{color}</span>
                </div>
            )}
          />

        </div>
      </div>
    </div>
  );
}
