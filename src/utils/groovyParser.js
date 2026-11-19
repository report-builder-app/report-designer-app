/**
 * Минимальный парсер Groovy DSL, который генерирует generateGroovyDSL.
 * Возвращает объект report в формате ReportContext.
 *
 * НЕ выполняет произвольный Groovy. Поддерживает только:
 *   report("Name") { ... }
 *   title = "..."
 *   pageFormat = PageFormat.A4
 *   orientation = PageOrientation.PORTRAIT
 *   parameters { param("X", Type, default) }
 *   fields { field("name", Type) }
 *   queryString(""" ... """)
 *   styles { style("name") { font { size = N } ... } }
 *   bands { titleBand { label(text: "...", width: 100) } ... }
 */
export function parseGroovyDSL(source) {
    if (typeof source !== 'string' || !source.trim()) {
        throw new Error('Пустой DSL');
    }

    let pos = 0;
    const len = source.length;

    const isWs = (c) => c === ' ' || c === '\t' || c === '\n' || c === '\r';

    function skipWs() {
        while (pos < len && isWs(source[pos])) pos++;
    }

    function expect(ch, ctx = '') {
        skipWs();
        if (source[pos] !== ch) {
            throw new Error(
                `Ожидался "${ch}"${ctx ? ` (${ctx})` : ''} на позиции ${pos}, найдено "${source[pos] ?? 'EOF'}"`
            );
        }
        pos++;
    }

    function match(ch) {
        skipWs();
        if (source[pos] === ch) {
            pos++;
            return true;
        }
        return false;
    }

    function ident() {
        skipWs();
        const start = pos;
        while (pos < len && /[A-Za-z0-9_$]/.test(source[pos])) pos++;
        if (start === pos) throw new Error(`Ожидался идентификатор на позиции ${pos}`);
        return source.slice(start, pos);
    }

    function stringLit() {
        skipWs();
        const q = source[pos];
        if (q !== '"' && q !== "'") {
            throw new Error(`Ожидалась строка на позиции ${pos}`);
        }
        // тройные кавычки — для queryString
        if (source.startsWith(q.repeat(3), pos)) {
            const close = q.repeat(3);
            const start = pos + 3;
            const end = source.indexOf(close, start);
            if (end === -1) throw new Error('Не закрыта тройная кавычка');
            pos = end + 3;
            return source.slice(start, end);
        }
        const start = pos + 1;
        pos++;
        let out = '';
        while (pos < len && source[pos] !== q) {
            if (source[pos] === '\\' && pos + 1 < len) {
                const n = source[pos + 1];
                if (n === 'n') out += '\n';
                else if (n === 't') out += '\t';
                else if (n === 'r') out += '\r';
                else out += n;
                pos += 2;
            } else {
                out += source[pos++];
            }
        }
        if (pos >= len) throw new Error('Не закрыта строка');
        pos++;
        return out;
    }

    function numberLit() {
        skipWs();
        const start = pos;
        while (pos < len && /[0-9.\-]/.test(source[pos])) pos++;
        if (start === pos) throw new Error(`Ожидалось число на позиции ${pos}`);
        return Number(source.slice(start, pos));
    }

    function qualifiedName() {
        skipWs();
        const parts = [ident()];
        while (source[pos] === '.') {
            pos++;
            parts.push(ident());
        }
        return parts;
    }

    // --- разбор элементов ---
    function parseElement() {
        const name = ident();       // label | textField | staticText | image | line | rectangle
        expect('(');

        const attrs = {};
        skipWs();
        while (source[pos] !== ')') {
            const key = ident();
            expect(':');
            skipWs();

            let value;
            const c = source[pos];
            if (c === '"' || c === "'") value = stringLit();
            else if (/[-0-9]/.test(c)) value = numberLit();
            else if (c === 't' || c === 'f') {
                const id = ident();
                if (id === 'true') value = true;
                else if (id === 'false') value = false;
                else throw new Error(`Неизвестное значение "${id}"`);
            } else {
                // возможно, выражение без кавычек — маловероятно в нашем DSL
                throw new Error(`Неожиданное значение на позиции ${pos}`);
            }

            attrs[key] = value;
            if (!match(',')) break;
        }
        expect(')');

        // превращаем attrs в объект элемента
        return {
            type: name,
            x: attrs.x ?? 0,
            y: attrs.y ?? 0,
            width: attrs.width ?? 100,
            height: attrs.height ?? 20,
            text: attrs.text,
            expression: attrs.expression,
            style: attrs.style,
            pattern: attrs.pattern,
        };
    }

    function parseBandBody() {
        const elements = [];
        expect('{');
        skipWs();
        while (source[pos] !== '}') {
            elements.push(parseElement());
            skipWs();
        }
        expect('}');
        return elements;
    }

    // --- верхний уровень ---
    function parseReport() {
        skipWs();
        const callName = ident();
        if (callName !== 'report') {
            throw new Error(`Ожидался вызов report(...), найдено "${callName}"`);
        }
        expect('(');
        const name = stringLit();
        expect(')');
        expect('{');

        const report = {
            name,
            title: '',
            pageFormat: 'A4',
            orientation: 'PORTRAIT',
            parameters: [],
            fields: [],
            query: '',
            styles: [],
            bands: {},
        };

        skipWs();
        while (source[pos] !== '}') {
            const id = ident();

            if (id === 'title') {
                expect('=');
                report.title = stringLit();
            } else if (id === 'pageFormat') {
                expect('=');
                const [ns, val] = qualifiedName();
                if (ns !== 'PageFormat') throw new Error('Ожидалось PageFormat.X');
                report.pageFormat = val;
            } else if (id === 'orientation') {
                expect('=');
                const [ns, val] = qualifiedName();
                if (ns !== 'PageOrientation') throw new Error('Ожидалось PageOrientation.X');
                report.orientation = val;
            } else if (id === 'parameters') {
                expect('{');
                skipWs();
                while (source[pos] !== '}') {
                    const fn = ident();
                    if (fn !== 'param') throw new Error('Ожидался param(...)');
                    expect('(');
                    const pName = stringLit();
                    expect(',');
                    const pType = ident();
                    let def = undefined;
                    if (match(',')) {
                        const c = source[pos];
                        if (c === '"' || c === "'") def = stringLit();
                        else if (/[-0-9]/.test(c)) def = numberLit();
                        else def = ident(); // true/false
                    }
                    expect(')');
                    report.parameters.push({ name: pName, type: pType, ...(def !== undefined ? { defaultValue: def } : {}) });
                    skipWs();
                }
                expect('}');
            } else if (id === 'fields') {
                expect('{');
                skipWs();
                while (source[pos] !== '}') {
                    const fn = ident();
                    if (fn !== 'field') throw new Error('Ожидался field(...)');
                    expect('(');
                    const fName = stringLit();
                    expect(',');
                    const fType = ident();
                    expect(')');
                    report.fields.push({ name: fName, type: fType });
                    skipWs();
                }
                expect('}');
            } else if (id === 'queryString') {
                expect('(');
                report.query = stringLit();
                expect(')');
            } else if (id === 'styles') {
                expect('{');
                skipWs();
                while (source[pos] !== '}') {
                    const fn = ident();
                    if (fn !== 'style') throw new Error('Ожидался style(...)');
                    expect('(');
                    const sName = stringLit();
                    expect(')');
                    expect('{');
                    const style = { name: sName };
                    skipWs();
                    while (source[pos] !== '}') {
                        const prop = ident();
                        expect('=');
                        const c = source[pos];
                        if (c === '"' || c === "'") style[prop] = stringLit();
                        else if (/[-0-9]/.test(c)) style[prop] = numberLit();
                        else style[prop] = ident();
                        skipWs();
                    }
                    expect('}');
                    report.styles.push(style);
                    skipWs();
                }
                expect('}');
            } else if (id === 'bands') {
                expect('{');
                skipWs();
                while (source[pos] !== '}') {
                    const bandName = ident();
                    report.bands[bandName] = parseBandBody();
                    skipWs();
                }
                expect('}');
            } else {
                throw new Error(`Неизвестный ключ "${id}" на позиции ${pos}`);
            }

            skipWs();
        }

        expect('}');
        skipWs();
        if (pos < len) throw new Error(`Лишний текст после "}" на позиции ${pos}`);

        return report;
    }

    return parseReport();
}