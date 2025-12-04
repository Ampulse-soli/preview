"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Phone, 
  Mail, 
  MapPin, 
  Plus, 
  UserCheck, 
  Calendar,
  Users,
  Building2,
  User,
  Euro,
  TrendingUp,
  Star,
  Clock,
  AlertCircle,
  Download,
  Send,
  Eye,
  FileText,
  Shield,
  Heart,
  Briefcase,
  Home,
  ArrowLeft,
  Edit,
  Trash2,
  Grid,
  List,
  CheckCircle,
  Calculator,
  Building
} from 'lucide-react';
import { OperateurSocial, Client as ClientType } from '../../types';
import { supabase } from '../../lib/supabase';
import AddClientPage from '../pages/AddClientPage';
import React from 'react'; // Added missing import for React

interface OperateursTableProps {
  operateurs: OperateurSocial[];
  onOperateurSelect: (operateur: OperateurSocial) => void;
  onAddOperateur?: () => void;
}

// Types de clients étendus
interface Client {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  codePostal: string;
  type: 'association' | 'entreprise' | 'particulier';
  statut: 'actif' | 'inactif' | 'vip';
  dateCreation: string;
  derniereVisite: string;
  nombreReservations: number;
  totalDepense: number;
  pointsFidelite: number;
  notes: string;
  preferences: string[];
  // Champs spécifiques aux associations
  organisation?: string;
  specialite?: string;
  zoneIntervention?: string;
  numeroAgrement?: string;
  // Champs spécifiques aux entreprises
  siret?: string;
  secteurActivite?: string;
  nombreEmployes?: number;
  // Champs spécifiques aux particuliers
  dateNaissance?: string;
  profession?: string;
}

// Types et constantes pour l'édition
const CLIENT_TYPES = [
  { id: 1, label: 'Particulier', icon: User },
  { id: 2, label: 'Entreprise', icon: Building },
  { id: 3, label: 'Association', icon: Heart }
];

const SECTEURS_ACTIVITE = [
  'Santé / Social',
  'Éducation / Formation',
  'Commerce / Vente',
  'Industrie / Production',
  'Services / Conseil',
  'Administration publique',
  'Associations / ONG',
  'Autre'
];

const STATUTS_JURIDIQUES = [
  'SARL', 'SAS', 'SA', 'EURL', 'Auto-entrepreneur',
  'Association loi 1901', 'Fondation', 'Coopérative', 'Autre'
];

const TYPES_REFERENT = [
  'contact_principal',
  'facturation',
  'juridique',
  'technique'
];

interface Referent {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  fonction: string;
  types: string[];
}

interface ConventionPrixForm {
  hotelId: number;
  typeChambre: string;
  prixConventionne: number;
  prixStandard: number;
  reduction: number;
  conditionsSpeciales?: string;
  tarifsMensuels?: any;
}

