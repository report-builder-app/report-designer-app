import React, { createContext, useState } from 'react';
import { blankTemplate } from '../templates/blankTemplate';

export const ReportContext = createContext();

export function ReportProvider({ children }) {
  const [report, setReport] = useState(blankTemplate);
  const [selectedElement, setSelectedElement] = useState(null);

  const updateReport = (updater) => {
    setReport(prev => {
      if (typeof updater === 'function') {
        return updater(prev);
      }
      return { ...prev, ...updater };
    });
  };

  return (
    <ReportContext.Provider value={{
      report,
      updateReport,
      selectedElement,
      setSelectedElement
    }}>
      {children}
    </ReportContext.Provider>
  );
}