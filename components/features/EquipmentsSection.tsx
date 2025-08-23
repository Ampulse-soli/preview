'use client';

import React, { useState, useEffect } from 'react';
import { equipmentsApi, type Equipment } from '@/lib/api/equipments';
import { useNotifications } from '@/hooks/useNotifications';
import { Plus, Edit2, Trash2, Filter, Search, Tag, Eye, EyeOff, Wifi, Tv, Coffee, Car, Home, Users, MapPin, Wrench, Clock, Utensils, Bath, Wind, Thermometer, Shield, Music, Baby, Gamepad2, Dumbbell, Waves } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import EquipmentFormModal from '../modals/EquipmentFormModal';

// Mapping des icônes
const iconMap = {
  Wifi, Tv, Coffee, Car, Home, Users, MapPin, Wrench, Clock, Utensils, 
  Bath, Wind, Thermometer, Shield, Music, Baby, Gamepad2, Dumbbell, Waves
};

interface EquipmentFormData extends Partial<Equipment> {
  // Extension du type pour le formulaire
}

export default function EquipmentsSection() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const { addNotification } = useNotifications();

  // Types d'équipements disponibles
  const equipmentTypes = [
    { value: 'amenity', label: 'Équipement' },
    { value: 'facility', label: 'Installation' },
    { value: 'service', label: 'Service' },
    { value: 'safety', label: 'Sécurité' },
    { value: 'accessibility', label: 'Accessibilité' },
    { value: 'technology', label: 'Technologie' },
    { value: 'other', label: 'Autre' }
  ];

  useEffect(() => {
    loadEquipments();
  }, []);

  const loadEquipments = async () => {
    try {
      setLoading(true);
      const response = await equipmentsApi.getEquipments();
      if (response.success && response.data) {
        setEquipments(response.data);
      } else {
        console.error('Erreur:', response.error);
        addNotification('error', response.error || 'Erreur lors du chargement des équipements');
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      addNotification('error', 'Erreur lors du chargement des équipements');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingEquipment(null);
    setShowModal(true);
  };

  const handleEdit = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setShowModal(true);
  };

  const handleDelete = async (equipment: Equipment) => {
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer l'équipement "${equipment.nom}" ?\n\nCette action est irréversible.`;
    if (!confirm(confirmMessage)) return;

    try {
      setLoading(true);
      const response = await equipmentsApi.deleteEquipment(equipment.id);
      
      if (response.success) {
        addNotification('success', `Équipement "${equipment.nom}" supprimé avec succès`);
        await loadEquipments();
      } else {
        console.error('Erreur de l\'API:', response.error);
        addNotification('error', response.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      addNotification('error', 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (equipment: Equipment) => {
    try {
      const response = await equipmentsApi.updateEquipment(equipment.id, {
        est_actif: !equipment.est_actif
      });
      
      if (response.success) {
        addNotification(
          'success',
          `Équipement ${equipment.est_actif ? 'désactivé' : 'activé'} avec succès`
        );
        await loadEquipments();
      } else {
        console.error('Erreur de l\'API:', response.error);
        addNotification('error', response.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      addNotification('error', 'Erreur lors de la modification');
    }
  };

  const handleModalSubmit = async (data: any) => {
    setModalLoading(true);
    
    try {
      // Mapper les données du formulaire vers le format de la base de données
      const dbData = {
        nom: data.name,
        categorie: data.category,
        description: data.description,
        icone: data.icon,
        est_actif: data.is_active,
        ordre_affichage: data.display_order
      };
      
      let response;
      
      if (editingEquipment?.id) {
        // Mise à jour
        response = await equipmentsApi.updateEquipment(editingEquipment.id, dbData);
      } else {
        // Création
        response = await equipmentsApi.createEquipment(dbData);
      }

      if (response.success) {
        addNotification(
          'success',
          editingEquipment 
            ? `Équipement "${data.name}" modifié avec succès` 
            : `Équipement "${data.name}" créé avec succès`
        );
        await loadEquipments();
        setShowModal(false);
        setEditingEquipment(null);
      } else {
        console.error('Erreur de l\'API:', response.error);
        addNotification('error', response.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      addNotification('error', 'Erreur lors de la sauvegarde');
    } finally {
      setModalLoading(false);
    }
  };

  // Filtrer les équipements
  const filteredEquipments = equipments.filter(equipment => {
    // Filtre par terme de recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesName = equipment.nom.toLowerCase().includes(searchLower);
      const matchesDescription = equipment.description?.toLowerCase().includes(searchLower);
      const matchesCategory = equipment.categorie?.toLowerCase().includes(searchLower);
      
      if (!matchesName && !matchesDescription && !matchesCategory) return false;
    }
    
    // Filtre par catégorie
    if (filterCategory && equipment.categorie !== filterCategory) return false;
    
    // Filtre par statut actif
    if (filterActive === 'active' && !equipment.est_actif) return false;
    if (filterActive === 'inactive' && equipment.est_actif) return false;
    
    return true;
  });

  // Obtenir les catégories uniques
  const uniqueCategories = Array.from(new Set(
    equipments.map(e => e.categorie).filter(Boolean)
  )).sort();

  // Statistiques
  const stats = {
    total: equipments.length,
    active: equipments.filter(e => e.est_actif).length,
    inactive: equipments.filter(e => !e.est_actif).length,
    byCategory: equipments.reduce((acc, e) => {
      acc[e.categorie] = (acc[e.categorie] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  // Fonction pour obtenir l'icône
  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Home;
    return IconComponent;
  };

  return (
    <div>
      {/* Header Section */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Équipements et services</h1>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un équipement
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Tag className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactifs</p>
                <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
              </div>
              <EyeOff className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Types</p>
                <p className="text-2xl font-bold text-purple-600">{Object.keys(stats.byCategory).length}</p>
              </div>
              <Filter className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Barre de recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un équipement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              
              {/* Filtre par type */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les types</option>
                  {equipmentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              {/* Filtre par catégorie */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les catégories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* Filtre par statut */}
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs seulement</option>
                <option value="inactive">Inactifs seulement</option>
              </select>
            </div>
          </div>
          
          {/* Résultats de filtrage */}
          {(searchTerm || filterType || filterCategory || filterActive !== 'all') && (
            <div className="mt-4 text-sm text-gray-600">
              {filteredEquipments.length} équipement{filteredEquipments.length > 1 ? 's' : ''} trouvé{filteredEquipments.length > 1 ? 's' : ''}
              {searchTerm && ` pour "${searchTerm}"`}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des équipements - Format tableau */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Chargement des équipements...</p>
            </div>
          ) : filteredEquipments.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun équipement trouvé</h3>
              <p className="text-gray-500 mb-4">
                {equipments.length === 0 
                  ? "Commencez par ajouter votre premier équipement" 
                  : "Aucun équipement ne correspond aux critères de recherche"}
              </p>
              {equipments.length === 0 && (
                <Button onClick={handleAddNew} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter un équipement
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Équipement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEquipments.map((equipment) => {
                    const IconComponent = getIcon(equipment.icone || 'Home');
                    const categoryLabel = equipment.categorie || 'general';
                    
                    return (
                      <tr key={equipment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg border ${equipment.est_actif ? 'bg-blue-50 border-blue-200' : 'bg-gray-100 border-gray-200'}`}>
                              <IconComponent className={`h-4 w-4 ${equipment.est_actif ? 'text-blue-600' : 'text-gray-400'}`} />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {equipment.nom}
                              </div>
                              <div className="text-xs text-gray-500">
                                Ordre: {equipment.ordre_affichage}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline" className="text-xs">
                            {categoryLabel}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {equipment.categorie || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {equipment.description || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={equipment.est_actif ? 'default' : 'secondary'}
                              className={equipment.est_actif ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                            >
                              {equipment.est_actif ? 'Actif' : 'Inactif'}
                            </Badge>
                            <button
                              onClick={() => handleToggleActive(equipment)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                              title={equipment.est_actif ? 'Désactiver' : 'Activer'}
                            >
                              {equipment.est_actif ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(equipment)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(equipment)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de formulaire */}
      <EquipmentFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingEquipment(null);
        }}
        onSubmit={handleModalSubmit}
        initialData={editingEquipment || {}}
        isEditing={!!editingEquipment}
        loading={modalLoading}
      />
    </div>
  );
}