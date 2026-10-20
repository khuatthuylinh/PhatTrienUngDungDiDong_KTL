import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL, API_ENDPOINTS, createEmptyStore, createId, createPendingChange, createSeedData, FIELDS, MSSV, STORAGE_KEY, TABLES } from './foodData';

const PENDING_KEY = `${MSSV}_PendingChanges`;
const API_KEY = `${MSSV}_ApiBaseUrl`;
const LANGUAGE_KEY = `${MSSV}_Language`;
let transactionQueue = Promise.resolve();
let activeSync = null;
const stateListeners = new Set();

function notify(state) {
  for (const listener of stateListeners) listener(state);
}

export function subscribeToStore(listener) {
  stateListeners.add(listener);
  return () => stateListeners.delete(listener);
}

function normalizeState(state) {
  return {
    ...createEmptyStore(),
    ...state,
    [TABLES.categories]: Array.isArray(state?.[TABLES.categories]) ? state[TABLES.categories] : [],
    [TABLES.dishes]: Array.isArray(state?.[TABLES.dishes]) ? state[TABLES.dishes] : [],
    [PENDING_KEY]: Array.isArray(state?.[PENDING_KEY]) ? state[PENDING_KEY] : [],
    [API_KEY]: API_BASE_URL,
    [LANGUAGE_KEY]: state?.[LANGUAGE_KEY] === 'vi' ? 'vi' : 'en',
  };
}

function removeUntouchedDemoChanges(state) {
  const demo = createSeedData();
  const demoById = new Map([
    ...demo[TABLES.categories].map((record) => [record[FIELDS.id], record]),
    ...demo[TABLES.dishes].map((record) => [record[FIELDS.id], record]),
  ]);
  return {
    ...state,
    [PENDING_KEY]: state[PENDING_KEY].filter((change) => {
      const original = demoById.get(change[FIELDS.id]);
      return !original || change[FIELDS.action] !== 'upsert' || JSON.stringify(change[FIELDS.snapshot]) !== JSON.stringify(original);
    }),
  };
}

export async function loadStore() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const emptyStore = createEmptyStore();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(emptyStore));
      return emptyStore;
    }
    const state = removeUntouchedDemoChanges(normalizeState(JSON.parse(raw)));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
  } catch (error) {
    if (error instanceof SyntaxError) {
      const emptyStore = createEmptyStore();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(emptyStore));
      return emptyStore;
    }
    throw error;
  }
}

export function saveStoreUpdate(update) {
  const task = transactionQueue.then(async () => {
    const current = await loadStore();
    const next = normalizeState(update(current));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    notify(next);
    return next;
  });
  transactionQueue = task.catch(() => undefined);
  return task;
}

function replacePendingChange(pending, entity, action, recordId, snapshot) {
  const existing = pending.filter((change) => !(change[FIELDS.entity] === entity && change[FIELDS.id] === recordId));
  return [...existing, createPendingChange(entity, action, snapshot ?? { [FIELDS.id]: recordId })];
}

export function saveDish(input, existingId = null) {
  return saveStoreUpdate((state) => {
    const dishes = [...state[TABLES.dishes]];
    const index = dishes.findIndex((dish) => dish[FIELDS.id] === existingId);
    const existing = index >= 0 ? dishes[index] : null;
    const thumbnailIndex = input.images.findIndex((image) => image[FIELDS.isThumbnail]);
    const dish = {
      ...existing,
      [FIELDS.id]: existingId ?? createId('DISH'),
      [FIELDS.name]: input.name.trim(),
      [FIELDS.price]: Number(input.price),
      [FIELDS.preparationTime]: Number(input.preparationTime),
      [FIELDS.isAvailable]: Boolean(input.isAvailable),
      [FIELDS.description]: input.description.trim(),
      [FIELDS.categoryId]: input.categoryId,
      [FIELDS.images]: input.images.map((image, imageIndex) => ({
        [FIELDS.imageUrl]: image[FIELDS.imageUrl].trim(),
        [FIELDS.isThumbnail]: imageIndex === (thumbnailIndex >= 0 ? thumbnailIndex : 0),
      })),
      [FIELDS.remoteId]: existing?.[FIELDS.remoteId] ?? null,
    };
    if (index >= 0) dishes[index] = dish;
    else dishes.unshift(dish);
    return {
      ...state,
      [TABLES.dishes]: dishes,
      [PENDING_KEY]: replacePendingChange(state[PENDING_KEY], 'dish', 'upsert', dish[FIELDS.id], dish),
    };
  });
}

export function deleteDish(dishId) {
  return saveStoreUpdate((state) => {
    const dish = state[TABLES.dishes].find((record) => record[FIELDS.id] === dishId);
    return {
      ...state,
      [TABLES.dishes]: state[TABLES.dishes].filter((record) => record[FIELDS.id] !== dishId),
      [PENDING_KEY]: replacePendingChange(state[PENDING_KEY], 'dish', 'delete', dishId, dish ?? { [FIELDS.id]: dishId }),
    };
  });
}

