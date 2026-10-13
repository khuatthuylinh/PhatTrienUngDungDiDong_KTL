import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { getLocales } from 'expo-localization';
import { confirmPlatformAction } from '../components/platform-dialogs';

export type Student = {
  id: string;
  name: string;
  studentId: string;
  email: string;
  avatar: string;
};

const STORAGE_KEY = '@students';

const locale = getLocales()[0]?.languageCode ?? 'en';
const isVietnamese = locale.startsWith('vi');

const t = {
  title: isVietnamese ? 'Quản lý Sinh viên' : 'Student Management',
  add: isVietnamese ? 'Thêm sinh viên' : 'Add Student',
  edit: isVietnamese ? 'Sửa' : 'Edit',
  empty: isVietnamese
    ? 'Chưa có sinh viên nào'
    : 'No students yet',
  confirmDelete: isVietnamese
    ? 'Bạn có muốn xóa thông tin SV không?'
    : 'Do you want to delete this student?',
  confirmEdit: isVietnamese
    ? 'Bạn có muốn sửa thông tin SV không?'
    : 'Do you want to edit this student?',
  cancel: isVietnamese ? 'Hủy' : 'Cancel',
  yes: isVietnamese ? 'Có' : 'Yes',
  delete: isVietnamese ? 'Xóa' : 'Delete',
};

export default function HomeScreen() {
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);

  const loadStudents = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);

      if (data) {
        setStudents(JSON.parse(data));
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.log('Load students error:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStudents();
    }, [])
  );

  const handleDelete = async (student: Student) => {
    const confirmed = await confirmPlatformAction(
      t.delete,
      t.confirmDelete,
      t.cancel,
      t.yes,
    );
    if (!confirmed) return;

    const newStudents = students.filter(
      (item) => item.id !== student.id
    );

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(newStudents)
      );
      setStudents(newStudents);
    } catch (error) {
      console.log('Delete student error:', error);
    }
  };

  const handleEdit = async (student: Student) => {
    const confirmed = await confirmPlatformAction(
      t.edit,
      t.confirmEdit,
      t.cancel,
      t.yes,
    );
    if (!confirmed) return;

    router.push({
      pathname: '/student',
      params: { id: student.id, edit: 'true' },
    });
  };

  const renderStudent = ({ item }: { item: Student }) => {
    return (
      <View style={styles.studentCard}>
        <Pressable
          style={styles.studentContent}
          onPress={() =>
            router.push({
              pathname: '/student',
              params: {
                id: item.id,
              },
            })
          }
        >
          {item.avatar ? (
            <Image
              source={{ uri: item.avatar }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>
              {item.name}
            </Text>

            <Text style={styles.studentId}>
              {item.studentId}
            </Text>

            <Text style={styles.email}>
              {item.email}
            </Text>
          </View>
        </Pressable>

        <View style={styles.actions}>
          <Pressable
            style={styles.editButton}
            onPress={() => handleEdit(item)}
          >
            <Text style={styles.editButtonText}>{t.edit}</Text>
          </Pressable>

          <Pressable
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.deleteButtonText}>{t.delete}</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {t.title}
        </Text>
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={renderStudent}
        contentContainerStyle={
          students.length === 0
            ? styles.emptyContainer
            : styles.listContainer
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {t.empty}
          </Text>
        }
      />

      <View style={styles.bottomBar}>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/student')}
        >
          <Text style={styles.addButtonText}>+ {t.add}</Text>
        </Pressable>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    alignItems: 'flex-start',
  },

  title: {
    fontSize: 25,
    fontWeight: '700',
    color: '#111827',
  },

  addButton: {
    width: '100%',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },

  listContainer: {
    padding: 15,
    paddingBottom: 20,
  },

  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#f5f7fb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },

  studentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    marginBottom: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },

  studentContent: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  avatar: {
    width: 65,
    height: 65,
    borderRadius: 33,
    marginRight: 14,
  },

  avatarPlaceholder: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563eb',
  },

  studentInfo: {
    flex: 1,
  },

  studentName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },

  studentId: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 3,
  },

  email: {
    fontSize: 13,
    color: '#6b7280',
  },

  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },

  editButtonText: {
    color: '#2563eb',
    fontWeight: '600',
  },

  deleteButtonText: {
    color: '#dc2626',
    fontWeight: '600',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    color: '#6b7280',
    fontSize: 16,
  },
});