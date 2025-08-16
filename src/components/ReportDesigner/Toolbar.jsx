import React from 'react';
import { FiSave, FiFolder, FiFile, FiImage, FiCode } from 'react-icons/fi';
import './Toolbar.css';

function Toolbar({ onSave, onNew, onOpen, onExportImage, onShowCode }) {
  return (
    <div className="toolbar">
      <button onClick={onNew} className="toolbar-button" title="New Report">
        <FiFile /> New
      </button>
      <button onClick={onOpen} className="toolbar-button" title="Open Report">
        <FiFolder /> Open
      </button>
      <button onClick={onSave} className="toolbar-button" title="Save Report">
        <FiSave /> Save
      </button>
      <div className="toolbar-separator" />
      <button onClick={onExportImage} className="toolbar-button" title="Export as PNG">
        <FiImage /> Export
      </button>
      <button onClick={onShowCode} className="toolbar-button" title="View Groovy Code">
        <FiCode /> View Code
      </button>
    </div>
  );
}

export default Toolbar;