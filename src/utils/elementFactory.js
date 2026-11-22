import {
  FiType, FiHash, FiImage, FiMinus, FiSquare, FiAlignLeft,
} from 'react-icons/fi';
import { uuid } from './uuid';

/* ============================================================
   Утилиты
   ============================================================ */

const q = (s) =>
    `"${String(s ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

const typeName = (t) => (typeof t === 'string' ? t : t?.name ?? 'String');

/* ============================================================
   Типы элементов (реестр)
   ============================================================ */
export const elementTypes = {
  label: {
    label: 'Label',
    icon: FiType,
    create: () => ({
      id: uuid(),
      type: 'label', text: 'Label', x: 0, y: 0, width: 100, height: 20,
      fontSize: 12, bold: false,
    }),
  },
  textField: {
    label: 'Text Field',
    icon: FiHash,
    create: () => ({
      id: uuid(),
      type: 'textField', expression: '$F{field}', x: 0, y: 0, width: 120, height: 20,
      fontSize: 12, bold: false, pattern: '',
    }),
  },
  staticText: {
    label: 'Static Text',
    icon: FiAlignLeft,
    create: () => ({
      id: uuid(),
      type: 'staticText', text: 'Static', x: 0, y: 0, width: 100, height: 20,
      fontSize: 12, bold: false,
    }),
  },
  image: {
    label: 'Image',
    icon: FiImage,
    create: () => ({
      id: uuid(),
      type: 'image', expression: '$F{image}', x: 0, y: 0, width: 80, height: 80,
    }),
  },
  line: {
    label: 'Line',
    icon: FiMinus,
    create: () => ({
      id: uuid(),
      type: 'line', x: 0, y: 0, width: 100,
    }),
  },
  rectangle: {
    label: 'Rectangle',
    icon: FiSquare,
    create: () => ({
      id: uuid(),
      type: 'rectangle', x: 0, y: 0, width: 100, height: 40,
    }),
  },
};

export const createElement = (type) => elementTypes[type].create();

/* ============================================================
   Groovy DSL — элемент
   ============================================================ */

function generateElementDSL(el) {
  const attrs = [];
  if (el.x) attrs.push(`x: ${el.x}`);
  if (el.y) attrs.push(`y: ${el.y}`);
  if (el.width != null) attrs.push(`width: ${el.width}`);
  if (el.height != null && el.type !== 'line') attrs.push(`height: ${el.height}`);

  switch (el.type) {
    case 'label':
      return `label(text: ${q(el.text)}, ${attrs.join(', ')})`;
    case 'staticText':
      return `staticText(text: ${q(el.text)}, ${attrs.join(', ')})`;
    case 'textField': {
      const extra = [`expression: ${q(el.expression)}`, ...attrs];
      if (el.pattern) extra.push(`pattern: ${q(el.pattern)}`);
      return `textField(${extra.join(', ')})`;
    }
    case 'image':
      return `image(expression: ${q(el.expression)}, ${attrs.join(', ')})`;
    case 'line':
      return `line(${attrs.join(', ')})`;
    case 'rectangle':
      return `rectangle(${attrs.join(', ')})`;
    default:
      return `// unknown element: ${el.type}`;
  }
}

/* ============================================================
   Groovy DSL — источник данных
   ============================================================ */

function generateDataSourceDSL(ds) {
  if (!ds?.provider) return null;

  const L = [];
  L.push('    dataSource {');
  L.push(`        provider = ${q(ds.provider)}`);

  if (ds.provider === 'sql') {
    if (ds.jdbcUrl) L.push(`        jdbcUrl = ${q(ds.jdbcUrl)}`);
    if (ds.user) L.push(`        user = ${q(ds.user)}`);
    // Пароль в DSL не пишем — он хранится на сервере в /api/v1/datasources
  } else if (ds.provider === 'web') {
    if (ds.url) L.push(`        url = ${q(ds.url)}`);
    if (ds.jsonPath) L.push(`        jsonPath = ${q(ds.jsonPath)}`);
  } else if (ds.provider === 'custom') {
    if (ds.options && typeof ds.options === 'object') {
      L.push('        options {');
      Object.entries(ds.options).forEach(([k, v]) => {
        if (typeof v === 'string') {
          L.push(`            ${k} = ${q(v)}`);
        } else if (typeof v === 'number' || typeof v === 'boolean') {
          L.push(`            ${k} = ${v}`);
        } else if (v && typeof v === 'object') {
          L.push(`            ${k} = ${JSON.stringify(v)}`);
        }
      });
      L.push('        }');
    }
  }

  L.push('    }');
  L.push('');
  return L.join('\n');
}

