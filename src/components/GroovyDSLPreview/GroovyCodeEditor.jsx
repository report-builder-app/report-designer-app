import React, { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { java } from '@codemirror/lang-java';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';

/**
 * @param {Object} props
 * @param {string} props.value
 * @param {(v: string) => void} props.onChange
 * @param {'groovy' | 'json'} props.language
 * @param {boolean} [props.readOnly]
 * @param {string} [props.height]
 */
function GroovyCodeEditor({ value, onChange, language, readOnly = false, height = '100%' }) {
    const extensions = useMemo(() => {
        return language === 'json' ? [json()] : [java()];
    }, [language]);

    return (
        <CodeMirror
            value={value}
            onChange={onChange}
            extensions={extensions}
            theme={oneDark}
            height={height}
            readOnly={readOnly}
            basicSetup={{
                lineNumbers: true,
                foldGutter: false,
                highlightActiveLine: true,
                autocompletion: false,
            }}
            style={{ fontSize: 13, height: '100%' }}
        />
    );
}

export default GroovyCodeEditor;