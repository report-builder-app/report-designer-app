import React from 'react';
import './ElementProperties.css';

function ElementProperties({ element, onChange }) {
  const handleChange = (property, value) => {
    onChange(property, value);
  };

  const renderPropertyControls = () => {
    switch (element.type) {
      case 'textField':
        return (
          <>
            <div className="property-group">
              <label>Expression</label>
              <input
                type="text"
                value={element.expression}
                onChange={(e) => handleChange('expression', e.target.value)}
              />
            </div>
            <div className="property-group">
              <label>Font Size</label>
              <input
                type="number"
                value={element.fontSize}
                onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
              />
            </div>
            <div className="property-group">
              <label>Bold</label>
              <input
                type="checkbox"
                checked={element.bold}
                onChange={(e) => handleChange('bold', e.target.checked)}
              />
            </div>
          </>
        );
      case 'staticText':
        return (
          <>
            <div className="property-group">
              <label>Text</label>
              <input
                type="text"
                value={element.text}
                onChange={(e) => handleChange('text', e.target.value)}
              />
            </div>
            <div className="property-group">
              <label>Font Size</label>
              <input
                type="number"
                value={element.fontSize}
                onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
              />
            </div>
          </>
        );
      default:
        return <div>No properties available for this element type</div>;
    }
  };

  return (
    <div className="element-properties">
      <h4>{element.type} Properties</h4>
      <div className="property-group">
        <label>Position (X,Y)</label>
        <div className="position-controls">
          <input
            type="number"
            value={element.x}
            onChange={(e) => handleChange('x', parseInt(e.target.value))}
          />
          <input
            type="number"
            value={element.y}
            onChange={(e) => handleChange('y', parseInt(e.target.value))}
          />
        </div>
      </div>
      <div className="property-group">
        <label>Size (W,H)</label>
        <div className="size-controls">
          <input
            type="number"
            value={element.width}
            onChange={(e) => handleChange('width', parseInt(e.target.value))}
          />
          <input
            type="number"
            value={element.height}
            onChange={(e) => handleChange('height', parseInt(e.target.value))}
          />
        </div>
      </div>
      {renderPropertyControls()}
    </div>
  );
}

export default ElementProperties;