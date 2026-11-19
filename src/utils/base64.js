/**
 * Кодирует произвольную UTF-8 строку в base64.
 * Работает в браузере (window.btoa) и в Node (Buffer) — на случай тестов.
 */
export function encodeBase64(str) {
    // UTF-8 → бинарная строка → base64
    const utf8 = new TextEncoder().encode(String(str ?? ''));
    let binary = '';
    const chunk = 0x8000; // не переполняем стек при больших строках
    for (let i = 0; i < utf8.length; i += chunk) {
        binary += String.fromCharCode.apply(
            null,
            utf8.subarray(i, i + chunk)
        );
    }

    if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
        return window.btoa(binary);
    }
    // Node fallback (если когда-то будет SSR/тесты)
    // eslint-disable-next-line no-undef
    return Buffer.from(utf8).toString('base64');
}