/* ============================================================
   Groovy DSL — отчёт целиком
   ============================================================ */

const BAND_ORDER = [
  'titleBand', 'pageHeader', 'columnHeader',
  'detail', 'columnFooter', 'pageFooter', 'summary', 'noData',
];

export function generateGroovyDSL(report) {
  if (!report) return '// no report';

  const L = [];
  L.push(`report(${q(report.name || 'Report')}) {`);

  // Общие параметры
  if (report.title) L.push(`    title = ${q(report.title)}`);
  if (report.pageFormat)
    L.push(`    pageFormat = PageFormat.${report.pageFormat}`);
  if (report.orientation)
    L.push(`    orientation = PageOrientation.${report.orientation}`);
  L.push('');

  // Параметры
  if (report.parameters?.length) {
    L.push('    parameters {');
    report.parameters.forEach((p) => {
      const args = [q(p.name), typeName(p.type)];
      if (p.defaultValue !== undefined && p.defaultValue !== null) {
        args.push(
            typeof p.defaultValue === 'string'
                ? q(p.defaultValue)
                : String(p.defaultValue)
        );
      }
      L.push(`        param(${args.join(', ')})`);
    });
    L.push('    }');
    L.push('');
  }

  // Поля
  if (report.fields?.length) {
    L.push('    fields {');
    report.fields.forEach((f) =>
        L.push(`        field(${q(f.name)}, ${typeName(f.type)})`)
    );
    L.push('    }');
    L.push('');
  }

  // Запрос
  if (report.query) {
    L.push('    queryString(');
    L.push('        """');
    String(report.query)
        .trim()
        .split('\n')
        .forEach((line) => L.push('        ' + line));
    L.push('        """');
    L.push('    )');
    L.push('');
  }

  // Источник данных  ← добавлено
  const dsBlock = generateDataSourceDSL(report.dataSource);
  if (dsBlock) {
    L.push('    // Источник данных');
    L.push(dsBlock);
  }

  // Стили
  if (report.styles?.length) {
    L.push('    styles {');
    report.styles.forEach((s) => {
      L.push(`        style(${q(s.name)}) {`);
      if (s.fontSize || s.fontBold || s.fontItalic) {
        L.push('            font {');
        if (s.fontSize) L.push(`                size = ${s.fontSize}`);
        if (s.fontBold) L.push('                isBold = true');
        if (s.fontItalic) L.push('                isItalic = true');
        L.push('            }');
      }
      if (s.horizontalAlignment)
        L.push(`            horizontalAlignment = Alignment.${s.horizontalAlignment}`);
      if (s.background) L.push(`            background = ${s.background}`);
      L.push('        }');
    });
    L.push('    }');
    L.push('');
  }

  // Бэнды
  L.push('    bands {');
  const bands = report.bands || {};
  const names = [
    ...BAND_ORDER.filter((b) => bands[b]),
    ...Object.keys(bands).filter((b) => !BAND_ORDER.includes(b)),
  ];
  names.forEach((bandName) => {
    const elements = bands[bandName] || [];
    if (!elements.length) {
      L.push(`        ${bandName} { }`);
      return;
    }
    L.push(`        ${bandName} {`);
    elements.forEach((el) => L.push('            ' + generateElementDSL(el)));
    L.push('        }');
  });
  L.push('    }');
  L.push('}');

  return L.join('\n');
}