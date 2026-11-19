import React, { useContext, useMemo, useState } from 'react';
import { SettingsContext } from '../../contexts/SettingsContext';
import { DataSourcesContext } from '../../contexts/DataSourcesContext';
import DataSourceEditor from './DataSourceEditor';
import { FiPlus, FiEdit2 } from 'react-icons/fi';
import './DataSourcePicker.css';

/**
 * Виджет выбора источника данных для отчёта.
 *
 * @param {Object} props
 * @param {Object} props.report                — текущий отчёт (report.dataSourceId, report.dataSource)
 * @param {(field: string, value: any) => void} props.onChange
 */
function DataSourcePicker({ report, onChange }) {
    const { settings } = useContext(SettingsContext);
    const { items, loading, error, refresh } = useContext(DataSourcesContext);

    const [createOpen, setCreateOpen] = useState(false);
    const [editing, setEditing] = useState(null); // { id, data }

    const selectedDs = useMemo(
        () => items.find((x) => x.id === report.dataSourceId) || null,
        [items, report.dataSourceId]
    );

    // Копируем только допустимые DTO-поля (без id/name/createdAt/updatedAt/password)
    const toDsDto = (ds) => {
        if (!ds) return null;
        const dto = { provider: ds.provider };
        if (ds.provider === 'sql') {
            dto.jdbcUrl = ds.jdbcUrl;
            dto.user = ds.user;
        } else if (ds.provider === 'web') {
            dto.url = ds.url;
            dto.jsonPath = ds.jsonPath;
        } else if (ds.provider === 'custom') {
            dto.options = ds.options;
        }
        return dto;
    };

    const applyDataSource = (ds) => {
        if (!ds) {
            onChange('dataSourceId', null);
            onChange('dataSource', null);
            return;
        }
        onChange('dataSourceId', ds.id);
        onChange('dataSource', toDsDto(ds));
    };

    const handleSelect = (id) => {
        if (!id) {
            applyDataSource(null);
            return;
        }
        const ds = items.find((x) => x.id === id);
        if (ds) applyDataSource(ds);
    };

    const handleCreated = async (created) => {
        await refresh();
        // Даём контексту обновить items, затем применяем
        setTimeout(() => {
            applyDataSource(created);
        }, 0);
        setCreateOpen(false);
    };

    const handleEdited = async () => {
        await refresh();
        setEditing(null);
        // Переприменяем — вдруг поменялись поля
        const stillThere = items.find((x) => x.id === report.dataSourceId);
        if (stillThere) applyDataSource(stillThere);
    };

    const handleEditClick = () => {
        if (!selectedDs) return;
        setEditing({
            id: selectedDs.id,
            data: {
                ...selectedDs,
                password: '',
                options: selectedDs.options
                    ? JSON.stringify(selectedDs.options, null, 2)
                    : '',
            },
        });
    };

    const description = (ds) => {
        if (!ds) return '';
        if (ds.provider === 'sql') return ds.jdbcUrl || 'JDBC';
        if (ds.provider === 'web') return ds.url || 'HTTP';
        if (ds.provider === 'custom')
            return ds.options?.providerName || 'custom';
        return ds.provider;
    };

    return (
        <div className="ds-picker">
            <div className="ds-picker__row">
                <select
                    className="ds-picker__select"
                    value={report.dataSourceId || ''}
                    onChange={(e) => handleSelect(e.target.value)}
                    disabled={loading || !settings?.serverUrl}
                    title="Источник данных"
                >
                    <option value="">
                        {loading
                            ? 'Загрузка…'
                            : items.length === 0
                                ? '— нет источников —'
                                : '— не выбран —'}
                    </option>
                    {items.map((ds) => (
                        <option key={ds.id} value={ds.id}>
                            {ds.name} ({ds.provider})
                        </option>
                    ))}
                </select>

                <button
                    type="button"
                    className="ds-picker__btn"
                    title="Создать источник"
                    onClick={() => setCreateOpen(true)}
                    disabled={!settings?.serverUrl}
                >
                    <FiPlus />
                </button>

                <button
                    type="button"
                    className="ds-picker__btn"
                    title="Редактировать выбранный"
                    onClick={handleEditClick}
                    disabled={!selectedDs}
                >
                    <FiEdit2 />
                </button>
            </div>

            {error && <div className="ds-picker__error">{error}</div>}

            {selectedDs && (
                <div className="ds-picker__info" title={description(selectedDs)}>
                    <span className="ds-picker__provider">{selectedDs.provider}</span>
                    <span className="ds-picker__desc">{description(selectedDs)}</span>
                </div>
            )}

            {!report.dataSource && report.dataSourceId && (
                <div className="ds-picker__warn">
                    Источник выбран, но не найден — возможно, был удалён.
                </div>
            )}

            {createOpen && (
                <DataSourceEditor
                    settings={settings}
                    mode="create"
                    onClose={() => setCreateOpen(false)}
                    onSaved={handleCreated}
                />
            )}

            {editing && (
                <DataSourceEditor
                    settings={settings}
                    mode="edit"
                    id={editing.id}
                    initial={editing.data}
                    onClose={() => setEditing(null)}
                    onSaved={handleEdited}
                />
            )}
        </div>
    );
}

export default DataSourcePicker;