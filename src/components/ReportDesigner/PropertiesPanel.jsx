import React, { useContext } from 'react';
import { ReportContext } from '../../contexts/ReportContext';
import ElementProperties from '../common/ElementProperties';
import ReportProperties from '../common/ReportProperties';
import './PropertiesPanel.css';

function PropertiesPanel() {
  const { report, updateReport, selectedElement } = useContext(ReportContext);

  const selected = selectedElement
      ? (report.bands[selectedElement.bandName] || []).find(
          (el) => el.id === selectedElement.elementId
      )
      : null;

  const handlePropertyChange = (property, value) => {
    if (selected) {
      updateReport((prev) => {
        const updated = (prev.bands[selectedElement.bandName] || []).map((el) =>
            el.id === selectedElement.elementId ? { ...el, [property]: value } : el
        );
        return {
          ...prev,
          bands: { ...prev.bands, [selectedElement.bandName]: updated },
        };
      });
    } else {
      updateReport((prev) => ({ ...prev, [property]: value }));
    }
  };

  return (
      <div className="properties-panel">
        <h3>Properties</h3>
        {selected ? (
            <ElementProperties
                element={selected}
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