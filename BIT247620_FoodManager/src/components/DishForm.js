import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FIELDS } from '../foodData';
import { validateDish } from '../foodRepository';
import { translate } from '../translations';
import { colors } from '../theme';
import { ActionButton, ChoiceChip, FormField, primitiveStyles } from './Primitives';

export default function DishForm({ dish, categories, dishes, language, onClose, onSave }) {
  const text = (key) => translate(language, key);
  const [name, setName] = useState(dish?.[FIELDS.name] ?? '');
  const [description, setDescription] = useState(dish?.[FIELDS.description] ?? '');
  const [price, setPrice] = useState(dish ? String(dish[FIELDS.price]) : '');
  const [preparationTime, setPreparationTime] = useState(dish ? String(dish[FIELDS.preparationTime]) : '');
  const [categoryId, setCategoryId] = useState(dish?.[FIELDS.categoryId] ?? categories[0]?.[FIELDS.id] ?? '');
  const [isAvailable, setIsAvailable] = useState(dish?.[FIELDS.isAvailable] ?? true);
  const [images, setImages] = useState(dish?.[FIELDS.images]?.map((image) => ({ ...image })) ?? []);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [error, setError] = useState('');
  const pendingUrl = newImageUrl.trim();

  function addImage() {
    const url = newImageUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      setError(text('validationImageUrl'));
      return;
    }
    setImages((current) => [...current, { [FIELDS.imageUrl]: url, [FIELDS.isThumbnail]: current.length === 0 }]);
    setNewImageUrl('');
    setError('');
  }

  function submit() {
    if (pendingUrl && !/^https?:\/\//i.test(pendingUrl)) {
      setError(text('validationImageUrl'));
      return;
    }
    const submittedImages = pendingUrl
      ? [...images, { [FIELDS.imageUrl]: pendingUrl, [FIELDS.isThumbnail]: images.length === 0 }]
      : images;
    const input = { name, description, price, preparationTime, categoryId, isAvailable, images: submittedImages };
    const validation = validateDish(input, categories, dishes, dish?.[FIELDS.id], text);
    if (validation) {
      setError(validation);
      return;
    }
    setError('');
    void onSave(input, dish?.[FIELDS.id]);
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={primitiveStyles.modal}>
        <ScrollView contentContainerStyle={primitiveStyles.modalContent} keyboardShouldPersistTaps="handled">
          <View style={primitiveStyles.modalHeader}><Pressable onPress={onClose}><Text style={primitiveStyles.backText}>‹  {text('cancel')}</Text></Pressable><Text style={styles.eyebrow}>{dish ? text('edit') : text('addDish')}</Text></View>
          <Text style={primitiveStyles.title}>{dish ? text('edit') : text('addDish')}</Text>
          <View style={styles.formTop}>
            <FormField label={text('name')} value={name} onChangeText={setName} placeholder={text('dishNamePlaceholder')} />
            <View style={styles.row}><View style={styles.half}><FormField label={text('price')} value={price} onChangeText={setPrice} placeholder="85000" keyboardType="numeric" /></View><View style={styles.half}><FormField label={text('preparationTime')} value={preparationTime} onChangeText={setPreparationTime} placeholder="15" keyboardType="numeric" /></View></View>
            <FormField label={text('description')} value={description} onChangeText={setDescription} placeholder={text('descriptionPlaceholder')} multiline />
          </View>

          <Text style={styles.label}>{text('category')}</Text>
          {categories.length === 0 ? <Text style={styles.noCategory}>{text('noCategories')}</Text> : <View style={styles.choices}>{categories.map((category) => <ChoiceChip key={category[FIELDS.id]} label={category[FIELDS.name]} selected={categoryId === category[FIELDS.id]} onPress={() => setCategoryId(category[FIELDS.id])} />)}</View>}

          <View style={styles.switchRow}><View style={styles.switchCopy}><Text style={styles.label}>{text('status')}</Text><Text style={styles.switchValue}>{isAvailable ? text('available') : text('unavailable')}</Text></View><Switch value={isAvailable} onValueChange={setIsAvailable} trackColor={{ false: '#c6ceca', true: colors.green }} thumbColor={colors.white} /></View>

          <Text style={styles.label}>{text('images')}</Text>
          <Text style={styles.imageHint}>{text('imageHint')}</Text>
          <View style={styles.imageInputRow}><View style={styles.imageField}><FormField label={text('imageUrl')} value={newImageUrl} onChangeText={setNewImageUrl} placeholder="https://example.com/photo.jpg" autoCapitalize="none" /></View><ActionButton label={text('addImage')} onPress={addImage} variant="soft" compact /></View>
          {pendingUrl && /^https?:\/\//i.test(pendingUrl) ? <View style={styles.pendingPreview}><PhotoThumbnail uri={pendingUrl} /><Text style={styles.previewLabel}>{text('imagePreview')}</Text></View> : null}
          {images.map((image, index) => <View key={`${image[FIELDS.imageUrl]}-${index}`} style={styles.imageRow}>
            <PhotoThumbnail uri={image[FIELDS.imageUrl]} />
            <View style={styles.imageCopy}><Text style={styles.imageUrl} numberOfLines={1}>{image[FIELDS.imageUrl]}</Text>{image[FIELDS.isThumbnail] ? <Text style={styles.cover}>{text('thumbnail')}</Text> : null}</View>
            <Pressable onPress={() => setImages((current) => current.map((item, itemIndex) => ({ ...item, [FIELDS.isThumbnail]: itemIndex === index })))}><Text style={styles.actionText}>{text('markCover')}</Text></Pressable>
            <Pressable onPress={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index).map((item, itemIndex) => ({ ...item, [FIELDS.isThumbnail]: itemIndex === 0 })))}><Text style={styles.removeText}>×</Text></Pressable>
          </View>)}

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}><ActionButton label={text('cancel')} onPress={onClose} variant="ghost" /><ActionButton label={text('save')} onPress={submit} /></View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function PhotoThumbnail({ uri }) {
  const [failed, setFailed] = useState(false);
  return failed
    ? <View style={styles.brokenImage}><Text style={styles.brokenImageText}>×</Text></View>
    : <Image source={{ uri }} style={styles.photoThumbnail} resizeMode="cover" onError={() => setFailed(true)} />;
}

