import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CourseDetail } from './course-detail';
import { CourseForm } from './course-form';
import { confirmAction, showMessage } from '@/components/platform-dialogs';
import { Category, Course, CourseInput, courseApi, formatPrice } from '@/lib/course-api';

const colors = { ink: '#142b2b', muted: '#617372', paper: '#f4f5ef', white: '#ffffff', green: '#176b59', line: '#dce3da' };

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selected, setSelected] = useState<Course | null>(null);
  const [formCourse, setFormCourse] = useState<Course | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setLoadError('');
    try {
      const [courseData, categoryData] = await Promise.all([courseApi.getCourses(), courseApi.getCategories()]);
      setCourses(courseData);
      setCategories(categoryData);
    } catch {
      setLoadError('Không thể tải dữ liệu. Kiểm tra kết nối hoặc cấu hình resource MockAPI.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void Promise.resolve().then(() => loadData(true));
  }, [loadData]));

  const visibleCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi'));
    return matchesSearch && (categoryFilter === 'all' || course.categoryId === categoryFilter);
  });

  async function saveCourse(input: CourseInput) {
    setSaving(true);
    try {
      if (formCourse) await courseApi.updateCourse(formCourse.id, input);
      else await courseApi.createCourse(input);
      setFormCourse(undefined);
      setSelected(null);
      await loadData();
    } catch {
      showMessage('Chưa lưu được', 'Yêu cầu đến MockAPI thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  }

  function deleteCourse(course: Course) {
    confirmAction('Xóa khóa học?', `Khóa học “${course.title}” sẽ bị xóa khỏi MockAPI.`, () => {
      void courseApi.deleteCourse(course.id).then(async () => {
        setSelected(null);
        await loadData();
      }).catch(() => showMessage('Chưa xóa được', 'Không thể xóa khóa học từ MockAPI.'));
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>LEARNING / 2026</Text>
        <View style={styles.headingRow}>
          <View style={styles.headingCopy}>
            <Text style={styles.title}>Khóa học</Text>
            <Text style={styles.subtitle}>Tìm một điều mới để học hôm nay.</Text>
          </View>
          <Pressable style={styles.addButton} onPress={() => setFormCourse(null)}><Text style={styles.addButtonText}>＋</Text></Pressable>
        </View>
        <View style={styles.searchBox}>
          <Text style={styles.searchGlyph}>⌕</Text>
          <TextInput value={search} onChangeText={setSearch} placeholder="Tên khóa học..." placeholderTextColor={colors.muted} style={styles.searchInput} accessibilityLabel="Tìm kiếm khóa học" />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <FilterChip label="Tất cả" active={categoryFilter === 'all'} onPress={() => setCategoryFilter('all')} />
          {categories.map((category) => <FilterChip key={category.id} label={category.name} active={categoryFilter === category.id} onPress={() => setCategoryFilter(category.id)} />)}
        </ScrollView>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>ĐANG MỞ</Text>
          <Text style={styles.count}>{loading ? '...' : `${visibleCourses.length} khóa học`}</Text>
        </View>

        {loading ? (
          <StateBox><ActivityIndicator color={colors.green} /><Text style={styles.stateText}>Đang tải khóa học...</Text></StateBox>
        ) : loadError ? (
          <StateBox>
            <Text style={styles.stateTitle}>Chưa kết nối được</Text><Text style={styles.stateText}>{loadError}</Text>
            <Pressable style={styles.retryButton} onPress={() => { void loadData(true); }}><Text style={styles.retryText}>Thử lại</Text></Pressable>
          </StateBox>
        ) : visibleCourses.length === 0 ? (
          <StateBox>
            <Text style={styles.stateTitle}>{courses.length ? 'Không tìm thấy kết quả' : 'Chưa có khóa học'}</Text>
            <Text style={styles.stateText}>{courses.length ? 'Thử từ khóa hoặc danh mục khác.' : 'Thêm khóa học đầu tiên để bắt đầu quản lý.'}</Text>
          </StateBox>
        ) : (
          <View style={styles.courseList}>
            {visibleCourses.map((course, index) => (
              <Pressable key={course.id} style={styles.courseCard} onPress={() => setSelected(course)}>
                <Image source={{ uri: course.thumbnail }} style={styles.thumbnail} contentFit="cover" transition={180} />
                <View style={styles.courseInfo}>
                  <Text style={styles.categoryLabel} numberOfLines={1}>{categories.find((item) => item.id === course.categoryId)?.name ?? 'Chưa phân loại'}</Text>
                  <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
                  <Text style={styles.instructor} numberOfLines={1}>{course.instructor}</Text>
                  <View style={styles.priceLine}><Text style={styles.price}>{formatPrice(Number(course.price) || 0)}</Text><Text style={styles.duration}>{course.duration} giờ · {String(index + 1).padStart(2, '0')}</Text></View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={Boolean(selected)} animationType="slide" onRequestClose={() => setSelected(null)}>
        {selected && <CourseDetail course={selected} category={categories.find((item) => item.id === selected.categoryId)?.name ?? 'Chưa phân loại'} onClose={() => setSelected(null)} onEdit={() => setFormCourse(selected)} onDelete={() => deleteCourse(selected)} />}
      </Modal>
      <Modal visible={formCourse !== undefined} animationType="slide" onRequestClose={() => setFormCourse(undefined)}>
        <CourseForm course={formCourse ?? null} categories={categories} saving={saving} onClose={() => setFormCourse(undefined)} onSave={saveCourse} />
      </Modal>
    </SafeAreaView>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.filterChip, active && styles.filterChipActive]}><Text style={[styles.filterText, active && styles.filterTextActive]} numberOfLines={1}>{label}</Text></Pressable>;
}

function StateBox({ children }: { children: React.ReactNode }) {
  return <View style={styles.stateBox}>{children}</View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.paper },
  page: { paddingHorizontal: 22, paddingTop: 14, paddingBottom: 48, maxWidth: 760, width: '100%', alignSelf: 'center' },
  eyebrow: { color: colors.green, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 19, marginBottom: 20 },
  headingCopy: { flex: 1 },
  title: { color: colors.ink, fontSize: 34, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 14, marginTop: 5 },
  addButton: { width: 48, height: 48, borderRadius: 15, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: colors.white, fontSize: 28, lineHeight: 31 },
  searchBox: { height: 50, backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1, borderRadius: 13, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  searchGlyph: { color: colors.green, fontSize: 25, marginRight: 9 },
  searchInput: { flex: 1, color: colors.ink, fontSize: 14, paddingVertical: 8, outlineStyle: 'none' as never },
  filters: { gap: 8, paddingVertical: 17 },
  filterChip: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, borderRadius: 20, paddingVertical: 9, paddingHorizontal: 14, maxWidth: 190 },
  filterChipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  filterText: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: colors.white },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2, marginBottom: 12 },
  sectionTitle: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  count: { color: colors.muted, fontSize: 12 },
  courseList: { gap: 11 },
  courseCard: { minHeight: 132, flexDirection: 'row', padding: 10, borderRadius: 17, backgroundColor: colors.white, borderWidth: 1, borderColor: '#e7ebe4', gap: 13 },
  thumbnail: { width: 112, height: 112, borderRadius: 11, backgroundColor: '#dce5dc' },
  courseInfo: { flex: 1, justifyContent: 'space-between', paddingVertical: 2, minWidth: 0 },
  categoryLabel: { color: colors.green, fontSize: 10, fontWeight: '800' },
  courseTitle: { color: colors.ink, fontSize: 15, fontWeight: '700', lineHeight: 19, marginTop: 4 },
  instructor: { color: colors.muted, fontSize: 12, marginTop: 2 },
  priceLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  price: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  duration: { color: colors.muted, fontSize: 11 },
  stateBox: { minHeight: 190, justifyContent: 'center', alignItems: 'center', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, gap: 9 },
  stateTitle: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  stateText: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  retryButton: { backgroundColor: colors.green, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, marginTop: 5 },
  retryText: { color: colors.white, fontSize: 13, fontWeight: '700' },
});