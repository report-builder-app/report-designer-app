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
    // Специальные команды для параметров и полей
    if (property === 'addParameter') {
      updateReport(prev => ({
        ...prev,
        parameters: [
          ...(prev.parameters || []),
          { name: '', type: 'String', defaultValue: '' }
        ]
      }));
      return;
    }
    if (property === 'removeParameter') {
      updateReport(prev => ({
        ...prev,
        parameters: (prev.parameters || []).filter((_, i) => i !== value)
      }));
      return;
    }
    if (property === 'addField') {
      updateReport(prev => ({
        ...prev,
        fields: [
          ...(prev.fields || []),
          { name: '', type: 'String' }
        ]
      }));
      return;
    }
    if (property === 'removeField') {
      updateReport(prev => ({
        ...prev,
        fields: (prev.fields || []).filter((_, i) => i !== value)
      }));
      return;
    }

    // Обработка точечных путей (parameters[0].name)
    if (property.startsWith('parameters[') || property.startsWith('fields[')) {
      const match = property.match(/^(\w+)\[(\d+)\]\.(\w+)$/);
      if (match) {
        const [_, section, indexStr, key] = match;
        const index = parseInt(indexStr, 10);
        updateReport(prev => {
          const list = [...(prev[section] || [])];
          list[index] = { ...list[index], [key]: value };
          return { ...prev, [section]: list };
        });
        return;
      }
    }
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