const styles = StyleSheet.create({
  eyebrow: { color: colors.green, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  formTop: { marginTop: 22 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1, minWidth: 0 },
  label: { color: colors.ink, fontSize: 12, fontWeight: '700', marginBottom: 8 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 18 },
  noCategory: { color: colors.coral, fontSize: 13, marginBottom: 18 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.line, borderBottomWidth: 1, borderBottomColor: colors.line, marginBottom: 20 },
  switchCopy: { gap: 3 },
  switchValue: { color: colors.muted, fontSize: 12 },
  imageHint: { color: colors.muted, fontSize: 12, lineHeight: 18, marginBottom: 12 },
  imageInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  imageField: { flex: 1, minWidth: 0 },
  imageRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48, borderBottomWidth: 1, borderBottomColor: colors.line },
  pendingPreview: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  previewLabel: { color: colors.muted, fontSize: 11 },
  photoThumbnail: { width: 44, height: 44, borderRadius: 7, backgroundColor: colors.greenSoft },
  brokenImage: { width: 44, height: 44, borderRadius: 7, backgroundColor: colors.coralSoft, alignItems: 'center', justifyContent: 'center' },
  brokenImageText: { color: colors.coral, fontSize: 20, fontWeight: '700' },
  imageCopy: { flex: 1, minWidth: 0 },
  imageUrl: { color: colors.ink, fontSize: 11 },
  cover: { color: colors.green, fontSize: 10, fontWeight: '700', marginTop: 2 },
  actionText: { color: colors.green, fontSize: 10, fontWeight: '700' },
  removeText: { color: colors.coral, fontSize: 22, paddingHorizontal: 3 },
  error: { color: colors.coral, fontSize: 13, lineHeight: 19, marginTop: 12 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 22 },
});