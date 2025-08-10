import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Subscription, SupabaseSubscription } from '../types';

// Convertir datos de Supabase a tipo Subscription
const convertSupabaseSubscriptionToSubscription = (supabaseSubscription: SupabaseSubscription): Subscription => {
  return {
    id: supabaseSubscription.id,
    serviceName: supabaseSubscription.service_name,
    subscriptionType: supabaseSubscription.subscription_type,
    currency: supabaseSubscription.currency,
    status: supabaseSubscription.status,
    lastRenewalDate: new Date(supabaseSubscription.last_renewal_date),
    nextDueDate: new Date(supabaseSubscription.next_due_date),
    paymentMethod: supabaseSubscription.payment_method,
    responsible: {
      id: supabaseSubscription.responsible_id || '',
      name: supabaseSubscription.responsible_id ? 'Usuario' : 'Sin asignar',
      email: '',
      avatar: '',
      role: 'member'
    },
    notes: supabaseSubscription.notes || undefined,
    alerts: supabaseSubscription.alerts,
    managementUrl: supabaseSubscription.management_url || undefined,
    accessCredentials: supabaseSubscription.access_credentials ? {
      username: supabaseSubscription.access_credentials.username || '',
      password: supabaseSubscription.access_credentials.password || undefined
    } : undefined,
    cost: Number(supabaseSubscription.cost),
    projectId: supabaseSubscription.project_id || undefined,
    createdAt: new Date(supabaseSubscription.created_at),
    updatedAt: new Date(supabaseSubscription.updated_at),
  };
};

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Cargar todas las suscripciones
  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const convertedSubscriptions = data?.map((item: any) => {
        return convertSupabaseSubscriptionToSubscription(item);
      }) || [];

      setSubscriptions(convertedSubscriptions);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error fetching subscriptions'));
      console.error('Error fetching subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva suscripción
  const createSubscription = async (subscriptionData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);

      const { data, error: createError } = await supabase
        .from('subscriptions')
        .insert({
          service_name: subscriptionData.serviceName,
          subscription_type: subscriptionData.subscriptionType,
          currency: subscriptionData.currency,
          status: subscriptionData.status,
          last_renewal_date: subscriptionData.lastRenewalDate.toISOString().split('T')[0],
          next_due_date: subscriptionData.nextDueDate.toISOString().split('T')[0],
          payment_method: subscriptionData.paymentMethod,
          responsible_id: subscriptionData.responsible.id,
          notes: subscriptionData.notes,
          alerts: subscriptionData.alerts,
          management_url: subscriptionData.managementUrl,
          access_credentials: subscriptionData.accessCredentials ? {
            username: subscriptionData.accessCredentials.username,
            password: subscriptionData.accessCredentials.password
          } : null,
          cost: subscriptionData.cost,
          project_id: subscriptionData.projectId,
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Recargar suscripciones para obtener datos actualizados
      await fetchSubscriptions();

      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error creating subscription'));
      console.error('Error creating subscription:', err);
      throw err;
    }
  };

  // Actualizar suscripción
  const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
    try {
      setError(null);

      const updateData: any = {};
      
      if (updates.serviceName !== undefined) updateData.service_name = updates.serviceName;
      if (updates.subscriptionType !== undefined) updateData.subscription_type = updates.subscriptionType;
      if (updates.currency !== undefined) updateData.currency = updates.currency;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.lastRenewalDate !== undefined) updateData.last_renewal_date = updates.lastRenewalDate.toISOString().split('T')[0];
      if (updates.nextDueDate !== undefined) updateData.next_due_date = updates.nextDueDate.toISOString().split('T')[0];
      if (updates.paymentMethod !== undefined) updateData.payment_method = updates.paymentMethod;
      if (updates.responsible !== undefined) updateData.responsible_id = updates.responsible.id;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.alerts !== undefined) updateData.alerts = updates.alerts;
      if (updates.managementUrl !== undefined) updateData.management_url = updates.managementUrl;
      if (updates.accessCredentials !== undefined) {
        updateData.access_credentials = {
          username: updates.accessCredentials.username,
          password: updates.accessCredentials.password
        };
      }
      if (updates.cost !== undefined) updateData.cost = updates.cost;
      if (updates.projectId !== undefined) updateData.project_id = updates.projectId;

      const { data, error: updateError } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Actualizar estado local
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === id 
            ? convertSupabaseSubscriptionToSubscription(data)
            : sub
        )
      );

      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error updating subscription'));
      console.error('Error updating subscription:', err);
      throw err;
    }
  };

  // Eliminar suscripción
  const deleteSubscription = async (id: string) => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      // Actualizar estado local
      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error deleting subscription'));
      console.error('Error deleting subscription:', err);
      throw err;
    }
  };

  // Obtener suscripción por ID
  const getSubscriptionById = async (id: string) => {
    try {
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      return convertSupabaseSubscriptionToSubscription(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error fetching subscription'));
      console.error('Error fetching subscription:', err);
      throw err;
    }
  };

  // Obtener suscripciones por estado
  const getSubscriptionsByStatus = (status: string) => {
    return subscriptions.filter(sub => sub.status === status);
  };

  // Obtener suscripciones próximas a vencer
  const getUpcomingSubscriptions = (daysAhead: number = 30) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    return subscriptions.filter(sub => {
      const dueDate = new Date(sub.nextDueDate);
      return sub.status === 'active' && dueDate >= today && dueDate <= futureDate;
    }).sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  };

  // Obtener suscripciones vencidas
  const getOverdueSubscriptions = () => {
    const today = new Date();
    return subscriptions.filter(sub => {
      const dueDate = new Date(sub.nextDueDate);
      return sub.status === 'active' && dueDate < today;
    });
  };

  // Cargar suscripciones al montar el hook
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return {
    subscriptions,
    loading,
    error,
    fetchSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    getSubscriptionById,
    getSubscriptionsByStatus,
    getUpcomingSubscriptions,
    getOverdueSubscriptions,
  };
};
