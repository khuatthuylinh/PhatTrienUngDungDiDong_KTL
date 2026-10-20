import { StatusBar } from 'expo-status-bar';
import NetInfo from '@react-native-community/netinfo';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import CategoryForm from './src/components/CategoryForm';
import CategoryScreen from './src/components/CategoryScreen';
import DishDetail from './src/components/DishDetail';
import DishForm from './src/components/DishForm';
import DishListScreen from './src/components/DishListScreen';
import { FIELDS, MSSV, TABLES } from './src/foodData';
import {
  deleteCategory,
  deleteDish,
  getApiBaseUrl,
  getLanguage,
  getPendingCount,
  loadStore,
  saveCategory,
  saveDish,
  saveLanguage,
  subscribeToStore,
  syncPendingChanges,
  validateDish,
} from './src/foodRepository';
import { translate } from './src/translations';
import { colors } from './src/theme';

export default function App() {
  const [store, setStore] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(false);
  const [activeTab, setActiveTab] = useState('dishes');
  const [modal, setModal] = useState({ type: 'none', id: null });

  const language = getLanguage(store);
  const text = (key, values) => translate(language, key, values);
  const categories = store?.[TABLES.categories] ?? [];
  const dishes = store?.[TABLES.dishes] ?? [];
  const pendingCount = getPendingCount(store);
  const apiBaseUrl = getApiBaseUrl(store);
  const selectedDish = useMemo(() => dishes.find((dish) => dish[FIELDS.id] === modal.id) ?? null, [dishes, modal.id]);
  const selectedCategory = useMemo(() => categories.find((category) => category[FIELDS.id] === modal.id) ?? null, [categories, modal.id]);

  useEffect(() => {
    let mounted = true;
    const unsubscribeStore = subscribeToStore((next) => {
      if (mounted) setStore(next);
    });
    loadStore().then((saved) => {
      if (mounted) setStore(saved);
    }).catch(() => {
      if (mounted) setLoadError(true);
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
      unsubscribeStore();
    };
  }, []);

  useEffect(() => {
    const updateNetwork = (state) => {
      setOnline(state.isConnected === true && state.isInternetReachable !== false);
    };
    const unsubscribe = NetInfo.addEventListener(updateNetwork);
    NetInfo.fetch().then(updateNetwork).catch(() => setOnline(false));
    return unsubscribe;
  }, []);

  const syncNow = useCallback(async () => {
    try {
      await syncPendingChanges();
    } catch (error) {
      console.warn('FoodManager sync failed; queued changes will be retried.', error);
    }
  }, []);

  useEffect(() => {
    if (!store || !online || !apiBaseUrl) return undefined;
    void syncNow();
    const interval = setInterval(() => { void syncNow(); }, 15000);
    return () => clearInterval(interval);
  }, [store !== null, online, apiBaseUrl, pendingCount, syncNow]);

  async function persistLanguage(nextLanguage) {
    try {
      setStore(await saveLanguage(nextLanguage));
    } catch {
      showMessage(text('saveError'));
    }
  }

  async function persistDish(input, dishId = null) {
    if (dishId && !dishes.some((dish) => dish[FIELDS.id] === dishId)) {
      showMessage(text('missingDish'));
      setModal({ type: 'none', id: null });
      return false;
    }
    const validation = validateDish(input, categories, dishes, dishId, text);
    if (validation) {
      showMessage(validation);
      return false;
    }
    try {
      setStore(await saveDish(input, dishId));
      setModal({ type: 'none', id: null });
      return true;
    } catch {
      showMessage(text('saveError'));
      return false;
    }
  }

  async function persistCategory(input, categoryId = null) {
    if (categoryId && !categories.some((category) => category[FIELDS.id] === categoryId)) {
      showMessage(text('missingCategory'));
      setModal({ type: 'none', id: null });
      return false;
    }
    if (!input.name.trim() || !input.description.trim()) {
      showMessage(text('validationName'));
      return false;
    }
    try {
      setStore(await saveCategory(input, categoryId));
      setModal({ type: 'none', id: null });
      return true;
    } catch {
      showMessage(text('categoryError'));
      return false;
    }
  }

  function removeDish(dishId) {
    const dish = dishes.find((item) => item[FIELDS.id] === dishId);
    if (!dish) {
      showMessage(text('missingDish'));
      setModal({ type: 'none', id: null });
      return;
    }
    confirmAction(text('confirmDeleteDish'), async () => {
      try {
        setStore(await deleteDish(dishId));
        setModal({ type: 'none', id: null });
      } catch {
        showMessage(text('saveError'));
      }
    }, text('cancel'), text('delete'), text('brand'));
  }

  function removeCategory(categoryId) {
    const category = categories.find((item) => item[FIELDS.id] === categoryId);
    if (!category) {
      showMessage(text('missingCategory'));
      return;
    }
    const usageCount = dishes.filter((dish) => dish[FIELDS.categoryId] === categoryId).length;
    if (usageCount > 0) {
      showMessage(text('categoryInUse', { count: usageCount }));
      return;
    }
    confirmAction(text('confirmDeleteCategory'), async () => {
      try {
        setStore(await deleteCategory(categoryId));
      } catch {
        showMessage(text('categoryError'));
      }
    }, text('cancel'), text('delete'), text('brand'));
  }

  async function retryLoad() {
    try {
      setStore(await loadStore());
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }

  if (loading || !store) {
    return <SafeAreaView style={styles.loadingScreen}><StatusBar style="dark" /><Text style={styles.loadingBrand}>{MSSV} / FOOD MANAGER</Text><Text style={styles.loadingText}>{loadError ? text('loadError') : text('loading')}</Text><Pressable onPress={retryLoad}><Text style={styles.retry}>{loadError ? text('retry') : ''}</Text></Pressable></SafeAreaView>;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.app}>
        <StatusBar style="dark" />
        <View style={styles.topBar}>
          <View style={styles.brandMark}><View style={styles.brandGlyph}><Text style={styles.brandGlyphText}>F</Text></View><View><Text style={styles.brand}>{text('brand')}</Text><Text style={styles.brandSub}>FOOD MANAGER</Text></View></View>
          <View style={styles.topActions}>
            <View style={styles.languageSwitch} accessibilityRole="radiogroup">
              <Pressable accessibilityRole="radio" accessibilityState={{ selected: language === 'en' }} style={[styles.languageButton, language === 'en' && styles.languageButtonActive]} onPress={() => { void persistLanguage('en'); }}><Text style={[styles.languageText, language === 'en' && styles.languageTextActive]}>EN</Text></Pressable>
              <Pressable accessibilityRole="radio" accessibilityState={{ selected: language === 'vi' }} style={[styles.languageButton, language === 'vi' && styles.languageButtonActive]} onPress={() => { void persistLanguage('vi'); }}><Text style={[styles.languageText, language === 'vi' && styles.languageTextActive]}>VI</Text></Pressable>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={[styles.tabScreen, (activeTab !== 'dishes' || modal.type === 'dishDetail') && styles.hiddenTab]}>
            <DishListScreen dishes={dishes} categories={categories} language={language} loading={false} error={null} onRetry={retryLoad} onAdd={() => setModal({ type: 'dishForm', id: null })} onOpen={(id) => setModal({ type: 'dishDetail', id })} />
          </View>
          <View style={[styles.tabScreen, (activeTab !== 'categories' || modal.type === 'dishDetail') && styles.hiddenTab]}>
            <CategoryScreen categories={categories} dishes={dishes} language={language} onAdd={() => setModal({ type: 'categoryForm', id: null })} onEdit={(id) => setModal({ type: 'categoryForm', id })} onDelete={removeCategory} />
          </View>
          {modal.type === 'dishDetail' ? <View style={styles.detailScreen}>
            <DishDetail
              dish={selectedDish}
              category={categories.find((item) => item[FIELDS.id] === selectedDish?.[FIELDS.categoryId])}
              language={language}
              onClose={() => setModal({ type: 'none', id: null })}
              onEdit={() => setModal({ type: 'dishForm', id: selectedDish?.[FIELDS.id] ?? null })}
              onDelete={() => selectedDish && removeDish(selectedDish[FIELDS.id])}
            />
          </View> : null}
        </View>

        {modal.type !== 'dishDetail' ? <View style={styles.bottomBar}>
          <TabButton icon="▦" label={text('dishes')} selected={activeTab === 'dishes'} onPress={() => setActiveTab('dishes')} />
          <TabButton icon="≡" label={text('categories')} selected={activeTab === 'categories'} onPress={() => setActiveTab('categories')} />
        </View> : null}

        {modal.type === 'dishForm' ? <DishForm dish={selectedDish} categories={categories} dishes={dishes} language={language} onClose={() => setModal({ type: 'none', id: null })} onSave={persistDish} /> : null}
        {modal.type === 'categoryForm' ? <CategoryForm category={selectedCategory} language={language} onClose={() => setModal({ type: 'none', id: null })} onSave={persistCategory} /> : null}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function TabButton({ icon, label, selected, onPress }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.tabButton, pressed && styles.tabPressed]}><Text style={[styles.tabIcon, selected && styles.tabIconActive]}>{icon}</Text><Text style={[styles.tabLabel, selected && styles.tabLabelActive]}>{label}</Text><View style={[styles.tabIndicator, selected && styles.tabIndicatorActive]} /></Pressable>;
}

function showMessage(message) {
  if (Platform.OS === 'web') globalThis.alert(message);
  else Alert.alert('Food Manager', message);
}

function confirmAction(message, onConfirm, cancelLabel, deleteLabel, title) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm(message)) void onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelLabel, style: 'cancel' },
    { text: deleteLabel, style: 'destructive', onPress: () => { void onConfirm(); } },
  ]);
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, gap: 12 },
  loadingBrand: { color: colors.green, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  loadingText: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  retry: { color: colors.green, fontSize: 13, fontWeight: '700' },
  topBar: { minHeight: 64, paddingHorizontal: 19, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: colors.background, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandMark: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandGlyph: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  brandGlyphText: { color: colors.white, fontSize: 19, fontWeight: '900' },
  brand: { color: colors.ink, fontSize: 11, fontWeight: '900', letterSpacing: 0.4 },
  brandSub: { color: colors.muted, fontSize: 8, fontWeight: '700', letterSpacing: 1.1, marginTop: 2 },
  languageSwitch: { flexDirection: 'row', padding: 3, borderRadius: 9, backgroundColor: '#e5ebe5' },
  languageButton: { minWidth: 36, height: 30, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 7 },
  languageButtonActive: { backgroundColor: colors.green },
  languageText: { color: colors.muted, fontSize: 10, fontWeight: '800' },
  languageTextActive: { color: colors.white },
  content: { flex: 1 },
  tabScreen: { flex: 1 },
  hiddenTab: { display: 'none' },
  detailScreen: { flex: 1 },
  bottomBar: { minHeight: 66, paddingHorizontal: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, backgroundColor: colors.surface, flexDirection: 'row', justifyContent: 'center' },
  tabButton: { flex: 1, maxWidth: 210, minHeight: 66, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabPressed: { opacity: 0.7 },
  tabIcon: { color: colors.muted, fontSize: 19, lineHeight: 21 },
  tabIconActive: { color: colors.green },
  tabLabel: { color: colors.muted, fontSize: 10, fontWeight: '600' },
  tabLabelActive: { color: colors.green, fontWeight: '800' },
  tabIndicator: { position: 'absolute', bottom: 0, width: 30, height: 3, backgroundColor: 'transparent', borderRadius: 2 },
  tabIndicatorActive: { backgroundColor: colors.green },
});
