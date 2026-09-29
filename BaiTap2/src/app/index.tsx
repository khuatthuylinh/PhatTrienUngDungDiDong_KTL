import React from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { Stack } from 'expo-router';

class StudentInfo {
  constructor(public name = '', public studentId = '') {}
}

export default function HomeScreen() {
  const [showScreen2, setShowScreen2] = React.useState(false);
  const [studentInfo, setStudentInfo] = React.useState(() => new StudentInfo());
  const [validationError, setValidationError] = React.useState('');

  const handleContinue = () => {
    if (!studentInfo.name.trim() || !studentInfo.studentId.trim()) {
      setValidationError('Vui lòng nhập đầy đủ họ tên và MSSV.');
      return;
    }

    setValidationError('');
    setShowScreen2(true);
  };

  if (showScreen2) {
    return (
      <SafeAreaView style={styles.screen2}>
        <Pressable style={styles.backButton} onPress={() => setShowScreen2(false)}>
          <Image source={require('../../assets/images/tabIcons/left-arrow.png')} style={styles.backIcon} />
        </Pressable>
        <Text style={styles.screen2Text}>Họ và tên - MSSV</Text>
        <Text style={styles.studentInfoText}>{studentInfo.name}</Text>
        <Text style={styles.studentInfoText}>{studentInfo.studentId}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.content}>

        <View style={[styles.box, styles.box1]}>
          <Text style={styles.text}>1</Text>
        </View>

        <View style={[styles.box, styles.box2]}>
          <Text style={styles.text}>2</Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.box, styles.boxVertical, styles.box3]}>
            <Text style={styles.text3}>3</Text>
          </View>
          <View style={[styles.box, styles.boxVertical, styles.box4]}>
            <Text style={styles.text}>4</Text>
          </View>
          <View style={[styles.box, styles.boxVertical, styles.box5]}>
            <Text style={styles.text}>5</Text>
          </View>

          <View style={styles.emptySpace} />
        </View>

        <View style={[styles.box, styles.box6]}>
          <Text style={styles.text}>6</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.formTitle}>Nhập thông tin Sinh viên</Text>
        <TextInput
          style={styles.input}
          placeholder="Họ và tên"
          placeholderTextColor="#9ca3af"
          value={studentInfo.name}
          onChangeText={(name) => {
            setValidationError('');
            setStudentInfo((current) => new StudentInfo(name, current.studentId))
          }}
        />
        <TextInput
          style={styles.input}
          placeholder="Mã số sinh viên"
          placeholderTextColor="#9ca3af"
          value={studentInfo.studentId}
          onChangeText={(studentId) => {
            setValidationError('');
            setStudentInfo((current) => new StudentInfo(current.name, studentId))
          }}
        />
        {validationError ? <Text style={styles.errorText}>{validationError}</Text> : null}
      </View>

      <Pressable
        style={styles.button}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>Click Me</Text>
      </Pressable>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen2: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    padding: 8,
  },
  backIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  screen2Text: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  studentInfoText: {
    marginTop: 8,
    fontSize: 25,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 8,
    justifyContent: 'space-between',
  },
  content: {
    gap: 8,
  },
  box: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  text3: {
    color: '#090909',
    fontSize: 40,
    fontWeight: 'bold',
  },
  box1: {
    height: 90,
    backgroundColor: '#1e88e5',
  },
  box2: {
    height: 90,
    backgroundColor: '#ff3d3d',
  },
  row: {
    flexDirection: 'row',
    height: 180,
    gap: 8,
  },
  boxVertical: {
    flex: 1,
  },
  box3: {
    backgroundColor: '#ffc107',
  },
  box4: {
    backgroundColor: '#2e7d32',
  },
  box5: {
    backgroundColor: '#7b1fa2',
  },
  emptySpace: {
    flex: 1,
  },
  box6: {
    height: 150,
    backgroundColor: '#ff6d00',
  },
  footer: {
    gap: 8,
  },
  formTitle: {
    color: '#1565c0',
    fontSize: 25,
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#1e88e5',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  errorText: {
    color: '#c62828',
    fontSize: 15,
  },
  button: {
    alignSelf: 'center',
    backgroundColor: '#1e88e5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
