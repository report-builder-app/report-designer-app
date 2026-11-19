import axios from 'axios';
import { encodeBase64 } from './base64';

function buildHeaders(settings) {
    const headers = {};
    const auth = settings?.auth;
    if (!auth) return headers;
    if (auth.type === 'basic' && auth.basic?.username) {
        headers.Authorization =
            'Basic ' + encodeBase64(`${auth.basic.username}:${auth.basic.password ?? ''}`);
    } else if (auth.type === 'bearer') {
        const token = sessionStorage.getItem('jasper-designer.accessToken');
        if (token) headers.Authorization = `Bearer ${token}`;
    }
    return headers;
}

function baseUrl(settings) {
    const b = settings?.serverUrl?.replace(/\/$/, '');
    if (!b) throw new Error('Не задан адрес сервера (Настройки → Сервер)');
    return b;
}

async function readProblem(error) {
    const data = error.response?.data;
    if (data instanceof Blob) {
        try {
            const text = await data.text();
            try { return JSON.parse(text).detail || JSON.parse(text).title; } catch { return text; }
        } catch { return 'Ошибка запроса'; }
    }
    if (data && typeof data === 'object') return data.detail || data.title;
    return error.response?.statusText || error.message || 'Ошибка запроса';
}

async function request(promise) {
    try {
        const res = await promise;
        return res.data;
    } catch (e) {
        throw new Error(await readProblem(e));
    }
}

/* ---------- CRUD ---------- */

export const listDataSources = (settings) =>
    request(axios.get(`${baseUrl(settings)}/api/v1/datasources`, {
        headers: buildHeaders(settings),
    }));

export const getDataSource = (settings, id) =>
    request(axios.get(`${baseUrl(settings)}/api/v1/datasources/${id}`, {
        headers: buildHeaders(settings),
    }));

export const createDataSource = (settings, body) =>
    request(axios.post(`${baseUrl(settings)}/api/v1/datasources`, body, {
        headers: buildHeaders(settings),
    }));

export const updateDataSource = (settings, id, body) =>
    request(axios.put(`${baseUrl(settings)}/api/v1/datasources/${id}`, body, {
        headers: buildHeaders(settings),
    }));

export const deleteDataSource = (settings, id) =>
    request(axios.delete(`${baseUrl(settings)}/api/v1/datasources/${id}`, {
        headers: buildHeaders(settings),
    }));

export const testDataSource = (settings, id) =>
    request(axios.post(`${baseUrl(settings)}/api/v1/datasources/${id}/test`, null, {
        headers: buildHeaders(settings),
    }));