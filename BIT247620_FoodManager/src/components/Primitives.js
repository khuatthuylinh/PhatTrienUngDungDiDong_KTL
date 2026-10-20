import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '../theme';

export function ActionButton({ label, onPress, variant = 'primary', disabled = false, loading = false, compact = false }) {
  const buttonStyle = variant === 'primary' ? styles.primary : variant === 'danger' ? styles.danger : variant === 'soft' ? styles.soft : styles.ghost;
  const textStyle = variant === 'primary' || variant === 'danger' ? styles.lightText : styles.darkText;
  return (
    <Pressable onPress={onPress} disabled={disabled || loading} style={({ pressed }) => [styles.button, compact && styles.compactButton, buttonStyle, pressed && styles.pressed, (disabled || loading) && styles.disabled]}>
      {loading ? <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? colors.white : colors.green} /> : <Text style={[styles.buttonText, textStyle]}>{label}</Text>}
    </Pressable>
  );
}

export function FormField({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false, autoCapitalize = 'sentences', rightText, editable = true }) {
  return (
    <View style={styles.fieldWrap}>
      <View style={styles.fieldLabelRow}><Text style={styles.fieldLabel}>{label}</Text>{rightText ? <Text style={styles.fieldHint}>{rightText}</Text> : null}</View>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#98a19d" keyboardType={keyboardType} multiline={multiline} autoCapitalize={autoCapitalize} editable={editable} style={[styles.input, multiline && styles.multiline, !editable && styles.readOnly]} />
    </View>
  );
}

export function ChoiceChip({ label, selected, onPress, disabled = false }) {
  return <Pressable onPress={onPress} disabled={disabled} style={[styles.chip, selected && styles.chipSelected, disabled && styles.disabled]}><Text style={[styles.chipText, selected && styles.chipTextSelected]} numberOfLines={1}>{label}</Text></Pressable>;
}

export function SectionLabel({ children, right }) {
  return <View style={styles.sectionRow}><Text style={styles.sectionLabel}>{children}</Text>{right ? <Text style={styles.sectionRight}>{right}</Text> : null}</View>;
}

export function EmptyState({ title, detail, action, onAction }) {
  return <View style={styles.empty}><View style={styles.emptyMark} /><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyDetail}>{detail}</Text>{action ? <ActionButton label={action} onPress={onAction} compact /> : null}</View>;
}

export const primitiveStyles = StyleSheet.create({
  body: { color: colors.ink, fontSize: 15, lineHeight: 23 },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  modal: { flex: 1, backgroundColor: colors.background },
  modalContent: { flexGrow: 1, width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 18, paddingBottom: 38 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 },
  backText: { color: colors.green, fontSize: 14, fontWeight: '700' },
  title: { color: colors.ink, fontSize: 28, fontWeight: '800', lineHeight: 34 },
});

const styles = StyleSheet.create({
  button: { minHeight: 48, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  compactButton: { minHeight: 40, paddingHorizontal: 15 },
  primary: { backgroundColor: colors.green },
  danger: { backgroundColor: colors.coral },
  soft: { backgroundColor: colors.greenSoft },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.line },
  buttonText: { fontSize: 14, fontWeight: '700' },
  lightText: { color: colors.white },
  darkText: { color: colors.ink },
  pressed: { opacity: 0.78 },
  disabled: { opacity: 0.55 },
  fieldWrap: { marginBottom: 17 },
  fieldLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 },
  fieldLabel: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  fieldHint: { color: colors.muted, fontSize: 11 },
  input: { minHeight: 48, paddingHorizontal: 13, paddingVertical: 11, borderRadius: 10, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, color: colors.ink, fontSize: 14 },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  readOnly: { opacity: 0.65 },
  chip: { minHeight: 36, paddingHorizontal: 13, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  chipSelected: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  chipTextSelected: { color: colors.white },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionLabel: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  sectionRight: { color: colors.muted, fontSize: 11 },
  empty: { alignItems: 'center', justifyContent: 'center', minHeight: 240, paddingHorizontal: 28, gap: 10 },
  emptyMark: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.lime, marginBottom: 4 },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  emptyDetail: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center', marginBottom: 6 },
});