import axios from 'axios';
import { generateGroovyDSL } from './elementFactory';

/**
 * Отправляет Groovy DSL на бэкенд и возвращает URL готового отчёта.
 * В моке — возвращает data-URL с DSL для наглядности.
 *
 * @param {Object} reportDefinition — состояние из ReportContext
 * @returns {Promise<string>} URL отчёта
 */
export async function generateJasperReport(reportDefinition) {
  try {
    const dsl = generateGroovyDSL(reportDefinition);

    // Реальная интеграция:
    // const { data } = await axios.post('/api/generate-report', {
    //   dsl,
    //   format: 'pdf', // или 'html'
    // });
    // return data.reportUrl;

    // Мок-режим:
    await new Promise((resolve) => setTimeout(resolve, 800));

    const payload = {
      title: reportDefinition.title || 'Untitled Report',
      generatedAt: new Date().toISOString(),
      dsl,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error generating report:', error);
    throw new Error('Failed to generate report. Please try again.');
  }
}

/**
 * Компиляция JRXML на клиенте больше не поддерживается —
 * JRXML собирается на сервере из того же DSL.
 *
 * Если функция всё ещё вызывается где-то в UI (Toolbar/Preview),
 * оставляем её как явную заглушку с понятной ошибкой,
 * чтобы не падать молча.
 */
export function compileToJRXML() {
  throw new Error(
      'compileToJRXML: JRXML компилируется на сервере. ' +
      'Передавайте Groovy DSL (generateGroovyDSL) в /api/generate-report.'
  );
}