export default function OperateursTable({ operateurs, onOperateurSelect, onAddOperateur }: OperateursTableProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'associations' | 'entreprises' | 'particuliers'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  
  // États pour la gestion des clients réels
  const [realClients, setRealClients] = useState<ClientType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<ClientType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<ClientType>>({});
  const [editActiveTab, setEditActiveTab] = useState('general');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  // États pour l'édition complète
  const [editReferents, setEditReferents] = useState<Referent[]>([]);
  const [editConventionsPrix, setEditConventionsPrix] = useState<ConventionPrixForm[]>([]);

  // Charger les vrais clients depuis la base de données
  useEffect(() => {
    loadRealClients();
  }, []);

  const loadRealClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('search_clients', {
        p_search_term: '',
        p_type_id: null,
        p_statut: null,
        p_limit: 100
      });

      if (error) {
        console.error('Erreur lors du chargement des clients:', error);
        return;
      }

      setRealClients((data as unknown as ClientType[]) || []);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClient = (client: ClientType) => {
    setSelectedClient(client);
    setEditFormData({
      nom: client.nom || '',
      prenom: client.prenom || '',
      raison_sociale: client.raison_sociale || '',
      email: client.email || '',
      telephone: client.telephone || '',
      adresse: client.adresse || '',
      code_postal: client.code_postal || '',
      ville: client.ville || '',
      pays: client.pays || 'France',
      statut: client.statut || 'actif',
      notes: client.notes || '',
      conditions_paiement: client.conditions_paiement || '30 jours',
      siret: client.siret || '',
      secteur_activite: client.secteur_activite || '',
      nombre_employes: client.nombre_employes || undefined,
      numero_agrement: client.numero_agrement || '',
      nombre_adherents: client.nombre_adherents || undefined,
      nombre_enfants: client.nombre_enfants || undefined,
      type_id: client.type_id || 1
    });
    setIsEditing(true);
    setEditActiveTab('general');
    setEditError(null);
    setEditSuccess(null);
  };

  const handleSaveClient = async () => {
    if (!selectedClient) return;

    try {
      setEditLoading(true);
      setEditError(null);

      const { data, error } = await supabase.rpc('update_client', {
        p_client_id: selectedClient.id,
        p_nom: editFormData.nom,
        p_prenom: editFormData.prenom,
        p_raison_sociale: editFormData.raison_sociale,
        p_email: editFormData.email,
        p_telephone: editFormData.telephone,
        p_adresse: editFormData.adresse,
        p_code_postal: editFormData.code_postal,
        p_ville: editFormData.ville,
        p_pays: editFormData.pays,
        p_statut: editFormData.statut,
        p_notes: editFormData.notes,
        p_conditions_paiement: editFormData.conditions_paiement,
        p_siret: editFormData.siret,
        p_secteur_activite: editFormData.secteur_activite,
        p_nombre_employes: editFormData.nombre_employes,
        p_numero_agrement: editFormData.numero_agrement,
        p_nombre_adherents: editFormData.nombre_adherents,
        p_nombre_enfants: editFormData.nombre_enfants
      });

      if (error) {
        setEditError('Erreur lors de la modification: ' + error.message);
        return;
      }

      const result = data as any;
      if (result && result.success) {
        setEditSuccess('Client modifié avec succès !');
        await loadRealClients(); // Recharger les données
        setTimeout(() => {
          setIsEditing(false);
          setSelectedClient(null);
          setEditFormData({});
        }, 2000);
      } else {
        setEditError(result?.message || 'Erreur lors de la modification');
      }
    } catch (error: any) {
      setEditError('Erreur lors de la modification: ' + error.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedClient(null);
    setEditFormData({});
    setEditError(null);
    setEditSuccess(null);
  };

  // Gestion des référents pour l'édition
  const ajouterReferent = () => {
    const nouvelId = `ref_${Date.now()}`;
    setEditReferents(prev => [...prev, {
      id: nouvelId,
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      fonction: '',
      types: ['contact_principal']
    }]);
  };

  const supprimerReferent = (id: string) => {
    setEditReferents(prev => prev.filter(ref => ref.id !== id));
  };

  const modifierReferent = (id: string, champ: string, valeur: any) => {
    setEditReferents(prev => prev.map(ref => 
      ref.id === id ? { ...ref, [champ]: valeur } : ref
    ));
  };

  const toggleTypeReferent = (refId: string, type: string) => {
    setEditReferents(prev => prev.map(ref => {
      if (ref.id === refId) {
        const types = ref.types.includes(type)
          ? ref.types.filter(t => t !== type)
          : [...ref.types, type];
        return { ...ref, types };
      }
      return ref;
    }));
  };

  // Gestion des conventions de prix pour l'édition
  const ajouterConventionPrix = () => {
    const nouvelleConvention: ConventionPrixForm = {
      hotelId: 1,
      typeChambre: 'standard',
      prixConventionne: 45,
      prixStandard: 50,
      reduction: 10,
      conditionsSpeciales: '',
      tarifsMensuels: {}
    };
    setEditConventionsPrix(prev => [...prev, nouvelleConvention]);
  };

  const supprimerConventionPrix = (index: number) => {
    setEditConventionsPrix(prev => prev.filter((_, i) => i !== index));
  };

  const modifierConventionPrix = (index: number, champ: string, valeur: any) => {
    setEditConventionsPrix(prev => prev.map((conv, i) =>
      i === index ? { ...conv, [champ]: valeur } : conv
    ));
  };

  // Données fictives pour les statistiques
  const entreprisesClients: Client[] = [
    {
      id: 1,
      nom: 'Tech Solutions',
      prenom: '',
      email: 'contact@techsolutions.fr',
      telephone: '01.42.00.10.01',
      adresse: '123 Rue de la Paix',
      ville: 'Paris',
      codePostal: '75001',
      type: 'entreprise',
      statut: 'actif',
      dateCreation: '2023-01-15',
      derniereVisite: '2024-01-20',
      nombreReservations: 45,
      totalDepense: 12500,
      pointsFidelite: 1250,
      notes: 'Client fidèle, préfère les chambres avec vue',
      preferences: ['chambres_vue', 'parking'],
      siret: '12345678901234',
      secteurActivite: 'Informatique',
      nombreEmployes: 25
    },
    {
      id: 2,
      nom: 'ConstructPlus',
      prenom: '',
      email: 'contact@constructplus.fr',
      telephone: '01.42.00.10.02',
      adresse: '456 Avenue des Champs',
      ville: 'Paris',
      codePostal: '75008',
      type: 'entreprise',
      statut: 'actif',
      dateCreation: '2023-03-20',
      derniereVisite: '2024-01-18',
      nombreReservations: 32,
      totalDepense: 8900,
      pointsFidelite: 890,
      notes: 'Entreprise de construction, besoins réguliers',
      preferences: ['chambres_adaptees', 'restaurant'],
      siret: '98765432109876',
      secteurActivite: 'Construction',
      nombreEmployes: 85
    }
  ];

  const particuliersClients: Client[] = [
    {
      id: 3,
      nom: 'Bernard',
      prenom: 'Marie',
      email: 'marie.bernard@email.com',
      telephone: '01.42.00.10.03',
      adresse: '789 Rue du Faubourg Saint-Honoré',
      ville: 'Paris',
      codePostal: '75008',
      type: 'particulier',
      statut: 'actif',
      dateCreation: '2023-02-10',
      derniereVisite: '2024-01-15',
      nombreReservations: 12,
      totalDepense: 3200,
      pointsFidelite: 320,
      notes: 'Client fidèle, préfère les chambres avec vue',
      preferences: ['chambres_vue', 'spa'],
      dateNaissance: '1985-06-15',
      profession: 'Avocate'
    },
    {
      id: 4,
      nom: 'Petit',
      prenom: 'Pierre',
      email: 'pierre.petit@email.com',
      telephone: '01.42.00.10.04',
      adresse: '321 Avenue Montaigne',
      ville: 'Paris',
      codePostal: '75008',
      type: 'particulier',
      statut: 'vip',
      dateCreation: '2023-01-05',
      derniereVisite: '2024-01-22',
      nombreReservations: 28,
      totalDepense: 15600,
      pointsFidelite: 1560,
      notes: 'Client VIP, très exigeant sur la qualité',
      preferences: ['suite', 'conciergerie', 'spa'],
      dateNaissance: '1978-12-03',
      profession: 'Médecin'
    }
  ];

  const associationsClients: Client[] = [
    {
      id: 5,
      nom: 'SIAO 75',
      prenom: '',
      email: 'contact@siao75.fr',
      telephone: '01.42.00.10.05',
      adresse: '654 Boulevard Saint-Germain',
      ville: 'Paris',
      codePostal: '75006',
      type: 'association',
      statut: 'actif',
      dateCreation: '2023-04-12',
      derniereVisite: '2024-01-19',
      nombreReservations: 67,
      totalDepense: 18900,
      pointsFidelite: 1890,
      notes: 'Association d\'aide aux sans-abri, besoins fréquents',
      preferences: ['chambres_adaptees', 'parking'],
      organisation: 'SIAO 75',
      specialite: 'Aide aux sans-abri',
      zoneIntervention: 'Paris',
      numeroAgrement: 'AGR-0001'
    },
    {
      id: 6,
      nom: 'Emmaüs France',
      prenom: '',
      email: 'contact@emmaus.fr',
      telephone: '01.42.00.10.06',
      adresse: '987 Rue de Rivoli',
      ville: 'Paris',
      codePostal: '75001',
      type: 'association',
      statut: 'actif',
      dateCreation: '2023-05-18',
      derniereVisite: '2024-01-16',
      nombreReservations: 43,
      totalDepense: 12100,
      pointsFidelite: 1210,
      notes: 'Association de solidarité, tarifs préférentiels',
      preferences: ['chambres_standard', 'restaurant'],
      organisation: 'Emmaüs France',
      specialite: 'Solidarité',
      zoneIntervention: 'France',
      numeroAgrement: 'AGR-0002'
    }
  ];

  // Utiliser seulement les clients réels de la base de données
  const allClients = realClients;

  // Filtrer les clients selon le type
  const filteredClients = allClients.filter(client => {
    const matchesSearch = searchTerm === '' || 
      client.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.raison_sociale?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || 
      (typeFilter === 'association' && client.type_id === 3) ||
      (typeFilter === 'entreprise' && client.type_id === 2) ||
      (typeFilter === 'particulier' && client.type_id === 1);

    const matchesStatus = statusFilter === 'all' || client.statut === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculer les statistiques
  const totalClients = allClients.length;
  const actifsClients = allClients.filter(c => c.statut === 'actif').length;
  const inactifsClients = allClients.filter(c => c.statut === 'inactif').length;
  const prospectsClients = allClients.filter(c => c.statut === 'prospect').length;
  const archivesClients = allClients.filter(c => c.statut === 'archive').length;

  const associationsClientsCount = allClients.filter(c => c.type_id === 3).length;
  const entreprisesClientsCount = allClients.filter(c => c.type_id === 2).length;
  const particuliersClientsCount = allClients.filter(c => c.type_id === 1).length;

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'actif': return 'bg-green-100 text-green-800';
      case 'inactif': return 'bg-gray-100 text-gray-800';
      case 'prospect': return 'bg-yellow-100 text-yellow-800';
      case 'archive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'association': return 'bg-purple-100 text-purple-800';
      case 'entreprise': return 'bg-blue-100 text-blue-800';
      case 'particulier': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'association': return Heart;
      case 'entreprise': return Building2;
      case 'particulier': return User;
      default: return User;
    }
  };

  const getTypeName = (typeId: number) => {
    switch (typeId) {
      case 1: return 'Particulier';
      case 2: return 'Entreprise';
      case 3: return 'Association';
      default: return 'Inconnu';
    }
  };

  const getTypeIconById = (typeId: number) => {
    switch (typeId) {
      case 1: return User;
      case 2: return Building2;
      case 3: return Heart;
      default: return User;
    }
  };

  const getClientFullName = (client: ClientType) => {
    if (client.raison_sociale) {
      return client.raison_sociale;
    }
    return `${client.prenom || ''} ${client.nom || ''}`.trim();
  };

  const getClientIdentifier = (client: ClientType) => {
    if (client.numero_client) {
      return client.numero_client;
    }
    return `CLI-${client.id.toString().padStart(4, '0')}`;
  };

  // Rendu du formulaire d'édition complet
  const renderEditForm = () => {
    if (!selectedClient) return null;

    return (
      <div className="max-w-6xl mx-auto p-4">
        {/* Messages d'état */}
        {editError && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Erreur:</strong> {editError}
            </AlertDescription>
          </Alert>
        )}

        {editSuccess && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Succès:</strong> {editSuccess}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center space-x-2">
                <Edit className="h-6 w-6" />
                <span>Modifier le client : {getClientFullName(selectedClient)}</span>
              </CardTitle>
              <Button variant="outline" onClick={handleCancelEdit}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={editActiveTab} onValueChange={setEditActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">Informations générales</TabsTrigger>
                <TabsTrigger value="facturation">Facturation</TabsTrigger>
                <TabsTrigger value="referents">Référents ({editReferents.length})</TabsTrigger>
                <TabsTrigger value="tarification">Conventions tarifaires</TabsTrigger>
              </TabsList>

              {/* Onglet Informations générales */}
              <TabsContent value="general" className="space-y-6">
                {/* Sélection du type */}
                <div>
                  <Label className="text-base font-medium">Type de structure *</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {CLIENT_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <Card 
                          key={type.id}
                          className={`cursor-pointer transition-all ${
                            editFormData.type_id === type.id 
                              ? 'ring-2 ring-blue-500 bg-blue-50' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setEditFormData(prev => ({ ...prev, type_id: type.id }))}
                        >
                          <CardContent className="p-4 text-center">
                            <Icon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                            <div className="font-medium">{type.label}</div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nom">Nom / Raison sociale *</Label>
                    <Input
                      id="nom"
                      value={editFormData.nom || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, nom: e.target.value }))}
                      required
                    />
                  </div>

                  {editFormData.type_id === 1 && (
                    <div>
                      <Label htmlFor="prenom">Prénom *</Label>
                      <Input
                        id="prenom"
                        value={editFormData.prenom || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, prenom: e.target.value }))}
                        required
                      />
                    </div>
                  )}

                  {editFormData.type_id !== 1 && (
                    <div>
                      <Label htmlFor="raison_sociale">Raison sociale *</Label>
                      <Input
                        id="raison_sociale"
                        value={editFormData.raison_sociale || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, raison_sociale: e.target.value }))}
                        required
                      />
                    </div>
                  )}

                  {editFormData.type_id === 2 && (
                    <div>
                      <Label htmlFor="siret">SIRET</Label>
                      <Input
                        id="siret"
                        value={editFormData.siret || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, siret: e.target.value }))}
                        placeholder="14 chiffres"
                      />
                    </div>
                  )}

                  {editFormData.type_id === 3 && (
                    <div>
                      <Label htmlFor="numero_agrement">Numéro d'agrément</Label>
                      <Input
                        id="numero_agrement"
                        value={editFormData.numero_agrement || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, numero_agrement: e.target.value }))}
                        placeholder="Numéro d'agrément"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="secteur_activite">Secteur d'activité</Label>
                    <select
                      id="secteur_activite"
                      value={editFormData.secteur_activite || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, secteur_activite: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Sélectionner un secteur</option>
                      {SECTEURS_ACTIVITE.map(secteur => (
                        <option key={secteur} value={secteur}>{secteur}</option>
                      ))}
                    </select>
                  </div>

                  {editFormData.type_id === 2 && (
                    <div>
                      <Label htmlFor="nombre_employes">Nombre d'employés</Label>
                      <Input
                        id="nombre_employes"
                        type="number"
                        value={editFormData.nombre_employes || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, nombre_employes: parseInt(e.target.value) || undefined }))}
                      />
                    </div>
                  )}

                  {editFormData.type_id === 3 && (
                    <div>
                      <Label htmlFor="nombre_adherents">Nombre d'adhérents</Label>
                      <Input
                        id="nombre_adherents"
                        type="number"
                        value={editFormData.nombre_adherents || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, nombre_adherents: parseInt(e.target.value) || undefined }))}
                      />
                    </div>
                  )}

                  {editFormData.type_id === 1 && (
                    <div>
                      <Label htmlFor="nombre_enfants">Nombre d'enfants</Label>
                      <Input
                        id="nombre_enfants"
                        type="number"
                        value={editFormData.nombre_enfants || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, nombre_enfants: parseInt(e.target.value) || undefined }))}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="adresse">Adresse complète</Label>
                  <Textarea
                    id="adresse"
                    value={editFormData.adresse || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, adresse: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="ville">Ville</Label>
                    <Input
                      id="ville"
                      value={editFormData.ville || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, ville: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="code_postal">Code postal</Label>
                    <Input
                      id="code_postal"
                      value={editFormData.code_postal || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, code_postal: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pays">Pays</Label>
                    <Input
                      id="pays"
                      value={editFormData.pays || 'France'}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, pays: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editFormData.email || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input
                      id="telephone"
                      value={editFormData.telephone || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, telephone: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="statut">Statut</Label>
                  <select
                    id="statut"
                    value={editFormData.statut || 'actif'}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, statut: e.target.value as 'actif' | 'inactif' | 'prospect' | 'archive' }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                    <option value="prospect">Prospect</option>
                    <option value="archive">Archivé</option>
                  </select>
                </div>
              </TabsContent>

              {/* Onglet Facturation */}
              <TabsContent value="facturation" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="conditions_paiement">Conditions de paiement</Label>
                    <Input
                      id="conditions_paiement"
                      value={editFormData.conditions_paiement || '30 jours'}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, conditions_paiement: e.target.value }))}
                      placeholder="Ex: 30 jours"
                    />
                  </div>

                </div>

                <div>
                  <Label htmlFor="notes">Notes et observations</Label>
                  <Textarea
                    id="notes"
                    value={editFormData.notes || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    placeholder="Informations complémentaires..."
                  />
                </div>
              </TabsContent>

              {/* Onglet Référents */}
              <TabsContent value="referents" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Référents</h3>
                    <p className="text-sm text-gray-600">Gérez les contacts de cette structure</p>
                  </div>
                  <Button type="button" onClick={ajouterReferent} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Ajouter un référent</span>
                  </Button>
                </div>

                {editReferents.length === 0 && (
                  <Card className="p-8 text-center">
                    <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun référent</h3>
                    <p className="text-gray-600">Ajoutez des référents pour faciliter la communication</p>
                  </Card>
                )}

                {editReferents.map((referent, index) => (
                  <Card key={referent.id}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-base">Référent #{index + 1}</CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => supprimerReferent(referent.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Nom *</Label>
                          <Input
                            value={referent.nom}
                            onChange={(e) => modifierReferent(referent.id, 'nom', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label>Prénom *</Label>
                          <Input
                            value={referent.prenom}
                            onChange={(e) => modifierReferent(referent.id, 'prenom', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label>Email *</Label>
                          <Input
                            type="email"
                            value={referent.email}
                            onChange={(e) => modifierReferent(referent.id, 'email', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label>Téléphone</Label>
                          <Input
                            value={referent.telephone}
                            onChange={(e) => modifierReferent(referent.id, 'telephone', e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Fonction</Label>
                        <Input
                          value={referent.fonction}
                          onChange={(e) => modifierReferent(referent.id, 'fonction', e.target.value)}
                          placeholder="Ex: Directeur, Responsable social..."
                        />
                      </div>

                      <div>
                        <Label>Rôles</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {TYPES_REFERENT.map(type => (
                            <Button
                              key={type}
                              type="button"
                              variant={referent.types.includes(type) ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleTypeReferent(referent.id, type)}
                            >
                              {type === 'contact_principal' && 'Contact principal'}
                              {type === 'facturation' && 'Facturation'}
                              {type === 'juridique' && 'Juridique'}
                              {type === 'technique' && 'Technique'}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Onglet Conventions tarifaires */}
              <TabsContent value="tarification" className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Conventions tarifaires</h3>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Tarifs conventionnés</h3>
                    <p className="text-sm text-gray-600">Définissez les tarifs préférentiels pour ce client</p>
                  </div>
                  <Button type="button" onClick={ajouterConventionPrix} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Ajouter une convention</span>
                  </Button>
                </div>

                {editConventionsPrix.length === 0 && (
                  <Card className="p-8 text-center">
                    <Calculator className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune convention tarifaire</h3>
                    <p className="text-gray-600">Ajoutez des conventions pour personnaliser les tarifs</p>
                  </Card>
                )}

                {editConventionsPrix.map((convention, index) => (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-base">Convention #{index + 1}</CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => supprimerConventionPrix(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Type de chambre</Label>
                          <select
                            value={convention.typeChambre}
                            onChange={(e) => modifierConventionPrix(index, 'typeChambre', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="standard">Standard</option>
                            <option value="confort">Confort</option>
                            <option value="superieure">Supérieure</option>
                            <option value="suite">Suite</option>
                            <option value="adaptee">Adaptée PMR</option>
                          </select>
                        </div>
                        <div>
                          <Label>Prix standard (€)</Label>
                          <Input
                            type="number"
                            value={convention.prixStandard}
                            onChange={(e) => modifierConventionPrix(index, 'prixStandard', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label>Prix conventionné (€)</Label>
                          <Input
                            type="number"
                            value={convention.prixConventionne}
                            onChange={(e) => modifierConventionPrix(index, 'prixConventionne', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Conditions spéciales</Label>
                        <Textarea
                          value={convention.conditionsSpeciales || ''}
                          onChange={(e) => modifierConventionPrix(index, 'conditionsSpeciales', e.target.value)}
                          rows={2}
                          placeholder="Conditions particulières..."
                        />
                      </div>

                      <div className="text-center p-3 bg-blue-50 rounded-md">
                        <div className="text-sm font-medium text-blue-800">
                          Réduction : {convention.reduction}%
                        </div>
                        <div className="text-xs text-blue-600">
                          Économie : {(convention.prixStandard - convention.prixConventionne).toFixed(0)}€ par nuit
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
              <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={editLoading}>
                Annuler
              </Button>
              <Button type="button" onClick={handleSaveClient} disabled={editLoading} className="px-8">
                {editLoading ? 'Sauvegarde en cours...' : 'Sauvegarder les modifications'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Si on est en mode édition, afficher le formulaire d'édition
  if (isEditing) {
    return renderEditForm();
  }

  // Si on affiche le formulaire d'ajout
  if (showAddClientForm) {
    return (
      <AddClientPage 
        onSuccess={() => {
          setShowAddClientForm(false);
          loadRealClients();
        }}
      />
    );
  }

  // Rendu de la vue d'ensemble
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold">{totalClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Clients Actifs</p>
                <p className="text-2xl font-bold">{actifsClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Prospects</p>
                <p className="text-2xl font-bold">{prospectsClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Euro className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
                <p className="text-2xl font-bold">€{allClients.reduce((sum, client) => sum + (client.montant_total_reservations || 0), 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-purple-600" />
              <span>Associations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{associationsClientsCount}</p>
            <p className="text-sm text-gray-600">clients associatifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span>Entreprises</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{entreprisesClientsCount}</p>
            <p className="text-sm text-gray-600">clients entreprises</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-green-600" />
              <span>Particuliers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{particuliersClientsCount}</p>
            <p className="text-sm text-gray-600">clients particuliers</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des clients récents */}
      <Card>
        <CardHeader>
          <CardTitle>Clients récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredClients.slice(0, 5).map((client) => (
              <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${getTypeColor(getTypeName(client.type_id || 1).toLowerCase())}`}>
                    {React.createElement(getTypeIconById(client.type_id || 1), { className: "h-4 w-4" })}
                  </div>
                  <div>
                    <p className="font-medium">{getClientFullName(client)}</p>
                    <p className="text-sm text-gray-600">{getClientIdentifier(client)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(client.statut || 'actif')}>
                    {client.statut || 'actif'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClient(client)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Rendu de la liste des clients
  const renderClientList = (clientType: 'association' | 'entreprise' | 'particulier') => {
    const typeId = clientType === 'association' ? 3 : clientType === 'entreprise' ? 2 : 1;
    const clients = filteredClients.filter(client => client.type_id === typeId);

    return (
      <div className="space-y-4">
        {clients.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              {React.createElement(getTypeIconById(typeId), { className: "h-12 w-12 mx-auto" })}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun client {clientType}</h3>
            <p className="text-gray-600">Aucun client de ce type trouvé</p>
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
            {clients.map((client) => (
              <Card key={client.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-full ${getTypeColor(getTypeName(client.type_id || 1).toLowerCase())}`}>
                        {React.createElement(getTypeIconById(client.type_id || 1), { className: "h-4 w-4" })}
                      </div>
                      <div>
                        <CardTitle className="text-base">{getClientFullName(client)}</CardTitle>
                        <p className="text-sm text-gray-600">{getClientIdentifier(client)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Badge className={getStatusColor(client.statut || 'actif')}>
                        {client.statut || 'actif'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClient(client)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{client.email || 'Non renseigné'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{client.telephone || 'Non renseigné'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {client.ville && client.code_postal 
                        ? `${client.code_postal} ${client.ville}`
                        : 'Adresse non renseignée'
                      }
                    </span>
                  </div>
                  
                  {client.nombre_reservations !== undefined && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{client.nombre_reservations} réservation(s)</span>
                    </div>
                  )}
                  
                  {client.montant_total_reservations !== undefined && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Euro className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">€{client.montant_total_reservations.toLocaleString()}</span>
                    </div>
                  )}

                  {client.notes && (
                    <div className="text-sm text-gray-600 border-t pt-2">
                      <p className="line-clamp-2">{client.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec recherche et filtres */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Gestion des clients</h2>
          <Button onClick={() => setShowAddClientForm(true)} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Ajouter un client</span>
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="all">Tous les types</option>
            <option value="association">Associations</option>
            <option value="entreprise">Entreprises</option>
            <option value="particulier">Particuliers</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="all">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
            <option value="prospect">Prospect</option>
            <option value="archive">Archivé</option>
          </select>

          <div className="flex items-center space-x-1 border rounded-md p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveTab('associations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'associations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Associations ({associationsClientsCount})
          </button>
          <button
            onClick={() => setActiveTab('entreprises')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'entreprises'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Entreprises ({entreprisesClientsCount})
          </button>
          <button
            onClick={() => setActiveTab('particuliers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'particuliers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Particuliers ({particuliersClientsCount})
          </button>
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'associations' && renderClientList('association')}
        {activeTab === 'entreprises' && renderClientList('entreprise')}
        {activeTab === 'particuliers' && renderClientList('particulier')}
      </div>
    </div>
  );
} 
