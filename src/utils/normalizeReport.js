import { uuid } from './uuid';

/**
 * Приводит report.bands к формату { [bandName]: [element, ...] }.
 * Старые форматы { elements: [...] } или { elements, height } извлекаются.
 * Также заполняет bandHeights и id для элементов, если их нет.
 */
export function normalizeReport(input) {
    if (!input || typeof input !== 'object') return input;

    const bands = {};
    const bandHeights = { ...(input.bandHeights || {}) };

    Object.entries(input.bands || {}).forEach(([bandName, value]) => {
        // Массив — уже правильно
        if (Array.isArray(value)) {
            bands[bandName] = value.map((el) => ({
                ...el,
                id: el.id || uuid(),
            }));
            if (!bandHeights[bandName]) bandHeights[bandName] = 40;
            return;
        }

        // Объект с .elements — извлекаем
        if (value && Array.isArray(value.elements)) {
            bands[bandName] = value.elements.map((el) => ({
                ...el,
                id: el.id || uuid(),
            }));
            if (value.height != null) bandHeights[bandName] = value.height;
            else if (!bandHeights[bandName]) bandHeights[bandName] = 40;
            return;
        }

        // Неизвестный формат — пустой массив
        bands[bandName] = [];
        if (!bandHeights[bandName]) bandHeights[bandName] = 40;
    });

    return { ...input, bands, bandHeights };
}