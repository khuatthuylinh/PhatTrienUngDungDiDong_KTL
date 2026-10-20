import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryForm } from './category-form';
import { confirmAction, showMessage } from '@/components/platform-dialogs';
import { Category, CategoryInput, Course, courseApi } from '@/lib/course-api';

const colors = { ink: '#142b2b', muted: '#617372', paper: '#f4f5ef', white: '#ffffff', green: '#176b59', lime: '#d1ed78', line: '#dce3da', red: '#b34032' };

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Category | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    try {
      const [categoryData, courseData] = await Promise.all([courseApi.getCategories(), courseApi.getCourses()]);
      setError('');
      setCategories(categoryData);
      setCourses(courseData);
    } catch {
      setError('Không thể tải danh mục hoặc khóa học từ MockAPI.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void Promise.resolve().then(refresh); }, []);

  async function save(input: CategoryInput) {
    setSaving(true);
    try {
      if (editing) await courseApi.updateCategory(editing.id, input);
      else await courseApi.createCategory(input);
      setEditing(undefined);
      await refresh();
    } catch {
      showMessage('Chưa lưu được', 'Yêu cầu đến MockAPI thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  }

  function remove(category: Category) {
    const usageCount = courses.filter((course) => course.categoryId === category.id).length;
    if (usageCount > 0) {
      showMessage('Không thể xóa danh mục', `Danh mục này đang được ${usageCount} khóa học sử dụng.`);
      return;
    }
    confirmAction('Xóa danh mục?', `Danh mục “${category.name}” sẽ bị xóa khỏi MockAPI.`, () => {
      void courseApi.deleteCategory(category.id).then(refresh).catch(() => showMessage('Chưa xóa được', 'Không thể xóa danh mục từ MockAPI.'));
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.kickerRow}><Text style={styles.kicker}>COURSE LIBRARY</Text><View style={styles.kickerDot} /></View>
        <View style={styles.headingRow}>
          <View style={styles.headingCopy}><Text style={styles.title}>Danh mục</Text></View>
          <Pressable style={styles.addButton} onPress={() => setEditing(null)}><Text style={styles.addText}>＋</Text></Pressable>
        </View>
        {loading ? (
          <View style={styles.stateBox}><ActivityIndicator color={colors.green} /><Text style={styles.stateText}>Đang tải danh mục...</Text></View>
        ) : error ? (
          <View style={styles.stateBox}><Text style={styles.stateTitle}>Chưa kết nối được</Text><Text style={styles.stateText}>{error}</Text><Pressable style={styles.retry} onPress={() => { setLoading(true); void refresh(); }}><Text style={styles.retryText}>Thử lại</Text></Pressable></View>
        ) : categories.length === 0 ? (
          <View style={styles.stateBox}><Text style={styles.stateTitle}>Chưa có danh mục</Text><Text style={styles.stateText}>Tạo danh mục trước khi thêm khóa học.</Text></View>
        ) : (
          <View style={styles.categoryList}>
            {categories.map((category, index) => {
              const courseCount = courses.filter((course) => course.categoryId === category.id).length;
              return <View key={category.id} style={styles.categoryRow}>
                <View style={styles.numberBlock}><Text style={styles.numberText}>{String(index + 1).padStart(2, '0')}</Text></View>
                <View style={styles.categoryCopy}><Text style={styles.categoryName}>{category.name}</Text><Text style={styles.categoryDescription} numberOfLines={2}>{category.description || 'Chưa có mô tả.'}</Text><Text style={styles.usage}>{courseCount} khóa học</Text></View>
                <View style={styles.actions}>
                  <Pressable accessibilityLabel={`Sửa ${category.name}`} style={styles.actionButton} onPress={() => setEditing(category)}><Text style={styles.editGlyph}>✎</Text></Pressable>
                  <Pressable accessibilityLabel={`Xóa ${category.name}`} style={styles.actionButton} onPress={() => remove(category)}><Text style={styles.deleteGlyph}>×</Text></Pressable>
                </View>
              </View>;
            })}
          </View>
        )}
      </ScrollView>
      <Modal visible={editing !== undefined} animationType="slide" onRequestClose={() => setEditing(undefined)}>
        <CategoryForm key={editing?.id ?? 'new-category'} category={editing ?? null} saving={saving} onClose={() => setEditing(undefined)} onSave={save} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.paper },
  page: { paddingHorizontal: 22, paddingTop: 14, paddingBottom: 50, maxWidth: 760, width: '100%', alignSelf: 'center' },
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kicker: { color: colors.green, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  kickerDot: { width: 7, height: 7, borderRadius: 5, backgroundColor: '#9bc64c' },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 19, marginBottom: 22 },
  headingCopy: { flex: 1 },
  title: { color: colors.ink, fontSize: 34, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 14, marginTop: 5 },
  addButton: { width: 48, height: 48, borderRadius: 15, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  addText: { color: colors.white, fontSize: 28, lineHeight: 31 },
  categoryList: { gap: 10 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', minHeight: 112, padding: 13, borderRadius: 15, backgroundColor: colors.white, borderWidth: 1, borderColor: '#e7ebe4' },
  numberBlock: { width: 40, height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#edf2df', borderRadius: 10, marginRight: 12 },
  numberText: { color: colors.green, fontSize: 12, fontWeight: '800' },
  categoryCopy: { flex: 1, minWidth: 0 },
  categoryName: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  categoryDescription: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  usage: { color: colors.green, fontSize: 10, fontWeight: '800', marginTop: 6 },
  actions: { gap: 6, marginLeft: 8 },
  actionButton: { width: 34, height: 34, justifyContent: 'center', alignItems: 'center', borderRadius: 9, backgroundColor: '#f1f4ed' },
  editGlyph: { color: colors.green, fontSize: 17 },
  deleteGlyph: { color: colors.red, fontSize: 22, lineHeight: 24 },
  stateBox: { minHeight: 185, justifyContent: 'center', alignItems: 'center', padding: 24, borderRadius: 15, backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1, gap: 9 },
  stateTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  stateText: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  retry: { backgroundColor: colors.green, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, marginTop: 4 },
  retryText: { color: colors.white, fontSize: 13, fontWeight: '700' },
});