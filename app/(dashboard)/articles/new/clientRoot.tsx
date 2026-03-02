"use client";

import { useState, useEffect } from "react";
import NodeLinkDiagram from "@/app/(dashboard)/articles/new/templates/nodeLinkDiagram";
import RouteEditingSection from "@/app/(dashboard)/articles/new/templates/routeEditingSection";
import RouteSettingsSection from "@/app/(dashboard)/articles/new/templates/routeSettingsSection";
import ActionBar from "@/app/(dashboard)/articles/new/ingredients/actionBar";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { isMobileAtom } from "@/lib/client/atoms";
import { useRouteEditor } from "./hooks/useRouteEditor";
import { getDataFromServerWithJson, postDataToServerWithJson } from "@/lib/client/helpers";


export default function ClientRoot() {
    const router = useRouter();
    const isMobile = useAtomValue(isMobileAtom);

    // -------------------------------------------------------------------------
    // 状態管理
    // -------------------------------------------------------------------------

    // セクションの切り替え ('edit' | 'settings')
    const [activeSection, setActiveSection] = useState<'edit' | 'settings'>('edit');

    // モーダル表示
    const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    // ルート全体のメタ情報
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("General");
    const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
    const [thumbnailImageSrc, setThumbnailImageSrc] = useState<string | undefined>(undefined);

    // ルート編集ロジック（カスタムフック）
    const {
        items,
        selectedIndex,
        setSelectedIndex,
        selectedItem,
        updateItem,
        deleteItem,
        addItem,
        addWaypoint
    } = useRouteEditor();

    // ESCでモーダルを閉じる（編集/設定）
    useEffect(() => {
        if (!isEditorModalOpen && !isSettingsModalOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isSettingsModalOpen) setIsSettingsModalOpen(false);
                else if (isEditorModalOpen) setIsEditorModalOpen(false);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isEditorModalOpen, isSettingsModalOpen]);


    // 背景スクロールをロック（いずれかのモーダルが開いている時・モバイル時）
    useEffect(() => {
        if (!isMobile) return;
        const originalOverflow = document.body.style.overflow;
        if (isEditorModalOpen || isSettingsModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = originalOverflow || '';
        }
        return () => {
            document.body.style.overflow = originalOverflow || '';
        };
    }, [isMobile, isEditorModalOpen, isSettingsModalOpen]);


    // 投稿状態
    const [publishing, setPublishing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    // -------------------------------------------------------------------------
    // ロジック
    // -------------------------------------------------------------------------

    // 各バリデーション項目の個別判定
    const isTitleSet = title.trim() !== "";
    const isDescriptionSet = description.trim() !== "";
    const isThumbnailSet = thumbnailImageSrc !== undefined;
    const isWaypointsSet = items.filter(it => it.type === 'waypoint').length >= 2;

    // 公開設定が完了しているか確認
    const isSettingsComplete = isTitleSet && isDescriptionSet && isThumbnailSet && isWaypointsSet;

    // 画像アップロード処理
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setMessage(null);
        try {
                // 1) 署名付きURLを取得
                const params = new URLSearchParams({
                    fileName: file.name,
                    contentType: file.type,
                    type: 'route-thumbnails'
                });

                const data = await getDataFromServerWithJson<{ uploadUrl: string, publicUrl: string }>(`/api/v1/uploads?${params.toString()}`);
                if (!data) throw new Error('Failed to get upload URL');
                const { uploadUrl, publicUrl } = data;

                // 2) S3(MinIO)に直接アップロード
                // fetch(uploadUrl, ...) を postDataToServerWithJson に置き換えるのは不適切（S3への直接PUTであり、共通JSONラッパーではない）
                // ただし、もし S3 アップロードも一貫させたい場合は別途検討が必要。ここでは指示通り fetch を減らすため、ここも検討対象。
                // ただし postDataToServerWithJson は POST で body を JSON.stringify するため、ファイルアップロードには使えない。
                // よって、ここは fetch のままにするか、バイナリ対応のヘルパーを作る必要がある。現状はそのまま。
                const uploadRes = await fetch(uploadUrl, {
                    method: 'PUT',
                    body: file,
                    headers: {
                        'Content-Type': file.type
                    }
                });

            if (!uploadRes.ok) throw new Error('Failed to upload image');

            // 3) 公開URLを状態にセット
            setThumbnailImageSrc(publicUrl);
            setMessage('Image uploaded successfully!');
        } catch (e: any) {
            setMessage(e?.message ?? 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    // 投稿処理: 現在の items を API に送信
    const handlePublish = async () => {
        if (!isSettingsComplete) return;

        // 追加バリデーション: 最初のアイテムと最後のアイテムがWaypointであること
        const waypoints = items.filter(it => it.type === 'waypoint');
        if (waypoints.length < 2) {
            setMessage("At least 2 waypoints are required.");
            return;
        }

        if (items[0].type !== 'waypoint' || items[items.length - 1].type !== 'waypoint') {
            setMessage("Route must start and end with a waypoint.");
            return;
        }

        // 送信データの整形: 配列の順番を尊重し、不要な id を除外
        const normalizedItems = items.map((item, index) => {
            if (item.type === 'waypoint') {
                const { id, ...rest } = item;
                // 既存の UUID があれば維持するが、基本的には index で順序を管理
                const isUuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id));
                const hasCoordinates = typeof item.lat === 'number' && typeof item.lng === 'number';

                if (!hasCoordinates) {
                    throw new Error(`Waypoint "${item.name}" has no coordinates.`);
                }

                return {
                    ...(isUuid ? { id } : {}),
                    ...rest,
                    order: index, // 配列の順番を order として明示
                    source: item.source || 'USER'
                };
            } else {
                const { id, ...rest } = item;
                const isUuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id));
                return {
                    ...(isUuid ? { id } : {}),
                    ...rest,
                    order: index // 配列の順番を order として明示
                };
            }
        });

        setPublishing(true);
        setMessage(null);
        try {
            const result = await postDataToServerWithJson<{ routeId: string }>('/api/v1/routes', {
                title,
                description,
                category,
                visibility,
                thumbnailImageSrc,
                items: normalizedItems
            });

            if (result?.routeId) {
                setMessage(`Published! Redirecting...`);
                router.push(`/`);
            } else {
                throw new Error('Failed to publish');
            }
        } catch (e: any) {
            setMessage(e?.message ?? 'Publish failed');
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="relative w-full h-full flex flex-row ">
            {/* 左側：ルート構成の可視化と操作 */}
            <NodeLinkDiagram
                items={items}
                selectedIndex={selectedIndex}
                onSelectItem={(index) => {
                    setSelectedIndex(index);
                    if (isMobile) {
                        setIsSettingsModalOpen(false);
                        setIsEditorModalOpen(true);
                    }
                }}
                onAddWaypoint={addWaypoint}
                onDeleteWaypoint={deleteItem}
                onAddItem={addItem}
                onOpenSettings={() => {
                    if (isMobile) {
                        setIsEditorModalOpen(false);
                        setIsSettingsModalOpen(true);
                    } else {
                        setActiveSection('settings');
                    }
                }}
                onPublish={handlePublish}
                publishing={publishing}
                isSettingsComplete={isSettingsComplete}
                title={title}
            />
            {/* 右側：詳細情報の編集フォーム＋投稿アクション（モバイルでは非表示） */}
            <div className="hidden md:flex flex-1 h-full overflow-y-auto no-scrollbar shadow-[-10px_0_30px_rgba(0,0,0,0.02)] z-10 flex-col">
                <ActionBar
                    isSettingsComplete={isSettingsComplete}
                    isTitleSet={isTitleSet}
                    isDescriptionSet={isDescriptionSet}
                    isThumbnailSet={isThumbnailSet}
                    isWaypointsSet={isWaypointsSet}
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                    handlePublish={handlePublish}
                    publishing={publishing}
                />
                <div className="w-full flex-1">
                    {message && (
                        <div className={`mx-10 mt-4 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${message.includes('fail') || message.includes('error') || message.includes('required') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-accent-2/10 text-accent-2 border border-accent-2/20'}`}>
                            {message.includes('fail') || message.includes('error') || message.includes('required') ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                            <span className="text-sm font-bold">{message}</span>
                        </div>
                    )}
                    {activeSection === 'edit' ? (
                        <div className="w-full h-full animate-in fade-in duration-300">
                            <RouteEditingSection
                                selectedItem={selectedItem}
                                onUpdateItem={(updates) => updateItem(selectedIndex, updates)}
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full animate-in fade-in duration-300">
                            <RouteSettingsSection
                                title={title}
                                setTitle={setTitle}
                                description={description}
                                setDescription={setDescription}
                                category={category}
                                setCategory={setCategory}
                                visibility={visibility}
                                setVisibility={setVisibility}
                                thumbnailImageSrc={thumbnailImageSrc}
                                handleImageUpload={handleImageUpload}
                                uploading={uploading}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* モバイル用エディタモーダル（フルスクリーン） */}
            {isMobile && isEditorModalOpen && selectedItem && (
                <div className="absolute inset-0 z-50 flex md:hidden" aria-modal="true" role="dialog">

                    {/* Full-screen panel */}
                    <div className="flex flex-col w-screen h-fit bg-background-0 shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
                        {/* Header */}
                        <div className="sticky z-10 bg-background-1 backdrop-blur-md border-b border-grass px-4 md:px-5 py-3 flex items-center justify-between top-0">
                            <div className="text-base font-bold text-foreground-0">{selectedItem.type === 'waypoint' ? 'Edit Waypoint' : 'Edit Transportation'}</div>
                            <button
                                className="p-2 -mr-2 text-foreground-1 hover:text-foreground-0 active:scale-95"
                                onClick={() => setIsEditorModalOpen(false)}
                                aria-label="Close editor"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <RouteEditingSection
                            selectedItem={selectedItem}
                            onUpdateItem={(updates) => updateItem(selectedIndex, updates)}
                        />
                    </div>
                </div>
            )}

            {/* モバイル用設定モーダル（フルスクリーン） */}
            {isMobile && isSettingsModalOpen && (
                <div className="absolute inset-0 z-50 flex md:hidden" aria-modal="true" role="dialog">
                    {/* Full-screen panel */}
                    <div className="flex flex-col w-screen h-fit bg-background-0 shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
                        {/* Header */}
                        <div className="sticky z-10 bg-background-1/80 backdrop-blur-md border-b border-grass px-4 md:px-5 py-3 flex items-center justify-between top-0">
                            <div className="text-base font-bold text-foreground-0">Publication Settings</div>
                            <button
                                className="p-2 -mr-2 text-foreground-1 hover:text-foreground-0 active:scale-95"
                                onClick={() => setIsSettingsModalOpen(false)}
                                aria-label="Close settings"
                            >
                                <X size={22} />
                            </button>
                        </div>
                        <RouteSettingsSection
                            title={title}
                            setTitle={setTitle}
                            description={description}
                            setDescription={setDescription}
                            category={category}
                            setCategory={setCategory}
                            visibility={visibility}
                            setVisibility={setVisibility}
                            thumbnailImageSrc={thumbnailImageSrc}
                            handleImageUpload={handleImageUpload}
                            uploading={uploading}
                        />
                    </div>
                </div>
            )}

        </div>
    )

}
