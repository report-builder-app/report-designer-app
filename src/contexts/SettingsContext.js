import React, { createContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'jasper-designer.settings';

export const defaultSettings = {
    serverUrl: 'http://localhost:8080',
    auth: {
        type: 'none', // 'none' | 'basic' | 'bearer'
        basic: {
            username: '',
            password: '',
        },
        bearer: {
            // параметры подключения к SSO для получения токена
            ssoUrl: '',
            clientId: '',
            clientSecret: '',
            username: '',
            password: '',
            grantType: 'password', // 'password' | 'client_credentials'
        },
    },
};

function loadSettings() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultSettings;
        const parsed = JSON.parse(raw);
        // мягкое слияние с дефолтами, чтобы не терять новые поля
        return {
            ...defaultSettings,
            ...parsed,
            auth: {
                ...defaultSettings.auth,
                ...(parsed.auth || {}),
                basic: { ...defaultSettings.auth.basic, ...(parsed.auth?.basic || {}) },
                bearer: { ...defaultSettings.auth.bearer, ...(parsed.auth?.bearer || {}) },
            },
        };
    } catch (e) {
        console.warn('Failed to read settings from localStorage', e);
        return defaultSettings;
    }
}

export const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(loadSettings);

    // автосохранение в localStorage при любом изменении
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch (e) {
            console.warn('Failed to persist settings', e);
        }
    }, [settings]);

    const updateSettings = (updater) => {
        setSettings((prev) => {
            if (typeof updater === 'function') return updater(prev);
            return { ...prev, ...updater };
        });
    };

    // Удобный хелпер: путь для частичного обновления
    // updatePath(['auth','basic','username'], 'admin')
    const updatePath = (path, value) => {
        setSettings((prev) => {
            const next = structuredClone(prev);
            let node = next;
            for (let i = 0; i < path.length - 1; i++) {
                node = node[path[i]];
            }
            node[path[path.length - 1]] = value;
            return next;
        });
    };

    const resetSettings = () => setSettings(defaultSettings);

    // Заголовки для запросов к бэкенду
    const authHeaders = useMemo(() => {
        const { auth } = settings;
        if (auth.type === 'basic' && auth.basic.username) {
            const token = btoa(`${auth.basic.username}:${auth.basic.password}`);
            return { Authorization: `Basic ${token}` };
        }
        if (auth.type === 'bearer') {
            // Токен хранится в sessionStorage (после логина через SSO)
            const token = sessionStorage.getItem('jasper-designer.accessToken');
            if (token) return { Authorization: `Bearer ${token}` };
        }
        return {};
    }, [settings]);

    return (
        <SettingsContext.Provider
            value={{ settings, updateSettings, updatePath, resetSettings, authHeaders }}
        >
            {children}
        </SettingsContext.Provider>
    );
}