import React, { useEffect, useState } from 'react';
import {
    createDataSource,
    updateDataSource,
    testDataSource,
} from '../../utils/datasourcesApi';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import './DataSourceEditor.css';

const EMPTY = {
    name: '',
    provider: 'sql',
    jdbcUrl: '',
    user: '',
    password: '',
    url: '',
    jsonPath: '',
    options: '',
};

function toPayload(d) {
    const payload = { name: d.name, provider: d.provider };
    if (d.provider === 'sql') {
        payload.jdbcUrl = d.jdbcUrl;
        payload.user = d.user;
        if (d.password) payload.password = d.password;
    } else if (d.provider === 'web') {
        payload.url = d.url;
        payload.jsonPath = d.jsonPath;
    } else if (d.provider === 'custom') {
        if (d.options?.trim()) {
            // Может бросить SyntaxError — ловим в handleSave
            payload.options = JSON.parse(d.options);
        }
    }
    return payload;
}

/**
 * Модалка создания/редактирования источника данных.
 *
 * @param {Object} props
 * @param {Object} props.settings                — из SettingsContext
 * @param {'create'|'edit'} [props.mode='create']
 * @param {Object} [props.initial]               — исходные данные (edit)
 * @param {string} [props.id]                    — id источника (edit)
 * @param {() => void} props.onClose
 * @param {(saved: Object) => void} [props.onSaved]
 */
function DataSourceEditor({
                              settings,
                              mode = 'create',
                              initial,
                              id,
                              onClose,
                              onSaved,
                          }) {
    const [data, setData] = useState(() => ({
        ...EMPTY,
        ...(initial || {}),
        password: '',
        options: initial?.options ? JSON.stringify(initial.options, null, 2) : '',
    }));
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const [testResult, setTestResult] = useState(null);

    // Сброс состояния при смене initial/id
    useEffect(() => {
        setData({
            ...EMPTY,
            ...(initial || {}),
            password: '',
            options: initial?.options ? JSON.stringify(initial.options, null, 2) : '',
        });
        setError(null);
        setTestResult(null);
    }, [initial, id]);

    const patch = (field, value) =>
        setData((p) => ({ ...p, [field]: value }));

    const handleSave = async () => {
        setBusy(true);
        setError(null);
        try {
            const payload = toPayload(data);
            let saved;
            if (mode === 'create') {
                saved = await createDataSource(settings, payload);
            } else {
                saved = await updateDataSource(settings, id, payload);
            }
            onSaved?.(saved);
        } catch (e) {
            setError(e.message);
        } finally {
            setBusy(false);
        }
    };

    const handleTest = async () => {
        if (mode !== 'edit' || !id) return;
        setBusy(true);
        setTestResult(null);
        try {
            setTestResult(await testDataSource(settings, id));
        } catch (e) {
            setTestResult({ ok: false, message: e.message });
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="ds-modal-backdrop" onClick={onClose}>
            <div className="ds-modal" onClick={(e) => e.stopPropagation()}>
                <h3>
                    {mode === 'create'
                        ? 'Новый источник данных'
                        : 'Редактирование источника'}
                </h3>

                <div className="ds-form">
                    <label>Имя</label>
                    <input
                        value={data.name}
                        onChange={(e) => patch('name', e.target.value)}
                        placeholder="Shop DB"
                    />

                    <label>Тип</label>
                    <select
                        value={data.provider}
                        onChange={(e) => patch('provider', e.target.value)}
                    >
                        <option value="sql">SQL (JDBC)</option>
                        <option value="web">Web (HTTP JSON)</option>
                        <option value="custom">Custom (MongoDB и др.)</option>
                    </select>

                    {data.provider === 'sql' && (
                        <>
                            <label>JDBC URL</label>
                            <input
                                value={data.jdbcUrl}
                                onChange={(e) => patch('jdbcUrl', e.target.value)}
                                placeholder="jdbc:postgresql://localhost:5432/mydb"
                            />
                            <label>User</label>
                            <input
                                value={data.user}
                                onChange={(e) => patch('user', e.target.value)}
                            />
                            <label>Password</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => patch('password', e.target.value)}
                                placeholder={
                                    mode === 'edit'
                                        ? '•••••• (оставьте пустым, чтобы не менять)'
                                        : ''
                                }
                            />
                        </>
                    )}

                    {data.provider === 'web' && (
                        <>
                            <label>URL</label>
                            <input
                                value={data.url}
                                onChange={(e) => patch('url', e.target.value)}
                                placeholder="https://api.example.com/orders"
                            />
                            <label>JSONPath</label>
                            <input
                                value={data.jsonPath}
                                onChange={(e) => patch('jsonPath', e.target.value)}
                                placeholder="$.data[*]"
                            />
                        </>
                    )}

                    {data.provider === 'custom' && (
                        <>
                            <label>Options (JSON)</label>
                            <textarea
                                rows={6}
                                value={data.options}
                                onChange={(e) => patch('options', e.target.value)}
                                placeholder='{"providerName":"mongodb","uri":"mongodb://localhost:27017","database":"shop","collection":"orders"}'
                            />
                        </>
                    )}
                </div>

                {error && <div className="ds-error">{error}</div>}

                {testResult && (
                    <div className={`ds-test ${testResult.ok ? 'ok' : 'fail'}`}>
                        {testResult.ok ? <FiCheckCircle /> : <FiXCircle />}
                        {testResult.message ||
                            (testResult.ok ? 'Подключение успешно' : 'Ошибка подключения')}
                        {testResult.latencyMs != null && (
                            <span className="ds-latency"> · {testResult.latencyMs} ms</span>
                        )}
                    </div>
                )}

                <div className="ds-actions">
                    <button onClick={onClose} disabled={busy}>Отмена</button>
                    {mode === 'edit' && (
                        <button onClick={handleTest} disabled={busy}>Проверить</button>
                    )}
                    <button
                        className="primary"
                        onClick={handleSave}
                        disabled={busy || !data.name}
                    >
                        {busy ? 'Сохранение…' : 'Сохранить'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DataSourceEditor;