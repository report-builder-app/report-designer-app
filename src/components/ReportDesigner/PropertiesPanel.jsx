import React, { useContext } from 'react';
import { ReportContext } from '../../contexts/ReportContext';
import ElementProperties from '../common/ElementProperties';
import ReportProperties from '../common/ReportProperties';
import './PropertiesPanel.css';

function PropertiesPanel() {
  const { report, updateReport, selectedElement } = useContext(ReportContext);

  const handlePropertyChange = (property, value) => {
    if (selectedElement) {
      // Update element properties
      updateReport(prev => {
        const updatedElements = [...prev.bands[selectedElement.bandName]];
        updatedElements[selectedElement.elementIndex] = {
          ...updatedElements[selectedElement.elementIndex],
          [property]: value
        };
        return {
          ...prev,
          bands: {
            ...prev.bands,
            [selectedElement.bandName]: updatedElements
          }
        };
      });
    } else {
      // Update report properties
      updateReport(prev => ({
        ...prev,
        [property]: value
      }));
    }
  };

  return (
    <div className="properties-panel">
      <h3>Properties</h3>
      {selectedElement ? (
        <ElementProperties
          element={report.bands[selectedElement.bandName][selectedElement.elementIndex]}
          onChange={handlePropertyChange}
        />
      ) : (
        <ReportProperties
          report={report}
          onChange={handlePropertyChange}
        />
      )}
    </div>
  );
}

export default PropertiesPanel;