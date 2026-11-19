import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { SettingsContext } from './SettingsContext';
import {
    listDataSources,
} from '../utils/datasourcesApi';

export const DataSourcesContext = createContext(null);

export function DataSourcesProvider({ children }) {
    const { settings } = useContext(SettingsContext);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const refresh = useCallback(async () => {
        if (!settings?.serverUrl) {
            setItems([]);
            setError('Не задан адрес сервера');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const list = await listDataSources(settings);
            setItems(list);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [settings]);

    useEffect(() => { refresh(); }, [refresh]);

    return (
        <DataSourcesContext.Provider
            value={{ items, loading, error, refresh, setItems }}
        >
            {children}
        </DataSourcesContext.Provider>
    );
}