import React from 'react';
import DataSourcePicker from './DataSourcePicker'; // см. примечание про перенос ниже
import './ReportProperties.css';

function ReportProperties({ report, onChange }) {
    const handleChange = (property, value) => {
        onChange(property, value);
    };

    const handlePageFormatChange = (format) => {
        handleChange('pageFormat', format);
        // Автоподстановка размеров под формат
        if (format === 'A4') {
            handleChange('pageWidth', 595);
            handleChange('pageHeight', 842);
        } else if (format === 'A5') {
            handleChange('pageWidth', 420);
            handleChange('pageHeight', 595);
        } else if (format === 'LETTER') {
            handleChange('pageWidth', 612);
            handleChange('pageHeight', 792);
        }
    };

    return (
        <div className="report-properties">
            <h4>Report Properties</h4>

            <div className="property-group">
                <label>Name</label>
                <input
                    type="text"
                    value={report.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="CustomerReport"
                />
            </div>

            <div className="property-group">
                <label>Title</label>
                <input
                    type="text"
                    value={report.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Customer List"
                />
            </div>

            <div className="property-group">
                <label>Page Format</label>
                <select
                    value={report.pageFormat || 'A4'}
                    onChange={(e) => handlePageFormatChange(e.target.value)}
                >
                    <option value="A4">A4</option>
                    <option value="A5">A5</option>
                    <option value="LETTER">LETTER</option>
                </select>
            </div>

            <div className="property-group">
                <label>Page Size (px)</label>
                <div className="size-controls">
                    <input
                        type="number"
                        value={report.pageWidth ?? ''}
                        onChange={(e) => handleChange('pageWidth', parseInt(e.target.value, 10) || 0)}
                        placeholder="Width"
                    />
                    <input
                        type="number"
                        value={report.pageHeight ?? ''}
                        onChange={(e) => handleChange('pageHeight', parseInt(e.target.value, 10) || 0)}
                        placeholder="Height"
                    />
                </div>
            </div>

            <div className="property-group">
                <label>Orientation</label>
                <select
                    value={report.orientation || 'PORTRAIT'}
                    onChange={(e) => handleChange('orientation', e.target.value)}
                >
                    <option value="PORTRAIT">Portrait</option>
                    <option value="LANDSCAPE">Landscape</option>
                </select>
            </div>

            {/* ---------- Источник данных ---------- */}
            <div className="property-group">
                <label>Data Source</label>
                <DataSourcePicker report={report} onChange={onChange} />
            </div>

            {/* ---------- Запрос ---------- */}
            <div className="property-group">
                <label>Query (SQL)</label>
                <textarea
                    rows={5}
                    value={report.query || ''}
                    onChange={(e) => handleChange('query', e.target.value)}
                    placeholder="SELECT id, name FROM customers WHERE created_at >= $P{StartDate}"
                />
            </div>

            {/* ---------- Отступы (для дизайнера; в DTO бэкенда их нет) ---------- */}
            <div className="property-group">
                <label>Margins (px)</label>
                <div className="margin-controls">
                    <input
                        type="number"
                        value={report.marginLeft ?? 20}
                        onChange={(e) => handleChange('marginLeft', parseInt(e.target.value, 10) || 0)}
                        placeholder="Left"
                    />
                    <input
                        type="number"
                        value={report.marginRight ?? 20}
                        onChange={(e) => handleChange('marginRight', parseInt(e.target.value, 10) || 0)}
                        placeholder="Right"
                    />
                    <input
                        type="number"
                        value={report.marginTop ?? 20}
                        onChange={(e) => handleChange('marginTop', parseInt(e.target.value, 10) || 0)}
                        placeholder="Top"
                    />
                    <input
                        type="number"
                        value={report.marginBottom ?? 20}
                        onChange={(e) => handleChange('marginBottom', parseInt(e.target.value, 10) || 0)}
                        placeholder="Bottom"
                    />
                </div>
            </div>
        </div>
    );
}

export default ReportProperties;