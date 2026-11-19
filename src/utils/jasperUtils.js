import axios from 'axios';
import { generateGroovyDSL } from './elementFactory';
import { encodeBase64 } from './base64';

/**
 * Запрашивает токен у SSO.
 * @param {Object} settings — из SettingsContext
 * @returns {Promise<string>} access_token
 */
export async function fetchBearerToken(settings) {
  const { bearer } = settings.auth;
  if (!bearer.ssoUrl) throw new Error('Не задан SSO URL');

  const params = new URLSearchParams();
  params.set('grant_type', bearer.grantType);
  params.set('client_id', bearer.clientId);
  params.set('client_secret', bearer.clientSecret);
  if (bearer.grantType === 'password') {
    params.set('username', bearer.username);
    params.set('password', bearer.password);
  }

  const { data } = await axios.post(bearer.ssoUrl, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!data.access_token) {
    throw new Error('SSO не вернул access_token');
  }
  return data.access_token;
}

/**
 * Генерация отчёта: отправляет Groovy DSL на бэкенд.
 * @param {Object} reportDefinition
 * @param {Object} settings — из SettingsContext
 * @returns {Promise<string>} URL отчёта (или blob:)
 */
export async function generateJasperReport(reportDefinition, settings) {
  try {
    const dsl = generateGroovyDSL(reportDefinition);

    const base = settings?.serverUrl?.replace(/\/$/, '') || '';
    const headers = {};

    // Basic (UTF-8 → base64, работает и с кириллицей)
    if (settings?.auth?.type === 'basic' && settings.auth.basic.username) {
      const token = encodeBase64(
          `${settings.auth.basic.username}:${settings.auth.basic.password}`
      );
      headers.Authorization = `Basic ${token}`;
    }

    // Bearer
    if (settings?.auth?.type === 'bearer') {
      const token = sessionStorage.getItem('jasper-designer.accessToken');
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    // Мок-режим, если сервер не задан
    if (!base) {
      await new Promise((r) => setTimeout(r, 500));
      const payload = {
        title: reportDefinition.title || 'Untitled Report',
        generatedAt: new Date().toISOString(),
        dsl,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      });
      return URL.createObjectURL(blob);
    }

    const { data } = await axios.post(
        `${base}/api/generate-report`,
        { dsl, format: 'pdf' },
        { headers }
    );

    return data.reportUrl;
  } catch (error) {
    console.error('Error generating report:', error);
    throw new Error(
        error.response?.data?.message || 'Не удалось сгенерировать отчёт'
    );
  }
}

/**
 * JRXML компилируется на сервере. Оставлено явной заглушкой,
 * чтобы не было двух источников истины.
 */
export function compileToJRXML() {
  throw new Error(
      'compileToJRXML: JRXML компилируется на сервере. ' +
      'Передавайте Groovy DSL (generateGroovyDSL) в /api/generate-report.'
  );
}