import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 Hook useAuth: Inicializando...');
    
    // Obtener sesión actual
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('📡 Sesión actual:', { session, error });
        
        if (error) {
          console.error('❌ Error al obtener sesión:', error);
        }
        
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('❌ Error general al obtener sesión:', err);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Cambio de estado de autenticación:', { event, session });
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      console.log('🚪 Cerrando sesión...');
      
      // Limpiar estado local inmediatamente
      setUser(null);
      setLoading(false);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Error al cerrar sesión:', error);
        throw error;
      }
      
      console.log('✅ Sesión cerrada exitosamente');
      
      // Forzar recarga de la página en producción para limpiar completamente el estado
      if (import.meta.env.PROD) {
        window.location.href = '/';
      }
    } catch (err) {
      console.error('❌ Error general al cerrar sesión:', err);
      throw err;
    }
  };

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user
  };
};
