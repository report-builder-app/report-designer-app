import React, { useContext } from 'react';
import { ReportContext } from '../../contexts/ReportContext';
import { generateGroovyDSL } from '../../utils/groovyGenerator';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FiCopy } from 'react-icons/fi';
import './GroovyDSLPreview.css';

// Import Prism properly - either use a default import or named imports
import Prism from 'prismjs';
import 'prismjs/components/prism-groovy';
import 'prismjs/themes/prism.css';

function GroovyDSLPreview() {
  const { report } = useContext(ReportContext);
  const groovyCode = generateGroovyDSL(report);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Create a function to safely highlight the code
  const highlightCode = (code) => {
    try {
      return Prism.highlight(code, Prism.languages.groovy, 'groovy');
    } catch (error) {
      console.error('Error highlighting code:', error);
      return code;
    }
  };

  return (
    <div className="groovy-preview-container">
      <div className="groovy-preview-header">
        <h2>Groovy DSL Code</h2>
        <CopyToClipboard text={groovyCode} onCopy={handleCopy}>
          <button className="copy-button">
            <FiCopy /> {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </CopyToClipboard>
      </div>

      <div className="code-container">
        <pre>
          <code
            className="language-groovy"
            dangerouslySetInnerHTML={{ __html: highlightCode(groovyCode) }}
          />
        </pre>
      </div>
    </div>
  );
}

export default GroovyDSLPreview;