'use client';

import React, { useState, useEffect } from 'react';
import { X, Wifi, Tv, Coffee, Car, Home, Users, MapPin, Wrench, Clock, Utensils, Bath, Wind, Thermometer, Shield, Music, Baby, Gamepad2, Dumbbell, Waves } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { Equipment, EquipmentInsert, EquipmentUpdate } from '@/lib/api/equipments';

interface EquipmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EquipmentInsert | EquipmentUpdate) => void;
  initialData?: Partial<Equipment>;
  isEditing?: boolean;
  loading?: boolean;
}

// Icônes disponibles pour les équipements
const availableIcons = [
  { name: 'Wifi', icon: Wifi, label: 'WiFi' },
  { name: 'Tv', icon: Tv, label: 'Télévision' },
  { name: 'Coffee', icon: Coffee, label: 'Café/Restaurant' },
  { name: 'Car', icon: Car, label: 'Transport' },
  { name: 'Home', icon: Home, label: 'Logement' },
  { name: 'Users', icon: Users, label: 'Accessibilité' },
  { name: 'MapPin', icon: MapPin, label: 'Localisation' },
  { name: 'Wrench', icon: Wrench, label: 'Maintenance' },
  { name: 'Clock', icon: Clock, label: 'Service' },
  { name: 'Utensils', icon: Utensils, label: 'Cuisine' },
  { name: 'Bath', icon: Bath, label: 'Salle de bain' },
  { name: 'Wind', icon: Wind, label: 'Climatisation' },
  { name: 'Thermometer', icon: Thermometer, label: 'Température' },
  { name: 'Shield', icon: Shield, label: 'Sécurité' },
  { name: 'Music', icon: Music, label: 'Divertissement' },
  { name: 'Baby', icon: Baby, label: 'Famille' },
  { name: 'Gamepad2', icon: Gamepad2, label: 'Jeux' },
  { name: 'Dumbbell', icon: Dumbbell, label: 'Sport' },
  { name: 'Waves', icon: Waves, label: 'Bien-être' }
];

// Types d'équipements disponibles
const equipmentTypes = [
  { value: 'amenity', label: 'Équipement', description: 'Confort et agrément' },
  { value: 'facility', label: 'Installation', description: 'Infrastructure de l\'établissement' },
  { value: 'service', label: 'Service', description: 'Service proposé aux clients' },
  { value: 'safety', label: 'Sécurité', description: 'Équipement de sécurité' },
  { value: 'accessibility', label: 'Accessibilité', description: 'Équipement PMR' },
  { value: 'technology', label: 'Technologie', description: 'Équipement technologique' },
  { value: 'other', label: 'Autre', description: 'Autre type d\'équipement' }
];

// Catégories suggérées
const suggestedCategories = [
  'Connectivité', 'Divertissement', 'Climatisation', 'Salle de bain', 
  'Confort', 'Cuisine', 'Vue', 'Transport', 'Accessibilité', 
  'Services', 'Sécurité', 'Bien-être', 'Restauration'
];

export default function EquipmentFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  isEditing = false,
  loading = false
}: EquipmentFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'amenity' as const,
    category: '',
    description: '',
    icon: 'Home',
    is_active: true,
    display_order: 0
  });

  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  // Charger les données initiales
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData.nom || '',
        type: 'amenity',
        category: initialData.categorie || '',
        description: initialData.description || '',
        icon: initialData.icone || 'Home',
        is_active: initialData.est_actif ?? true,
        display_order: initialData.ordre_affichage || 0
      });
      
      // Vérifier si la catégorie est personnalisée
      const isCustom = initialData.categorie && !suggestedCategories.includes(initialData.categorie);
      if (isCustom) {
        setCustomCategory(initialData.categorie || '');
        setShowCustomCategory(true);
      } else {
        setCustomCategory('');
        setShowCustomCategory(false);
      }
    }
  }, [isOpen, initialData]);

  // Réinitialiser le formulaire à la fermeture
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        type: 'amenity',
        category: '',
        description: '',
        icon: 'Home',
        is_active: true,
        display_order: 0
      });
      setCustomCategory('');
      setShowCustomCategory(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalCategory = showCustomCategory ? customCategory : formData.category;
    
    const submitData = {
      ...formData,
      category: finalCategory || undefined,
    };

    onSubmit(submitData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const selectedIcon = availableIcons.find(i => i.name === formData.icon)?.icon || Home;
  const selectedType = equipmentTypes.find(t => t.value === formData.type);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Modifier l\'équipement' : 'Ajouter un équipement'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Aperçu */}
          <Card className="bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Aperçu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border">
                  {React.createElement(selectedIcon, { className: 'h-5 w-5 text-blue-600' })}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {formData.name || 'Nom de l\'équipement'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedType?.label} 
                    {formData.category && ` • ${showCustomCategory ? customCategory : formData.category}`}
                  </div>
                  {formData.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {formData.description}
                    </div>
                  )}
                </div>
                <div className="ml-auto">
                  <Badge variant={formData.is_active ? 'default' : 'secondary'}>
                    {formData.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations de base */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Informations de base</h3>
              
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'équipement <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: WiFi gratuit"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {equipmentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {selectedType && (
                  <p className="text-xs text-gray-500 mt-1">{selectedType.description}</p>
                )}
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <div className="space-y-2">
                  {!showCustomCategory ? (
                    <div>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {suggestedCategories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowCustomCategory(true)}
                        className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                      >
                        + Créer une catégorie personnalisée
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nom de la catégorie"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCustomCategory(false)}
                        className="text-xs text-gray-600 hover:text-gray-800 mt-1"
                      >
                        ← Retour aux catégories suggérées
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Description détaillée de l'équipement"
                />
              </div>
            </div>

            {/* Configuration */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Configuration</h3>
              
              {/* Icône */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icône
                </label>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {availableIcons.map((iconItem) => {
                    const IconComponent = iconItem.icon;
                    return (
                      <button
                        key={iconItem.name}
                        type="button"
                        onClick={() => handleInputChange('icon', iconItem.name)}
                        className={`p-2 rounded-lg border transition-colors ${
                          formData.icon === iconItem.name
                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                        title={iconItem.label}
                      >
                        <IconComponent className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ordre d'affichage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordre d'affichage
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.display_order}
                  onChange={(e) => handleInputChange('display_order', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Plus le nombre est petit, plus l'équipement apparaîtra en haut de la liste
                </p>
              </div>

              {/* Statut */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Équipement actif
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Les équipements inactifs ne seront pas proposés lors de l'association aux hôtels
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="min-w-24"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Enregistrement...</span>
                </div>
              ) : (
                isEditing ? 'Modifier' : 'Ajouter'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}