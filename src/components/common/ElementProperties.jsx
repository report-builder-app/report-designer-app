import React, { useContext, useMemo } from 'react';
import { ReportContext } from '../../contexts/ReportContext';
import './ElementProperties.css';

function ElementProperties({ element, onChange }) {
    const { report } = useContext(ReportContext);

    // Собираем доступные имена для автодополнения
    const suggestions = useMemo(() => {
        const params = (report.parameters || [])
            .filter((p) => p.name)
            .map((p) => `$P{${p.name}}`);
        const fields = (report.fields || [])
            .filter((f) => f.name)
            .map((f) => `$F{${f.name}}`);
        return [...params, ...fields];
    }, [report.parameters, report.fields]);

    const handleChange = (property, value) => {
        onChange(property, value);
    };

    const handleNumberChange = (property, value) => {
        const parsed = value === '' ? 0 : parseInt(value, 10);
        handleChange(property, Number.isNaN(parsed) ? 0 : parsed);
    };

    // --- Валидация $P{} и $F{} в выражении ---
    const expressionError = useMemo(() => {
        if (element.type !== 'textField' && element.type !== 'image') return null;
        const expr = element.expression;
        if (!expr) return null;

        const paramNames = new Set((report.parameters || []).map((p) => p.name));
        const fieldNames = new Set((report.fields || []).map((f) => f.name));
        const unknown = [];

        // $P{name}
        const paramMatches = expr.matchAll(/\$P\{(\w+)\}/g);
        for (const m of paramMatches) {
            if (!paramNames.has(m[1])) unknown.push(`$P{${m[1]}}`);
        }
        // $F{name}
        const fieldMatches = expr.matchAll(/\$F\{(\w+)\}/g);
        for (const m of fieldMatches) {
            if (!fieldNames.has(m[1])) unknown.push(`$F{${m[1]}}`);
        }

        return unknown.length ? `Unknown: ${unknown.join(', ')}` : null;
    }, [element.type, element.expression, report.parameters, report.fields]);

    const renderPropertyControls = () => {
        switch (element.type) {
            case 'textField':
                return (
                    <>
                        <div className="property-group">
                            <label>Expression</label>
                            <input
                                type="text"
                                value={element.expression ?? ''}
                                onChange={(e) => handleChange('expression', e.target.value)}
                                list="expression-suggestions"
                                className={expressionError ? 'input-error' : ''}
                                placeholder="$F{field} или $P{param}"
                            />
                            <datalist id="expression-suggestions">
                                {suggestions.map((s) => (
                                    <option key={s} value={s} />
                                ))}
                            </datalist>
                            {expressionError && (
                                <div className="field-error">{expressionError}</div>
                            )}
                        </div>

                        <div className="property-group">
                            <label>Pattern</label>
                            <input
                                type="text"
                                value={element.pattern ?? ''}
                                onChange={(e) => handleChange('pattern', e.target.value)}
                                placeholder="напр. #,##0.00"
                            />
                        </div>

                        <div className="property-group">
                            <label>Font Size</label>
                            <input
                                type="number"
                                value={element.fontSize ?? 12}
                                onChange={(e) => handleNumberChange('fontSize', e.target.value)}
                                min={6}
                                max={72}
                            />
                        </div>

                        <div className="property-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={!!element.bold}
                                    onChange={(e) => handleChange('bold', e.target.checked)}
                                />
                                Bold
                            </label>
                        </div>
                    </>
                );

            case 'staticText':
            case 'label':
                return (
                    <>
                        <div className="property-group">
                            <label>Text</label>
                            <input
                                type="text"
                                value={element.text ?? ''}
                                onChange={(e) => handleChange('text', e.target.value)}
                            />
                        </div>

                        <div className="property-group">
                            <label>Font Size</label>
                            <input
                                type="number"
                                value={element.fontSize ?? 12}
                                onChange={(e) => handleNumberChange('fontSize', e.target.value)}
                                min={6}
                                max={72}
                            />
                        </div>

                        <div className="property-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={!!element.bold}
                                    onChange={(e) => handleChange('bold', e.target.checked)}
                                />
                                Bold
                            </label>
                        </div>
                    </>
                );

            case 'image':
                return (
                    <>
                        <div className="property-group">
                            <label>Expression</label>
                            <input
                                type="text"
                                value={element.expression ?? ''}
                                onChange={(e) => handleChange('expression', e.target.value)}
                                list="expression-suggestions"
                                className={expressionError ? 'input-error' : ''}
                                placeholder="$F{imageField} или URL"
                            />
                            <datalist id="expression-suggestions">
                                {suggestions.map((s) => (
                                    <option key={s} value={s} />
                                ))}
                            </datalist>
                            {expressionError && (
                                <div className="field-error">{expressionError}</div>
                            )}
                        </div>
                    </>
                );

            case 'line':
                return (
                    <div className="property-group">
                        <label>Line Width</label>
                        <input
                            type="number"
                            value={element.height ?? 1}
                            onChange={(e) => handleNumberChange('height', e.target.value)}
                            min={1}
                            max={10}
                        />
                    </div>
                );

            case 'rectangle':
                return (
                    <div className="property-group">
                        <label>Border Radius</label>
                        <input
                            type="number"
                            value={element.borderRadius ?? 0}
                            onChange={(e) => handleNumberChange('borderRadius', e.target.value)}
                            min={0}
                        />
                    </div>
                );

            default:
                return <div>No properties available for this element type</div>;
        }
    };

    return (
        <div className="element-properties">
            <h4>{element.type} Properties</h4>

            <div className="property-group">
                <label>Position (X, Y)</label>
                <div className="position-controls">
                    <input
                        type="number"
                        value={element.x ?? 0}
                        onChange={(e) => handleNumberChange('x', e.target.value)}
                    />
                    <input
                        type="number"
                        value={element.y ?? 0}
                        onChange={(e) => handleNumberChange('y', e.target.value)}
                    />
                </div>
            </div>

            <div className="property-group">
                <label>Size (W, H)</label>
                <div className="size-controls">
                    <input
                        type="number"
                        value={element.width ?? 100}
                        onChange={(e) => handleNumberChange('width', e.target.value)}
                        min={1}
                    />
                    <input
                        type="number"
                        value={element.height ?? 20}
                        onChange={(e) => handleNumberChange('height', e.target.value)}
                        min={1}
                        disabled={element.type === 'line'}
                    />
                </div>
            </div>

            {renderPropertyControls()}
        </div>
    );
}

export default ElementProperties;