import { useState, useCallback } from 'react';

interface UsePinSecurityReturn {
  isPinSet: boolean;
  isAuthenticated: boolean;
  setPin: (pin: string) => void;
  verifyPin: (pin: string) => boolean;
  clearPin: () => void;
  resetAuthentication: () => void;
}

export const usePinSecurity = (): UsePinSecurityReturn => {
  const [storedPin, setStoredPin] = useState<string>(() => {
    // Intentar obtener el PIN del localStorage
    const savedPin = localStorage.getItem('subscription_pin');
    return savedPin || '';
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setPin = useCallback((pin: string) => {
    if (pin.length >= 4) {
      setStoredPin(pin);
      localStorage.setItem('subscription_pin', pin);
      setIsAuthenticated(true);
    }
  }, []);

  const verifyPin = useCallback((pin: string): boolean => {
    if (storedPin && pin === storedPin) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, [storedPin]);

  const clearPin = useCallback(() => {
    setStoredPin('');
    setIsAuthenticated(false);
    localStorage.removeItem('subscription_pin');
  }, []);

  const resetAuthentication = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  return {
    isPinSet: storedPin.length > 0,
    isAuthenticated,
    setPin,
    verifyPin,
    clearPin,
    resetAuthentication
  };
};
