import React, { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { getLocales } from 'expo-localization';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { confirmPlatformAction, showPlatformAlert } from '../components/platform-dialogs';

type Student = {
  id: string;
  name: string;
  studentId: string;
  email: string;
  avatar: string;
};

const STORAGE_KEY = '@students';
const STUDENT_ID_PATTERN = /^[Bb][A-Za-z]{2}(2[2-9]|30)\d{4}$/;

const locale = getLocales()[0]?.languageCode ?? 'en';
const isVietnamese = locale.startsWith('vi');

const t = {
  addTitle: isVietnamese
    ? 'Thêm sinh viên'
    : 'Add Student',

  detailTitle: isVietnamese
    ? 'Thông tin sinh viên'
    : 'Student Details',

  name: isVietnamese
    ? 'Họ tên SV'
    : 'Student Name',

  studentId: isVietnamese
    ? 'Mã số SV'
    : 'Student ID',

  email: 'Email',

  avatar: isVietnamese
    ? 'Ảnh avatar'
    : 'Avatar',

  avatarLink: isVietnamese
    ? 'Link ảnh avatar'
    : 'Avatar image URL',

  chooseImage: isVietnamese
    ? 'Chọn ảnh từ thiết bị'
    : 'Choose image',

  save: isVietnamese
    ? 'Lưu'
    : 'Save',

  edit: isVietnamese
    ? 'Sửa'
    : 'Edit',

  back: isVietnamese
    ? 'Quay lại'
    : 'Back',

  cancel: isVietnamese
    ? 'Hủy'
    : 'Cancel',

  yes: isVietnamese
    ? 'Có'
    : 'Yes',

  requiredName: isVietnamese
    ? 'Vui lòng nhập họ tên.'
    : 'Please enter student name.',

  requiredId: isVietnamese
    ? 'Vui lòng nhập mã số sinh viên.'
    : 'Please enter student ID.',

  invalidStudentId: isVietnamese
    ? 'Mã số SV không đúng định dạng.'
    : 'Student ID format is invalid.',

  requiredEmail: isVietnamese
    ? 'Vui lòng nhập email.'
    : 'Please enter email.',

  invalidEmail: isVietnamese
    ? 'Email không hợp lệ.'
    : 'Invalid email.',

  confirmEdit: isVietnamese
    ? 'Bạn có muốn sửa thông tin SV không?'
    : 'Do you want to edit this student?',

  success: isVietnamese
    ? 'Lưu thông tin thành công.'
    : 'Student saved successfully.',

  error: isVietnamese
    ? 'Không thể lưu thông tin sinh viên.'
    : 'Unable to save student information.',

  notice: isVietnamese
    ? 'Thông báo'
    : 'Notice',

  errorTitle: isVietnamese
    ? 'Lỗi'
    : 'Error',

  permissionTitle: isVietnamese
    ? 'Thông báo'
    : 'Notice',

  permissionMessage: isVietnamese
    ? 'Ứng dụng cần quyền truy cập thư viện ảnh.'
    : 'The app needs access to your photo library.',
};

export default function StudentScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    id?: string;
    edit?: string;
  }>();

  const studentIdParam =
    typeof params.id === 'string'
      ? params.id
      : undefined;

  const isEditMode = !!studentIdParam;
  const openForEditing = params.edit === 'true';

  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');

  const [isEditing, setIsEditing] =
    useState(!isEditMode || openForEditing);

  // =========================
  // LOAD SINH VIÊN
  // =========================

  useEffect(() => {
    if (studentIdParam) {
      loadStudent(studentIdParam);
    }
  }, [studentIdParam]);

  const loadStudent = async (id: string) => {
    try {
      const data =
        await AsyncStorage.getItem(STORAGE_KEY);

      if (!data) return;

      const students: Student[] =
        JSON.parse(data);

      const student = students.find(
        (item) => item.id === id
      );

      if (student) {
        setName(student.name);
        setStudentId(student.studentId);
        setEmail(student.email);
        setAvatar(student.avatar);
      }
    } catch (error) {
      console.log('LOAD ERROR:', error);
    }
  };

  // =========================
  // CHỌN ẢNH
  // =========================

  const chooseImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      showPlatformAlert(t.permissionTitle, t.permissionMessage);

      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  // =========================
  // KIỂM TRA DỮ LIỆU
  // =========================

  const validate = () => {
    if (!name.trim()) {
      showPlatformAlert(t.notice, t.requiredName);

      return false;
    }

    if (!studentId.trim()) {
      showPlatformAlert(t.notice, t.requiredId);

      return false;
    }

    if (!STUDENT_ID_PATTERN.test(studentId.trim())) {
      showPlatformAlert(t.notice, t.invalidStudentId);

      return false;
    }

    if (!email.trim()) {
      showPlatformAlert(t.notice, t.requiredEmail);

      return false;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      showPlatformAlert(t.notice, t.invalidEmail);

      return false;
    }

    return true;
  };

  // =========================
  // LƯU SINH VIÊN
  // =========================

  const saveStudent = async () => {
    // Kiểm tra dữ liệu
    if (!validate()) {
      return;
    }

    try {
      const data =
        await AsyncStorage.getItem(STORAGE_KEY);

      const students: Student[] =
        data ? JSON.parse(data) : [];

      // =================================
      // TRƯỜNG HỢP SỬA SINH VIÊN
      // =================================

      if (isEditMode) {
        const confirmed = await confirmPlatformAction(
          t.edit,
          t.confirmEdit,
          t.cancel,
          t.yes,
        );
        if (!confirmed) return;

        const updatedStudents = students.map((item) =>
          item.id === studentIdParam
            ? {
                ...item,
                name: name.trim(),
                studentId: studentId.trim(),
                email: email.trim(),
                avatar: avatar.trim(),
              }
            : item
        );

        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(updatedStudents)
        );
        router.back();
        return;
      }

      // =================================
      // TRƯỜNG HỢP THÊM SINH VIÊN
      // =================================

      const newStudent: Student = {
        id: Date.now().toString(),
        name: name.trim(),
        studentId: studentId.trim(),
        email: email.trim(),
        avatar: avatar.trim(),
      };

      students.push(newStudent);

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(students)
      );

      console.log(
        'ĐÃ LƯU:',
        newStudent
      );

      router.back();

    } catch (error) {
      console.log(
        'SAVE ERROR:',
        error
      );

      showPlatformAlert(t.errorTitle, t.error);
    }
  };

  // =========================
  // GIAO DIỆN
  // =========================

  const title = isEditMode
    ? t.detailTitle
    : t.addTitle;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.content
          }
          keyboardShouldPersistTaps="handled"
        >

          {/* QUAY LẠI */}

          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>
              ← {t.back}
            </Text>
          </Pressable>

          {/* TIÊU ĐỀ */}

          <Text style={styles.title}>
            {title}
          </Text>

          {/* AVATAR */}

          <View
            style={styles.avatarContainer}
          >
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                style={styles.avatar}
              />
            ) : (
              <View
                style={
                  styles.avatarPlaceholder
                }
              >
                <Text
                  style={
                    styles.avatarPlaceholderText
                  }
                >
                  ?
                </Text>
              </View>
            )}

            {isEditing && (
              <>
                <Pressable
                  style={
                    styles.imageButton
                  }
                  onPress={chooseImage}
                >
                  <Text
                    style={
                      styles.imageButtonText
                    }
                  >
                    {t.chooseImage}
                  </Text>
                </Pressable>

                <TextInput
                  style={styles.input}
                  placeholder={
                    t.avatarLink
                  }
                  value={avatar}
                  onChangeText={
                    setAvatar
                  }
                  autoCapitalize="none"
                />
              </>
            )}
          </View>

          {/* HỌ TÊN */}

          <Text style={styles.label}>
            {t.name}
          </Text>

          <TextInput
            style={styles.input}
            placeholder={t.name}
            value={name}
            onChangeText={setName}
            editable={isEditing}
          />

          {/* MSSV */}

          <Text style={styles.label}>
            {t.studentId}
          </Text>

          <TextInput
            style={styles.input}
            placeholder={t.studentId}
            value={studentId}
            onChangeText={setStudentId}
            editable={isEditing}
            maxLength={9}
          />

          {/* EMAIL */}

          <Text style={styles.label}>
            {t.email}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="example@gmail.com"
            value={email}
            onChangeText={setEmail}
            editable={isEditing}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* NÚT SAVE / EDIT */}

          {isEditing && (
            <Pressable
              style={styles.saveButton}
              onPress={saveStudent}
            >
              <Text
                style={styles.saveButtonText}
              >
                {t.save}
              </Text>
            </Pressable>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

// =========================
// STYLE
// =========================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },

  flex: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  backButton: {
    marginBottom: 15,
  },

  backText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },

  title: {
    fontSize: 27,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 25,
  },

  avatarContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },

  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginBottom: 15,
  },

  avatarPlaceholder: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  avatarPlaceholderText: {
    fontSize: 45,
    color: '#2563eb',
  },

  imageButton: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
  },

  imageButtonText: {
    color: '#111827',
    fontWeight: '600',
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 7,
  },

  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 18,
  },

  saveButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  saveButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },

});