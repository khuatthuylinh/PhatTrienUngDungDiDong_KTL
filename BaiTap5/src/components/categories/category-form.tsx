import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { showMessage } from '@/components/platform-dialogs';
import { Category, CategoryInput } from '@/lib/course-api';

const colors = { ink: '#142b2b', muted: '#617372', paper: '#f4f5ef', white: '#ffffff', green: '#176b59', line: '#dce3da' };

export function CategoryForm({ category, saving, onClose, onSave }: { category: Category | null; saving: boolean; onClose: () => void; onSave: (input: CategoryInput) => Promise<void> }) {
  const [name, setName] = useState(category?.name ?? '');
  const [description, setDescription] = useState(category?.description ?? '');

  function submit() {
    if (!name.trim() || !description.trim()) {
      showMessage('Thiếu thông tin', 'Tên và mô tả danh mục là bắt buộc.');
      return;
    }
    void onSave({ name: name.trim(), description: description.trim() });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.formPage}>
        <Pressable onPress={onClose}><Text style={styles.back}>‹  Đóng</Text></Pressable>
        <Text style={styles.formKicker}>{category ? 'CHỈNH SỬA CHỦ ĐỀ' : 'THÊM CHỦ ĐỀ'}</Text>
        <Text style={styles.formTitle}>{category ? 'Sửa danh mục' : 'Danh mục mới'}</Text>
        <Text style={styles.label}>TÊN DANH MỤC</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Ví dụ: Lập trình Mobile" placeholderTextColor="#899692" style={styles.input} />
        <Text style={styles.label}>MÔ TẢ</Text>
        <TextInput value={description} onChangeText={setDescription} placeholder="Mô tả các khóa học thuộc nhóm" placeholderTextColor="#899692" style={[styles.input, styles.descriptionInput]} multiline />
        <Pressable style={[styles.saveButton, saving && styles.disabled]} onPress={submit} disabled={saving}>
          {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveText}>Lưu danh mục</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.paper },
  formPage: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 48, maxWidth: 760, width: '100%', alignSelf: 'center' },
  back: { color: colors.green, fontSize: 14, fontWeight: '700', marginBottom: 25 },
  formKicker: { color: colors.green, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  formTitle: { color: colors.ink, fontSize: 28, fontWeight: '800', marginTop: 8, marginBottom: 24 },
  label: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.15, marginBottom: 7, marginTop: 12 },
  input: { minHeight: 49, borderRadius: 11, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, paddingHorizontal: 13, paddingVertical: 11, color: colors.ink, fontSize: 14 },
  descriptionInput: { minHeight: 100, textAlignVertical: 'top' },
  saveButton: { minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: colors.green, marginTop: 24 },
  saveText: { color: colors.white, fontSize: 14, fontWeight: '800' },
  disabled: { opacity: 0.6 },
});