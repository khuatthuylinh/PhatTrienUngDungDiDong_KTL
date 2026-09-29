import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'; 
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { Stack } from 'expo-router';

export default function HomeScreen() {
  const [showScreen2, setShowScreen2] = React.useState(false);

  if (showScreen2) {
    return (
      <SafeAreaView style={styles.screen2}>
        <Pressable style={styles.backButton} onPress={() => setShowScreen2(false)}>
          <Image source={require('../../assets/images/tabIcons/left-arrow.png')} style={styles.backIcon} />
        </Pressable>
        <Text style={styles.screen2Text}>Sreen hi</Text>
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
        <Text style={styles.footerText}>Khuất Thùy Linh - BIT247620</Text>
      </View>

      <Pressable
        style={styles.button}
        onPress={() => setShowScreen2(true)}
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
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  screen2Text: {
    fontSize: 28,
    fontWeight: 'bold',
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
    alignItems: 'center',
    paddingBottom: 16,
  },
  footerText: {
    fontSize: 20,
    color: '#333',
    fontWeight: '500',
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



//generate a function component display a button on bottom-center of the screen with text "Click Me" and when clicked, it should show an alert with the message "Button Clicked!"

//when click "Click me", nó sẽ ra trang mới có dòng chữ "Sreen 2" ở giữa màn hình và có nút quay lại để quay lại trang trước đó(dùng icon left-arrow.png).
