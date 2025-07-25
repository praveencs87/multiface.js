// Type declarations for React Native AsyncStorage dependency
// These are stub declarations to enable building without actual dependencies

declare module '@react-native-async-storage/async-storage' {
  interface AsyncStorageStatic {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    multiGet(keys: string[]): Promise<[string, string | null][]>;
    multiSet(keyValuePairs: [string, string][]): Promise<void>;
    multiRemove(keys: string[]): Promise<void>;
    clear(): Promise<void>;
    getAllKeys(): Promise<string[]>;
  }

  const AsyncStorage: AsyncStorageStatic;
  export default AsyncStorage;
}
