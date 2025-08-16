import React, { useState } from 'react';
import { FiMove, FiX, FiEdit2 } from 'react-icons/fi';
import './DraggableElement.css';

function DraggableElement({
  element,
  isSelected,
  onClick,
  onMove,
  onDelete,
  onDoubleClick
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: element.x, y: element.y });

  const handleMouseDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setStartPosition({ x: element.x, y: element.y });
    onClick();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    onMove(startPosition.x + dx, startPosition.y + dy);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, startPosition]);

  const getElementContent = () => {
    switch (element.type) {
      case 'textField':
        return (
          <div className="element-content">
            <span className="expression">[{element.expression}]</span>
            <span className="field-type">Text Field</span>
          </div>
        );
      case 'staticText':
        return (
          <div className="element-content">
            <span className="text">{element.text}</span>
            <span className="field-type">Static Text</span>
          </div>
        );
      case 'image':
        return (
          <div className="element-content">
            <div className="image-placeholder"></div>
            <span className="field-type">Image</span>
          </div>
        );
      default:
        return <div className="element-content">Unknown Element</div>;
    }
  };

  return (
    <div
      className={`draggable-element ${element.type} ${isSelected ? 'selected' : ''}`}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={onDoubleClick}
    >
      {getElementContent()}

      {isSelected && (
        <div className="element-controls">
          <button
            className="control-button move-handle"
            title="Drag to move"
            onMouseDown={handleMouseDown}
          >
            <FiMove size={14} />
          </button>
          <button
            className="control-button delete-button"
            title="Delete element"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <FiX size={14} />
          </button>
        </div>
      )}

      <div className="size-handles">
        <div className="handle top-left"></div>
        <div className="handle top-right"></div>
        <div className="handle bottom-left"></div>
        <div className="handle bottom-right"></div>
      </div>
    </div>
  );
}

export default DraggableElement;