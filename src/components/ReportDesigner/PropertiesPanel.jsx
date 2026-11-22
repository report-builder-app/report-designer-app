import React, { useContext } from 'react';
import { ReportContext } from '../../contexts/ReportContext';
import ElementProperties from '../common/ElementProperties';
import ReportProperties from '../common/ReportProperties';
import './PropertiesPanel.css';

function getElements(bandValue) {
  if (!bandValue) return [];
  if (Array.isArray(bandValue)) return bandValue;
  if (Array.isArray(bandValue.elements)) return bandValue.elements;
  return [];
}

function PropertiesPanel() {
  const { report, updateReport, selectedElement } = useContext(ReportContext);

  const elements = selectedElement
      ? getElements(report.bands[selectedElement.bandName])
      : [];

  const selected = selectedElement
      ? elements.find((el) => el.id === selectedElement.elementId) || null
      : null;

  const handlePropertyChange = (property, value) => {
    if (selected) {
      updateReport((prev) => {
        const bandValue = prev.bands[selectedElement.bandName];
        const currentElements = getElements(bandValue);
        const updated = currentElements.map((el) =>
            el.id === selectedElement.elementId ? { ...el, [property]: value } : el
        );

        // Сохраняем структуру: если был объект { elements, height } — оставляем объектом
        const newBandValue = Array.isArray(bandValue)
            ? updated
            : { ...bandValue, elements: updated };

        return {
          ...prev,
          bands: { ...prev.bands, [selectedElement.bandName]: newBandValue },
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
            <ElementProperties element={selected} onChange={handlePropertyChange} />
        ) : (
            <ReportProperties report={report} onChange={handlePropertyChange} />
        )}
      </div>
  );
}

export default PropertiesPanel;