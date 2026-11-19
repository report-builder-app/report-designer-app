import React, {useContext} from 'react';
import {FiSave, FiFolder, FiFile, FiImage, FiCode} from 'react-icons/fi';
import './Toolbar.css';
import {NavigationContext} from "../../contexts/NavigationContext";

function Toolbar({onSave, onNew, onOpen, onExportImage, onShowCode}) {
    const {goTo} = useContext(NavigationContext);
    return (
        <div className="toolbar">
            <button onClick={onNew} className="toolbar-button" title="New Report">
                <FiFile/> New
            </button>
            <button onClick={onOpen} className="toolbar-button" title="Open Report">
                <FiFolder/> Open
            </button>
            <button onClick={onSave} className="toolbar-button" title="Save Report">
                <FiSave/> Save
            </button>
            <div className="toolbar-separator"/>
            <button onClick={onExportImage} className="toolbar-button" title="Export as PNG">
                <FiImage/> Export
            </button>
            <button onClick={() => goTo('groovy')} className="toolbar-button" title="View Groovy Code">
                <FiCode/> View Code
            </button>
        </div>
    );
}

export default Toolbar;