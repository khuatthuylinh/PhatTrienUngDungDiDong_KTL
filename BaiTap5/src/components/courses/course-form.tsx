import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { showMessage } from '@/components/platform-dialogs';
import { Category, Course, CourseInput } from '@/lib/course-api';

const colors = { ink: '#142b2b', muted: '#617372', paper: '#f4f5ef', white: '#ffffff', green: '#176b59', line: '#dce3da', red: '#b34032' };

export function CourseForm({ course, categories, saving, onClose, onSave }: { course: Course | null; categories: Category[]; saving: boolean; onClose: () => void; onSave: (input: CourseInput) => Promise<void> }) {
  const [title, setTitle] = useState(course?.title ?? '');
  const [description, setDescription] = useState(course?.description ?? '');
  const [categoryId, setCategoryId] = useState(course?.categoryId ?? categories[0]?.id ?? '');
  const [instructor, setInstructor] = useState(course?.instructor ?? '');
  const [price, setPrice] = useState(course ? String(course.price) : '');
  const [duration, setDuration] = useState(course ? String(course.duration) : '');
  const [thumbnail, setThumbnail] = useState(course?.thumbnail ?? '');
  const [trailerUrl, setTrailerUrl] = useState(course?.trailerUrl ?? '');
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);

  function submit() {
    if (!title.trim() || !description.trim() || !instructor.trim() || !price.trim() || !duration.trim() || !trailerUrl.trim()) {
      showMessage('Thiếu thông tin', 'Tên, mô tả, giảng viên, học phí, thời lượng và trailer là bắt buộc.'); return;
    }
    if (!categoryId || !categories.some((item) => item.id === categoryId)) {
      showMessage('Danh mục không hợp lệ', 'Vui lòng tải hoặc chọn một danh mục đang tồn tại.'); return;
    }
    const parsedPrice = Number(price);
    const parsedDuration = Number(duration);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0 || !Number.isFinite(parsedDuration) || parsedDuration < 0) {
      showMessage('Giá trị không hợp lệ', 'Học phí và thời lượng phải là số không âm.'); return;
    }
    if (!thumbnail.trim() || !/^https?:\/\//i.test(thumbnail.trim())) {
      showMessage('URL ảnh không hợp lệ', 'Nhập URL ảnh bắt đầu bằng http:// hoặc https://.'); return;
    }
    if (!/^https?:\/\//i.test(trailerUrl.trim())) {
      showMessage('URL trailer không hợp lệ', 'URL trailer phải bắt đầu bằng http:// hoặc https://.'); return;
    }
    void onSave({ title: title.trim(), description: description.trim(), categoryId, instructor: instructor.trim(), price: parsedPrice, duration: parsedDuration, thumbnail: thumbnail.trim(), trailerUrl: trailerUrl.trim(), createdAt: course?.createdAt ?? new Date().toISOString().slice(0, 10) });
  }

  return (
    <>
      <SafeAreaView style={styles.modalSafe}>
        <ScrollView contentContainerStyle={styles.formPage} keyboardShouldPersistTaps="handled">
          <View style={styles.modalTop}><Pressable onPress={onClose}><Text style={styles.backText}>‹  Đóng</Text></Pressable><Text style={styles.eyebrow}>{course ? 'CẬP NHẬT' : 'KHÓA HỌC MỚI'}</Text></View>
          <Text style={styles.formTitle}>{course ? 'Sửa khóa học' : 'Thêm khóa học'}</Text>
          <Field label="TÊN KHÓA HỌC" value={title} onChangeText={setTitle} placeholder="Ví dụ: Lập trình Android" />
          <Field label="MÔ TẢ" value={description} onChangeText={setDescription} placeholder="Nội dung khóa học" multiline />
          <Text style={styles.fieldLabel}>DANH MỤC</Text>
          {categories.length === 0 ? <Text style={styles.noCategory}>Tạo danh mục trước khi thêm khóa học.</Text> : (
            <Pressable style={styles.categorySelect} onPress={() => setCategoryPickerVisible(true)} accessibilityRole="button">
              <Text style={styles.categorySelectText}>{categories.find((item) => item.id === categoryId)?.name ?? 'Chọn danh mục'}</Text><Text style={styles.categorySelectArrow}>⌄</Text>
            </Pressable>
          )}
          <Field label="GIẢNG VIÊN" value={instructor} onChangeText={setInstructor} placeholder="Tên giảng viên" />
          <View style={styles.twoFields}><Field label="HỌC PHÍ (VNĐ)" value={price} onChangeText={setPrice} placeholder="500000" keyboardType="numeric" /><Field label="THỜI LƯỢNG (GIỜ)" value={duration} onChangeText={setDuration} placeholder="30" keyboardType="numeric" /></View>
          <Field label="URL ẢNH BÌA" value={thumbnail} onChangeText={setThumbnail} placeholder="https://..." keyboardType="url" />
          {thumbnail.startsWith('http') && <Image source={{ uri: thumbnail }} style={styles.previewImage} contentFit="cover" />}
          <Field label="URL TRAILER MP4" value={trailerUrl} onChangeText={setTrailerUrl} placeholder="https://...mp4" keyboardType="url" />
          <Pressable style={[styles.saveButton, saving && styles.disabledButton]} disabled={saving} onPress={submit}>{saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveButtonText}>Lưu khóa học</Text>}</Pressable>
        </ScrollView>
      </SafeAreaView>
      <Modal visible={categoryPickerVisible} transparent animationType="fade" onRequestClose={() => setCategoryPickerVisible(false)}>
        <View style={styles.dropdownBackdrop}><Pressable style={StyleSheet.absoluteFill} onPress={() => setCategoryPickerVisible(false)} /><View style={styles.dropdownPanel}>
          <Text style={styles.dropdownTitle}>CHỌN DANH MỤC</Text>
          {categories.map((item) => <Pressable key={item.id} style={styles.dropdownOption} onPress={() => { setCategoryId(item.id); setCategoryPickerVisible(false); }}><Text style={[styles.dropdownOptionText, item.id === categoryId && styles.dropdownOptionSelected]}>{item.name}</Text></Pressable>)}
        </View></View>
      </Modal>
    </>
  );
}

