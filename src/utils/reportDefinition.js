const KIND_MAP = {
    label: 'label',
    staticText: 'label',   // бэк не знает staticText
    textField: 'textField',
    line: 'line',
    // image / rectangle бэк не поддерживает — отфильтруем
};

const BAND_TYPE_MAP = {
    titleBand: 'TITLE',
    columnHeader: 'COLUMN_HEADER',
    detail: 'DETAIL',
    summary: 'SUMMARY',
    // pageHeader/pageFooter/columnFooter/noData — в enum бэка НЕТ
};

export function toReportDefinitionDto(report) {
    const bands = Object.entries(report.bands || {})
        .map(([bandName, elements]) => {
            const type = BAND_TYPE_MAP[bandName];
            if (!type) return null; // бэк не примет неизвестный type
            return {
                type,
                elements: (elements || [])
                    .map(toElementDto)
                    .filter(Boolean),
            };
        })
        .filter(Boolean);

    const dto = {
        name: report.name || 'Report',
        bands,
    };

    if (report.title) dto.title = report.title;
    if (report.pageFormat) dto.pageFormat = report.pageFormat;
    if (report.orientation) dto.orientation = report.orientation;
    if (report.parameters?.length) {
        dto.parameters = report.parameters.map((p) => ({
            name: p.name,
            type: p.type,
            ...(p.defaultValue != null ? { defaultValue: p.defaultValue } : {}),
        }));
    }
    if (report.fields?.length) {
        dto.fields = report.fields.map((f) => ({ name: f.name, type: f.type }));
    }
    if (report.query) dto.queryString = report.query;
    if (report.dataSource) {
        const { provider, jdbcUrl, user, url, jsonPath, options } = report.dataSource;
        const ds = { provider };
        if (jdbcUrl) ds.jdbcUrl = jdbcUrl;
        if (user) ds.user = user;
        if (url) ds.url = url;
        if (jsonPath) ds.jsonPath = jsonPath;
        if (options) ds.options = options;
        dto.dataSource = ds;
    }

    return dto;
}

function toElementDto(el) {
    const kind = KIND_MAP[el.type];
    if (!kind) return null; // image/rectangle — пока не поддерживаются

    const dto = { kind };
    if (el.text != null) dto.text = el.text;
    if (el.expression != null) dto.expression = el.expression;
    if (el.style) dto.style = el.style;
    if (el.width != null) dto.width = el.width;
    if (el.height != null) dto.height = el.height;
    if (el.y != null) dto.y = el.y;
    // x бэк не принимает — порядок элементов в массиве и есть порядок колонок
    return dto;
}