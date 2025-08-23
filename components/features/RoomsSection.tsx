'use client';

import React, { useState, useEffect } from 'react';
import { roomsApi } from '@/lib/api/rooms';
import { useNotifications } from '@/hooks/useNotifications';
import { Plus, Bed, Edit2, Trash2, Check, MapPin, Users, DollarSign, Home, Wifi, Tv, Coffee, Car, AlertCircle, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import RoomFormModal from '../modals/RoomFormModal';
import type { Room } from '@/lib/api/rooms';

interface RoomFormData extends Partial<Room> {
  amenities_list?: string[];
}

export default function RoomsSection() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('tous');
  const [filterType, setFilterType] = useState<string>('tous');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { addNotification } = useNotifications();

  // Types de chambres disponibles
  const roomTypes = [
    { value: 'Simple', label: 'Chambre Simple', capacity: 1, basePrice: 45 },
    { value: 'Double', label: 'Chambre Double', capacity: 2, basePrice: 65 },
    { value: 'Twin', label: 'Chambre Twin', capacity: 2, basePrice: 65 },
    { value: 'Familiale', label: 'Chambre Familiale', capacity: 4, basePrice: 85 },
    { value: 'Suite', label: 'Suite', capacity: 2, basePrice: 120 },
    { value: 'PMR', label: 'Chambre PMR', capacity: 2, basePrice: 55 },
    { value: 'Studio', label: 'Studio', capacity: 2, basePrice: 55 }
  ];

  // Équipements disponibles
  const availableAmenities = [
    { value: 'WiFi', label: 'WiFi', icon: Wifi },
    { value: 'TV', label: 'Télévision', icon: Tv },
    { value: 'TV 4K', label: 'TV 4K', icon: Tv },
    { value: 'Climatisation', label: 'Climatisation', icon: Home },
    { value: 'Chauffage', label: 'Chauffage', icon: Home },
    { value: 'Minibar', label: 'Minibar', icon: Coffee },
    { value: 'Machine à café', label: 'Machine à café', icon: Coffee },
    { value: 'Salle de bain privée', label: 'Salle de bain privée', icon: Home },
    { value: 'Balcon', label: 'Balcon', icon: Home },
    { value: 'Terrasse', label: 'Terrasse', icon: Home },
    { value: 'Vue mer', label: 'Vue mer', icon: MapPin },
    { value: 'Vue jardin', label: 'Vue jardin', icon: MapPin },
    { value: 'Parking', label: 'Parking', icon: Car },
    { value: 'Accès PMR', label: 'Accès PMR', icon: Users },
    { value: 'Kitchenette', label: 'Kitchenette', icon: Home },
    { value: 'Jacuzzi', label: 'Jacuzzi', icon: Home },
    { value: 'Salon séparé', label: 'Salon séparé', icon: Home }
  ];

  useEffect(() => {
    loadRooms();
  }, [selectedHotelId]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      // Si aucun hôtel sélectionné, charger toutes les chambres
      const hotelId = selectedHotelId || undefined;
      const response = await roomsApi.getRooms(hotelId);
      if (response.success && response.data) {
        setRooms(response.data);
      } else {
        console.error('Erreur:', response.error);
        if (response.error?.includes('schema cache')) {
          addNotification('error', 'La table des chambres n\'existe pas encore. Veuillez la créer dans Supabase.');
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      addNotification('error', 'Erreur lors du chargement des chambres');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingRoom(null);
    setShowModal(true);
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setShowModal(true);
  };

  const handleDelete = async (room: Room) => {
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer la chambre ${room.numero} ?\n\nCette action est irréversible.`;
    if (!confirm(confirmMessage)) return;

    try {
      setLoading(true);
      const response = await roomsApi.deleteRoom(room.id);
      
      if (response.success) {
        addNotification('success', `Chambre ${room.numero} supprimée avec succès`);
        await loadRooms();
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

  const handleModalSubmit = async (data: any) => {
    setModalLoading(true);
    
    try {
      let response;
      
      if (editingRoom?.id) {
        // Mise à jour
        const updateData = {
          ...data,
          amenities: data.amenities || [],
          images: data.images || []
        };
        response = await roomsApi.updateRoom(editingRoom.id, updateData);
      } else {
        // Création
        const createData = {
          hotel_id: selectedHotelId || 1,
          numero: data.numero,
          type: data.type,
          prix: data.prix,
          statut: data.statut || 'disponible',
          description: data.description,
          floor: data.floor || 0,
          room_size: data.room_size,
          bed_type: data.bed_type,
          view_type: data.view_type,
          is_smoking: data.is_smoking || false,
          amenities: data.amenities || [],
          images: data.images || [],
          notes: data.notes
        };
        
        response = await roomsApi.createRoom(createData);
      }

      if (response.success) {
        addNotification(
          'success',
          editingRoom ? `Chambre ${data.numero} modifiée avec succès` : `Chambre ${data.numero} créée avec succès`
        );
        await loadRooms();
        setShowModal(false);
        setEditingRoom(null);
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

  // Fonction utilitaire pour convertir les amenities/images vers string[]
  const normalizeArrayField = (field: any): string[] => {
    if (!field) return [];
    if (!Array.isArray(field)) return [];
    
    return field.map(item => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null) {
        return (item as any).name || (item as any).value || item.toString();
      }
      return item.toString();
    });
  };

  // Préparer les données initiales pour le modal d'édition
  const getInitialModalData = () => {
    if (!editingRoom) return { amenities: [], images: [] };
    
    // Convertir amenities et images de Record<string, unknown>[] vers string[]
    const amenitiesList = normalizeArrayField(editingRoom.amenities);
    const imagesList = normalizeArrayField(editingRoom.images);
    
    return {
      ...editingRoom,
      description: editingRoom.description || undefined,
      category_id: editingRoom.category_id || undefined,
      floor: editingRoom.floor || undefined,
      room_size: editingRoom.room_size || undefined,
      bed_type: editingRoom.bed_type || undefined,
      view_type: editingRoom.view_type || undefined,
      is_smoking: editingRoom.is_smoking || undefined,
      last_cleaned: editingRoom.last_cleaned || undefined,
      notes: editingRoom.notes || undefined,
      amenities: amenitiesList,
      images: imagesList
    };
  };

  // Filtrer les chambres
  const filteredRooms = rooms.filter(room => {
    // Filtrer par statut
    if (filterStatus !== 'tous' && room.statut !== filterStatus) return false;
    
    // Filtrer par type
    if (filterType !== 'tous' && room.type !== filterType) return false;
    
    // Filtrer par terme de recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesNumber = room.numero.toLowerCase().includes(searchLower);
      const matchesType = room.type.toLowerCase().includes(searchLower);
      const matchesDescription = room.description?.toLowerCase().includes(searchLower);
      
      if (!matchesNumber && !matchesType && !matchesDescription) return false;
    }
    
    return true;
  });

  // Statistiques
  const stats = {
    total: rooms.length,
    disponibles: rooms.filter(r => r.statut === 'disponible').length,
    occupees: rooms.filter(r => r.statut === 'occupee').length,
    maintenance: rooms.filter(r => r.statut === 'maintenance').length,
    tauxOccupation: rooms.length > 0 ? Math.round((rooms.filter(r => r.statut === 'occupee').length / rooms.length) * 100) : 0
  };

  return (
    <div>
      {/* Header Section */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Gestion des chambres</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Hôtel :</label>
          <select
            value={selectedHotelId || 'all'}
            onChange={(e) => setSelectedHotelId(e.target.value === 'all' ? null : Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les hôtels ({rooms.length} chambres)</option>
            <option value="1">Hotel Le Refuge</option>
            <option value="2">Residence Les Oliviers</option>
            <option value="3">Foyer Solidaire Marseille</option>
            <option value="9">Hôtel Le Grand Piip</option>
            <option value="10">Hôtel Le Grand Paris</option>
          </select>
        </div>
      </div>

      {/* Filtres et actions */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Barre de recherche */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher par numéro, type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              
              {/* Filtre par statut */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="tous">Tous les statuts</option>
                  <option value="disponible">Disponibles</option>
                  <option value="occupee">Occupées</option>
                  <option value="maintenance">En maintenance</option>
                </select>
              </div>
              
              {/* Filtre par type */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tous">Tous les types</option>
                {roomTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <Button onClick={handleAddNew} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Ajouter une chambre
            </Button>
          </div>
          
          {/* Résultats de filtrage */}
          {(searchTerm || filterStatus !== 'tous' || filterType !== 'tous') && (
            <div className="mt-4 text-sm text-gray-600">
              {filteredRooms.length} chambre{filteredRooms.length > 1 ? 's' : ''} trouvée{filteredRooms.length > 1 ? 's' : ''}
              {searchTerm && ` pour "${searchTerm}"`}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des chambres - Format tableau */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Chargement des chambres...</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-12">
              <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune chambre trouvée</h3>
              <p className="text-gray-500 mb-4">
                {rooms.length === 0 
                  ? "Commencez par ajouter votre première chambre" 
                  : "Aucune chambre ne correspond aux critères de recherche"}
              </p>
              {rooms.length === 0 && (
                <Button onClick={handleAddNew} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter une chambre
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Numéro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    {!selectedHotelId && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hôtel
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Étage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Équipements
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRooms.map((room) => (
                    <tr key={room.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {room.numero}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{room.type}</div>
                        {room.bed_type && (
                          <div className="text-xs text-gray-500">{room.bed_type}</div>
                        )}
                      </td>
                      {!selectedHotelId && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {room.hotel_id === 1 && 'Hotel Le Refuge'}
                            {room.hotel_id === 2 && 'Residence Les Oliviers'}
                            {room.hotel_id === 3 && 'Foyer Solidaire Marseille'}
                            {room.hotel_id === 9 && 'Hôtel Le Grand Piip'}
                            {room.hotel_id === 10 && 'Hôtel Le Grand Paris'}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={room.statut === 'disponible' ? 'default' : 
                                  room.statut === 'occupee' ? 'destructive' : 'secondary'}
                          className={room.statut === 'disponible' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                        >
                          {room.statut === 'disponible' ? 'Disponible' : 
                           room.statut === 'occupee' ? 'Occupée' : 'Maintenance'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {room.prix}€
                        </div>
                        <div className="text-xs text-gray-500">par nuit</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {room.floor || 0}
                        </div>
                        {room.room_size && (
                          <div className="text-xs text-gray-500">{room.room_size}m²</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const normalizedAmenities = normalizeArrayField(room.amenities);
                          return normalizedAmenities.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {normalizedAmenities.slice(0, 2).map((amenity, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                              {normalizedAmenities.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{normalizedAmenities.length - 2}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(room)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(room)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de formulaire */}
      <RoomFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingRoom(null);
        }}
        onSubmit={handleModalSubmit}
        initialData={getInitialModalData()}
        isEditing={!!editingRoom}
        loading={modalLoading}
      />
    </div>
  );
}