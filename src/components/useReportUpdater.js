import { useCallback } from 'react';
import { computeBandHeight } from '../utils/bandHeight';

export function useReportUpdater(updateReport) {
    return useCallback(
        (updater) => {
            updateReport((prev) => {
                const next = updater(prev);
                if (!next.bands) return next;

                // Теперь гарантированно массивы
                const bandHeights = { ...(prev.bandHeights || {}) };
                Object.entries(next.bands).forEach(([bandName, elements]) => {
                    if (!Array.isArray(elements)) return;
                    const currentHeight = bandHeights[bandName] ?? 40;
                    bandHeights[bandName] = computeBandHeight(elements, currentHeight);
                });

                return { ...next, bandHeights };
            });
        },
        [updateReport]
    );
}