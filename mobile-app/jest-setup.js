// Mock definitivo para impedir que o runtime nativo do Expo (runtime.native) seja importado/executado no Jest
jest.mock('expo/src/winter/runtime.native', () => ({}), { virtual: true });
jest.mock('expo/src/winter/runtime.native.ts', () => ({}), { virtual: true });
jest.mock('expo/build/winter/runtime.native', () => ({}), { virtual: true });
jest.mock('expo/build/winter/runtime.native.js', () => ({}), { virtual: true });

// Mock de bibliotecas nativas e animações
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native-worklets', () => ({}));
