import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Upload, Download, Trash2, FileText, ArrowUp, ArrowDown, Scissors, Layers, Plus } from "lucide-react";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";
import { PageHeader } from "../../components/PageHeader";
import { ButtonGroup } from "../../components/ButtonGroup";

export function meta() {
    return [
        { title: "PDF Tools - Merge & Split" },
        { name: "description", content: "Merge and Split PDF files entirely in your browser." },
    ];
}

type Tab = "merge" | "split";

interface PDFFile {
    id: string;
    file: File;
    name: string;
    size: string;
}

export default function PDFTools() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<Tab>("merge");

    // Merge State
    const [mergeFiles, setMergeFiles] = useState<PDFFile[]>([]);

    // Split State
    const [splitFile, setSplitFile] = useState<PDFFile | null>(null);
    const [splitMode, setSplitMode] = useState<"all" | "range">("all");
    const [pageRange, setPageRange] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newFiles: PDFFile[] = Array.from(files).map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            name: file.name,
            size: formatSize(file.size)
        }));

        if (activeTab === "merge") {
            setMergeFiles(prev => [...prev, ...newFiles]);
        } else {
            if (newFiles.length > 0) {
                setSplitFile(newFiles[0]);
            }
        }

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Merge Functions
    const moveFile = (index: number, direction: "up" | "down") => {
        const newFiles = [...mergeFiles];
        if (direction === "up" && index > 0) {
            [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]];
        } else if (direction === "down" && index < newFiles.length - 1) {
            [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
        }
        setMergeFiles(newFiles);
    };

    const removeFile = (id: string) => {
        setMergeFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleMerge = async () => {
        if (mergeFiles.length === 0) {
            toast.error(t("pdf_tools.toast.no_files"));
            return;
        }

        try {
            const mergedPdf = await PDFDocument.create();

            for (const fileObj of mergeFiles) {
                const fileBuffer = await fileObj.file.arrayBuffer();
                const pdf = await PDFDocument.load(fileBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const pdfBytes = await mergedPdf.save();
            downloadPdf(pdfBytes, "merged-document.pdf");
            toast.success(t("pdf_tools.toast.merged"));
        } catch (error) {
            console.error(error);
            toast.error(t("pdf_tools.toast.merge_error"));
        }
    };

    // Split Functions
    const handleSplit = async () => {
        if (!splitFile) {
            toast.error(t("pdf_tools.toast.no_files"));
            return;
        }

        try {
            const fileBuffer = await splitFile.file.arrayBuffer();
            const pdf = await PDFDocument.load(fileBuffer);
            const totalPages = pdf.getPageCount();

            if (splitMode === "all") {
                // Split into individual files (zip would be better but let's download one by one or create a zip?
                // Downloading too many files is blocked by browsers.
                // Ideally we should zip them. But for now maybe just split into ONE specific PDF?
                // Actually "Split all pages" usually means ONE file per page.
                // Browsers might block multiple downloads.
                // Let's implement extracting to a new PDF for now (extract mode) or zip if I had JSZip.
                // I don't see JSZip. I'll stick to extracting specific pages to a SINGLE new PDF for "extract" mode.
                // For "all pages", I might need to clarify component capabilities.
                // Let's just implement Extract Range for now as the primary "Split" feature.
                // Or if "all" is selected, creating a ZIP requires a library.
                // Let's refine the "Split" to "Extract Pages" mainly.
                // If user wants to split into individual files, I'll add that later with JSZip.
                // For now, I'll interpret "Split all pages" as "Not supported yet" or just remove it?
                // No, let's just do Extract Pages first.

                // Wait, I can implement "Split" as "Save specific range as new PDF".
                // "All pages" doesn't make sense unless we zip.

                toast.info("Splitting to ZIP not yet supported. Please use Extract Range.");
                return;
            }

            // Parse range
            const pagesToKeep = new Set<number>();
            const parts = pageRange.split(",");

            for (const part of parts) {
                const range = part.trim().split("-");
                if (range.length === 1) {
                    const p = parseInt(range[0]);
                    if (!isNaN(p) && p >= 1 && p <= totalPages) pagesToKeep.add(p - 1); // 0-indexed
                } else if (range.length === 2) {
                    const start = parseInt(range[0]);
                    const end = parseInt(range[1]);
                    if (!isNaN(start) && !isNaN(end)) {
                        for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
                            if (i >= 1 && i <= totalPages) pagesToKeep.add(i - 1);
                        }
                    }
                }
            }

            if (pagesToKeep.size === 0) {
                toast.error(t("pdf_tools.toast.no_range"));
                return;
            }

            const newPdf = await PDFDocument.create();
            const copiedPages = await newPdf.copyPages(pdf, Array.from(pagesToKeep).sort((a, b) => a - b));
            copiedPages.forEach(page => newPdf.addPage(page));

            const pdfBytes = await newPdf.save();
            downloadPdf(pdfBytes, `${splitFile.name.replace(".pdf", "")}-split.pdf`);
            toast.success(t("pdf_tools.toast.split"));

        } catch (error) {
            console.error(error);
            toast.error(t("pdf_tools.toast.split_error"));
        }
    };

    const downloadPdf = (bytes: Uint8Array, filename: string) => {
        const blob = new Blob([bytes as any], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 p-4 md:p-8 font-sans">
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
                <PageHeader
                    title={t("pdf_tools.title")}
                    description={t("pdf_tools.description")}
                />

                {/* Tabs */}
                <div className="flex p-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 w-fit">
                    <button
                        onClick={() => setActiveTab("merge")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "merge"
                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            }`}
                    >
                        <Layers className="w-4 h-4" /> {t("pdf_tools.tabs.merge")}
                    </button>
                    <button
                        onClick={() => setActiveTab("split")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "split"
                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            }`}
                    >
                        <Scissors className="w-4 h-4" /> {t("pdf_tools.tabs.split")}
                    </button>
                </div>

                {/* Main Area */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 min-h-[400px] flex flex-col">

                    {/* Action Bar */}
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm active:scale-95 transform duration-100"
                        >
                            <Plus className="w-4 h-4" /> {t("pdf_tools.actions.upload")}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".pdf"
                            multiple={activeTab === "merge"}
                            onChange={handleUpload}
                        />

                        {activeTab === "merge" && mergeFiles.length > 0 && (
                            <button
                                onClick={() => setMergeFiles([])}
                                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                            >
                                {t("pdf_tools.actions.clear")}
                            </button>
                        )}
                    </div>

                    {/* Content Tab: Merge */}
                    {activeTab === "merge" && (
                        <div className="flex-1 flex flex-col gap-4">
                            {mergeFiles.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-8">
                                    <Layers className="w-16 h-16 opacity-20 mb-4" />
                                    <p>{t("pdf_tools.placeholders.empty_merge")}</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {mergeFiles.map((file, idx) => (
                                        <div key={file.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800 group hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-colors">
                                            <div className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-sm truncate">{file.name}</h3>
                                                <p className="text-xs text-gray-500">{file.size}</p>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => moveFile(idx, "up")}
                                                    disabled={idx === 0}
                                                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 disabled:opacity-30 transition-colors"
                                                >
                                                    <ArrowUp className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => moveFile(idx, "down")}
                                                    disabled={idx === mergeFiles.length - 1}
                                                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 disabled:opacity-30 transition-colors"
                                                >
                                                    <ArrowDown className="w-4 h-4" />
                                                </button>
                                                <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1" />
                                                <button
                                                    onClick={() => removeFile(file.id)}
                                                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {mergeFiles.length > 0 && (
                                <div className="flex justify-end mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <button
                                        onClick={handleMerge}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-lg shadow-indigo-500/20"
                                    >
                                        <Download className="w-4 h-4" /> {t("pdf_tools.actions.merge")}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Content Tab: Split */}
                    {activeTab === "split" && (
                        <div className="flex-1 flex flex-col gap-6">
                            {!splitFile ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-8">
                                    <Scissors className="w-16 h-16 opacity-20 mb-4" />
                                    <p>{t("pdf_tools.placeholders.empty_split")}</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <div className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium truncate">{splitFile.name}</h3>
                                            <p className="text-sm text-gray-500">{splitFile.size}</p>
                                        </div>
                                        <button
                                            onClick={() => setSplitFile(null)}
                                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {t("pdf_tools.message", "Split Options")}
                                        </label>

                                        <div className="space-y-3">
                                            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                                                <input
                                                    type="radio"
                                                    name="splitMode"
                                                    checked={splitMode === "range"}
                                                    onChange={() => setSplitMode("range")}
                                                    className="text-indigo-600"
                                                />
                                                <div className="flex-1">
                                                    <span className="block font-medium text-sm">{t("pdf_tools.split_options.extract_pages")}</span>
                                                </div>
                                            </label>

                                            {splitMode === "range" && (
                                                <div className="ml-7">
                                                    <input
                                                        type="text"
                                                        value={pageRange}
                                                        onChange={(e) => setPageRange(e.target.value)}
                                                        placeholder={t("pdf_tools.placeholders.page_range")}
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
                                        <button
                                            onClick={handleSplit}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-lg shadow-indigo-500/20"
                                        >
                                            <Download className="w-4 h-4" /> {t("pdf_tools.actions.download")}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
