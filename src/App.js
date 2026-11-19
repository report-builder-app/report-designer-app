import React, { useState } from 'react';
import ReportDesigner from './components/ReportDesigner/ReportDesigner';
import GroovyDSLPreview from './components/GroovyDSLPreview/GroovyDSLPreview';
import ReportPreview from './components/ReportPreview/ReportPreview';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import { SettingsProvider } from './contexts/SettingsContext';
import './App.css';

function App() {
    const [activeTab, setActiveTab] = useState('designer');

    return (
        <SettingsProvider>
            <div className="app-container">
                <header className="app-header">
                    <h1>Jasper Groovy DSL Designer</h1>
                    <nav className="tabs">
                        <div className="tabs-left">
                            <button
                                className={activeTab === 'designer' ? 'active' : ''}
                                onClick={() => setActiveTab('designer')}
                            >Designer</button>
                            <button
                                className={activeTab === 'groovy' ? 'active' : ''}
                                onClick={() => setActiveTab('groovy')}
                            >Groovy DSL</button>
                            <button
                                className={activeTab === 'preview' ? 'active' : ''}
                                onClick={() => setActiveTab('preview')}
                            >Preview</button>
                        </div>

                        {/* пункт «Настройки» — справа */}
                        <div className="tabs-right">
                            <button
                                className={activeTab === 'settings' ? 'active' : ''}
                                onClick={() => setActiveTab('settings')}
                                title="Настройки"
                            >
                                ⚙ Настройки
                            </button>
                        </div>
                    </nav>
                </header>

                <main className="app-main">
                    {activeTab === 'designer' && <ReportDesigner />}
                    {activeTab === 'groovy' && <GroovyDSLPreview />}
                    {activeTab === 'preview' && <ReportPreview />}
                    {activeTab === 'settings' && <SettingsPage />}
                </main>
            </div>
        </SettingsProvider>
    );
}

export default App;