function Field({ label, value, onChangeText, placeholder, multiline = false, keyboardType = 'default' }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; multiline?: boolean; keyboardType?: 'default' | 'numeric' | 'url' }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#899692" style={[styles.input, multiline && styles.multilineInput]} multiline={multiline} keyboardType={keyboardType} autoCapitalize={keyboardType === 'url' ? 'none' : 'sentences'} /></View>;
}

const styles = StyleSheet.create({
  modalSafe: { flex: 1, backgroundColor: colors.paper },
  formPage: { padding: 22, paddingBottom: 48, maxWidth: 760, width: '100%', alignSelf: 'center' },
  modalTop: { minHeight: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 17 },
  backText: { color: colors.green, fontSize: 14, fontWeight: '700' },
  eyebrow: { color: colors.green, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  formTitle: { color: colors.ink, fontSize: 28, fontWeight: '800', marginBottom: 20 },
  field: { marginBottom: 15, flex: 1 },
  fieldLabel: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.15, marginBottom: 7 },
  input: { minHeight: 48, borderRadius: 11, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, paddingHorizontal: 13, paddingVertical: 11, color: colors.ink, fontSize: 14 },
  multilineInput: { minHeight: 88, textAlignVertical: 'top' },
  categorySelect: { minHeight: 48, borderRadius: 11, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, paddingHorizontal: 13, marginBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categorySelectText: { color: colors.ink, fontSize: 14 },
  categorySelectArrow: { color: colors.green, fontSize: 20, marginTop: -6 },
  dropdownBackdrop: { flex: 1, backgroundColor: '#00000066', justifyContent: 'center', padding: 24 },
  dropdownPanel: { backgroundColor: colors.white, borderRadius: 14, padding: 16, maxWidth: 480, width: '100%', alignSelf: 'center' },
  dropdownTitle: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  dropdownOption: { minHeight: 46, justifyContent: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  dropdownOptionText: { color: colors.ink, fontSize: 14 },
  dropdownOptionSelected: { color: colors.green, fontWeight: '800' },
  noCategory: { color: colors.red, fontSize: 13, marginBottom: 16 },
  twoFields: { flexDirection: 'row', gap: 12 },
  previewImage: { width: '100%', height: 150, borderRadius: 12, backgroundColor: '#dce5dc', marginTop: -5, marginBottom: 16 },
  saveButton: { minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: colors.green, marginTop: 5 },
  saveButtonText: { color: colors.white, fontSize: 14, fontWeight: '800' },
  disabledButton: { opacity: 0.5 },
});