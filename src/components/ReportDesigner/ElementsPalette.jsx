import React, { useContext } from 'react';
import { ReportContext } from '../../contexts/ReportContext';
import { elementTypes } from '../../utils/elementFactory';
import './ElementsPalette.css';

function ElementsPalette() {
  const { report, updateReport } = useContext(ReportContext);

  const addElement = (type) => {
    const newElement = elementTypes[type].create();
    updateReport(prev => ({
      ...prev,
      bands: {
        ...prev.bands,
        detail: [...prev.bands.detail, newElement]
      }
    }));
  };

  return (
    <div className="elements-palette">
      <h3>Elements</h3>
      <div className="elements-list">
        {Object.entries(elementTypes).map(([type, { label, icon: Icon }]) => (
          <button
            key={type}
            className="element-button"
            onClick={() => addElement(type)}
            title={`Add ${label}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ElementsPalette;