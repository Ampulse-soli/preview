"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Hotel } from '../lib/supabase';
import { useNotifications } from './useNotifications';

export interface EstablishmentFormData {
  nom: string;
  adresse: string;
  ville: string;
  code_postal: string;
  telephone?: string;
  email?: string;
  gestionnaire?: string;
  statut: 'ACTIF' | 'INACTIF';
  siret?: string;
  tva_intracommunautaire?: string;
  directeur?: string;
  telephone_directeur?: string;
  email_directeur?: string;
  capacite?: number;
  categories?: string[];
  services?: string[];
  horaires?: any;
}

export const useEstablishments = () => {
  const [establishments, setEstablishments] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  // Récupérer tous les établissements
  const fetchEstablishments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .order('nom', { ascending: true });

      if (error) {
        throw error;
      }

      setEstablishments(data || []);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des établissements:', err);
      setError(err.message);
      addNotification('warning', 'Erreur lors de la récupération des établissements');
    } finally {
      setLoading(false);
    }
  };

  // Récupérer un établissement par ID
  const fetchEstablishmentById = async (id: number): Promise<Hotel | null> => {
    try {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (err: any) {
      console.error('Erreur lors de la récupération de l\'établissement:', err);
      addNotification('warning', 'Erreur lors de la récupération de l\'établissement');
      return null;
    }
  };

  // Créer un nouvel établissement
  const createEstablishment = async (formData: EstablishmentFormData): Promise<Hotel | null> => {
    try {
      const { data, error } = await supabase
        .from('hotels')
        .insert([{
          ...formData,
          chambres_total: 0,
          chambres_occupees: 0,
          taux_occupation: 0
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Mettre à jour la liste locale
      setEstablishments(prev => [...prev, data]);

      addNotification('success', 'Établissement créé avec succès');

      return data;
    } catch (err: any) {
      console.error('Erreur lors de la création de l\'établissement:', err);
      addNotification('warning', 'Erreur lors de la création de l\'établissement');
      return null;
    }
  };

  // Mettre à jour un établissement
  const updateEstablishment = async (id: number, formData: Partial<EstablishmentFormData>): Promise<Hotel | null> => {
    try {
      const { data, error } = await supabase
        .from('hotels')
        .update(formData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Mettre à jour la liste locale
      setEstablishments(prev => 
        prev.map(est => est.id === id ? data : est)
      );

      addNotification('success', 'Établissement mis à jour avec succès');

      return data;
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour de l\'établissement:', err);
      addNotification('warning', 'Erreur lors de la mise à jour de l\'établissement');
      return null;
    }
  };

  // Supprimer un établissement
  const deleteEstablishment = async (id: number): Promise<boolean> => {
    try {
      // Vérifier d'abord s'il y a des réservations actives
      const { data: reservations, error: reservationError } = await supabase
        .from('reservations')
        .select('id')
        .eq('hotel_id', id)
        .in('statut', ['CONFIRMEE', 'EN_COURS']);

      if (reservationError) {
        throw reservationError;
      }

      if (reservations && reservations.length > 0) {
        addNotification('warning', 'Impossible de supprimer un établissement avec des réservations actives');
        return false;
      }

      const { error } = await supabase
        .from('hotels')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Mettre à jour la liste locale
      setEstablishments(prev => prev.filter(est => est.id !== id));

      addNotification('success', 'Établissement supprimé avec succès');

      return true;
    } catch (err: any) {
      console.error('Erreur lors de la suppression de l\'établissement:', err);
      addNotification('warning', 'Erreur lors de la suppression de l\'établissement');
      return false;
    }
  };

  // Recherche et filtrage
  const searchEstablishments = (query: string, status?: string) => {
    let filtered = establishments;

    if (query) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(est => 
        est.nom.toLowerCase().includes(searchTerm) ||
        est.ville.toLowerCase().includes(searchTerm) ||
        est.adresse.toLowerCase().includes(searchTerm) ||
        (est.gestionnaire && est.gestionnaire.toLowerCase().includes(searchTerm))
      );
    }

    if (status && status !== 'all') {
      filtered = filtered.filter(est => est.statut === status);
    }

    return filtered;
  };

  // Statistiques des établissements
  const getEstablishmentStats = () => {
    const total = establishments.length;
    const actifs = establishments.filter(est => est.statut === 'ACTIF').length;
    const inactifs = establishments.filter(est => est.statut === 'INACTIF').length;
    const totalChambres = establishments.reduce((sum, est) => sum + (est.chambres_total || 0), 0);
    const tauxOccupationMoyen = total > 0 
      ? establishments.reduce((sum, est) => sum + (est.taux_occupation || 0), 0) / total 
      : 0;

    return {
      total,
      actifs,
      inactifs,
      totalChambres,
      tauxOccupationMoyen: Math.round(tauxOccupationMoyen * 100) / 100
    };
  };

  // Mettre à jour les statistiques d'un établissement
  const updateEstablishmentStats = async (id: number) => {
    try {
      // Récupérer le nombre total de chambres
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('id, statut')
        .eq('hotel_id', id);

      if (roomsError) {
        throw roomsError;
      }

      const chambres_total = rooms ? rooms.length : 0;
      const chambres_occupees = rooms ? rooms.filter(room => room.statut === 'occupee').length : 0;
      const taux_occupation = chambres_total > 0 ? (chambres_occupees / chambres_total) * 100 : 0;

      // Mettre à jour les statistiques
      await updateEstablishment(id, {
        chambres_total,
        chambres_occupees,
        taux_occupation: Math.round(taux_occupation * 100) / 100
      });

    } catch (err: any) {
      console.error('Erreur lors de la mise à jour des statistiques:', err);
    }
  };

  // Configuration de la réactivité en temps réel
  useEffect(() => {
    fetchEstablishments();

    // Écouter les changements en temps réel
    const subscription = supabase
      .channel('hotels_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'hotels' },
        (payload) => {
          console.log('Changement détecté dans les établissements:', payload);
          fetchEstablishments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    establishments,
    loading,
    error,
    fetchEstablishments,
    fetchEstablishmentById,
    createEstablishment,
    updateEstablishment,
    deleteEstablishment,
    searchEstablishments,
    getEstablishmentStats,
    updateEstablishmentStats
  };
};