export function saveCategory(input, existingId = null) {
  return saveStoreUpdate((state) => {
    const categories = [...state[TABLES.categories]];
    const index = categories.findIndex((category) => category[FIELDS.id] === existingId);
    const existing = index >= 0 ? categories[index] : null;
    const category = {
      ...existing,
      [FIELDS.id]: existingId ?? createId('CAT'),
      [FIELDS.name]: input.name.trim(),
      [FIELDS.description]: input.description.trim(),
      [FIELDS.remoteId]: existing?.[FIELDS.remoteId] ?? null,
    };
    if (index >= 0) categories[index] = category;
    else categories.unshift(category);
    return {
      ...state,
      [TABLES.categories]: categories,
      [PENDING_KEY]: replacePendingChange(state[PENDING_KEY], 'category', 'upsert', category[FIELDS.id], category),
    };
  });
}

export function deleteCategory(categoryId) {
  return saveStoreUpdate((state) => {
    const category = state[TABLES.categories].find((record) => record[FIELDS.id] === categoryId);
    return {
      ...state,
      [TABLES.categories]: state[TABLES.categories].filter((record) => record[FIELDS.id] !== categoryId),
      [PENDING_KEY]: replacePendingChange(state[PENDING_KEY], 'category', 'delete', categoryId, category ?? { [FIELDS.id]: categoryId }),
    };
  });
}

export function saveApiBaseUrl(url) {
  return saveStoreUpdate((state) => ({ ...state, [API_KEY]: url.trim().replace(/\/+$/, '') }));
}

export function saveLanguage(language) {
  return saveStoreUpdate((state) => ({ ...state, [LANGUAGE_KEY]: language === 'vi' ? 'vi' : 'en' }));
}

