/**
 * Вычисляет минимальную высоту бэнда на основе элементов.
 * Если элементы занимают >= 50% текущей высоты, бэнд растягивается
 * до (maxBottom + padding), но не меньше минимальной высоты.
 *
 * @param {Array} elements   — элементы бэнда
 * @param {number} currentHeight — текущая высота бэнда (px)
 * @param {number} minHeight — минимальная высота по умолчанию (px)
 * @returns {number} новая высота бэнда
 */
export function computeBandHeight(elements, currentHeight = 40, minHeight = 40) {
    if (!elements || elements.length === 0) {
        return Math.max(currentHeight, minHeight);
    }

    // Нижняя граница самого нижнего элемента
    const maxBottom = elements.reduce((max, el) => {
        const bottom = (el.y ?? 0) + (el.height ?? 20);
        return Math.max(max, bottom);
    }, 0);

    const padding = 10;
    const requiredHeight = maxBottom + padding;

    // Растягиваем, если элементы уже занимают >= 50% текущей высоты,
    // или если элементы вылезают за пределы бэнда
    const threshold = currentHeight * 0.5;
    if (maxBottom >= threshold || requiredHeight > currentHeight) {
        return Math.max(requiredHeight, currentHeight, minHeight);
    }

    return Math.max(currentHeight, minHeight);
}