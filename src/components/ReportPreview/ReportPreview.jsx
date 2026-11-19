import React, { useContext, useEffect, useRef, useState } from 'react';
import { ReportContext } from '../../contexts/ReportContext';
import { SettingsContext } from '../../contexts/SettingsContext';
import { renderReport } from '../../utils/jasperUtils';
import { FiRefreshCw } from 'react-icons/fi';
import './ReportPreview.css';

const DEBOUNCE_MS = 800;

const FORMATS = [
  { value: 'html', label: 'HTML' },
  { value: 'pdf',  label: 'PDF'  },
  { value: 'json', label: 'JSON' },
];

function ReportPreview() {
  const { report } = useContext(ReportContext);
  const { settings } = useContext(SettingsContext);

  const [format, setFormat] = useState('html');
  const [preview, setPreview] = useState(null); // { url, contentType }
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const lastBlobUrlRef = useRef(null);
  const requestIdRef = useRef(0);
  const debounceTimerRef = useRef(null);

  const revokeLastBlob = () => {
    if (lastBlobUrlRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(lastBlobUrlRef.current);
    }
    lastBlobUrlRef.current = null;
  };

  const generatePreview = async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const { blobUrl, contentType } = await renderReport(report, settings, format);

      // пока запрос шёл, стартовал более новый — игнорируем
      if (requestId !== requestIdRef.current) {
        URL.revokeObjectURL(blobUrl);
        return;
      }

      revokeLastBlob();
      lastBlobUrlRef.current = blobUrl;
      setPreview({ url: blobUrl, contentType: contentType || '' });
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error('Error generating preview:', err);
      setError(err.message || 'Не удалось сгенерировать превью');
      setPreview(null);
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  };

  // авто-генерация с дебаунсом при изменениях отчёта, настроек или формата
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      generatePreview();
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report, settings, format]);

  // очистка blob-URL при размонтировании
  useEffect(() => {
    return () => {
      revokeLastBlob();
    };
  }, []);

  const isJson = preview?.contentType?.includes('application/json');
  const isPdf = preview?.contentType?.includes('application/pdf');

  return (
      <div className="report-preview-container">
        <div className="preview-header">
          <h2>Report Preview</h2>
          <div className="preview-header__meta">
          <span className="preview-server" title="Адрес сервера из настроек">
            {settings?.serverUrl || '— мок-режим —'}
          </span>

            <label className="preview-format">
              Format:{' '}
              <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  disabled={isLoading}
              >
                {FORMATS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                ))}
              </select>
            </label>

            <button
                onClick={generatePreview}
                disabled={isLoading}
                className="refresh-button"
            >
              <FiRefreshCw className={isLoading ? 'spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {isLoading ? (
            <div className="loading-state">Generating preview…</div>
        ) : error ? (
            <div className="error-state">
              Error generating preview: {error}
              {!settings?.serverUrl && (
                  <div className="error-hint">
                    Задайте адрес сервера на вкладке «Настройки».
                  </div>
              )}
            </div>
        ) : (
            <div className="preview-content">
              {preview ? (
                  isJson ? (
                      <JsonPreview url={preview.url} />
                  ) : isPdf ? (
                      <embed
                          src={preview.url}
                          type="application/pdf"
                          className="preview-iframe"
                      />
                  ) : (
                      <iframe
                          src={preview.url}
                          title="Jasper Report Preview"
                          className="preview-iframe"
                      />
                  )
              ) : (
                  <div className="no-preview">No preview available</div>
              )}
            </div>
        )}
      </div>
  );
}

/** Загружает blob по URL и показывает JSON с форматированием */
function JsonPreview({ url }) {
  const [text, setText] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch(url)
        .then((r) => r.text())
        .then((t) => {
          if (cancelled) return;
          try {
            setText(JSON.stringify(JSON.parse(t), null, 2));
          } catch {
            setText(t);
          }
        })
        .catch((e) => setText(`Ошибка чтения: ${e.message}`));
    return () => {
      cancelled = true;
    };
  }, [url]);

  return <pre className="preview-json">{text}</pre>;
}

export default ReportPreview;