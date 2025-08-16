import React, { useState } from 'react';
import ReportDesigner from './components/ReportDesigner/ReportDesigner';
import GroovyDSLPreview from './components/GroovyDSLPreview/GroovyDSLPreview';
import ReportPreview from './components/ReportPreview/ReportPreview';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('designer');

  return (
    <div className="app">
      <header className="app-header">
        <h1>Jasper Groovy DSL Designer</h1>
        <nav className="tabs">
          <button
            className={activeTab === 'designer' ? 'active' : ''}
            onClick={() => setActiveTab('designer')}
          >
            Designer
          </button>
          <button
            className={activeTab === 'groovy' ? 'active' : ''}
            onClick={() => setActiveTab('groovy')}
          >
            Groovy DSL
          </button>
          <button
            className={activeTab === 'preview' ? 'active' : ''}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
        </nav>
      </header>

      <main>
        {activeTab === 'designer' && <ReportDesigner />}
        {activeTab === 'groovy' && <GroovyDSLPreview />}
        {activeTab === 'preview' && <ReportPreview />}
      </main>
    </div>
  );
}

export default App;


//import React from 'react';
//import ReportDesigner from './components/ReportDesigner/ReportDesigner';
//import './App.css';

//function App() {
//  return (
//    <div className="app">
//      <ReportDesigner />
//    </div>
//  );
//}
//
//export default App;
