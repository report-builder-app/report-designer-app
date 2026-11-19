import React, { useContext, useEffect, useState } from 'react';
import { SettingsContext } from '../../contexts/SettingsContext';
import { DataSourcesContext } from '../../contexts/DataSourcesContext';
import {
    createDataSource,
    updateDataSource,
    deleteDataSource,
    testDataSource,
} from '../../utils/datasourcesApi';
import { FiPlus, FiTrash2, FiEdit2, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import './DataSourcesPage.css';

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

function DataSourcesPage() {
    const { settings } = useContext(SettingsContext);
    const { items, loading, error, refresh } = useContext(DataSourcesContext);

    const [editor, setEditor] = useState(null);   // { mode: 'create'|'edit', data, id? }
    const [testResult, setTestResult] = useState(null);
    const [busy, setBusy] = useState(false);
    const [actionError, setActionError] = useState(null);

    const openCreate = () => {
        setEditor({ mode: 'create', data: { ...EMPTY } });
        setTestResult(null);
        setActionError(null);
    };

    const openEdit = (ds) => {
        setEditor({
            mode: 'edit',
            id: ds.id,
            data: {
                ...EMPTY,
                ...ds,
                password: '',                            // не показываем
                options: ds.options ? JSON.stringify(ds.options, null, 2) : '',
            },
        });
        setTestResult(null);
        setActionError(null);
    };

    const closeEditor = () => {
        setEditor(null);
        setTestResult(null);
        setActionError(null);
    };

    const patch = (field, value) => {
        setEditor((prev) => ({ ...prev, data: { ...prev.data, [field]: value } }));
    };

    const toPayload = (d) => {
        const payload = {
            name: d.name,
            provider: d.provider,
        };
        if (d.provider === 'sql') {
            payload.jdbcUrl = d.jdbcUrl;
            payload.user = d.user;
            if (d.password) payload.password = d.password;
        } else if (d.provider === 'web') {
            payload.url = d.url;
            payload.jsonPath = d.jsonPath;
        } else if (d.provider === 'custom') {
            if (d.options?.trim()) {
                try {
                    payload.options = JSON.parse(d.options);
                } catch {
                    throw new Error('options: невалидный JSON');
                }
            }
        }
        return payload;
    };

    const handleSave = async () => {
        setBusy(true);
        setActionError(null);
        try {
            const payload = toPayload(editor.data);
            if (editor.mode === 'create') {
                await createDataSource(settings, payload);
            } else {
                await updateDataSource(settings, editor.id, payload);
            }
            await refresh();
            closeEditor();
        } catch (e) {
            setActionError(e.message);
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Удалить источник «${name}»?`)) return;
        setBusy(true);
        setActionError(null);
        try {
            await deleteDataSource(settings, id);
            await refresh();
        } catch (e) {
            setActionError(e.message);
        } finally {
            setBusy(false);
        }
    };

    const handleTest = async () => {
        if (editor.mode !== 'edit' || !editor.id) return;
        setBusy(true);
        setTestResult(null);
        try {
            const r = await testDataSource(settings, editor.id);
            setTestResult(r);
        } catch (e) {
            setTestResult({ ok: false, message: e.message });
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="datasources-page">
            <div className="ds-header">
                <h2>Источники данных</h2>
                <button className="primary" onClick={openCreate} disabled={!settings?.serverUrl || busy}>
                    <FiPlus /> Добавить
                </button>
            </div>

            {!settings?.serverUrl && (
                <div className="ds-warn">Задайте адрес сервера в разделе «Настройки».</div>
            )}
            {error && <div className="ds-error">{error}</div>}

            {loading ? (
                <div className="ds-loading">Загрузка…</div>
            ) : items.length === 0 ? (
                <div className="ds-empty">Источники данных пока не созданы.</div>
            ) : (
                <table className="ds-table">
                    <thead>
                    <tr>
                        <th>Имя</th>
                        <th>Тип</th>
                        <th>Параметры</th>
                        <th style={{ width: 180 }}>Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {items.map((ds) => (
                        <tr key={ds.id}>
                            <td>{ds.name}</td>
                            <td><code>{ds.provider}</code></td>
                            <td className="ds-params">
                                {ds.provider === 'sql' && ds.jdbcUrl}
                                {ds.provider === 'web' && ds.url}
                                {ds.provider === 'custom' && ds.options?.providerName}
                            </td>
                            <td>
                                <button className="icon" title="Редактировать" onClick={() => openEdit(ds)}>
                                    <FiEdit2 />
                                </button>
                                <button className="icon danger" title="Удалить" onClick={() => handleDelete(ds.id, ds.name)}>
                                    <FiTrash2 />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {editor && (
                <div className="ds-modal-backdrop" onClick={closeEditor}>
                    <div className="ds-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>{editor.mode === 'create' ? 'Новый источник' : 'Редактирование источника'}</h3>

                        <div className="ds-form">
                            <label>Имя</label>
                            <input value={editor.data.name} onChange={(e) => patch('name', e.target.value)} />

                            <label>Тип</label>
                            <select value={editor.data.provider} onChange={(e) => patch('provider', e.target.value)}>
                                <option value="sql">SQL (JDBC)</option>
                                <option value="web">Web (HTTP JSON)</option>
                                <option value="custom">Custom (MongoDB и др.)</option>
                            </select>

                            {editor.data.provider === 'sql' && (
                                <>
                                    <label>JDBC URL</label>
                                    <input value={editor.data.jdbcUrl} onChange={(e) => patch('jdbcUrl', e.target.value)} placeholder="jdbc:postgresql://localhost:5432/mydb" />
                                    <label>User</label>
                                    <input value={editor.data.user} onChange={(e) => patch('user', e.target.value)} />
                                    <label>Password</label>
                                    <input type="password" value={editor.data.password} onChange={(e) => patch('password', e.target.value)} placeholder={editor.mode === 'edit' ? '•••••• (оставьте пустым, чтобы не менять)' : ''} />
                                </>
                            )}

                            {editor.data.provider === 'web' && (
                                <>
                                    <label>URL</label>
                                    <input value={editor.data.url} onChange={(e) => patch('url', e.target.value)} placeholder="https://api.example.com/orders" />
                                    <label>JSONPath</label>
                                    <input value={editor.data.jsonPath} onChange={(e) => patch('jsonPath', e.target.value)} placeholder="$.data[*]" />
                                </>
                            )}

                            {editor.data.provider === 'custom' && (
                                <>
                                    <label>Options (JSON)</label>
                                    <textarea rows={6} value={editor.data.options} onChange={(e) => patch('options', e.target.value)} placeholder='{"providerName":"mongodb","uri":"mongodb://localhost:27017","database":"shop","collection":"orders"}' />
                                </>
                            )}
                        </div>

                        {actionError && <div className="ds-error">{actionError}</div>}
                        {testResult && (
                            <div className={`ds-test ${testResult.ok ? 'ok' : 'fail'}`}>
                                {testResult.ok ? <FiCheckCircle /> : <FiXCircle />}
                                {testResult.message || (testResult.ok ? 'Подключение успешно' : 'Ошибка подключения')}
                                {testResult.latencyMs != null && <span className="ds-latency"> · {testResult.latencyMs} ms</span>}
                            </div>
                        )}

                        <div className="ds-actions">
                            <button onClick={closeEditor} disabled={busy}>Отмена</button>
                            {editor.mode === 'edit' && (
                                <button onClick={handleTest} disabled={busy}>Проверить</button>
                            )}
                            <button className="primary" onClick={handleSave} disabled={busy || !editor.data.name}>
                                {busy ? 'Сохранение…' : 'Сохранить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DataSourcesPage;