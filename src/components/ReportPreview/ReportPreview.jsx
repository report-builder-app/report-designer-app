import React, { useContext, useEffect, useRef, useState } from 'react';
import { ReportContext } from '../../contexts/ReportContext';
import { SettingsContext } from '../../contexts/SettingsContext';
import { generateJasperReport } from '../../utils/jasperUtils';
import { FiRefreshCw } from 'react-icons/fi';
import './ReportPreview.css';

const DEBOUNCE_MS = 800;

function ReportPreview() {
  const { report } = useContext(ReportContext);
  const { settings } = useContext(SettingsContext);

  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // храним предыдущий blob-URL, чтобы освободить память
  const lastBlobUrlRef = useRef(null);
  // защита от гонки запросов
  const requestIdRef = useRef(0);
  // таймер дебаунса
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
      const url = await generateJasperReport(report, settings);

      // если пока запрос шёл, стартовал более новый — игнорируем
      if (requestId !== requestIdRef.current) return;

      revokeLastBlob();
      lastBlobUrlRef.current = url;
      setPreviewUrl(url);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error('Error generating preview:', err);
      setError(err.message || 'Не удалось сгенерировать превью');
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  };

  // авто-генерация с дебаунсом при изменениях отчёта или настроек
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      generatePreview();
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report, settings]);

  // очистка blob-URL при размонтировании
  useEffect(() => {
    return () => {
      revokeLastBlob();
    };
  }, []);

  const isBlob = previewUrl?.startsWith('blob:');
  // JSON-мок от бэкенда лучше показать текстом, а не в iframe
  const isJsonBlob = isBlob && previewUrl;

  return (
      <div className="report-preview-container">
        <div className="preview-header">
          <h2>Report Preview</h2>
          <div className="preview-header__meta">
          <span className="preview-server" title="Адрес сервера из настроек">
            {settings?.serverUrl || '— мок-режим —'}
          </span>
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
              {previewUrl ? (
                  isJsonBlob ? (
                      // мок: покажем содержимое как текст, а не пытаемся рендерить JSON в iframe
                      <JsonPreview url={previewUrl} />
                  ) : (
                      <iframe
                          src={previewUrl}
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
          if (!cancelled) {
            try {
              setText(JSON.stringify(JSON.parse(t), null, 2));
            } catch {
              setText(t);
            }
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