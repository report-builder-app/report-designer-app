import React from 'react';
import './ReportProperties.css';

function ReportProperties({ report, onChange }) {
  const handleChange = (property, value) => {
    onChange(property, value);
  };

  return (
    <div className="report-properties">
      <h4>Report Properties</h4>

      <div className="property-group">
        <label>Title</label>
        <input
          type="text"
          value={report.title}
          onChange={(e) => handleChange('title', e.target.value)}
        />
      </div>

      <div className="property-group">
        <label>Page Size</label>
        <div className="size-controls">
          <input
            type="number"
            value={report.pageWidth}
            onChange={(e) => handleChange('pageWidth', parseInt(e.target.value))}
            placeholder="Width"
          />
          <input
            type="number"
            value={report.pageHeight}
            onChange={(e) => handleChange('pageHeight', parseInt(e.target.value))}
            placeholder="Height"
          />
        </div>
      </div>

      <div className="property-group">
        <label>Orientation</label>
        <select
          value={report.orientation}
          onChange={(e) => handleChange('orientation', e.target.value)}
        >
          <option value="Portrait">Portrait</option>
          <option value="Landscape">Landscape</option>
        </select>
      </div>

      <div className="property-group">
        <label>Margins</label>
        <div className="margin-controls">
          <input
            type="number"
            value={report.marginLeft || 20}
            onChange={(e) => handleChange('marginLeft', parseInt(e.target.value))}
            placeholder="Left"
          />
          <input
            type="number"
            value={report.marginRight || 20}
            onChange={(e) => handleChange('marginRight', parseInt(e.target.value))}
            placeholder="Right"
          />
          <input
            type="number"
            value={report.marginTop || 20}
            onChange={(e) => handleChange('marginTop', parseInt(e.target.value))}
            placeholder="Top"
          />
          <input
            type="number"
            value={report.marginBottom || 20}
            onChange={(e) => handleChange('marginBottom', parseInt(e.target.value))}
            placeholder="Bottom"
          />
        </div>
      </div>
    </div>
  );
}

export default ReportProperties;