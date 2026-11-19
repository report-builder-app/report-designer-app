import React, { useContext, useState } from 'react';
import './ReportDesigner.css';
import Toolbar from './Toolbar';
import BandsDesigner from './BandsDesigner';
import ElementsPalette from './ElementsPalette';
import PropertiesPanel from './PropertiesPanel';
import { ReportContext } from '../../contexts/ReportContext';
import { SettingsContext } from '../../contexts/SettingsContext';
import { generateJasperReport } from '../../utils/jasperUtils';
import { blankTemplate } from '../../templates/blankTemplate';

function ReportDesigner() {
    const { report, updateReport } = useContext(ReportContext);
    const { settings } = useContext(SettingsContext);

    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState(null);

    /* ---------- New ---------- */
    const handleNew = () => {
        if (window.confirm('Сбросить отчёт к пустому шаблону?')) {
            updateReport(() => JSON.parse(JSON.stringify(blankTemplate)));
        }
    };

    /* ---------- Open ---------- */
    const handleOpen = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json,.json';
        input.onchange = (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const parsed = JSON.parse(ev.target.result);
                    if (!parsed.bands || typeof parsed.bands !== 'object') {
                        throw new Error('Файл не похож на описание отчёта (нет bands)');
                    }
                    updateReport(() => parsed);
                } catch (err) {
                    alert(`Не удалось открыть файл: ${err.message}`);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    /* ---------- Save (JSON) ---------- */
    const handleSave = () => {
        const json = JSON.stringify(report, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.name || 'report'}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    /* ---------- Export (через бэкенд) ---------- */
    const handleExport = async () => {
        setIsExporting(true);
        setExportError(null);
        try {
            const url = await generateJasperReport(report, settings);
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch (err) {
            console.error('Export failed:', err);
            setExportError(err.message || 'Не удалось сгенерировать отчёт');
            alert(err.message || 'Не удалось сгенерировать отчёт');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="report-designer">
            <Toolbar
                onNew={handleNew}
                onOpen={handleOpen}
                onSave={handleSave}
                onExportImage={handleExport}
                onShowCode={() => {
                    /* Переключение на вкладку «Groovy DSL» управляется в App.
                       Если понадобится — можно прокинуть коллбэк через пропсы. */
                }}
            />

            <div className="designer-container">
                <ElementsPalette />
                <BandsDesigner />
                <PropertiesPanel />
            </div>

            {isExporting && (
                <div className="report-designer__overlay">Generating report…</div>
            )}

            {exportError && !isExporting && (
                <div className="report-designer__error">{exportError}</div>
            )}
        </div>
    );
}

export default ReportDesigner;