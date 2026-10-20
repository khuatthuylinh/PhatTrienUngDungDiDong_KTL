import { Alert, Platform } from 'react-native';

export function showMessage(title: string, body: string) {
  if (Platform.OS === 'web') {
    globalThis.alert(`${title}\n\n${body}`);
  } else {
    Alert.alert(title, body);
  }
}

export function confirmAction(title: string, body: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm(`${title}\n\n${body}`)) onConfirm();
    return;
  }

  Alert.alert(title, body, [
    { text: 'Hủy', style: 'cancel' },
    { text: 'Xóa', style: 'destructive', onPress: onConfirm },
  ]);
}