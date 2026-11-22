import { useCallback } from 'react';
import { computeBandHeight } from '../utils/bandHeight';

/**
 * Обёртка над updateReport из контекста, которая:
 * 1. Пересчитывает высоту бэнда после изменения элементов.
 * 2. Сохраняет всё остальное без изменений.
 */
export function useReportUpdater(updateReport) {
    return useCallback(
        (updater) => {
            updateReport((prev) => {
                const next = updater(prev);
                if (!next.bands) return next;

                const bands = {};
                Object.entries(next.bands).forEach(([bandName, elements]) => {
                    const prevBand = prev.bands?.[bandName] || {};
                    const currentHeight =
                        prevBand.height ?? next.bands[bandName]?.height ?? 40;
                    const newHeight = computeBandHeight(elements, currentHeight);

                    // Если элементы — массив, а не объект с полями, упакуем в объект
                    if (Array.isArray(elements)) {
                        bands[bandName] = Object.assign([], elements, { height: newHeight });
                        // У массивов нельзя просто так установить свойство — заменим на объект
                        bands[bandName] = {
                            elements,
                            height: newHeight,
                        };
                    } else {
                        bands[bandName] = {
                            ...elements,
                            height: newHeight,
                        };
                    }
                });

                return { ...next, bands };
            });
        },
        [updateReport]
    );
}