async function requestJson(url, options) {
  const response = await fetch(url, {
    ...options,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!response.ok) throw new Error(`MockAPI request failed (${response.status})`);
  if (response.status === 204) return null;
  return response.json();
}

async function fetchRemoteData() {
  const [remoteCategories, remoteDishes] = await Promise.all([
    requestJson(API_ENDPOINTS.categories, { method: 'GET' }),
    requestJson(API_ENDPOINTS.dishes, { method: 'GET' }),
  ]);
  if (!Array.isArray(remoteCategories) || !Array.isArray(remoteDishes)) {
    throw new Error('MockAPI resources must return lists.');
  }

  const categories = remoteCategories.map((record) => ({
    [FIELDS.id]: record[FIELDS.id] ?? `${MSSV}-CAT-REMOTE-${record.id}`,
    [FIELDS.name]: record[FIELDS.name] ?? '',
    [FIELDS.description]: record[FIELDS.description] ?? '',
    [FIELDS.remoteId]: String(record.id),
  }));
  const categoryIds = new Map(remoteCategories.map((record, index) => [String(record.id), categories[index][FIELDS.id]]));
  const dishes = remoteDishes.map((record) => {
    const rawImages = Array.isArray(record[FIELDS.images]) ? record[FIELDS.images] : [];
    const images = rawImages.map((image) => ({
      [FIELDS.imageUrl]: typeof image === 'string' ? image : image[FIELDS.imageUrl] ?? '',
      [FIELDS.isThumbnail]: typeof image === 'string' ? false : Boolean(image[FIELDS.isThumbnail]),
    }));
    if (images.length && !images.some((image) => image[FIELDS.isThumbnail])) images[0][FIELDS.isThumbnail] = true;
    return {
      [FIELDS.id]: record[FIELDS.id] ?? `${MSSV}-DISH-REMOTE-${record.id}`,
      [FIELDS.name]: record[FIELDS.name] ?? '',
      [FIELDS.price]: Number(record[FIELDS.price]) || 0,
      [FIELDS.preparationTime]: Number(record[FIELDS.preparationTime]) || 0,
      [FIELDS.isAvailable]: Boolean(record[FIELDS.isAvailable]),
      [FIELDS.description]: record[FIELDS.description] ?? '',
      [FIELDS.categoryId]: categoryIds.get(String(record[FIELDS.categoryId])) ?? record[FIELDS.categoryId] ?? '',
      [FIELDS.images]: images,
      [FIELDS.remoteId]: String(record.id),
    };
  });
  return { categories, dishes };
}

function mergeRemoteData(state, remoteData) {
  const pendingByEntity = (entity) => state[PENDING_KEY].filter((change) => change[FIELDS.entity] === entity);
  const mergeRecords = (remoteRecords, localRecords, pending) => {
    const pendingIds = new Set(pending.map((change) => change[FIELDS.id]));
    const merged = remoteRecords.filter((record) => !pendingIds.has(record[FIELDS.id]));
    for (const change of pending) {
      if (change[FIELDS.action] !== 'upsert') continue;
      const localRecord = localRecords.find((record) => record[FIELDS.id] === change[FIELDS.id]);
      if (localRecord) merged.push(localRecord);
    }
    return merged;
  };
  return {
    ...state,
    [TABLES.categories]: mergeRecords(remoteData.categories, state[TABLES.categories], pendingByEntity('category')),
    [TABLES.dishes]: mergeRecords(remoteData.dishes, state[TABLES.dishes], pendingByEntity('dish')),
  };
}

function remotePayload(entity, snapshot, state) {
  const payload = { ...snapshot };
  const localId = payload[FIELDS.id];
  delete payload[FIELDS.remoteId];
  payload[FIELDS.clientId] = localId;
  if (entity === 'dish') {
    const category = state[TABLES.categories].find((record) => record[FIELDS.id] === snapshot[FIELDS.categoryId]);
    payload[FIELDS.categoryId] = category?.[FIELDS.remoteId] ?? snapshot[FIELDS.categoryId];
  }
  return payload;
}

async function syncChange(change, state) {
  const resourceUrl = change[FIELDS.entity] === 'category' ? API_ENDPOINTS.categories : API_ENDPOINTS.dishes;
  const recordId = change[FIELDS.id];
  const snapshot = change[FIELDS.snapshot];
  const remoteRows = await requestJson(resourceUrl, { method: 'GET' });
  if (!Array.isArray(remoteRows)) throw new Error('MockAPI resource must return a list.');
  const remote = remoteRows.find((row) =>
    String(row.id) === String(change[FIELDS.remoteId])
    || row[FIELDS.id] === recordId
    || row[FIELDS.clientId] === recordId,
  ) ?? null;

  if (change[FIELDS.action] === 'delete') {
    const remoteId = remote?.id ?? change[FIELDS.remoteId];
    if (remoteId) await requestJson(`${resourceUrl}/${encodeURIComponent(remoteId)}`, { method: 'DELETE' });
    return null;
  }

  const payload = remotePayload(change[FIELDS.entity], snapshot, state);
  if (remote?.id) {
    const updated = await requestJson(`${resourceUrl}/${encodeURIComponent(remote.id)}`, { method: 'PUT', body: JSON.stringify(payload) });
    return updated?.id ?? remote.id;
  }
  const created = await requestJson(resourceUrl, { method: 'POST', body: JSON.stringify(payload) });
  return created?.id ?? null;
}

export function syncPendingChanges() {
  if (activeSync) return activeSync;
  activeSync = (async () => {
    let state = await loadStore();
    const remoteData = await fetchRemoteData();
    state = await saveStoreUpdate((current) => mergeRemoteData(current, remoteData));
    let synced = 0;

    while (state[PENDING_KEY].length > 0) {
      const [change] = [...state[PENDING_KEY]].sort((left, right) => {
        const entityOrder = (left[FIELDS.entity] === 'category' ? 0 : 1) - (right[FIELDS.entity] === 'category' ? 0 : 1);
        return entityOrder || left[FIELDS.changedAt] - right[FIELDS.changedAt];
      });
      const remoteId = await syncChange(change, state);
      state = await saveStoreUpdate((current) => {
        const currentQueue = current[PENDING_KEY];
        const stillSameChange = currentQueue.some((queued) =>
          queued[FIELDS.entity] === change[FIELDS.entity]
          && queued[FIELDS.id] === change[FIELDS.id]
          && queued[FIELDS.changedAt] === change[FIELDS.changedAt],
        );
        if (!stillSameChange) return current;

        const targetTable = change[FIELDS.entity] === 'category' ? TABLES.categories : TABLES.dishes;
        const records = current[targetTable].map((record) => record[FIELDS.id] === change[FIELDS.id]
          ? { ...record, [FIELDS.remoteId]: remoteId }
          : record);
        return {
          ...current,
          [targetTable]: records,
          [PENDING_KEY]: currentQueue.filter((queued) => !(
            queued[FIELDS.entity] === change[FIELDS.entity]
            && queued[FIELDS.id] === change[FIELDS.id]
            && queued[FIELDS.changedAt] === change[FIELDS.changedAt]
          )),
        };
      });
      synced += 1;
    }
    return { state: await loadStore(), synced, skipped: false };
  })().finally(() => { activeSync = null; });
  return activeSync;
}

export function validateDish(input, categories, dishes, currentId, translate) {
  if (!input.name.trim()) return translate('validationName');
  if (!Number.isFinite(Number(input.price)) || Number(input.price) <= 0) return translate('validationPrice');
  if (!Number.isFinite(Number(input.preparationTime)) || Number(input.preparationTime) <= 0) return translate('validationTime');
  if (!categories.some((category) => category[FIELDS.id] === input.categoryId)) return translate('validationCategory');
  const duplicate = dishes.some((dish) =>
    dish[FIELDS.id] !== currentId
    && dish[FIELDS.categoryId] === input.categoryId
    && dish[FIELDS.name].trim().toLocaleLowerCase() === input.name.trim().toLocaleLowerCase(),
  );
  if (duplicate) return translate('validationDuplicate');
  if (input.images.some((image) => !/^https?:\/\//i.test(image[FIELDS.imageUrl].trim()))) return translate('validationImageUrl');
  return null;
}

export function getPendingCount(state) {
  return state?.[PENDING_KEY]?.length ?? 0;
}

export function getApiBaseUrl(state) {
  return state?.[API_KEY] ?? '';
}

export function getLanguage(state) {
  return state?.[LANGUAGE_KEY] ?? 'en';
}

export function getPendingChanges(state) {
  return state?.[PENDING_KEY] ?? [];
}