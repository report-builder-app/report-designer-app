import React from 'react';
import './DraggableElement.css';

function DraggableElement({
                            element,
                            bandName,
                            elementIndex,
                            isSelected,
                            onClick,
                            onMove,
                          }) {
  // HTML5 drag для перемещения между бэндами
  const handleDragStart = (e) => {
    e.stopPropagation();
    e.dataTransfer.setData('application/x-move-element', JSON.stringify({
      id: element.id,
      sourceBand: bandName,
      elementIndex,
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  // Кастомное перемещение внутри бэнда через mouse
  const handleMouseDown = (e) => {
    // Если нажата левая кнопка, начинаем drag внутри бэнда
    if (e.button !== 0) return;
    e.stopPropagation();
    onClick();

    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = element.x ?? 0;
    const startTop = element.y ?? 0;
    let didMove = false;

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) didMove = true;
      onMove?.(startLeft + dx, startTop + dy);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      // если элемент не двигали — это клик, обработчик onClick уже вызван
      if (!didMove) return;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const style = {
    left: `${element.x ?? 0}px`,
    top: `${element.y ?? 0}px`,
    width: `${element.width ?? 100}px`,
    height: `${element.height ?? 20}px`,
  };

  return (
      <div
          className={`draggable-element ${isSelected ? 'selected' : ''} type-${element.type}`}
          style={style}
          draggable
          onDragStart={handleDragStart}
          onMouseDown={handleMouseDown}
          data-element-id={element.id}
          data-type={element.type}
      >
        {element.type === 'textField' && (
            <span className="element-preview">[{element.expression}]</span>
        )}
        {(element.type === 'staticText' || element.type === 'label') && (
            <span className="element-preview">{element.text}</span>
        )}
        {element.type === 'image' && (
            <span className="element-preview">[image]</span>
        )}
        {element.type === 'line' && <span className="element-preview">—</span>}
        {element.type === 'rectangle' && (
            <span className="element-preview">□</span>
        )}
      </div>
  );
}

export default DraggableElement;