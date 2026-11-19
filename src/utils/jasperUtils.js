import axios from 'axios';
import { encodeBase64 } from './base64';
import { toReportDefinitionDto } from './reportDefinition';

function buildHeaders(settings) {
  const headers = {};
  const auth = settings?.auth;
  if (!auth) return headers;

  if (auth.type === 'basic') {
    if (!auth.basic?.username) {
      console.warn('Auth type = basic, но логин не задан');
      return headers;
    }
    headers.Authorization =
        'Basic ' + encodeBase64(`${auth.basic.username}:${auth.basic.password ?? ''}`);
  } else if (auth.type === 'bearer') {
    const token = sessionStorage.getItem('jasper-designer.accessToken');
    if (token) headers.Authorization = `Bearer ${token}`;
    else console.warn('Auth type = bearer, но токен не получен');
  }
  return headers;
}

async function readProblem(error) {
  const data = error.response?.data;

  if (data instanceof Blob) {
    try {
      const text = await data.text();
      try {
        const problem = JSON.parse(text);
        return problem.detail || problem.title || 'Ошибка запроса';
      } catch {
        return text.slice(0, 500) || 'Ошибка запроса';
      }
    } catch {
      return 'Ошибка запроса';
    }
  }

  if (data && typeof data === 'object') {
    return data.detail || data.title || 'Ошибка запроса';
  }

  return error.response?.statusText || error.message || 'Ошибка запроса';
}

function parseContentDisposition(header) {
  if (!header) return null;

  const star = /filename\*\s*=\s*([^;]+)/i.exec(header);
  if (star) {
    let v = star[1].trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    const m = /^[^']*'[^']*'(.*)$/.exec(v);
    if (m) v = m[1];
    try {
      return decodeURIComponent(v);
    } catch {
      return v;
    }
  }

  const plain = /filename\s*=\s*("?)([^";]+)\1/i.exec(header);
  if (plain) {
    try {
      return decodeURIComponent(plain[2].trim());
    } catch {
      return plain[2].trim();
    }
  }
  return null;
}

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

  try {
    const { data } = await axios.post(bearer.ssoUrl, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    if (!data.access_token) throw new Error('SSO не вернул access_token');
    return data.access_token;
  } catch (error) {
    if (error.response?.data && !(error.response.data instanceof Blob)) {
      const d = error.response.data;
      throw new Error(d.error_description || d.error || 'Не удалось получить токен');
    }
    throw new Error(error.message || 'Не удалось получить токен');
  }
}

/**
 * @param {Object} report
 * @param {Object} settings
 * @param {'pdf'|'xls'|'html'|'json'} format
 * @param {Object} [runtimeParameters]
 * @returns {Promise<{ blobUrl: string, filename: string, contentType: string }>}
 */
export async function renderReport(report, settings, format = 'pdf', runtimeParameters = undefined) {
  const base = settings?.serverUrl?.replace(/\/$/, '');
  if (!base) throw new Error('Не задан адрес сервера (Настройки → Сервер)');

  const fmt = String(format || 'pdf').toLowerCase();

  const dto = toReportDefinitionDto(report);
  if (!dto.bands?.length) {
    throw new Error(
        'В отчёте нет бэндов, поддерживаемых сервером (TITLE / COLUMN_HEADER / DETAIL / SUMMARY).'
    );
  }

  const body = { report: dto };
  if (runtimeParameters && Object.keys(runtimeParameters).length) {
    body.parameters = { ...runtimeParameters };
  }

  try {
    const res = await axios.post(
        `${base}/api/v1/reports/render/${fmt}`,
        body,
        { headers: buildHeaders(settings), responseType: 'blob' }
    );

    if (!res.data || res.data.size === 0) {
      throw new Error('Сервер вернул пустой файл');
    }

    const contentType = res.headers['content-type'] || '';
    const disposition = res.headers['content-disposition'] || '';
    const fallbackExt = fmt === 'xls' ? 'xlsx' : fmt;
    const filename = parseContentDisposition(disposition) || `report.${fallbackExt}`;

    return {
      blobUrl: URL.createObjectURL(res.data),
      filename,
      contentType,
    };
  } catch (error) {
    console.error('renderReport failed:', error);
    throw new Error(await readProblem(error));
  }
}

export async function listFormats(settings) {
  const base = settings?.serverUrl?.replace(/\/$/, '');
  if (!base) throw new Error('Не задан адрес сервера');
  try {
    const res = await axios.get(`${base}/api/v1/reports/formats`, {
      headers: buildHeaders(settings),
    });
    return res.data;
  } catch (error) {
    throw new Error(await readProblem(error));
  }
}

/** Совместимость со старыми вызовами */
export const generateJasperReport = renderReport;