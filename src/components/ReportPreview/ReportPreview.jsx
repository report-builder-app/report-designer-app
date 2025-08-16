import React, { useContext, useState, useEffect } from 'react';
import { ReportContext } from '../../contexts/ReportContext';
import { generateJasperReport } from '../../utils/jasperUtils';
import { FiRefreshCw } from 'react-icons/fi';
import './ReportPreview.css';

function ReportPreview() {
  const { report } = useContext(ReportContext);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generatePreview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const reportUrl = await generateJasperReport(report);
      setPreviewUrl(reportUrl);
    } catch (err) {
      setError(err.message);
      console.error('Error generating preview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generatePreview();
  }, [report]);

  return (
    <div className="report-preview-container">
      <div className="preview-header">
        <h2>Report Preview</h2>
        <button
          onClick={generatePreview}
          disabled={isLoading}
          className="refresh-button"
        >
          <FiRefreshCw className={isLoading ? 'spin' : ''} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="loading-state">Generating preview...</div>
      ) : error ? (
        <div className="error-state">
          Error generating preview: {error}
        </div>
      ) : (
        <div className="preview-content">
          {previewUrl ? (
            <iframe
              src={previewUrl}
              title="Jasper Report Preview"
              className="preview-iframe"
            />
          ) : (
            <div className="no-preview">No preview available</div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReportPreview;