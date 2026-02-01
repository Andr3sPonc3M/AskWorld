import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Datos del Onboarding - 4 pantallas
const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Bienvenido a AuthApp',
    subtitle: 'La aplicación más segura para gestionar tus cuentas y autenticación.',
    icon: '🔐',
    backgroundColor: '#4F46E5',
  },
  {
    id: '2',
    title: 'Seguridad Total',
    subtitle: 'Protegemos tus datos con encriptación avanzada y autenticación de dos factores.',
    icon: '🛡️',
    backgroundColor: '#059669',
  },
  {
    id: '3',
    title: 'Control Total',
    subtitle: 'Gestiona tus sesiones, revisa accesos y mantén tu cuenta siempre segura.',
    icon: '📊',
    backgroundColor: '#0284C7',
  },
  {
    id: '4',
    title: '¡Comienza Ahora!',
    subtitle: 'Crea tu cuenta en minutos y experimenta la seguridad redefinida.',
    icon: '🚀',
    backgroundColor: '#7C3AED',
  },
];

// Componente de cada slide del onboarding
const OnboardingSlide = ({ item, isActive }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isActive ? 1 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [isActive, animatedValue]);

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <View style={[styles.slideContainer, { backgroundColor: item.backgroundColor }]}>
      <Animated.View style={[styles.iconContainer, { transform: [{ scale }], opacity }]}>
        <Text style={styles.slideIcon}>{item.icon}</Text>
      </Animated.View>

      <Animated.View style={[styles.textContainer, { opacity }]}>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
      </Animated.View>
    </View>
  );
};

// Componente del indicador de página (puntos)
const PaginationIndicator = ({ data, currentIndex, onDotPress }) => {
  return (
    <View style={styles.paginationContainer}>
      {data.map((item, index) => {
        const isActive = index === currentIndex;
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.dotTouchable}
            onPress={() => onDotPress(index)}
            accessibilityLabel={`Ir a slide ${index + 1}`}
            accessibilityRole="button"
          >
            <View
              style={[
                styles.dot,
                isActive ? styles.dotActive : styles.dotInactive,
              ]}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// Componente de los botones de navegación
const NavigationButtons = ({
  currentIndex,
  totalSlides,
  onNext,
  onSkip,
  onFinish,
  isLastSlide,
}) => {
  return (
    <View style={styles.navigationContainer}>
      <TouchableOpacity
        style={styles.skipButton}
        onPress={onSkip}
        accessibilityLabel="Omitir onboarding"
        accessibilityRole="button"
      >
        <Text style={styles.skipButtonText}>Omitir</Text>
      </TouchableOpacity>

      {isLastSlide ? (
        <TouchableOpacity
          style={styles.finishButton}
          onPress={onFinish}
          accessibilityLabel="Finalizar y crear cuenta"
          accessibilityRole="button"
        >
          <Text style={styles.finishButtonText}>Crear Cuenta</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.nextButton}
          onPress={onNext}
          accessibilityLabel="Siguiente slide"
          accessibilityRole="button"
        >
          <Text style={styles.nextButtonText}>Siguiente</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Verificar si es la primera vez que se abre la app
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        if (hasSeenOnboarding === 'true') {
          // Si ya vio el onboarding, navegar directamente a Auth
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      } catch (error) {
        console.error('Error verificando estado de onboarding:', error);
      }
    };

    checkOnboardingStatus();
  }, [navigation]);

  // Manejar el scroll para actualizar el índice actual
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  // Navegar al siguiente slide
  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  // Saltar onboarding
  const handleSkip = () => {
    completeOnboarding();
  };

  // Finalizar onboarding
  const handleFinish = () => {
    completeOnboarding();
  };

  // Completar onboarding y navegar
  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error guardando estado de onboarding:', error);
      // Navegar de todas formas aunque haya error
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  // Ir a un slide específico al presionar un punto
  const handleDotPress = (index) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
  };

  // Actualizar índice cuando cambia el slide
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

      <View style={styles.header}>
        <Text style={styles.logoText}>AuthApp</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={({ item, index }) => (
          <OnboardingSlide
            item={item}
            isActive={index === currentIndex}
          />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        onViewableItemsChanged={onViewableItemsChanged}
        accessibilityLabel="Carrusel de bienvenida"
      />

      <PaginationIndicator
        data={ONBOARDING_DATA}
        currentIndex={currentIndex}
        onDotPress={handleDotPress}
      />

      <NavigationButtons
        currentIndex={currentIndex}
        totalSlides={ONBOARDING_DATA.length}
        onNext={handleNext}
        onSkip={handleSkip}
        onFinish={handleFinish}
        isLastSlide={currentIndex === ONBOARDING_DATA.length - 1}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'flex-end',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4F46E5',
  },
  slideContainer: {
    width: width,
    height: height * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  slideIcon: {
    fontSize: 70,
  },
  textContainer: {
    alignItems: 'center',
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  slideSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  dotTouchable: {
    padding: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: '#4F46E5',
    width: 30,
  },
  dotInactive: {
    backgroundColor: '#D1D5DB',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  finishButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  finishButtonText: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '600',
  },
});

export default OnboardingScreen;
