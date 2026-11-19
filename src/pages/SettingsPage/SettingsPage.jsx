import React, { useContext, useState } from 'react';
import { SettingsContext } from '../../contexts/SettingsContext';
import { fetchBearerToken } from '../../utils/jasperUtils';
import { encodeBase64 } from '../../utils/base64';
import './SettingsPage.css';

function SettingsPage() {
    const { settings, updatePath, resetSettings, authHeaders } = useContext(SettingsContext);
    const { auth } = settings;

    const [tokenStatus, setTokenStatus] = useState('');
    const [testing, setTesting] = useState(false);

    const handleGetToken = async () => {
        setTesting(true);
        setTokenStatus('');
        try {
            const token = await fetchBearerToken(settings);
            sessionStorage.setItem('jasper-designer.accessToken', token);
            setTokenStatus('✓ Токен получен и сохранён в сессии');
        } catch (e) {
            setTokenStatus(`✗ ${e.message}`);
        } finally {
            setTesting(false);
        }
    };

    const handleClearToken = () => {
        sessionStorage.removeItem('jasper-designer.accessToken');
        setTokenStatus('Токен удалён');
    };

    return (
        <div className="settings-page">
            <h2>Настройки</h2>

            {/* ---------- Сервер ---------- */}
            <section className="settings-section">
                <h3>Сервер</h3>
                <div className="settings-row">
                    <label htmlFor="serverUrl">Адрес сервера</label>
                    <input
                        id="serverUrl"
                        type="text"
                        placeholder="http://localhost:8080"
                        value={settings.serverUrl}
                        onChange={(e) => updatePath(['serverUrl'], e.target.value)}
                    />
                </div>
            </section>

            {/* ---------- Авторизация ---------- */}
            <section className="settings-section">
                <h3>Авторизация</h3>

                <div className="settings-row">
                    <label>Тип</label>
                    <div className="settings-radio-group">
                        {[
                            { value: 'none', label: 'Без авторизации' },
                            { value: 'basic', label: 'Basic' },
                            { value: 'bearer', label: 'Bearer (SSO)' },
                        ].map((opt) => (
                            <label key={opt.value} className="settings-radio">
                                <input
                                    type="radio"
                                    name="authType"
                                    value={opt.value}
                                    checked={auth.type === opt.value}
                                    onChange={() => updatePath(['auth', 'type'], opt.value)}
                                />
                                {opt.label}
                            </label>
                        ))}
                    </div>
                </div>

                {auth.type === 'basic' && (
                    <>
                        <div className="settings-row">
                            <label htmlFor="basicUser">Логин</label>
                            <input
                                id="basicUser"
                                type="text"
                                autoComplete="username"
                                value={auth.basic.username}
                                onChange={(e) => updatePath(['auth', 'basic', 'username'], e.target.value)}
                            />
                        </div>
                        <div className="settings-row">
                            <label htmlFor="basicPass">Пароль</label>
                            <input
                                id="basicPass"
                                type="password"
                                autoComplete="current-password"
                                value={auth.basic.password}
                                onChange={(e) => updatePath(['auth', 'basic', 'password'], e.target.value)}
                            />
                        </div>
                    </>
                )}

                {auth.type === 'bearer' && (
                    <>
                        <div className="settings-row">
                            <label htmlFor="ssoUrl">SSO URL (token endpoint)</label>
                            <input
                                id="ssoUrl"
                                type="text"
                                placeholder="https://sso.example.com/oauth/token"
                                value={auth.bearer.ssoUrl}
                                onChange={(e) => updatePath(['auth', 'bearer', 'ssoUrl'], e.target.value)}
                            />
                        </div>
                        <div className="settings-row">
                            <label htmlFor="clientId">Client ID</label>
                            <input
                                id="clientId"
                                type="text"
                                value={auth.bearer.clientId}
                                onChange={(e) => updatePath(['auth', 'bearer', 'clientId'], e.target.value)}
                            />
                        </div>
                        <div className="settings-row">
                            <label htmlFor="clientSecret">Client Secret</label>
                            <input
                                id="clientSecret"
                                type="password"
                                value={auth.bearer.clientSecret}
                                onChange={(e) => updatePath(['auth', 'bearer', 'clientSecret'], e.target.value)}
                            />
                        </div>
                        <div className="settings-row">
                            <label htmlFor="grantType">Grant Type</label>
                            <select
                                id="grantType"
                                value={auth.bearer.grantType}
                                onChange={(e) => updatePath(['auth', 'bearer', 'grantType'], e.target.value)}
                            >
                                <option value="password">password</option>
                                <option value="client_credentials">client_credentials</option>
                            </select>
                        </div>
                        {auth.bearer.grantType === 'password' && (
                            <>
                                <div className="settings-row">
                                    <label htmlFor="ssoUser">Пользователь SSO</label>
                                    <input
                                        id="ssoUser"
                                        type="text"
                                        autoComplete="username"
                                        value={auth.bearer.username}
                                        onChange={(e) => updatePath(['auth', 'bearer', 'username'], e.target.value)}
                                    />
                                </div>
                                <div className="settings-row">
                                    <label htmlFor="ssoPass">Пароль SSO</label>
                                    <input
                                        id="ssoPass"
                                        type="password"
                                        autoComplete="current-password"
                                        value={auth.bearer.password}
                                        onChange={(e) => updatePath(['auth', 'bearer', 'password'], e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        <div className="settings-actions">
                            <button onClick={handleGetToken} disabled={testing}>
                                {testing ? 'Получение…' : 'Получить токен'}
                            </button>
                            <button onClick={handleClearToken} className="secondary">
                                Сбросить токен
                            </button>
                        </div>
                        {tokenStatus && <div className="settings-status">{tokenStatus}</div>}
                    </>
                )}
            </section>

            {/* ---------- Итог ---------- */}
            <section className="settings-section">
                <h3>Заголовки запросов (предпросмотр)</h3>
                <pre className="settings-preview">
          {JSON.stringify(authHeaders, null, 2)}
        </pre>
            </section>

            <div className="settings-footer">
                <button onClick={resetSettings} className="secondary">
                    Сбросить всё
                </button>
            </div>
        </div>
    );
}

export default SettingsPage;