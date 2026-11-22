import React, { useRef } from 'react';
import './DraggableElement.css';

function DraggableElement({
                            element,
                            bandName,
                            elementIndex,
                            isSelected,
                            onClick,
                            onMove,
                            onCrossBandMove,
                          }) {
  const dragStateRef = useRef(null);

  const handleMouseDown = (e) => {
    // не начинаем перетаскивание по клику на «содержимое» элементов, если нужно
    // (сейчас поведение прежнее — тащим везде)
    e.stopPropagation();
    onClick();

    dragStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startLeft: element.x ?? 0,
      startTop: element.y ?? 0,
      currentX: element.x ?? 0,
      currentY: element.y ?? 0,
    };

    const handleMouseMove = (moveEvent) => {
      if (!dragStateRef.current) return;
      const { startX, startY, startLeft, startTop } = dragStateRef.current;
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const nx = startLeft + dx;
      const ny = startTop + dy;

      dragStateRef.current.currentX = nx;
      dragStateRef.current.currentY = ny;

      // двигаем «на лету» — без ожидания mouseup
      onMove(nx, ny);
    };

    const handleMouseUp = (upEvent) => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      const st = dragStateRef.current;
      dragStateRef.current = null;
      if (!st) return;

      const targetEl = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
      const bandEl = targetEl?.closest?.('.band');
      const targetBand = bandEl?.dataset?.band;

      if (targetBand && targetBand !== bandName) {
        // пересчитываем координаты относительно нового band-content
        const contentEl = bandEl.querySelector('.band-content');
        const rect = contentEl
            ? contentEl.getBoundingClientRect()
            : bandEl.getBoundingClientRect();

        const newX = Math.max(0, upEvent.clientX - rect.left);
        const newY = Math.max(0, upEvent.clientY - rect.top);

        onCrossBandMove?.(bandName, elementIndex, targetBand, newX, newY);
      }
      // иначе — обычное перемещение внутри бэнда уже произошло через onMove
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
          onMouseDown={handleMouseDown}
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