import React, { createContext, useState, useCallback } from 'react';
import { normalizeReport } from '../utils/normalizeReport';
import { blankTemplate } from '../templates/blankTemplate';

export const ReportContext = createContext(null);

export function ReportProvider({ children }) {
    const [report, setReportState] = useState(() =>
        normalizeReport(JSON.parse(JSON.stringify(blankTemplate)))
    );
    const [selectedElement, setSelectedElement] = useState(null);

    // Всегда нормализуем результат updater'а
    const updateReport = useCallback((updater) => {
        setReportState((prev) => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            return normalizeReport(next);
        });
    }, []);

    return (
        <ReportContext.Provider
            value={{
                report,
                updateReport,
                selectedElement,
                setSelectedElement,
            }}
        >
            {children}
        </ReportContext.Provider>
    );
}