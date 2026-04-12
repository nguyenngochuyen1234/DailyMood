import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PIN_KEY = '@dailymood_security_pin';

interface SecurityContextType {
  pin: string | null;
  isEnabled: boolean;
  isLocked: boolean;
  setPinCode: (newPin: string) => Promise<void>;
  disablePinCode: () => Promise<void>;
  unlock: (enteredPin: string) => boolean;
  lock: () => void;
  loading: boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pin, setPin] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPin();
  }, []);

  const loadPin = async () => {
    try {
      const storedPin = await AsyncStorage.getItem(PIN_KEY);
      if (storedPin) {
        setPin(storedPin);
        setIsLocked(true);
      }
    } catch (e) {
      console.error('Error loading PIN', e);
    } finally {
      setLoading(false);
    }
  };

  const setPinCode = async (newPin: string) => {
    try {
      await AsyncStorage.setItem(PIN_KEY, newPin);
      setPin(newPin);
      setIsLocked(false); // Unlocked if just set
    } catch (e) {
      console.error('Error setting PIN', e);
      throw e;
    }
  };

  const disablePinCode = async () => {
    try {
      await AsyncStorage.removeItem(PIN_KEY);
      setPin(null);
      setIsLocked(false);
    } catch (e) {
      console.error('Error disabling PIN', e);
      throw e;
    }
  };

  const unlock = (enteredPin: string): boolean => {
    if (enteredPin === pin) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const lock = () => {
    if (pin) {
      setIsLocked(true);
    }
  };

  return (
    <SecurityContext.Provider
      value={{
        pin,
        isEnabled: !!pin,
        isLocked,
        setPinCode,
        disablePinCode,
        unlock,
        lock,
        loading
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
