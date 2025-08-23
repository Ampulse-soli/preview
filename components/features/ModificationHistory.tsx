"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  History, 
  Filter, 
  Search, 
  User, 
  Calendar, 
  Building2,
  Edit,
  Plus,
  Trash2,
  Eye,
  RefreshCw
} from 'lucide-react';

interface ModificationRecord {
  id: number;
  timestamp: string;
  agent: {
    id: number;
    nom: string;
    prenom: string;
    role: 'receptionniste' | 'manager' | 'admin' | 'superviseur';
  };
  reservation?: {
    id: number;
    numero: string;
    usager: string;
    hotel: string;
  };
  action: 'create' | 'update' | 'delete' | 'view';
  module: 'reservation' | 'client' | 'hotel' | 'chambre' | 'system';
  description: string;
  details?: string;
}

interface ModificationHistoryProps {
  reservations?: Array<{ id: number; numero: string; usager: string; hotel: string }>;
  agents?: Array<{ id: number; nom: string; prenom: string; role: string }>;
}

export default function ModificationHistory({ 
  reservations = [], 
  agents = [] 
}: ModificationHistoryProps) {
  const [modifications, setModifications] = useState<ModificationRecord[]>([]);
  const [filteredModifications, setFilteredModifications] = useState<ModificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtres
  const [selectedReservation, setSelectedReservation] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Générer des données de démonstration
  useEffect(() => {
    const generateDemoData = (): ModificationRecord[] => {
      const demoAgents = [
        { id: 1, nom: 'Dupont', prenom: 'Marie', role: 'receptionniste' as const },
        { id: 2, nom: 'Martin', prenom: 'Pierre', role: 'manager' as const },
        { id: 3, nom: 'Bernard', prenom: 'Sophie', role: 'admin' as const },
        { id: 4, nom: 'Leroy', prenom: 'Jean', role: 'superviseur' as const },
        { id: 5, nom: 'Moreau', prenom: 'Claire', role: 'receptionniste' as const }
      ];

      const demoReservations = [
        { id: 1, numero: 'RES-2024-001', usager: 'Jean Dupont', hotel: 'Hôtel Central' },
        { id: 2, numero: 'RES-2024-002', usager: 'Marie Martin', hotel: 'Résidence du Port' },
        { id: 3, numero: 'RES-2024-003', usager: 'Pierre Bernard', hotel: 'Hôtel Central' },
        { id: 4, numero: 'RES-2024-004', usager: 'Sophie Leroy', hotel: 'Hôtel du Parc' }
      ];

      const actions = ['create', 'update', 'delete', 'view'] as const;
      const modules = ['reservation', 'client', 'hotel', 'chambre', 'system'] as const;
      
      const actionDescriptions = {
        create: {
          reservation: 'Création d\'une nouvelle réservation',
          client: 'Ajout d\'un nouveau client',
          hotel: 'Création d\'un nouvel hôtel',
          chambre: 'Ajout d\'une nouvelle chambre',
          system: 'Configuration système modifiée'
        },
        update: {
          reservation: 'Modification d\'une réservation',
          client: 'Mise à jour des informations client',
          hotel: 'Modification des données hôtel',
          chambre: 'Mise à jour des caractéristiques de chambre',
          system: 'Paramètres système mis à jour'
        },
        delete: {
          reservation: 'Suppression d\'une réservation',
          client: 'Suppression d\'un client',
          hotel: 'Suppression d\'un hôtel',
          chambre: 'Suppression d\'une chambre',
          system: 'Suppression de données système'
        },
        view: {
          reservation: 'Consultation d\'une réservation',
          client: 'Consultation des données client',
          hotel: 'Consultation des informations hôtel',
          chambre: 'Consultation des détails de chambre',
          system: 'Consultation des paramètres système'
        }
      };

      const records: ModificationRecord[] = [];
      const now = new Date();
      
      for (let i = 0; i < 50; i++) {
        const timestamp = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const agent = demoAgents[Math.floor(Math.random() * demoAgents.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const moduleType = modules[Math.floor(Math.random() * modules.length)];
        const reservation = Math.random() > 0.3 ? demoReservations[Math.floor(Math.random() * demoReservations.length)] : undefined;

        records.push({
          id: i + 1,
          timestamp: timestamp.toISOString(),
          agent,
          reservation,
          action,
          module: moduleType,
          description: actionDescriptions[action][moduleType],
          details: `Action effectuée par ${agent.prenom} ${agent.nom} (${agent.role})`
        });
      }

      return records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    };

    setLoading(true);
    setTimeout(() => {
      const demoData = generateDemoData();
      setModifications(demoData);
      setFilteredModifications(demoData);
      setLoading(false);
    }, 1000);
  }, []);

  // Appliquer les filtres
  useEffect(() => {
    let filtered = modifications;

    // Filtre par réservation
    if (selectedReservation !== 'all') {
      filtered = filtered.filter(mod => 
        mod.reservation && mod.reservation.id.toString() === selectedReservation
      );
    }

    // Filtre par agent
    if (selectedAgent !== 'all') {
      filtered = filtered.filter(mod => 
        mod.agent.id.toString() === selectedAgent
      );
    }

    // Filtre par action
    if (selectedAction !== 'all') {
      filtered = filtered.filter(mod => mod.action === selectedAction);
    }

    // Filtre par module
    if (selectedModule !== 'all') {
      filtered = filtered.filter(mod => mod.module === selectedModule);
    }

    // Filtre par date
    if (dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter(mod => {
        const modDate = new Date(mod.timestamp);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        return modDate >= startDate && modDate <= endDate;
      });
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(mod => 
        mod.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mod.agent.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mod.agent.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (mod.reservation && mod.reservation.numero.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredModifications(filtered);
    setCurrentPage(1);
  }, [modifications, selectedReservation, selectedAgent, selectedAction, selectedModule, dateRange, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredModifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentModifications = filteredModifications.slice(startIndex, endIndex);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <Plus className="h-4 w-4 text-green-600" />;
      case 'update': return <Edit className="h-4 w-4 text-blue-600" />;
      case 'delete': return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'view': return <Eye className="h-4 w-4 text-gray-600" />;
      default: return <Eye className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'view': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'superviseur': return 'bg-orange-100 text-orange-800';
      case 'receptionniste': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const resetFilters = () => {
    setSelectedReservation('all');
    setSelectedAgent('all');
    setSelectedAction('all');
    setSelectedModule('all');
    setDateRange({ startDate: '', endDate: '' });
    setSearchTerm('');
  };

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2" />
            Historique de modifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Chargement de l'historique...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <History className="h-5 w-5 mr-2" />
            Historique de modifications
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={refreshData}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Actualiser
            </Button>
            <Badge variant="secondary">
              {filteredModifications.length} modification{filteredModifications.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filtres */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Filtres</h3>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <Filter className="h-4 w-4 mr-1" />
              Réinitialiser
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Recherche */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher dans l'historique..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filtre par réservation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Réservation
              </label>
              <select
                value={selectedReservation}
                onChange={(e) => setSelectedReservation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes les réservations</option>
                {reservations.map(reservation => (
                  <option key={reservation.id} value={reservation.id}>
                    {reservation.numero} - {reservation.usager}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre par agent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agent
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les agents</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.prenom} {agent.nom} ({agent.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre par action */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action
              </label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes les actions</option>
                <option value="create">Création</option>
                <option value="update">Modification</option>
                <option value="delete">Suppression</option>
                <option value="view">Consultation</option>
              </select>
            </div>

            {/* Filtre par module */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Module
              </label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les modules</option>
                <option value="reservation">Réservations</option>
                <option value="client">Clients</option>
                <option value="hotel">Hôtels</option>
                <option value="chambre">Chambres</option>
                <option value="system">Système</option>
              </select>
            </div>

            {/* Filtre par date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Liste des modifications */}
        <div className="space-y-3">
          {currentModifications.length > 0 ? (
            currentModifications.map((modification) => (
              <div key={modification.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getActionIcon(modification.action)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{modification.description}</h4>
                        <Badge className={getActionColor(modification.action)}>
                          {modification.action.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className={getRoleColor(modification.agent.role)}>
                          {modification.agent.role}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {modification.agent.prenom} {modification.agent.nom}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(modification.timestamp).toLocaleString('fr-FR')}
                          </span>
                          {modification.reservation && (
                            <span className="flex items-center">
                              <Building2 className="h-3 w-3 mr-1" />
                              {modification.reservation.numero}
                            </span>
                          )}
                        </div>
                        
                        {modification.details && (
                          <p className="text-gray-500">{modification.details}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune modification trouvée</h3>
              <p className="text-gray-500">
                Aucune modification ne correspond aux critères de recherche sélectionnés.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Affichage de {startIndex + 1} à {Math.min(endIndex, filteredModifications.length)} sur {filteredModifications.length} modifications
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
