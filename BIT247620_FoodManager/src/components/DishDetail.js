import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FIELDS, getQuickStatus } from '../foodData';
import { translate } from '../translations';
import { colors } from '../theme';
import { ActionButton, EmptyState, primitiveStyles, SectionLabel } from './Primitives';

export default function DishDetail({ dish, category, language, onClose, onEdit, onDelete }) {
  const text = (key) => translate(language, key);
  if (!dish) return <SafeAreaView style={primitiveStyles.modal}><EmptyState title={text('missingDish')} detail="" action={text('cancel')} onAction={onClose} /></SafeAreaView>;
  const images = dish[FIELDS.images] ?? [];
  const cover = images.find((image) => image[FIELDS.isThumbnail]) ?? images[0];
  return (
    <SafeAreaView style={primitiveStyles.modal}>
      <ScrollView contentContainerStyle={primitiveStyles.modalContent}>
        <View style={primitiveStyles.modalHeader}><ActionButton label={`‹  ${text('dishes')}`} onPress={onClose} variant="ghost" compact /><Text style={styles.eyebrow}>{text('detail')}</Text></View>
        {cover ? <Image source={{ uri: cover[FIELDS.imageUrl] }} style={styles.heroImage} resizeMode="cover" /> : <View style={styles.noImage}><Text style={styles.noImageText}>{text('noImages')}</Text></View>}
        <Text style={styles.category}>{category?.[FIELDS.name] ?? text('missingCategory')}</Text>
        <Text style={styles.title}>{dish[FIELDS.name]}</Text>
        <View style={styles.metadata}><Text style={styles.price}>{Number(dish[FIELDS.price]).toLocaleString('vi-VN')} ₫</Text><Text style={styles.separator}>·</Text><Text style={styles.time}>{dish[FIELDS.preparationTime]} {text('minutes')}</Text><Text style={styles.separator}>·</Text><Text style={styles.status}>{dish[FIELDS.isAvailable] ? text('available') : text('unavailable')}</Text></View>
        <View style={styles.quickPill}><View style={styles.quickDot} /><Text style={styles.quickText}>{text(getQuickStatus(dish[FIELDS.preparationTime]))}</Text></View>
        <SectionLabel>{text('ingredients')}</SectionLabel>
        <Text style={styles.description}>{dish[FIELDS.description] || '—'}</Text>
        <View style={styles.photosHeading}><SectionLabel right={String(images.length)}>{text('images')}</SectionLabel></View>
        {images.length ? <View style={styles.imageGrid}>{images.map((image, index) => <View key={`${image[FIELDS.imageUrl]}-${index}`} style={styles.imageFrame}><Image source={{ uri: image[FIELDS.imageUrl] }} style={styles.image} resizeMode="cover" />{image[FIELDS.isThumbnail] ? <Text style={styles.coverTag}>{text('thumbnail')}</Text> : null}</View>)}</View> : <Text style={styles.noPhotos}>{text('noImages')}</Text>}
        <View style={styles.actions}><ActionButton label={text('edit')} onPress={onEdit} variant="soft" /><ActionButton label={text('delete')} onPress={onDelete} variant="danger" /></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  eyebrow: { color: colors.green, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  heroImage: { width: '100%', height: 240, borderRadius: 15, backgroundColor: colors.greenSoft },
  noImage: { width: '100%', minHeight: 170, borderRadius: 15, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' },
  noImageText: { color: colors.muted, fontSize: 13 },
  category: { color: colors.green, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginTop: 22 },
  title: { color: colors.ink, fontSize: 29, fontWeight: '900', lineHeight: 35, marginTop: 6 },
  metadata: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 11 },
  price: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  separator: { color: colors.muted },
  time: { color: colors.muted, fontSize: 13 },
  status: { color: colors.green, fontSize: 12, fontWeight: '700' },
  quickPill: { flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 7, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 16, backgroundColor: colors.greenSoft, marginTop: 14, marginBottom: 24 },
  quickDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green },
  quickText: { color: colors.green, fontSize: 11, fontWeight: '700' },
  description: { color: colors.ink, fontSize: 15, lineHeight: 23, marginBottom: 23 },
  photosHeading: { marginBottom: 4 },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 22 },
  imageFrame: { width: '47%', aspectRatio: 1.25, position: 'relative' },
  image: { width: '100%', height: '100%', borderRadius: 10, backgroundColor: colors.greenSoft },
  coverTag: { position: 'absolute', left: 7, bottom: 7, backgroundColor: colors.white, color: colors.green, fontSize: 9, fontWeight: '800', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 4, overflow: 'hidden' },
  noPhotos: { color: colors.muted, fontSize: 13, marginBottom: 22 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
});