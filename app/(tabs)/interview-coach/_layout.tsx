import { Stack } from 'expo-router';

export default function InterviewCoachLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="setup" />
      <Stack.Screen name="session" />
      <Stack.Screen name="complete" />
      <Stack.Screen name="results" />
    </Stack>
  );
}
