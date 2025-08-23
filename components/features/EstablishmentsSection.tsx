'use client';

import React, { useState, useEffect } from 'react';
import { establishmentsApi } from '@/lib/api/establishments';
import { useNotifications } from '@/hooks/useNotifications';
import { Plus, Building2, MapPin, Edit2, Trash2, Check } from 'lucide-react';
import type { Establishment } from '@/lib/api/establishments';

export default function EstablishmentsSection() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Establishment>>({});
  const [isEditing, setIsEditing] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadEstablishments();
  }, []);

  const loadEstablishments = async () => {
    try {
      setLoading(true);
      const response = await establishmentsApi.getEstablishments();
      if (response.success && response.data) {
        setEstablishments(response.data);
        if (response.data.length > 0 && !selectedEstablishment) {
          setSelectedEstablishment(response.data[0]);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      addNotification('error', 'Erreur lors du chargement des établissements');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEstablishment = (establishment: Establishment) => {
    setSelectedEstablishment(establishment);
    setShowForm(false);
  };

  const handleAddNew = () => {
    setFormData({
      nom: 'Hôtel Le Grand Paris',
      adresse: '123 Avenue des Champs-Élysées',
      ville: 'Paris',
      code_postal: '75008',
      telephone: '01 42 56 78 90',
      email: 'contact@hotelgrandparis.fr',
      gestionnaire: 'Jean Dupont',
      statut: 'ACTIF',
      chambres_total: 45,
      chambres_occupees: 32,
      taux_occupation: 71,
      siret: '12345678900012'  // SIRET sans espaces (14 caractères)
    });
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEdit = (establishment: Establishment) => {
    setFormData(establishment);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    console.log('Suppression de l\'établissement avec ID:', id);
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet établissement ?')) return;

    try {
      console.log('Appel API de suppression...');
      // Utiliser la suppression hard (true) pour vraiment supprimer
      const response = await establishmentsApi.deleteEstablishment(id, true);
      console.log('Réponse de suppression:', response);
      
      if (response.success) {
        addNotification('success', 'Établissement supprimé avec succès');
        await loadEstablishments();
        // Sélectionner un autre établissement si celui supprimé était sélectionné
        if (selectedEstablishment?.id === id) {
          const remainingEstablishments = establishments.filter(e => e.id !== id);
          setSelectedEstablishment(remainingEstablishments[0] || null);
        }
      } else {
        console.error('Erreur de l\'API:', response.error);
        addNotification('error', response.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      addNotification('error', 'Erreur lors de la suppression');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let response;
      if (isEditing && formData.id) {
        response = await establishmentsApi.updateEstablishment(formData.id, formData);
      } else {
        // Préparer les données pour la création
        const createData = {
          nom: formData.nom || '',
          adresse: formData.adresse || '',
          ville: formData.ville || '',
          code_postal: formData.code_postal || '',
          telephone: formData.telephone,
          email: formData.email,
          gestionnaire: formData.gestionnaire,
          statut: formData.statut || 'ACTIF',
          chambres_total: formData.chambres_total || 0,
          chambres_occupees: formData.chambres_occupees || 0,
          taux_occupation: formData.taux_occupation || 0,
          siret: formData.siret
          // Removed is_active and type_etablissement as they don't exist in the table
        };
        
        console.log('Création établissement avec les données:', createData);
        response = await establishmentsApi.createEstablishment(createData);
      }

      if (response.success) {
        addNotification(
          'success',
          isEditing ? 'Établissement modifié avec succès' : 'Établissement créé avec succès'
        );
        await loadEstablishments();
        setShowForm(false);
        if (response.data) {
          setSelectedEstablishment(response.data);
        }
      } else {
        console.error('Erreur de l\'API:', response.error);
        addNotification('error', response.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      addNotification('error', 'Erreur lors de la sauvegarde');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Paramètres d'établissement</h1>
        <p className="text-gray-600 mt-1">Configurez l'établissement sur lequel vous travaillez</p>
      </div>

      {/* Establishment Selection */}
      {!showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Établissement actuel</h2>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Ajouter un établissement
            </button>
          </div>

          <p className="text-gray-600 mb-4">Sélectionnez l'établissement sur lequel vous souhaitez travailler.</p>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : establishments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun établissement trouvé. Cliquez sur "Ajouter un établissement" pour commencer.
              </div>
            ) : (
              establishments.map((establishment) => (
                <div
                  key={establishment.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedEstablishment?.id === establishment.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSelectEstablishment(establishment)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`rounded-full h-4 w-4 mt-1 ${
                        selectedEstablishment?.id === establishment.id
                          ? 'bg-blue-600 border-4 border-white shadow-sm'
                          : 'border-2 border-gray-400'
                      }`} />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{establishment.nom}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {establishment.ville}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {establishment.chambres_total} chambres
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            establishment.statut === 'ACTIF' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {establishment.statut}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(establishment);
                        }}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(establishment.id);
                        }}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedEstablishment && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Établissement sélectionné : {selectedEstablishment.nom}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-6">
            {isEditing ? 'Modifier l\'établissement' : 'Nouvel établissement'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'établissement *
                </label>
                <input
                  type="text"
                  value={formData.nom || ''}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Hôtel Le Grand Paris"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gestionnaire
                </label>
                <input
                  type="text"
                  value={formData.gestionnaire || ''}
                  onChange={(e) => handleInputChange('gestionnaire', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Jean Dupont"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  value={formData.adresse || ''}
                  onChange={(e) => handleInputChange('adresse', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 123 Avenue des Champs-Élysées"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  value={formData.ville || ''}
                  onChange={(e) => handleInputChange('ville', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Paris"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal
                </label>
                <input
                  type="text"
                  value={formData.code_postal || ''}
                  onChange={(e) => handleInputChange('code_postal', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 75008"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.telephone || ''}
                  onChange={(e) => handleInputChange('telephone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 01 42 56 78 90"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: contact@hotelgrandparis.fr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de chambres
                </label>
                <input
                  type="number"
                  value={formData.chambres_total || 0}
                  onChange={(e) => handleInputChange('chambres_total', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 45"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={formData.statut || 'ACTIF'}
                  onChange={(e) => handleInputChange('statut', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIF">Actif</option>
                  <option value="INACTIF">Inactif</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SIRET
                </label>
                <input
                  type="text"
                  value={formData.siret || ''}
                  onChange={(e) => handleInputChange('siret', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 12345678900012"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isEditing ? 'Enregistrer les modifications' : 'Créer l\'établissement'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}