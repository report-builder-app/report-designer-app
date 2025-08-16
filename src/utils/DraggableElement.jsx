import React from 'react';
import './DraggableElement.css';

function DraggableElement({ element, isSelected, onClick, onMove }) {
  const handleMouseDown = (e) => {
    e.stopPropagation();
    onClick();

    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = element.x;
    const startTop = element.y;

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      onMove(startLeft + dx, startTop + dy);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const style = {
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
  };

  return (
    <div
      className={`draggable-element ${isSelected ? 'selected' : ''}`}
      style={style}
      onMouseDown={handleMouseDown}
    >
      {element.type === 'textField' && (
        <span className="element-preview">[{element.expression}]</span>
      )}
      {element.type === 'staticText' && (
        <span className="element-preview">{element.text}</span>
      )}
    </div>
  );
}

export default DraggableElement;