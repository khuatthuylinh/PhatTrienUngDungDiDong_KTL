import { Alert, Platform } from 'react-native';

export function showPlatformAlert(title: string, message: string) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.alert(`${title}\n\n${message}`);
    }
    return;
  }

  Alert.alert(title, message);
}

export function confirmPlatformAction(
  title: string,
  message: string,
  cancelText: string,
  confirmText: string,
): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(
      typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`),
    );
  }

  return new Promise((resolve) => {
    let settled = false;
    const settle = (confirmed: boolean) => {
      if (settled) return;
      settled = true;
      resolve(confirmed);
    };

    Alert.alert(
      title,
      message,
      [
        { text: cancelText, style: 'cancel', onPress: () => settle(false) },
        { text: confirmText, onPress: () => settle(true) },
      ],
      { cancelable: true, onDismiss: () => settle(false) },
    );
  });
}