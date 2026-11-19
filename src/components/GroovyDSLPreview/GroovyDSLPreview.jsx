import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ReportContext } from '../../contexts/ReportContext';
import { generateGroovyDSL } from '../../utils/elementFactory';
import { parseGroovyDSL } from '../../utils/groovyParser';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FiCopy, FiCheck, FiEdit2, FiPlay, FiRotateCcw } from 'react-icons/fi';
import GroovyCodeEditor from './GroovyCodeEditor';
import './GroovyDSLPreview.css';

const MODE = { VIEW: 'view', EDIT_GROOVY: 'edit-groovy', EDIT_JSON: 'edit-json' };
const DEBOUNCE_MS = 400;

function GroovyDSLPreview() {
  const { report, updateReport } = useContext(ReportContext);

  const [mode, setMode] = useState(MODE.VIEW);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [justApplied, setJustApplied] = useState(false);

  const copyTimerRef = useRef(null);
  const debounceRef = useRef(null);
  const appliedTimerRef = useRef(null);

  const groovyCode = useMemo(() => {
    try {
      return generateGroovyDSL(report);
    } catch (e) {
      return `// Ошибка генерации DSL: ${e.message}`;
    }
  }, [report]);

  const jsonCode = useMemo(() => JSON.stringify(report, null, 2), [report]);

  useEffect(() => {
    if (mode === MODE.EDIT_GROOVY) setDraft(groovyCode);
    if (mode === MODE.EDIT_JSON) setDraft(jsonCode);
    setError(null);
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => () => {
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (appliedTimerRef.current) clearTimeout(appliedTimerRef.current);
  }, []);

  const handleCopy = () => {
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const applyDraft = (silent = false) => {
    setError(null);
    try {
      if (mode === MODE.EDIT_JSON) {
        const parsed = JSON.parse(draft);
        if (!parsed.bands || typeof parsed.bands !== 'object') {
          throw new Error('В JSON отсутствует объект "bands"');
        }
        updateReport(() => parsed);
      } else if (mode === MODE.EDIT_GROOVY) {
        const parsed = parseGroovyDSL(draft);
        updateReport(() => parsed);
      }
      setDirty(false);
      setJustApplied(true);
      if (appliedTimerRef.current) clearTimeout(appliedTimerRef.current);
      appliedTimerRef.current = setTimeout(() => setJustApplied(false), 1500);
    } catch (e) {
      if (silent) setError(e.message); // показываем и в live-режиме, чтобы не терять ошибку
      else setError(e.message);
    }
  };

  const handleDraftChange = (value) => {
    setDraft(value);
    setDirty(true);
    setJustApplied(false);
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => applyDraft(true), DEBOUNCE_MS);
  };

  const handleApply = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    applyDraft(false);
  };

  const handleReset = () => {
    if (mode === MODE.EDIT_GROOVY) setDraft(groovyCode);
    if (mode === MODE.EDIT_JSON) setDraft(jsonCode);
    setError(null);
    setDirty(false);
    setJustApplied(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const totalElements = useMemo(() => {
    const bands = report?.bands || {};
    return Object.values(bands).reduce(
        (s, a) => s + (Array.isArray(a) ? a.length : 0),
        0
    );
  }, [report]);

  const isEditing = mode === MODE.EDIT_GROOVY || mode === MODE.EDIT_JSON;

  return (
      <div className="groovy-preview-container">
        <div className="groovy-preview-header">
          <h2>Groovy DSL Code</h2>

          <div className="groovy-preview-meta">
            {/* индикаторы */}
            <span className="groovy-preview-stat">{totalElements} elements</span>

            {isEditing && (
                <span
                    className={`editor-status ${error ? 'error' : dirty ? 'dirty' : justApplied ? 'applied' : ''}`}
                >
      {error ? '✗ ошибка' : dirty ? '● изменено' : justApplied ? '✓ применено' : ''}
    </span>
            )}

            {/* переключатель режимов */}
            <div className="mode-switch">
              <button className={mode === MODE.VIEW ? 'active' : ''} onClick={() => setMode(MODE.VIEW)}>View</button>
              <button className={mode === MODE.EDIT_GROOVY ? 'active' : ''} onClick={() => setMode(MODE.EDIT_GROOVY)}>
                <FiEdit2 /> Groovy
              </button>
              <button className={mode === MODE.EDIT_JSON ? 'active' : ''} onClick={() => setMode(MODE.EDIT_JSON)}>
                <FiEdit2 /> JSON
              </button>
            </div>

            {/* действия — отдельная группа, всегда в строку */}
            <div className="groovy-preview-actions">
              {mode === MODE.VIEW ? (
                  CopyToClipboard ? (
                      <CopyToClipboard text={groovyCode} onCopy={handleCopy}>
                        <button className="copy-button">
                          {copied ? <FiCheck /> : <FiCopy />} {copied ? ' Copied!' : ' Copy'}
                        </button>
                      </CopyToClipboard>
                  ) : (
                      <button
                          className="copy-button"
                          onClick={() => { navigator.clipboard?.writeText(groovyCode); handleCopy(); }}
                      >
                        {copied ? <FiCheck /> : <FiCopy />} Copy
                      </button>
                  )
              ) : (
                  <>
                    <button className="copy-button secondary" onClick={handleReset}>
                      <FiRotateCcw /> Reset
                    </button>
                    <button className="copy-button" onClick={handleApply}>
                      <FiPlay /> Apply
                    </button>
                  </>
              )}
            </div>
          </div>
        </div>

        <div className="code-container">
          {/* View — тот же CodeMirror, но readOnly (никакого Prism) */}
          {mode === MODE.VIEW && (
              <GroovyCodeEditor
                  value={groovyCode}
                  onChange={() => {}}
                  language="groovy"
                  readOnly
                  height="100%"
              />
          )}

          {isEditing && (
              <GroovyCodeEditor
                  value={draft}
                  onChange={handleDraftChange}
                  language={mode === MODE.EDIT_JSON ? 'json' : 'groovy'}
                  height="100%"
              />
          )}
        </div>

        {error && <div className="editor-error">{error}</div>}
      </div>
  );
}

export default GroovyDSLPreview;