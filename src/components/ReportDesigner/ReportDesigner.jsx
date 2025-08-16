import React from 'react';
import './ReportDesigner.css';
import Toolbar from './Toolbar';
import BandsDesigner from './BandsDesigner';
import ElementsPalette from './ElementsPalette';
import PropertiesPanel from './PropertiesPanel';

function ReportDesigner() {
  return (
    <div className="report-designer">
      <Toolbar />
      <div className="designer-container">
        <ElementsPalette />
        <BandsDesigner />
        <PropertiesPanel />
      </div>
    </div>
  );
}

export default ReportDesigner;