import React, { useContext } from 'react';
import { ReportContext } from '../../contexts/ReportContext';
import DraggableElement from '../common/DraggableElement';
import './BandsDesigner.css';

function BandsDesigner() {
  const { report, updateReport, selectedElement, setSelectedElement } = useContext(ReportContext);

  const handleElementClick = (bandName, elementIndex) => {
    setSelectedElement({ bandName, elementIndex });
  };

  const handleElementMove = (bandName, elementIndex, newX, newY) => {
    updateReport(prev => {
      const updatedElements = [...prev.bands[bandName]];
      updatedElements[elementIndex] = {
        ...updatedElements[elementIndex],
        x: newX,
        y: newY
      };
      return {
        ...prev,
        bands: {
          ...prev.bands,
          [bandName]: updatedElements
        }
      };
    });
  };

  return (
    <div className="bands-designer">
      {Object.entries(report.bands).map(([bandName, elements]) => (
        <div key={bandName} className={`band ${bandName}`}>
          <div className="band-label">{bandName} Band</div>
          <div className="band-content">
            {elements.map((element, index) => (
              <DraggableElement
                key={index}
                element={element}
                isSelected={selectedElement?.bandName === bandName && selectedElement?.elementIndex === index}
                onClick={() => handleElementClick(bandName, index)}
                onMove={(x, y) => handleElementMove(bandName, index, x, y)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default BandsDesigner;