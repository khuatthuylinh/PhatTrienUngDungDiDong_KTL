import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Course, formatPrice } from '@/lib/course-api';

const colors = { ink: '#142b2b', muted: '#617372', paper: '#f4f5ef', white: '#ffffff', green: '#176b59', lime: '#d1ed78', line: '#dce3da', red: '#b34032' };

export function CourseDetail({ course, category, onClose, onEdit, onDelete }: { course: Course; category: string; onClose: () => void; onEdit: () => void; onDelete: () => void }) {
  const [trailerVisible, setTrailerVisible] = useState(false);
  return (
    <SafeAreaView style={styles.modalSafe}>
      <ScrollView contentContainerStyle={styles.detailPage}>
        <View style={styles.modalTop}><Pressable onPress={onClose}><Text style={styles.backText}>‹  Danh sách</Text></Pressable><Text style={styles.eyebrow}>CHI TIẾT KHÓA HỌC</Text></View>
        <Image source={{ uri: course.thumbnail }} style={styles.detailImage} contentFit="cover" />
        <Text style={styles.detailCategory}>{category.toLocaleUpperCase('vi')}</Text>
        <Text style={styles.detailTitle}>{course.title}</Text>
        <Text style={styles.detailInstructor}>Giảng viên · {course.instructor}</Text>
        <View style={styles.detailStats}><DetailStat label="HỌC PHÍ" value={formatPrice(Number(course.price) || 0)} /><DetailStat label="THỜI LƯỢNG" value={`${course.duration} giờ`} /></View>
        <Text style={styles.detailSection}>GIỚI THIỆU</Text>
        <Text style={styles.description}>{course.description || 'Chưa có mô tả.'}</Text>
        <Text style={styles.createdAt}>Ngày tạo · {course.createdAt || '—'}</Text>
        <Pressable style={[styles.trailerButton, !course.trailerUrl && styles.disabledButton]} disabled={!course.trailerUrl} onPress={() => setTrailerVisible(true)}><Text style={styles.trailerButtonText}>▶   Xem trailer</Text></Pressable>
        <View style={styles.detailActions}><Pressable style={styles.editButton} onPress={onEdit}><Text style={styles.editButtonText}>Sửa khóa học</Text></Pressable><Pressable style={styles.deleteButton} onPress={onDelete}><Text style={styles.deleteButtonText}>Xóa</Text></Pressable></View>
      </ScrollView>
      {trailerVisible && <TrailerPlayer uri={course.trailerUrl} onClose={() => setTrailerVisible(false)} />}
    </SafeAreaView>
  );
}

function TrailerPlayer({ uri, onClose }: { uri: string; onClose: () => void }) {
  const player = useVideoPlayer(uri, (videoPlayer) => videoPlayer.play());
  return <Modal visible animationType="fade" onRequestClose={onClose}><SafeAreaView style={styles.videoScreen}><View style={styles.videoHeader}><Pressable onPress={onClose}><Text style={styles.backText}>‹  Chi tiết</Text></Pressable><Text style={styles.eyebrow}>TRAILER</Text></View><VideoView player={player} style={styles.videoView} contentFit="contain" nativeControls /></SafeAreaView></Modal>;
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return <View style={styles.detailStat}><Text style={styles.detailStatLabel}>{label}</Text><Text style={styles.detailStatValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  modalSafe: { flex: 1, backgroundColor: colors.paper },
  detailPage: { padding: 22, paddingBottom: 48, maxWidth: 760, width: '100%', alignSelf: 'center' },
  modalTop: { minHeight: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 17 },
  backText: { color: colors.green, fontSize: 14, fontWeight: '700' },
  eyebrow: { color: colors.green, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  detailImage: { width: '100%', height: 230, borderRadius: 18, backgroundColor: '#dce5dc' },
  detailCategory: { color: colors.green, fontSize: 10, fontWeight: '800', marginTop: 22, letterSpacing: 1.3 },
  detailTitle: { color: colors.ink, fontSize: 29, fontWeight: '800', lineHeight: 35, marginTop: 8 },
  detailInstructor: { color: colors.muted, fontSize: 14, marginTop: 8 },
  detailStats: { flexDirection: 'row', gap: 12, marginTop: 22 },
  detailStat: { flex: 1, backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1, borderRadius: 13, padding: 15 },
  detailStatLabel: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  detailStatValue: { color: colors.ink, fontSize: 16, fontWeight: '800', marginTop: 6 },
  detailSection: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.3, marginTop: 25 },
  description: { color: colors.ink, fontSize: 15, lineHeight: 23, marginTop: 8 },
  createdAt: { color: colors.muted, fontSize: 12, marginTop: 14 },
  trailerButton: { minHeight: 52, borderRadius: 13, backgroundColor: colors.green, justifyContent: 'center', alignItems: 'center', marginTop: 23 },
  trailerButtonText: { color: colors.white, fontSize: 14, fontWeight: '800' },
  videoScreen: { flex: 1, backgroundColor: '#101817', paddingHorizontal: 18, paddingBottom: 18 },
  videoHeader: { minHeight: 52, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  videoView: { flex: 1, width: '100%', backgroundColor: '#000000', borderRadius: 12 },
  detailActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  editButton: { flex: 1, minHeight: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: colors.lime },
  editButtonText: { color: colors.ink, fontWeight: '800', fontSize: 13 },
  deleteButton: { width: 84, minHeight: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: '#f7e5df' },
  deleteButtonText: { color: colors.red, fontWeight: '800', fontSize: 13 },
  disabledButton: { opacity: 0.5 },
});