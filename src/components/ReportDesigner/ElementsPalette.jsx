import React, { useContext } from 'react';
import { ReportContext } from '../../contexts/ReportContext';
import { elementTypes } from '../../utils/elementFactory';
import './ElementsPalette.css';

const MIME = 'application/x-element-type';

function ElementsPalette() {
  const { updateReport, setSelectedElement } = useContext(ReportContext);

  const handleClick = (type) => {
    const newElement = elementTypes[type].create();
    updateReport((prev) => ({
      ...prev,
      bands: {
        ...prev.bands,
        detail: [...(prev.bands.detail || []), newElement],
      },
    }));
    setSelectedElement({ bandName: 'detail', elementId: newElement.id });
  };

  const handleDragStart = (e, type) => {
    e.dataTransfer.setData(MIME, type);
    e.dataTransfer.setData('text/plain', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
      <div className="elements-palette">
        <h3>Elements</h3>
        <p className="elements-palette__hint">
          Перетащите элемент в нужный бэнд или кликните, чтобы добавить в <code>detail</code>
        </p>
        <div className="elements-list">
          {Object.entries(elementTypes).map(([type, { label, icon: Icon }]) => (
              <div
                  key={type}
                  className="element-button"
                  draggable
                  onDragStart={(e) => handleDragStart(e, type)}
                  onClick={() => handleClick(type)}
                  title={`Перетащите «${label}» в бэнд или кликните для detail`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleClick(type);
                  }}
              >
                <Icon size={20} />
                <span>{label}</span>
              </div>
          ))}
        </div>
      </div>
  );
}

export default ElementsPalette;