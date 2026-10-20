import { useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, Pressable, View } from 'react-native';

import { FIELDS, getQuickStatus } from '../foodData';
import { translate } from '../translations';
import { colors, pageStyle } from '../theme';
import { ChoiceChip, EmptyState, SectionLabel } from './Primitives';

const sortOptions = [
  { value: 'featured', label: 'defaultSort' },
  { value: 'priceAsc', label: 'priceLow' },
  { value: 'priceDesc', label: 'priceHigh' },
  { value: 'fastest', label: 'fastest' },
];

export default function DishListScreen({ dishes, categories, language, loading, error, onRetry, onAdd, onOpen }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [minimumPrice, setMinimumPrice] = useState('');
  const [maximumPrice, setMaximumPrice] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const text = (key, values) => translate(language, key, values);

  const minimumInvalid = minimumPrice !== '' && (!Number.isFinite(Number(minimumPrice)) || Number(minimumPrice) < 0);
  const maximumInvalid = maximumPrice !== '' && (!Number.isFinite(Number(maximumPrice)) || Number(maximumPrice) < 0);
  const priceRangeInvalid = minimumInvalid || maximumInvalid || (minimumPrice !== '' && maximumPrice !== '' && Number(minimumPrice) > Number(maximumPrice));
  const visibleDishes = useMemo(() => {
    if (priceRangeInvalid) return [];
    const result = dishes.filter((dish) => {
      const matchesName = dish[FIELDS.name].toLocaleLowerCase(language === 'vi' ? 'vi' : 'en').includes(search.trim().toLocaleLowerCase(language === 'vi' ? 'vi' : 'en'));
      const matchesCategory = categoryFilter === 'all' || dish[FIELDS.categoryId] === categoryFilter;
      const matchesAvailability = availabilityFilter === 'all' || dish[FIELDS.isAvailable] === (availabilityFilter === 'available');
      const matchesMinimum = minimumPrice === '' || dish[FIELDS.price] >= Number(minimumPrice);
      const matchesMaximum = maximumPrice === '' || dish[FIELDS.price] <= Number(maximumPrice);
      return matchesName && matchesCategory && matchesAvailability && matchesMinimum && matchesMaximum;
    });
    if (sortBy === 'priceAsc') result.sort((left, right) => left[FIELDS.price] - right[FIELDS.price]);
    if (sortBy === 'priceDesc') result.sort((left, right) => right[FIELDS.price] - left[FIELDS.price]);
    if (sortBy === 'fastest') result.sort((left, right) => left[FIELDS.preparationTime] - right[FIELDS.preparationTime]);
    return result;
  }, [dishes, search, categoryFilter, availabilityFilter, minimumPrice, maximumPrice, sortBy, language, priceRangeInvalid]);

  function clearFilters() {
    setSearch('');
    setCategoryFilter('all');
    setAvailabilityFilter('all');
    setMinimumPrice('');
    setMaximumPrice('');
    setSortBy('featured');
  }

  return (
    <ScrollView contentContainerStyle={pageStyle} keyboardShouldPersistTaps="handled">
      <Text style={styles.eyebrow}>{text('menuEyebrow')}</Text>
      <View style={styles.heroRow}>
        <View style={styles.heroCopy}><Text style={styles.title}>{text('menuTitle')}</Text><Text style={styles.description}>{text('menuDescription')}</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel={text('addDish')} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]} onPress={onAdd}><Text style={styles.plus}>＋</Text></Pressable>
      </View>

      <View style={styles.searchBox}><Text style={styles.searchIcon}>⌕</Text><TextInput value={search} onChangeText={setSearch} placeholder={text('search')} placeholderTextColor={colors.muted} style={styles.search} /></View>
      <View style={styles.filterTop}><SectionLabel>{text('filters')}</SectionLabel><Pressable onPress={clearFilters}><Text style={styles.clear}>{text('clearFilters')}</Text></Pressable></View>

      <SectionLabel>{text('category')}</SectionLabel>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <ChoiceChip label={text('allCategories')} selected={categoryFilter === 'all'} onPress={() => setCategoryFilter('all')} />
        {categories.map((category) => <ChoiceChip key={category[FIELDS.id]} label={category[FIELDS.name]} selected={categoryFilter === category[FIELDS.id]} onPress={() => setCategoryFilter(category[FIELDS.id])} />)}
      </ScrollView>

      <SectionLabel>{text('availability')}</SectionLabel>
      <View style={styles.chips}>
        {['all', 'available', 'unavailable'].map((value) => <ChoiceChip key={value} label={text(value === 'all' ? 'allStatus' : value)} selected={availabilityFilter === value} onPress={() => setAvailabilityFilter(value)} />)}
      </View>

      <SectionLabel>{text('priceRange')}</SectionLabel>
      <View style={styles.priceInputs}>
        <TextInput value={minimumPrice} onChangeText={setMinimumPrice} placeholder={text('minimum')} placeholderTextColor={colors.muted} keyboardType="numeric" style={styles.priceInput} />
        <Text style={styles.rangeDash}>–</Text>
        <TextInput value={maximumPrice} onChangeText={setMaximumPrice} placeholder={text('maximum')} placeholderTextColor={colors.muted} keyboardType="numeric" style={styles.priceInput} />
      </View>
      {priceRangeInvalid ? <Text style={styles.validation}>{text('validationPriceRange')}</Text> : null}

      <SectionLabel>{text('sortBy')}</SectionLabel>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {sortOptions.map((option) => <ChoiceChip key={option.value} label={text(option.label)} selected={sortBy === option.value} onPress={() => setSortBy(option.value)} />)}
      </ScrollView>

      <View style={styles.listHeading}><SectionLabel right={text('filterResults', { count: visibleDishes.length })}>{text('dishes')}</SectionLabel></View>
      {loading ? <View style={styles.loading}><ActivityIndicator color={colors.green} /><Text style={styles.loadingText}>{text('loading')}</Text></View> : error ? <EmptyState title={text('loadError')} detail={error} action={text('retry')} onAction={onRetry} /> : visibleDishes.length === 0 ? <EmptyState title={dishes.length ? text('noResults') : text('emptyTitle')} detail={dishes.length ? '' : text('emptyText')} action={!dishes.length ? text('addDish') : undefined} onAction={onAdd} /> : (
        <View style={styles.dishList}>
          {visibleDishes.map((dish) => {
            const image = dish[FIELDS.images]?.find((item) => item[FIELDS.isThumbnail]) ?? dish[FIELDS.images]?.[0];
            const category = categories.find((item) => item[FIELDS.id] === dish[FIELDS.categoryId]);
            return <Pressable key={dish[FIELDS.id]} onPress={() => onOpen(dish[FIELDS.id])} style={({ pressed }) => [styles.dishRow, pressed && styles.pressed]}>
              {image ? <Image source={{ uri: image[FIELDS.imageUrl] }} style={styles.thumbnail} resizeMode="cover" /> : <View style={styles.noImage}><Text style={styles.noImageText}>+</Text></View>}
              <View style={styles.dishInfo}>
                <View style={styles.metaRow}><Text style={styles.category}>{category?.[FIELDS.name] ?? text('missingCategory')}</Text><View style={[styles.statusDot, dish[FIELDS.isAvailable] ? styles.statusAvailable : styles.statusUnavailable]} /></View>
                <Text style={styles.dishName} numberOfLines={2}>{dish[FIELDS.name]}</Text>
                <View style={styles.bottomMeta}><Text style={styles.price}>{Number(dish[FIELDS.price]).toLocaleString('vi-VN')} ₫</Text><Text style={styles.dot}>·</Text><Text style={styles.time}>{dish[FIELDS.preparationTime]} {text('minutes')}</Text><Text style={[styles.quick, getQuickStatus(dish[FIELDS.preparationTime]) === 'quick' ? styles.quickFast : styles.quickRegular]}>{text(getQuickStatus(dish[FIELDS.preparationTime]))}</Text></View>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>;
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  eyebrow: { color: colors.green, fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  heroRow: { flexDirection: 'row', alignItems: 'center', marginTop: 11, marginBottom: 22, gap: 12 },
  heroCopy: { flex: 1 },
  title: { color: colors.ink, fontSize: 31, fontWeight: '900', lineHeight: 36 },
  description: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 9, maxWidth: 330 },
  addButton: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.green },
  plus: { color: colors.white, fontSize: 30, lineHeight: 33 },
  pressed: { opacity: 0.75 },
  searchBox: { height: 48, borderWidth: 1, borderColor: colors.line, borderRadius: 11, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 24 },
  searchIcon: { color: colors.green, fontSize: 23, marginRight: 8 },
  search: { flex: 1, color: colors.ink, fontSize: 14, outlineStyle: 'none' },
  filterTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clear: { color: colors.green, fontSize: 12, fontWeight: '700', marginBottom: 10 },
  chips: { flexDirection: 'row', gap: 7, paddingBottom: 18, flexWrap: 'wrap' },
  priceInputs: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  priceInput: { flex: 1, height: 42, borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: colors.surface, paddingHorizontal: 11, color: colors.ink, fontSize: 13, outlineStyle: 'none' },
  rangeDash: { color: colors.muted },
  validation: { color: colors.coral, fontSize: 12, marginTop: -12, marginBottom: 16 },
  listHeading: { marginTop: 1 },
  dishList: { marginTop: 2 },
  dishRow: { flexDirection: 'row', alignItems: 'center', minHeight: 104, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line, gap: 13 },
  thumbnail: { width: 76, height: 76, borderRadius: 11, backgroundColor: colors.greenSoft },
  noImage: { width: 76, height: 76, borderRadius: 11, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' },
  noImageText: { fontSize: 25, color: colors.green },
  dishInfo: { flex: 1, minWidth: 0, gap: 4 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  category: { color: colors.green, fontSize: 10, fontWeight: '800', flexShrink: 1 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusAvailable: { backgroundColor: colors.green },
  statusUnavailable: { backgroundColor: colors.coral },
  dishName: { color: colors.ink, fontSize: 15, fontWeight: '800', lineHeight: 19 },
  bottomMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  price: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  dot: { color: colors.muted },
  time: { color: colors.muted, fontSize: 11 },
  quick: { fontSize: 10, fontWeight: '700', marginLeft: 2 },
  quickFast: { color: colors.green },
  quickRegular: { color: colors.muted },
  chevron: { color: colors.muted, fontSize: 24, paddingHorizontal: 2 },
  loading: { minHeight: 150, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: colors.muted, fontSize: 13 },
});