import React, { useContext, useState, useEffect, useRef } from 'react';
import { ReportContext } from '../../contexts/ReportContext';
import { elementTypes } from '../../utils/elementFactory';
import DraggableElement from '../common/DraggableElement';
import './BandsDesigner.css';

const MIME_NEW = 'application/x-element-type';
const MIME_MOVE = 'application/x-move-element';

function BandsDesigner() {
  const { report, updateReport, selectedElement, setSelectedElement } =
      useContext(ReportContext);

  const [dragOverBand, setDragOverBand] = useState(null);
  const canvasRef = useRef(null);

  // ---- Сброс фокуса по Esc ----
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedElement(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedElement]);

  // ---- Клик по пустому месту холста ----
  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      setSelectedElement(null);
    }
  };

  const handleElementClick = (bandName, elementId) => {
    setSelectedElement({ bandName, elementId });
  };

  const handleElementMove = (bandName, elementId, newX, newY) => {
    updateReport((prev) => {
      const updated = (prev.bands[bandName] || []).map((el) =>
          el.id === elementId ? { ...el, x: newX, y: newY } : el
      );
      return {
        ...prev,
        bands: { ...prev.bands, [bandName]: updated },
      };
    });
  };

  const handleCrossBandMove = (sourceBand, elementId, targetBand, newX, newY) => {
    if (!sourceBand || !targetBand || sourceBand === targetBand) return;

    updateReport((prev) => {
      const source = [...(prev.bands[sourceBand] || [])];
      const idx = source.findIndex((el) => el.id === elementId);
      if (idx === -1) return prev;

      const [moved] = source.splice(idx, 1);
      const target = [...(prev.bands[targetBand] || []), { ...moved, x: newX, y: newY }];

      return {
        ...prev,
        bands: { ...prev.bands, [sourceBand]: source, [targetBand]: target },
      };
    });

    // Переключаем выделение на новый бэнд
    setSelectedElement({ bandName: targetBand, elementId });
  };

  const handleDrop = (bandName, e) => {
    e.preventDefault();
    setDragOverBand(null);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left);
    const y = Math.max(0, e.clientY - rect.top);

    // 1. Перемещение существующего элемента
    const moveData = e.dataTransfer.getData(MIME_MOVE);
    if (moveData) {
      try {
        const { id, sourceBand } = JSON.parse(moveData);
        if (sourceBand !== bandName) {
          handleCrossBandMove(sourceBand, id, bandName, x, y);
        }
      } catch { /* ignore */ }
      return;
    }

    // 2. Новый элемент из палитры
    const type = e.dataTransfer.getData(MIME_NEW) || e.dataTransfer.getData('text/plain');
    if (!type || !elementTypes[type]) return;

    const newElement = elementTypes[type].create();
    newElement.x = x;
    newElement.y = y;

    updateReport((prev) => ({
      ...prev,
      bands: {
        ...prev.bands,
        [bandName]: [...(prev.bands[bandName] || []), newElement],
      },
    }));

    setSelectedElement({ bandName, elementId: newElement.id });
  };

  return (
      <div
          className="bands-designer"
          ref={canvasRef}
          onClick={handleCanvasClick}
      >
        {Object.entries(report.bands || {}).map(([bandName, elements]) => (
            <div key={bandName} className={`band ${bandName}`} data-band={bandName}>
              <div className="band-label">{bandName} Band</div>

              <div
                  className={`band-content${dragOverBand === bandName ? ' drag-over' : ''}`}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setDragOverBand(bandName);
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setDragOverBand((prev) => (prev === bandName ? null : prev));
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    // Разрешаем и copy, и move
                    e.dataTransfer.dropEffect = e.dataTransfer.types.includes(MIME_MOVE)
                        ? 'move'
                        : 'copy';
                  }}
                  onDrop={(e) => handleDrop(bandName, e)}
              >
                {(elements || []).map((element) => (
                    <DraggableElement
                        key={element.id}
                        element={element}
                        bandName={bandName}
                        elementIndex={elements.indexOf(element)}
                        isSelected={
                            selectedElement?.bandName === bandName &&
                            selectedElement?.elementId === element.id
                        }
                        onClick={() => handleElementClick(bandName, element.id)}
                        onMove={(x, y) => handleElementMove(bandName, element.id, x, y)}
                    />
                ))}
              </div>
            </div>
        ))}
      </div>
  );
}

export default BandsDesigner;