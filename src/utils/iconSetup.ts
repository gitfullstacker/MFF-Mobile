import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

// Preload icon fonts
export const setupIcons = async () => {
  try {
    await FeatherIcon.loadFont();
    await MaterialIcon.loadFont();
    console.log('Icons loaded successfully');
  } catch (error) {
    console.error('Error loading icon fonts:', error);
  }
};
