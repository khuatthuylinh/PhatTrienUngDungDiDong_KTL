import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FIELDS } from '../foodData';
import { translate } from '../translations';
import { colors } from '../theme';
import { ActionButton, FormField, primitiveStyles } from './Primitives';

export default function CategoryForm({ category, language, onClose, onSave }) {
  const text = (key) => translate(language, key);
  const [name, setName] = useState(category?.[FIELDS.name] ?? '');
  const [description, setDescription] = useState(category?.[FIELDS.description] ?? '');
  const [error, setError] = useState('');

  function submit() {
    if (!name.trim() || !description.trim()) {
      setError(text(name.trim() ? 'validationDescription' : 'validationName'));
      return;
    }
    setError('');
    void onSave({ name, description }, category?.[FIELDS.id]);
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={primitiveStyles.modal}>
        <ScrollView contentContainerStyle={primitiveStyles.modalContent} keyboardShouldPersistTaps="handled">
          <View style={primitiveStyles.modalHeader}><Pressable onPress={onClose}><Text style={primitiveStyles.backText}>‹  {text('cancel')}</Text></Pressable><Text style={styles.eyebrow}>{text(category ? 'editCategory' : 'addCategory')}</Text></View>
          <Text style={primitiveStyles.title}>{text(category ? 'editCategory' : 'addCategory')}</Text>
          <View style={styles.form}><FormField label={text('categoryName')} value={name} onChangeText={setName} placeholder={text('categoryNamePlaceholder')} /><FormField label={text('categoryDescription')} value={description} onChangeText={setDescription} placeholder={text('descriptionPlaceholder')} multiline /></View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}><ActionButton label={text('cancel')} onPress={onClose} variant="ghost" /><ActionButton label={text('saveCategory')} onPress={submit} /></View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  eyebrow: { color: colors.green, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  form: { marginTop: 22 },
  error: { color: colors.coral, fontSize: 13, lineHeight: 19, marginTop: 12 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 20 },
});