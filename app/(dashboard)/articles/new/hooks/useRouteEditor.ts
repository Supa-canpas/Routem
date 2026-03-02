import { useState, useCallback, useEffect } from "react";
import { RouteItem, Waypoint, Transportation } from "@/lib/client/types";

export function useRouteEditor() {
    // ルートを構成するアイテム（経由地・交通手段）のリスト
    const [items, setItems] = useState<RouteItem[]>([]);
    // 現在編集中のアイテムのインデックス
    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    // 初期化時に最初のWaypointを追加する
    useEffect(() => {
        if (items.length === 0) {
            setItems([
                { type: 'waypoint', name: "Waypoint 1", memo: "", order: 1, source: 'USER' },
            ]);
            setSelectedIndex(0);
        }
    }, [items.length]);

    const updateItem = useCallback((index: number, updates: Partial<RouteItem>) => {
        setItems((prev) =>
            prev.map((item, i) => (i === index ? { ...item, ...updates } as RouteItem : item))
        );
    }, []);

    // 指定したアイテムを削除する
    const deleteItem = useCallback((index: number) => {
        setItems((prev) => {
            const filtered = prev.filter((_, i) => i !== index);

            // 連続する交通手段を統合 or 削除するなどの正規化
            const next: RouteItem[] = [];
            for (let i = 0; i < filtered.length; i++) {
                const curr = filtered[i];
                const prevItem = next[next.length - 1];

                // 交通手段が連続する場合、2つ目以降はスキップ
                if (curr.type === 'transportation' && prevItem?.type === 'transportation') {
                    continue;
                }
                next.push(curr);
            }

            // 先頭や末尾が交通手段なら削除
            while (next.length > 0 && next[0].type === 'transportation') {
                next.shift();
            }
            while (next.length > 0 && next[next.length - 1].type === 'transportation') {
                next.pop();
            }

            // 削除したアイテムが選択中だった場合、適切にインデックスを調整
            if (index === selectedIndex) {
                setSelectedIndex(Math.max(0, Math.min(index, next.length - 1)));
            } else if (index < selectedIndex) {
                setSelectedIndex((prevIdx) => Math.max(0, prevIdx - 1));
            }
            return next;
        });
    }, [selectedIndex]);

    // アイテム（経由地または交通手段）を特定のアイテムの後ろに挿入する
    const addItem = useCallback((afterIndex: number, type: 'waypoint' | 'transportation') => {
        let newItem: RouteItem;

        if (type === 'waypoint') {
            newItem = {
                type: 'waypoint',
                name: 'New Waypoint',
                memo: '',
                order: 0,
                source: 'USER'
            };
        } else {
            newItem = {
                type: 'transportation',
                method: 'WALK',
                memo: '',
                order: 0
            };
        }

        const newItems = [...items];
        newItems.splice(afterIndex + 1, 0, newItem);
        setItems(newItems);
        setSelectedIndex(afterIndex + 1);
    }, [items]);

    // リストの最後に新しい経由地を追加する（必要に応じて交通手段も自動挿入）
    const addWaypoint = useCallback(() => {
        const newWaypoint: Waypoint = {
            type: 'waypoint',
            name: `New Waypoint`,
            memo: "",
            order: items.length + 1,
            source: 'MAPBOX'
        };

        if (items.length > 0) {
            const newTransport: Transportation = {
                type: 'transportation',
                method: 'WALK',
                memo: "",
                order: 0,
            };
            setItems([...items, newTransport, newWaypoint]);
            setSelectedIndex(items.length + 1);
        } else {
            setItems([...items, newWaypoint]);
            setSelectedIndex(0);
        }
    }, [items]);

    const selectedItem = items[selectedIndex];

    return {
        items,
        setItems,
        selectedIndex,
        setSelectedIndex,
        selectedItem,
        updateItem,
        deleteItem,
        addItem,
        addWaypoint
    };
}
