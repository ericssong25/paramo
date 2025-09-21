import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface BusinessWallet {
  id: string;
  name: string;
  display_name: string;
  currency: string;
  current_balance: number;
  is_active: boolean;
  color_code: string;
  icon_name: string;
  created_at: string;
  updated_at: string;
}

export const useBusinessWallets = () => {
  const [wallets, setWallets] = useState<BusinessWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('business_wallets')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (supabaseError) {
        throw supabaseError;
      }

      setWallets(data || []);
    } catch (err: any) {
      console.error('Error fetching business wallets:', err);
      setError(err.message || 'Error al cargar wallets');
    } finally {
      setLoading(false);
    }
  };

  const updateWalletBalance = async (walletId: string, newBalance: number) => {
    try {
      const { error } = await supabase
        .from('business_wallets')
        .update({ 
          current_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', walletId);

      if (error) throw error;

      // Actualizar el estado local
      setWallets(prev => 
        prev.map(wallet => 
          wallet.id === walletId 
            ? { ...wallet, current_balance: newBalance }
            : wallet
        )
      );
    } catch (err: any) {
      console.error('Error updating wallet balance:', err);
      throw err;
    }
  };

  const getTotalUSDBalance = () => {
    return wallets
      .filter(wallet => wallet.currency === 'USD')
      .reduce((total, wallet) => total + wallet.current_balance, 0);
  };

  const getWalletById = (id: string) => {
    return wallets.find(wallet => wallet.id === id);
  };

  const getWalletByName = (name: string) => {
    return wallets.find(wallet => wallet.name === name);
  };

  const getWalletDisplayName = (walletId: string) => {
    const wallet = wallets.find(wallet => wallet.id === walletId);
    return wallet ? wallet.display_name : walletId;
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  return {
    wallets,
    loading,
    error,
    fetchWallets,
    updateWalletBalance,
    getTotalUSDBalance,
    getWalletById,
    getWalletByName,
    getWalletDisplayName,
  };
};
