import { Stack } from 'expo-router';
import { ShoppingProvider } from '../context/shoppingcontext';

export default function RootLayout() {
  return (
    <ShoppingProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ShoppingProvider>
  );
}