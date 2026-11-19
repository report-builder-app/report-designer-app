import React, {useContext} from 'react';
import ReportDesigner from './components/ReportDesigner/ReportDesigner';
import GroovyDSLPreview from './components/GroovyDSLPreview/GroovyDSLPreview';
import ReportPreview from './components/ReportPreview/ReportPreview';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import { SettingsProvider } from './contexts/SettingsContext';
import DataSourcesPage from './pages/DataSourcesPage/DataSourcesPage';
import { DataSourcesProvider } from './contexts/DataSourcesContext';
import './App.css';

import { NavigationProvider, NavigationContext } from './contexts/NavigationContext';

function App() {
    return (
        <SettingsProvider>
            <NavigationProvider>
                <DataSourcesProvider>
                    <AppShell />
                </DataSourcesProvider>
            </NavigationProvider>
        </SettingsProvider>
    );
}

function AppShell() {
    const { activeTab, goTo } = useContext(NavigationContext);

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>Jasper Groovy DSL Designer</h1>
                <nav className="tabs">
                    <div className="tabs-left">
                        <button className={activeTab === 'designer' ? 'active' : ''} onClick={() => goTo('designer')}>Designer</button>
                        <button className={activeTab === 'groovy' ? 'active' : ''} onClick={() => goTo('groovy')}>Groovy DSL</button>
                        <button className={activeTab === 'preview' ? 'active' : ''} onClick={() => goTo('preview')}>Preview</button>
                        <button className={activeTab === 'datasources' ? 'active' : ''} onClick={() => goTo('datasources')}>Data Sources</button>
                    </div>
                    <div className="tabs-right">
                        <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => goTo('settings')}>⚙ Настройки</button>
                    </div>
                </nav>
            </header>

            <main className="app-main">
                {activeTab === 'designer' && <ReportDesigner />}
                {activeTab === 'groovy' && <GroovyDSLPreview />}
                {activeTab === 'preview' && <ReportPreview />}
                {activeTab === 'datasources' && <DataSourcesPage />}
                {activeTab === 'settings' && <SettingsPage />}
            </main>
        </div>
    );
}

export default App;