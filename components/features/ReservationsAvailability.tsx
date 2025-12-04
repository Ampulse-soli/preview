import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Bed, 
  Users, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  MapPin
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Reservation, Hotel } from '../../types';
import QuickReservationModal from '../modals/QuickReservationModal';
import { supabase } from '../../lib/supabase';
import EndingStaysAlert from './EndingStaysAlert';
import CriticalRoomsAlert from './CriticalRoomsAlert';

interface ReservationsAvailabilityProps {
  reservations: Reservation[];
  hotels: Hotel[];
  selectedHotel?: string; // Nom de l'hôtel sélectionné dans les paramètres
  operateurs?: any[]; // Opérateurs sociaux pour la réservation
}

export default function ReservationsAvailability({ reservations, hotels, selectedHotel, operateurs = [] }: ReservationsAvailabilityProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('all');
  const [selectedCharacteristic, setSelectedCharacteristic] = useState<string>('all');
  const [searchRoomNumber, setSearchRoomNumber] = useState<string>('');
  const [searchDateRange, setSearchDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [searchHotel, setSearchHotel] = useState<string>('all');
  const [numberOfGuests, setNumberOfGuests] = useState<number>(1);
  const [showAvailableOnly, setShowAvailableOnly] = useState<boolean>(false);
  const [rentalMode, setRentalMode] = useState<'pax' | 'room'>('room'); // Mode de location
  
  // États pour la réservation rapide
  const [isQuickReservationModalOpen, setIsQuickReservationModalOpen] = useState(false);
  const [selectedRoomForReservation, setSelectedRoomForReservation] = useState<any>(null);

  // Calcul de la disponibilité pour une date donnée
  const getAvailabilityForDate = (date: string, hotelFilter?: string) => {
    const targetDate = new Date(date);
    
    const filteredReservations = reservations.filter(reservation => {
      const arrivee = new Date(reservation.dateArrivee);
      const depart = new Date(reservation.dateDepart);
      const isInDateRange = targetDate >= arrivee && targetDate <= depart;
      
      if (hotelFilter && hotelFilter !== 'all') {
        return isInDateRange && reservation.hotel === hotelFilter;
      }
      return isInDateRange;
    });

    const totalRooms = hotelFilter && hotelFilter !== 'all' 
      ? hotels.find(h => h.nom === hotelFilter)?.chambresTotal || 0
      : hotels.reduce((sum, hotel) => sum + (hotel.chambresTotal || 0), 0);

    const occupiedRooms = filteredReservations.length;
    const availableRooms = totalRooms - occupiedRooms;
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms * 100).toFixed(1) : '0';

    return {
      totalRooms,
      occupiedRooms,
      availableRooms,
      occupancyRate,
      reservations: filteredReservations
    };
  };

  const availability = getAvailabilityForDate(selectedDate, selectedHotel || searchHotel || 'all');





  // Obtenir tous les types de chambres disponibles
  const getAvailableRoomTypes = () => {
    const roomTypes = new Set<string>();
    hotels.forEach(hotel => {
      // Simuler les types de chambres basés sur les réservations existantes
      if ((hotel.chambresTotal || 0) > 0) {
        roomTypes.add('Simple');
        roomTypes.add('Double');
        roomTypes.add('Suite');
        roomTypes.add('Familiale');
        roomTypes.add('Studio');
      }
    });
    return Array.from(roomTypes);
  };

  // Obtenir toutes les caractéristiques disponibles
  const getAvailableCharacteristics = () => {
    return [
      'WiFi',
      'TV',
      'Salle de bain privée',
      'Balcon',
      'Vue jardin',
      'Vue mer',
      'Vue montagne',
      'Climatisation',
      'Mini-bar',
      'Jacuzzi',
      'Cuisine équipée',
      'Accès PMR'
    ];
  };

  // Recherche avancée de disponibilité avec vraie base de données
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const searchAvailableRooms = async () => {
    if (!searchDateRange.startDate || !searchDateRange.endDate) {
      setAvailableRooms([]);
      return;
    }

    setLoadingRooms(true);
    try {
      // Trouver l'ID de l'hôtel si spécifié
      let hotelId = null;
      if (searchHotel !== 'all') {
        const hotel = hotels.find(h => h.nom === searchHotel);
        if (hotel) hotelId = hotel.id;
      }

             // Appeler la fonction de base de données avec tous les filtres
       const { data, error } = await supabase
         .rpc('get_available_rooms_with_details', {
           p_date_debut: searchDateRange.startDate,
           p_date_fin: searchDateRange.endDate,
           p_hotel_id: hotelId,
           p_room_type: selectedRoomType !== 'all' ? selectedRoomType : null,
           p_capacity: numberOfGuests,
           p_characteristic: selectedCharacteristic !== 'all' ? selectedCharacteristic : null,
           p_room_number: searchRoomNumber || null,
           p_rental_mode: rentalMode
         });

      if (error) {
        console.error('Erreur lors de la recherche des chambres:', error);
        // Fallback vers la méthode simulée
        setAvailableRooms(getSimulatedRooms());
      } else {
        // Transformer les données pour correspondre au format attendu
        const roomsData = data as any[];
        const transformedRooms = roomsData.map((room: any) => ({
          hotel: room.hotel_nom,
          hotelAddress: room.hotel_adresse,
          hotelVille: room.hotel_ville,
          roomNumber: room.room_numero,
          roomType: room.room_type,
          isAvailable: room.is_available,
          pricePerNight: room.price_per_night,
          totalPrice: room.total_price,
          characteristics: room.characteristics || getRandomCharacteristics(),
          capacity: room.capacity,
          roomId: room.room_id,
          hotelId: room.hotel_id
        }));
        
        // Filtrer les résultats par capacité si nécessaire
        let filteredRooms = transformedRooms;
        if (numberOfGuests > 1) {
          filteredRooms = transformedRooms.filter((room: any) => room.capacity >= numberOfGuests);
        }
        
        setAvailableRooms(filteredRooms);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche des chambres:', error);
      // Fallback vers la méthode simulée
      setAvailableRooms(getSimulatedRooms());
    } finally {
      setLoadingRooms(false);
    }
  };

  // Méthode simulée en cas d'erreur avec la base de données
  const getSimulatedRooms = () => {
    const searchStart = new Date(searchDateRange.startDate);
    const searchEnd = new Date(searchDateRange.endDate);
    const simulatedRooms: any[] = [];

    hotels.forEach(hotel => {
      if (searchHotel !== 'all' && hotel.nom !== searchHotel) {
        return;
      }

      const totalRooms = hotel.chambresTotal || 0;
      
      for (let roomNum = 1; roomNum <= totalRooms; roomNum++) {
        const roomNumber = `${roomNum}`.padStart(3, '0');
        
        const isOccupied = reservations.some(reservation => {
          if (reservation.hotel !== hotel.nom) return false;
          
          const resStart = new Date(reservation.dateArrivee);
          const resEnd = new Date(reservation.dateDepart);
          
          return !(searchEnd < resStart || searchStart > resEnd);
        });

        if (!isOccupied || !showAvailableOnly) {
          let roomType = 'Simple';
          if (roomNum % 4 === 0) roomType = 'Familiale';
          else if (roomNum % 3 === 0) roomType = 'Suite';
          else if (roomNum % 2 === 0) roomType = 'Double';

          if (selectedRoomType !== 'all' && roomType !== selectedRoomType) {
            continue;
          }

          // Filtrer par numéro de chambre si spécifié
          if (searchRoomNumber && !roomNumber.includes(searchRoomNumber)) {
            continue;
          }

                     const days = Math.ceil((searchEnd.getTime() - searchStart.getTime()) / (1000 * 60 * 60 * 24));
           const basePrice = roomType === 'Suite' ? 120 : 
                            roomType === 'Familiale' ? 100 : 
                            roomType === 'Double' ? 80 : 60;
           
           // Calculer le prix selon le mode de location
           let totalPrice: number;
           if (rentalMode === 'pax') {
             // Mode PAX : prix par personne
             totalPrice = basePrice * numberOfGuests * days;
           } else {
             // Mode chambre complète : prix fixe pour la chambre
             totalPrice = basePrice * days;
           }

          const capacity = roomType === 'Familiale' ? 4 : 
                          roomType === 'Suite' ? 3 : 
                          roomType === 'Double' ? 2 : 1;

          // Filtrer par capacité si spécifié
          if (numberOfGuests > 1 && capacity < numberOfGuests) {
            continue;
          }

          const characteristics = getRandomCharacteristics();
          
          // Filtrer par caractéristique si spécifiée
          if (selectedCharacteristic !== 'all') {
                        const hasCharacteristic = Object.values(characteristics).some((char: any) =>
              typeof char === 'string' && char.toLowerCase().includes(selectedCharacteristic.toLowerCase())
            );
            if (!hasCharacteristic) {
              continue;
            }
          }

          simulatedRooms.push({
            hotel: hotel.nom,
            hotelAddress: hotel.adresse,
            hotelVille: hotel.ville,
            roomNumber,
            roomType,
            isAvailable: !isOccupied,
            pricePerNight: basePrice,
            totalPrice,
            characteristics,
            capacity
          });
        }
      }
    });

    return simulatedRooms;
  };

  // Effectuer la recherche automatiquement seulement si les dates sont définies
  useEffect(() => {
    if (searchDateRange.startDate && searchDateRange.endDate) {
      searchAvailableRooms();
    }
  }, [searchDateRange.startDate, searchDateRange.endDate]);

  // Générer des caractéristiques aléatoires pour les chambres
  const getRandomCharacteristics = () => {
    const characteristicsMap: { [key: string]: string } = {
      'WiFi': 'wifi',
      'Climatisation': 'climatisation',
      'Balcon': 'balcon',
      'Vue mer': 'vue_mer',
      'TV': 'tv',
      'Salle de bain privée': 'salle_bain_privee'
    };
    
    const allCharacteristics = getAvailableCharacteristics();
    const numCharacteristics = Math.floor(Math.random() * 4) + 2; // 2-5 caractéristiques
    const shuffled = [...allCharacteristics].sort(() => 0.5 - Math.random());
    const selectedChars = shuffled.slice(0, numCharacteristics);
    
    // Convertir en objet avec valeurs booléennes
    const characteristicsObj: { [key: string]: boolean } = {};
    selectedChars.forEach(char => {
      const key = characteristicsMap[char] || char.toLowerCase().replace(/ /g, '_');
      characteristicsObj[key] = true;
    });
    
    return characteristicsObj;
  };

  // Filtrer les réservations selon les critères de recherche
  const getFilteredReservations = () => {
    return reservations.filter(reservation => {
      // Filtre par date de réservation
      if (searchDateRange.startDate && searchDateRange.endDate) {
        const reservationStart = new Date(reservation.dateArrivee);
        const reservationEnd = new Date(reservation.dateDepart);
        const searchStart = new Date(searchDateRange.startDate);
        const searchEnd = new Date(searchDateRange.endDate);
        
        if (reservationStart > searchEnd || reservationEnd < searchStart) {
          return false;
        }
      }

      // Filtre par hôtel
      if (searchHotel !== 'all' && reservation.hotel !== searchHotel) {
        return false;
      }

      if (selectedHotel && reservation.hotel !== selectedHotel) {
        return false;
      }

      // Filtre par numéro de chambre
      if (searchRoomNumber && !reservation.chambre.includes(searchRoomNumber)) {
        return false;
      }

      // Filtre par type de chambre (simulé basé sur le numéro de chambre)
      if (selectedRoomType !== 'all') {
        const roomNumber = reservation.chambre;
        if (selectedRoomType === 'Simple' && !roomNumber.includes('1')) return false;
        if (selectedRoomType === 'Double' && !roomNumber.includes('2')) return false;
        if (selectedRoomType === 'Suite' && !roomNumber.includes('3')) return false;
        if (selectedRoomType === 'Familiale' && !roomNumber.includes('4')) return false;
      }

      return true;
    });
  };

  const availableRoomTypes = getAvailableRoomTypes();
  const availableCharacteristics = getAvailableCharacteristics();
  const filteredReservations = getFilteredReservations();


  const getOccupancyColor = (rate: string) => {
    const numRate = parseFloat(rate);
    if (numRate >= 90) return 'text-red-600';
    if (numRate >= 75) return 'text-orange-600';
    if (numRate >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getOccupancyIcon = (rate: string) => {
    const numRate = parseFloat(rate);
    if (numRate >= 90) return <XCircle className="h-4 w-4 text-red-600" />;
    if (numRate >= 75) return <AlertCircle className="h-4 w-4 text-orange-600" />;
    if (numRate >= 50) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const resetSearchFilters = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSelectedRoomType('all');
    setSelectedCharacteristic('all');
    setSearchRoomNumber('');
    setSearchDateRange({ startDate: '', endDate: '' });
    setSearchHotel('all');
    setNumberOfGuests(1);
    setShowAvailableOnly(false);
    setRentalMode('room'); // Réinitialiser le mode de location
    setAvailableRooms([]); // Vider les résultats
  };

  // Fonctions pour la réservation rapide
  const handleQuickReservation = (room: any) => {
    setSelectedRoomForReservation(room);
    setIsQuickReservationModalOpen(true);
  };

  const handleQuickReservationSuccess = () => {
    setIsQuickReservationModalOpen(false);
    setSelectedRoomForReservation(null);
    // Ici vous pourriez recharger les données ou afficher une notification
    console.log('Réservation créée avec succès');
  };

  return (
    <div className="space-y-6">
      {/* Recherche avancée de disponibilité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Recherche de disponibilité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
                         {/* Première ligne : Dates et nombre de personnes */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Date d'arrivée *
                 </label>
                 <input
                   type="date"
                   value={searchDateRange.startDate}
                   onChange={(e) => setSearchDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   required
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Date de départ *
                 </label>
                 <input
                   type="date"
                   value={searchDateRange.endDate}
                   onChange={(e) => setSearchDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   required
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Mode de location
                 </label>
                 <select
                   value={rentalMode}
                   onChange={(e) => setRentalMode(e.target.value as 'pax' | 'room')}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                 >
                   <option value="room">Chambre complète</option>
                   <option value="pax">Par personne (PAX)</option>
                 </select>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   {rentalMode === 'pax' ? 'Nombre de personnes' : 'Capacité minimale'}
                 </label>
                 <select
                   value={numberOfGuests}
                   onChange={(e) => setNumberOfGuests(parseInt(e.target.value))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                 >
                   {[1, 2, 3, 4, 5, 6].map(num => (
                     <option key={num} value={num}>
                       {rentalMode === 'pax' ? `${num} personne${num > 1 ? 's' : ''}` : `${num} personne${num > 1 ? 's' : ''} min`}
                     </option>
                   ))}
                 </select>
               </div>
             </div>

            {/* Deuxième ligne : Hôtel, numéro de chambre et type de chambre */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hôtel
                </label>
                <select
                  value={searchHotel}
                  onChange={(e) => setSearchHotel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les hôtels</option>
                  {hotels.map(hotel => (
                    <option key={hotel.id} value={hotel.nom}>
                      {hotel.nom} - {hotel.ville}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de chambre
                </label>
                <input
                  type="text"
                  value={searchRoomNumber}
                  onChange={(e) => setSearchRoomNumber(e.target.value)}
                  placeholder="Ex: 101, 205..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de chambre
                </label>
                <select
                  value={selectedRoomType}
                  onChange={(e) => setSelectedRoomType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les types</option>
                  {availableRoomTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caractéristiques
                </label>
                <select
                  value={selectedCharacteristic}
                  onChange={(e) => setSelectedCharacteristic(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Toutes les caractéristiques</option>
                  {availableCharacteristics.map(char => (
                    <option key={char} value={char}>
                      {char}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Options et boutons */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="available-only"
                  checked={showAvailableOnly}
                  onChange={(e) => setShowAvailableOnly(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="available-only" className="text-sm text-gray-700">
                  Afficher uniquement les chambres disponibles
                </label>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={searchAvailableRooms}
                  disabled={!searchDateRange.startDate || !searchDateRange.endDate || loadingRooms}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Search className="h-4 w-4" />
                  {loadingRooms ? 'Recherche...' : 'Rechercher'}
                </Button>
                <Button
                  onClick={resetSearchFilters}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Réinitialiser
                </Button>
                {searchDateRange.startDate && searchDateRange.endDate && availableRooms.length > 0 && (
                  <Badge className="bg-blue-100 text-blue-800">
                    {availableRooms.length} résultat{availableRooms.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résultats de recherche de chambres disponibles */}
      {searchDateRange.startDate && searchDateRange.endDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>Chambres disponibles</span>
                                 {/* Affichage des filtres actifs */}
                 <div className="flex gap-1">
                   <Badge variant="secondary" className="text-xs">
                     {rentalMode === 'pax' ? 'PAX' : 'Chambre'}
                   </Badge>
                   {numberOfGuests > 1 && (
                     <Badge variant="secondary" className="text-xs">
                       {numberOfGuests} {rentalMode === 'pax' ? 'pax' : 'pers'}
                     </Badge>
                   )}
                   {searchRoomNumber && (
                     <Badge variant="secondary" className="text-xs">
                       Ch. {searchRoomNumber}
                     </Badge>
                   )}
                   {selectedRoomType !== 'all' && (
                     <Badge variant="secondary" className="text-xs">
                       {selectedRoomType}
                     </Badge>
                   )}
                   {selectedCharacteristic !== 'all' && (
                     <Badge variant="secondary" className="text-xs">
                       {selectedCharacteristic}
                     </Badge>
                   )}
                   {searchHotel !== 'all' && (
                     <Badge variant="secondary" className="text-xs">
                       {searchHotel}
                     </Badge>
                   )}
                 </div>
              </div>
              <Badge variant="outline">
                {availableRooms.filter((room: any) => room.isAvailable).length} / {availableRooms.length} disponibles
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableRooms
                  .filter((room: any) => !showAvailableOnly || room.isAvailable)
                  .filter((room: any) => room.capacity >= numberOfGuests)
                  .map((room: any, index: number) => (
                  <div key={index} className={`p-4 rounded-lg border-2 ${
                    room.isAvailable 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{room.hotel}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {room.hotelVille}
                        </p>
                      </div>
                      <Badge className={
                        room.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }>
                        {room.isAvailable ? 'Disponible' : 'Occupée'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Chambre {room.roomNumber}</span>
                        <span className="text-sm text-gray-600">{room.roomType}</span>
                      </div>
                      
                                             <div className="flex justify-between items-center">
                         <span className="text-sm text-gray-600 flex items-center gap-1">
                           <Users className="h-3 w-3" />
                           {room.capacity} personne{room.capacity > 1 ? 's' : ''}
                         </span>
                         <span className="text-lg font-bold text-blue-600">
                           {room.totalPrice}€
                         </span>
                       </div>
                       
                       <p className="text-xs text-gray-500">
                         {rentalMode === 'pax' 
                           ? `${room.pricePerNight}€/personne/nuit`
                           : `${room.pricePerNight}€/nuit`
                         }
                       </p>
                      
                      <div className="pt-2">
                        <p className="text-xs font-medium text-gray-700 mb-1">Équipements :</p>
                        <div className="flex flex-wrap gap-1">
                          {(() => {
                            // Convertir l'objet characteristics en tableau d'équipements
                            const charArray = Array.isArray(room.characteristics) 
                              ? room.characteristics 
                              : Object.entries(room.characteristics || {})
                                  .filter(([key, value]) => value === true)
                                  .map(([key]) => {
                                    switch(key) {
                                      case 'wifi': return 'WiFi';
                                      case 'climatisation': return 'Climatisation';
                                      case 'balcon': return 'Balcon';
                                      case 'vue_mer': return 'Vue mer';
                                      case 'tv': return 'TV';
                                      case 'salle_bain_privee': return 'Salle de bain privée';
                                      default: return key;
                                    }
                                  });
                            
                            return charArray.slice(0, 3).map((char: string) => (
                              <Badge key={char} variant="outline" className="text-xs px-1 py-0">
                                {char}
                              </Badge>
                            ));
                          })()}
                          {(() => {
                            const charArray = Array.isArray(room.characteristics) 
                              ? room.characteristics 
                              : Object.entries(room.characteristics || {})
                                  .filter(([key, value]) => value === true);
                            
                            return charArray.length > 3 && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                +{charArray.length - 3}
                              </Badge>
                            );
                          })()}
                        </div>
                      </div>
                      
                      {room.isAvailable && (
                        <Button 
                          className="w-full mt-3" 
                          size="sm"
                          onClick={() => handleQuickReservation(room)}
                        >
                          Réserver
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune chambre trouvée</h3>
                <p className="text-gray-500">
                  Essayez de modifier vos critères de recherche ou les dates sélectionnées.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Résultats de recherche des réservations existantes */}
      {(searchDateRange.startDate || searchDateRange.endDate || selectedRoomType !== 'all' || selectedCharacteristic !== 'all' || searchRoomNumber) && (
        <Card>
          <CardHeader>
            <CardTitle>Réservations pour la période</CardTitle>
            <p className="text-sm text-gray-500">
              {filteredReservations.length} réservation(s) trouvée(s) avec les critères sélectionnés
            </p>
          </CardHeader>
          <CardContent>
            {filteredReservations.length > 0 ? (
              <div className="space-y-3">
                {filteredReservations.map((reservation) => (
                  <div key={reservation.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{reservation.usager}</p>
                        <p className="text-sm text-gray-500">{reservation.hotel} - Chambre {reservation.chambre}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(reservation.dateArrivee).toLocaleDateString('fr-FR')} - {new Date(reservation.dateDepart).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={
                        reservation.statut === 'CONFIRMEE' ? 'bg-green-100 text-green-800' :
                        reservation.statut === 'EN_COURS' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {reservation.statut}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        {reservation.prix}€ pour {reservation.duree} jour(s)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réservation trouvée</h3>
                <p className="text-gray-500">
                  Aucune réservation ne correspond aux critères de recherche sélectionnés.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

             {/* Vue d'ensemble */}
       <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chambres totales</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availability.totalRooms}</div>
            <p className="text-xs text-muted-foreground">
              Capacité totale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chambres occupées</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{availability.occupiedRooms}</div>
            <p className="text-xs text-muted-foreground">
              Réservations actives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chambres disponibles</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availability.availableRooms}</div>
            <p className="text-xs text-muted-foreground">
              Prêtes à réserver
            </p>
          </CardContent>
        </Card>

                 <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Taux d'occupation</CardTitle>
             <TrendingUp className="h-4 w-4 text-blue-600" />
           </CardHeader>
           <CardContent>
             <div className={`text-2xl font-bold ${getOccupancyColor(availability.occupancyRate)}`}>
               {availability.occupancyRate}%
             </div>
             <p className="text-xs text-muted-foreground">
               {parseFloat(availability.occupancyRate) > 80 ? 'Élevé' : 'Normal'}
             </p>
           </CardContent>
         </Card>

         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Alerte sur occupation</CardTitle>
             <AlertCircle className="h-4 w-4 text-orange-600" />
           </CardHeader>
           <CardContent>
             <div className={`text-2xl font-bold ${getOccupancyColor(availability.occupancyRate)}`}>
               {availability.occupancyRate}%
             </div>
             <p className="text-xs text-muted-foreground">
               {parseFloat(availability.occupancyRate) >= 90 ? 'CRITIQUE' : 
                parseFloat(availability.occupancyRate) >= 75 ? 'ÉLEVÉE' : 
                parseFloat(availability.occupancyRate) >= 50 ? 'MODÉRÉE' : 'FAIBLE'}
             </p>
           </CardContent>
         </Card>
      </div>





      {/* Réservations du jour sélectionné */}
      {availability.reservations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Réservations pour le {new Date(selectedDate).toLocaleDateString('fr-FR')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availability.reservations.map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{reservation.usager}</p>
                      <p className="text-sm text-gray-500">{reservation.hotel} - {reservation.chambre}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={
                      reservation.statut === 'CONFIRMEE' ? 'bg-green-100 text-green-800' :
                      reservation.statut === 'EN_COURS' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {reservation.statut}
                    </Badge>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(reservation.dateArrivee).toLocaleDateString('fr-FR')} - {new Date(reservation.dateDepart).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

             {/* Modal de réservation rapide */}
       {isQuickReservationModalOpen && selectedRoomForReservation && (
         <QuickReservationModal
           isOpen={isQuickReservationModalOpen}
           onClose={() => setIsQuickReservationModalOpen(false)}
           onSuccess={handleQuickReservationSuccess}
           roomData={selectedRoomForReservation}
           dateRange={searchDateRange}
           hotels={hotels}
           operateurs={operateurs}
         />
       )}

       {/* Alertes et chambres critiques */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Alerte de fin de séjour */}
         <EndingStaysAlert maxDisplay={3} />
         
         {/* Chambres critiques */}
         <CriticalRoomsAlert maxDisplay={3} />
       </div>
     </div>
   );
 } 
