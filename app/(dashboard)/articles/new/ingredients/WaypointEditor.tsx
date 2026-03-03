"use client";

import { Waypoint } from "@/lib/client/types";
import { Image as ImageIcon, Loader2, X, CheckCircle2, MapPin, Search, Home } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface WaypointEditorProps {
    item: Waypoint;
    onUpdate: (updates: Partial<Waypoint>) => void;
}

interface MapboxSuggestion {
    name: string;
    full_address: string;
    mapbox_id: string;
    feature_type: string;
}

export default function WaypointEditor({ item, onUpdate }: WaypointEditorProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- 地点検索の状態 ---
    const [query, setQuery] = useState(item.name ?? "");
    const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // item.name が外から更新された場合に追従（例: 選択切り替え時）
    useEffect(() => {
        setQuery(item.name ?? "");
    }, [item.name]);

    // クリックアウトで候補を閉じる
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // デバウンス検索
    useEffect(() => {
        if (!query.trim() || query === item.name) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/v1/mapbox/geocode?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                if (data.suggestions) {
                    setSuggestions(data.suggestions);
                    setShowSuggestions(true);
                }
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query, item.name]);

    const handleSelect = async (suggestion: MapboxSuggestion) => {
        setQuery(suggestion.name);
        setShowSuggestions(false);
        setIsSearching(true);

        try {
            const res = await fetch(`/api/v1/mapbox/geocode?mapbox_id=${suggestion.mapbox_id}`);
            const data = await res.json();
            const feature = data.features[0];
            if (feature) {
                const { coordinates } = feature.geometry;
                const [lng, lat] = coordinates;
                const name = feature.properties.name || feature.properties.full_address;

                setQuery(name);
                onUpdate({
                    name,
                    lat,
                    lng,
                    sourceId: feature.properties.mapbox_id,
                });
            }
        } catch (err) {
            console.error("Retrieve error:", err);
        } finally {
            setIsSearching(false);
        }
    };

    const images = item.images ?? [];
    const MAX_IMAGES = 3;

    // Convert any image File/Blob to WebP Blob on the client
    async function convertToWebP(file: File, opts?: { quality?: number; maxSide?: number }): Promise<Blob> {
        const quality = opts?.quality ?? 0.85; // 0..1
        const maxSide = opts?.maxSide ?? 2560; // clamp long side

        // Prefer createImageBitmap when available for performance and orientation handling
        let bitmap: ImageBitmap;
        try {
            // Some browsers support orientation from EXIF via imageOrientation option
            // @ts-ignore - imageOrientation may be experimental
            bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
        } catch {
            // Fallback: load via HTMLImageElement
            const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = () => reject(new Error("ファイルの読み込みに失敗しました"));
                reader.readAsDataURL(file);
            });
            bitmap = await new Promise<ImageBitmap>((resolve, reject) => {
                const img = new Image();
                img.onload = async () => {
                    try {
                        const canvas = document.createElement("canvas");
                        const ctx = canvas.getContext("2d");
                        if (!ctx) return reject(new Error("Canvasがサポートされていません"));
                        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
                        const w = Math.max(1, Math.round(img.width * scale));
                        const h = Math.max(1, Math.round(img.height * scale));
                        canvas.width = w;
                        canvas.height = h;
                        ctx.drawImage(img, 0, 0, w, h);
                        const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", quality));
                        if (!blob) return reject(new Error("WEBPへの変換に失敗しました"));
                        const wb = await createImageBitmap(blob);
                        resolve(wb);
                    } catch (e) {
                        reject(e);
                    }
                };
                img.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
                img.src = dataUrl;
            });
        }

        // Draw to canvas with resize
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvasがサポートされていません");
        const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
        const w = Math.max(1, Math.round(bitmap.width * scale));
        const h = Math.max(1, Math.round(bitmap.height * scale));
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(bitmap, 0, 0, w, h);

        const out = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", quality));
        if (!out) throw new Error("WEBPへの変換に失敗しました");
        return out;
    }

    const handleClick = () => {
        setError(null);
        if (images.length >= MAX_IMAGES) {
            setError(`画像は最大${MAX_IMAGES}枚までです。`);
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError(null);

        if (images.length >= MAX_IMAGES) {
            setError(`画像は最大${MAX_IMAGES}枚までです。`);
            return;
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (!file.type.startsWith("image/")) {
            setError("画像ファイルを選択してください。");
            return;
        }

        try {
            setUploading(true);

            const webpBlob = await convertToWebP(file, { quality: 0.85, maxSide: 2560 });
            if (webpBlob.size > maxSize) {
                throw new Error("変換後ファイルが大きすぎます（最大10MB）。");
            }

            const qs = new URLSearchParams({
                fileName: file.name,
                contentType: "image/webp",
                type: "node-images",
            }).toString();

            const presignRes = await fetch(`/api/v1/uploads?${qs}`, { method: "GET" });
            const presignData = await presignRes.json();
            if (!presignRes.ok) throw new Error(presignData?.error || "アップロード用URLの取得に失敗しました");

            const { uploadUrl, publicUrl } = presignData as { uploadUrl: string; publicUrl?: string };
            if (!uploadUrl) throw new Error("uploadUrl が取得できませんでした");

            const putRes = await fetch(uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": "image/webp" },
                body: webpBlob,
            });
            if (!putRes.ok) throw new Error("画像のアップロードに失敗しました");

            if (publicUrl) {
                const next = [...images, publicUrl].slice(0, MAX_IMAGES);
                onUpdate({ images: next });
            }
        } catch (err: any) {
            setError(err?.message ?? "画像のアップロードに失敗しました");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemoveImage = (url: string) => {
        const next = (images || []).filter((u) => u !== url);
        onUpdate({ images: next.length ? next : undefined });
    };

    return (
        <div className="grid grid-cols-1 gap-10">
            {/* --- カスタム地点検索 --- */}
            <div className="space-y-3 relative" ref={searchContainerRef}>
                <label className="flex items-center gap-2 text-sm font-bold text-foreground-0">
                    Waypoint Search
                </label>

                <div className="relative group/search">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground-1 group-focus-within/search:text-accent-0 transition-colors">
                        {isSearching ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Search a place (e.g. 東京タワー)"
                        className="w-full pl-14 pr-6 py-5 bg-background-0 border-2 border-grass rounded-[1.5rem] focus:outline-none focus:bg-background-1 focus:border-accent-0 focus:ring-4 focus:ring-accent-0/5 transition-all text-base font-semibold text-foreground-0 placeholder:text-foreground-1/40"
                    />

                    {/* 検索候補リスト */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-3 bg-background-1 border border-grass rounded-2xl shadow-2xl shadow-black/10 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-2">
                                {suggestions.map((s) => (
                                    <button
                                        key={s.mapbox_id}
                                        onClick={() => handleSelect(s)}
                                        className="w-full flex items-start gap-4 p-4 hover:bg-background-0 rounded-xl transition-colors text-left group/item"
                                    >
                                        <div className="mt-1 p-2 bg-accent-0/5 text-accent-0 rounded-lg group-hover/item:bg-accent-0 group-hover/item:text-white transition-colors">
                                            {s.feature_type === "poi" ? (
                                                <Home size={18} />
                                            ) : (
                                                <MapPin size={18} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-foreground-0 truncate">{s.name}</div>
                                            <div className="text-xs text-foreground-1 truncate mt-0.5">{s.full_address}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 text-xs text-foreground-1/70">
                    {typeof item.lat === "number" && typeof item.lng === "number" && (
                        <span className="text-accent-2 font-bold flex items-center gap-1">
                            <CheckCircle2 size={12} /> Location Selected
                        </span>
                    )}
                </div>
            </div>

            {/* 画像アップロード・表示エリア（既存） */}
            <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-foreground-0">
                    <ImageIcon size={16} /> Visuals
                </label>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
                <div
                    className="group relative border-2 border-dashed border-grass rounded-3xl p-10 flex flex-col items-center justify-center text-foreground-1 hover:bg-background-0 hover:border-accent-0/30 cursor-pointer transition-all min-h-[240px] overflow-hidden"
                    onClick={handleClick}
                >
                    {images.length > 0 ? (
                        <>
                            <div className="absolute inset-0 grid grid-cols-3 gap-2 p-4">
                                {images.map((url) => (
                                    <div key={url} className="relative rounded-xl overflow-hidden">
                                        <img src={url} alt={item.name} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            className="absolute top-2 right-2 z-10 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveImage(url);
                                            }}
                                            aria-label="Remove image"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                {images.length < MAX_IMAGES && (
                                    <div className="rounded-xl border border-dashed border-grass/60 flex items-center justify-center text-sm text-foreground-1">
                                        {uploading ? <Loader2 className="animate-spin" size={20} /> : "+ Add"}
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-grass rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                {uploading ? (
                                    <Loader2 className="animate-spin text-foreground-1" size={28} />
                                ) : (
                                    <ImageIcon size={32} className="text-foreground-1" />
                                )}
                            </div>
                            <span className="font-bold">Add Image</span>
                            <span className="text-xs text-foreground-1/60 mt-1">Any image accepted; saved as WEBP (max 3)</span>
                        </>
                    )}
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
        </div>
    );
}
