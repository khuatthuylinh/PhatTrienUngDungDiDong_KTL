import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { FIELDS } from '../foodData';
import { translate } from '../translations';
import { colors, pageStyle } from '../theme';
import { ActionButton, EmptyState, SectionLabel } from './Primitives';

export default function CategoryScreen({ categories, dishes, language, onAdd, onEdit, onDelete }) {
  const text = (key, values) => translate(language, key, values);
  return (
    <ScrollView contentContainerStyle={pageStyle}>
      <Text style={styles.eyebrow}>{text('brand')}</Text>
      <View style={styles.header}><View style={styles.headerText}><Text style={styles.title}>{text('categories')}</Text><Text style={styles.subtitle}>{text('dishesCount')} · {categories.length}</Text></View><ActionButton label={text('addCategory')} onPress={onAdd} compact /></View>
      <SectionLabel right={text('filterResults', { count: dishes.length })}>{text('categories')}</SectionLabel>
      {categories.length === 0 ? <EmptyState title={text('noCategories')} detail={text('emptyText')} action={text('addCategory')} onAction={onAdd} /> : (
        <View style={styles.list}>
          {categories.map((category, index) => {
            const count = dishes.filter((dish) => dish[FIELDS.categoryId] === category[FIELDS.id]).length;
            return <View key={category[FIELDS.id]} style={styles.row}>
              <View style={styles.number}><Text style={styles.numberText}>{String(index + 1).padStart(2, '0')}</Text></View>
              <View style={styles.copy}><Text style={styles.name}>{category[FIELDS.name]}</Text><Text style={styles.description}>{category[FIELDS.description] || '—'}</Text><Text style={styles.count}>{text('categoryUsage', { count })}</Text></View>
              <View style={styles.actions}><ActionButton label={text('edit')} onPress={() => onEdit(category[FIELDS.id])} variant="soft" compact /><ActionButton label={text('delete')} onPress={() => onDelete(category[FIELDS.id])} variant="ghost" compact /></View>
            </View>;
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  eyebrow: { color: colors.green, fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 13, marginBottom: 24 },
  headerText: { flex: 1 },
  title: { color: colors.ink, fontSize: 30, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 5 },
  list: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 13, backgroundColor: colors.surface, borderRadius: 13, borderWidth: 1, borderColor: colors.line, gap: 11 },
  number: { width: 38, height: 44, borderRadius: 9, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' },
  numberText: { color: colors.green, fontSize: 12, fontWeight: '800' },
  copy: { flex: 1, minWidth: 0, gap: 3 },
  name: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  description: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  count: { color: colors.green, fontSize: 10, fontWeight: '700' },
  actions: { gap: 6 },
});