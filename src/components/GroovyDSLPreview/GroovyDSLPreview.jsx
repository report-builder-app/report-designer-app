import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ReportContext } from '../../contexts/ReportContext';
import { generateGroovyDSL } from '../../utils/elementFactory';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FiCopy, FiCheck } from 'react-icons/fi';
import './GroovyDSLPreview.css';

// Prism: ядро + groovy + тема
import Prism from 'prismjs';
import 'prismjs/components/prism-groovy';
import 'prismjs/themes/prism.css';

function GroovyDSLPreview() {
  const { report } = useContext(ReportContext);
  const [copied, setCopied] = useState(false);

  const copyTimerRef = useRef(null);

  // Генерируем DSL только при изменении report
  const groovyCode = useMemo(() => {
    try {
      return generateGroovyDSL(report);
    } catch (e) {
      console.error('generateGroovyDSL failed:', e);
      return `// Ошибка генерации DSL: ${e.message}`;
    }
  }, [report]);

  // Подсветка: тоже мемоизируем, чтобы не гонять Prism на каждый рендер
  const highlighted = useMemo(() => {
    try {
      if (Prism.languages.groovy) {
        return Prism.highlight(groovyCode, Prism.languages.groovy, 'groovy');
      }
      // fallback: просто экранируем HTML
      return escapeHtml(groovyCode);
    } catch (e) {
      console.error('Prism highlight failed:', e);
      return escapeHtml(groovyCode);
    }
  }, [groovyCode]);

  // Таймер «Copied!» — чистим при размонтировании
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleCopy = () => {
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  // Диагностика «обновилось ли»: сколько элементов на холсте
  const totalElements = useMemo(() => {
    const bands = report?.bands || {};
    return Object.values(bands).reduce(
        (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
        0
    );
  }, [report]);

  const copyButton = (
      <button className="copy-button" type="button">
        {copied ? <FiCheck /> : <FiCopy />}
        {copied ? ' Copied!' : ' Copy Code'}
      </button>
  );

  return (
      <div className="groovy-preview-container">
        <div className="groovy-preview-header">
          <h2>Groovy DSL Code</h2>
          <div className="groovy-preview-meta">
          <span className="groovy-preview-stat" title="Общее число элементов на холсте">
            {totalElements} element{totalElements === 1 ? '' : 's'}
          </span>
            <span className="groovy-preview-stat" title="Длина DSL в символах">
            {groovyCode.length} chars
          </span>
            {CopyToClipboard ? (
                <CopyToClipboard text={groovyCode} onCopy={handleCopy}>
                  {copyButton}
                </CopyToClipboard>
            ) : (
                // fallback: если пакет не установлен, хотя бы не падаем
                <button
                    className="copy-button"
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(groovyCode);
                      handleCopy();
                    }}
                >
                  {copied ? <FiCheck /> : <FiCopy />}
                  {copied ? ' Copied!' : ' Copy Code'}
                </button>
            )}
          </div>
        </div>

        <div className="code-container">
        <pre className="language-groovy">
          {/*
            key гарантирует, что React пересоздаст узел при изменении кода,
            даже если Prism по какой-то причине вернёт идентичный HTML
            (например, при «пустом» отчёте).
          */}
          <code
              key={groovyCode.length + ':' + totalElements}
              className="language-groovy"
              dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
        </div>
      </div>
  );
}

/** Простое экранирование HTML — на случай, если Prism не загрузился */
function escapeHtml(str) {
  return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
}

export default GroovyDSLPreview;