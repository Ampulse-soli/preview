export interface Hotel {
  id: number;
  nom: string;
  adresse: string;
  ville: string;
  codePostal: string;
  telephone: string;
  email: string;
  gestionnaire: string;
  statut: string;
  chambresTotal: number;
  chambresOccupees: number;
  tauxOccupation: number;
}

export interface Room {
  id: number;
  hotelId: number;
  numero: string;
  type: string;
  prix: number;
  statut: 'disponible' | 'occupee' | 'maintenance';
  description?: string;
  etage?: number;
  capacite: number;
  equipements?: string[];
  accessibilite: boolean;
  prixSemaine?: number;
  prixMois?: number;
  notes?: string;
  dateMaintenance?: string;
  dureeMaintenance: number;
}

export interface RoomType {
  id: number;
  nom: string;
  description?: string;
  capaciteMin: number;
  capaciteMax: number;
  prixBase: number;
  equipementsStandards?: string[];
}

export interface RoomPricing {
  id: number;
  hotelId: number;
  roomTypeId: number;
  prixJour: number;
  prixSemaine?: number;
  prixMois?: number;
  saison: 'basse' | 'standard' | 'haute' | 'pic';
  dateDebut?: string;
  dateFin?: string;
  actif: boolean;
}

export interface RoomAvailability {
  id: number;
  roomId: number;
  dateDisponibilite: string;
  statut: 'disponible' | 'reservee' | 'occupee' | 'maintenance' | 'bloquee';
  reservationId?: number;
  prixJour?: number;
  notes?: string;
}

export interface RoomStatusHistory {
  id: number;
  roomId: number;
  ancienStatut: string;
  nouveauStatut: string;
  raison?: string;
  utilisateurId?: string;
  dateChangement: string;
}

// Interfaces pour les options et suppléments
export interface OptionCategory {
  id: number;
  nom: string;
  description?: string;
  icone?: string;
  couleur: string;
  ordre: number;
  actif: boolean;
}

export interface RoomOption {
  id: number;
  nom: string;
  description?: string;
  categorieId?: number;
  type: 'option' | 'supplement' | 'service';
  prix: number;
  prixType: 'fixe' | 'pourcentage' | 'par_nuit' | 'par_personne';
  unite: string;
  disponible: boolean;
  obligatoire: boolean;
  maxQuantite: number;
  minQuantite: number;
  icone?: string;
  couleur: string;
  ordre: number;
  conditionsApplication?: Record<string, any>;
}

export interface RoomOptionAssignment {
  id: number;
  roomId: number;
  optionId: number;
  prixPersonnalise?: number;
  disponible: boolean;
  ordre: number;
  notes?: string;
}

export interface HotelOptionAssignment {
  id: number;
  hotelId: number;
  optionId: number;
  prixPersonnalise?: number;
  disponible: boolean;
  ordre: number;
  notes?: string;
}

export interface ReservationOption {
  id: number;
  reservationId: number;
  optionId: number;
  quantite: number;
  prixUnitaire: number;
  prixTotal: number;
  notes?: string;
  dateAjout: string;
}

export interface OptionPack {
  id: number;
  nom: string;
  description?: string;
  prixPack: number;
  reductionPourcentage: number;
  actif: boolean;
  ordre: number;
}

export interface OptionPackItem {
  id: number;
  packId: number;
  optionId: number;
  quantite: number;
  prixPersonnalise?: number;
  obligatoire: boolean;
}

export interface HotelPackAssignment {
  id: number;
  hotelId: number;
  packId: number;
  prixPersonnalise?: number;
  disponible: boolean;
  ordre: number;
}

// Interface pour les options avec informations complètes
export interface RoomOptionWithDetails extends RoomOption {
  categorie?: OptionCategory;
  prixPersonnalise?: number;
  quantiteSelectionnee?: number;
}

export interface Reservation {
  id: number;
  usager: string;
  chambre: string;
  hotel: string;
  dateArrivee: string;
  dateDepart: string;
  statut: string;
  prescripteur: string;
  prix: number;
  duree: number;
}

export interface OperateurSocial {
  id: number;
  nom: string;
  prenom: string;
  organisation: string;
  telephone: string;
  email: string;
  statut: 'actif' | 'inactif';
  specialite: string;
  zoneIntervention: string;
  nombreReservations: number;
  dateCreation: string;
  notes?: string;
}

// Interface pour les tarifs mensuels
export interface TarifsMensuels {
  janvier?: {
    prixParPersonne?: number;
    prixParChambre?: number;
  };
  fevrier?: {
    prixParPersonne?: number;
    prixParChambre?: number;
  };
  mars?: {
    prixParPersonne?: number;
    prixParChambre?: number;
  };
  avril?: {
    prixParPersonne?: number;
    prixParChambre?: number;
  };
  mai?: {
    prixParPersonne?: number;
    prixParChambre?: number;
  };
  juin?: {
    prixParPersonne?: number;
    prixParChambre?: number;
  };
  juillet?: {
    prixParPersonne?: number;
    prixParChambre?: number;
  };
  aout?: {
    prixParPersonne?: number;
    prixParChambre?: number;
  };
  septembre?: {
    prixParPersonne?: number;
    prixParChambre?: number;
  };
  octobre?: {
    prixParPersonne?: number;
    prixParChambre?: number;
  };
  novembre?: {
    prixParPersonne?: number;
    prixParChambre?: number;
  };
  decembre?: {
    prixParPersonne?: number;
    prixParChambre?: number;
  };
}

export interface ConventionPrix {
  id: number;
  operateurId: number;
  hotelId: number;
  hotelNom: string;
  typeChambre: string;
  prixStandard: number;
  prixConventionne: number;
  reduction: number;
  dateDebut: string;
  dateFin?: string;
  statut: 'active' | 'expiree' | 'suspendue';
  conditions?: string;
  conditionsSpeciales?: string;
  tarifsMensuels?: TarifsMensuels;
}

export interface ProcessusReservation {
  id: number;
  reservationId: number;
  statut: 'en_cours' | 'termine' | 'annule';
  etapes: {
    bonHebergement: {
      statut: 'en_attente' | 'valide' | 'refuse' | 'expire';
      dateCreation: string;
      dateValidation?: string;
      numero: string;
      validateur?: string;
      commentaires?: string;
    };
    bonCommande: {
      statut: 'en_attente' | 'valide' | 'refuse' | 'expire';
      dateCreation?: string;
      dateValidation?: string;
      numero?: string;
      validateur?: string;
      montant: number;
      commentaires?: string;
    };
    facture: {
      statut: 'en_attente' | 'generee' | 'envoyee' | 'payee' | 'impayee';
      dateCreation?: string;
      dateEnvoi?: string;
      datePaiement?: string;
      numero?: string;
      montant: number;
      montantPaye: number;
      commentaires?: string;
    };
  };
  dateDebut: string;
  dateFin?: string;
  dureeEstimee: number;
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
}

export interface Message {
  id: number;
  expediteurId: number;
  expediteurNom: string;
  expediteurType: 'admin' | 'operateur';
  destinataireId: number;
  destinataireNom: string;
  destinataireType: 'admin' | 'operateur';
  sujet: string;
  contenu: string;
  dateEnvoi: string;
  dateLecture?: string;
  statut: 'envoye' | 'lu' | 'repondu';
  priorite: 'normale' | 'importante' | 'urgente';
  pieceJointe?: string;
  conversationId: number;
}

export interface Conversation {
  id: number;
  operateurId: number;
  operateurNom: string;
  adminId: number;
  adminNom: string;
  sujet: string;
  dateCreation: string;
  dateDernierMessage: string;
  nombreMessages: number;
  statut: 'active' | 'terminee' | 'archivée';
  derniereMessage?: string;
  nonLus: number;
}

export interface SelectedItem {
  type: 'hotel' | 'reservation' | 'operateur';
  data: Hotel | Reservation | OperateurSocial;
}

export interface Notification {
  id: number;
  type: 'success' | 'warning' | 'info' | 'error';
  message: string;
  time: string;
}

export interface DashboardStats {
  totalHotels: number;
  activeHotels: number;
  totalChambres: number;
  chambresOccupees: number;
  tauxOccupationMoyen: number;
  reservationsActives: number;
  revenusMensuel: number;
  totalOperateurs: number;
  operateursActifs: number;
}

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: UserRole;
  hotelId?: number; // Pour les managers et réceptionnistes
  statut: 'actif' | 'inactif';
  dateCreation: string;
  derniereConnexion?: string;
  permissions: Permission[];
}

export type UserRole = 'admin' | 'manager' | 'comptable' | 'receptionniste' | 'technicien_maintenance' | 'femme_menage';

export interface Permission {
  module: string;
  actions: ('read' | 'write' | 'delete' | 'export')[];
}

export interface RoleDefinition {
  id: UserRole;
  nom: string;
  description: string;
  permissions: Permission[];
  icon: string;
}

export interface DocumentTemplate {
  id: number;
  nom: string;
  type: DocumentType;
  description: string;
  contenu: string;
  variables: DocumentVariable[];
  statut: 'actif' | 'inactif';
  dateCreation: string;
  dateModification: string;
  version: string;
  format: 'pdf' | 'docx' | 'html';
  enTete?: string;
  piedDePage?: string;
}

export type DocumentType = 'facture' | 'bon_reservation' | 'prolongation_reservation' | 'fin_prise_charge';

export interface DocumentVariable {
  nom: string;
  description: string;
  type: 'texte' | 'nombre' | 'date' | 'email' | 'telephone' | 'adresse' | 'montant';
  obligatoire: boolean;
  valeurParDefaut?: string;
  exemple?: string;
}

export interface DocumentPreview {
  id: number;
  nom: string;
  type: DocumentType;
  contenu: string;
  variablesRemplies: Record<string, string>;
  dateGeneration: string;
}

// Interfaces pour la gestion des clients
export interface ClientType {
  id: number;
  nom: string;
  description?: string;
  icone?: string;
  couleur: string;
  ordre: number;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: number;
  type_id: number;
  nom: string;
  prenom?: string;
  raison_sociale?: string;
  siret?: string;
  siren?: string;
  tva_intracommunautaire?: string;
  numero_client: string;
  statut: 'actif' | 'inactif' | 'prospect' | 'archive';
  
  // Informations de contact
  email?: string;
  telephone?: string;
  telephone_mobile?: string;
  fax?: string;
  site_web?: string;
  
  // Adresse
  adresse?: string;
  complement_adresse?: string;
  code_postal?: string;
  ville?: string;
  pays: string;
  
  // Informations spécifiques
  date_creation?: string;
  date_modification?: string;
  source_acquisition?: string;
  notes?: string;
  tags?: string[];
  
  // Informations financières
  conditions_paiement: string;
  limite_credit?: number;
  solde_compte: number;
  
  // Informations commerciales
  commercial_id?: string;
  secteur_activite?: string;
  taille_entreprise?: string;
  chiffre_affaires?: string;
  nombre_employes?: number;
  
  // Informations pour associations
  numero_agrement?: string;
  date_agrement?: string;
  domaine_action?: string[];
  nombre_adherents?: number;
  
  // Informations pour particuliers
  date_naissance?: string;
  lieu_naissance?: string;
  nationalite?: string;
  situation_familiale?: string;
  nombre_enfants: number;
  profession?: string;
  employeur?: string;
  
  // Informations de suivi
  derniere_activite?: string;
  nombre_reservations: number;
  montant_total_reservations: number;
  date_derniere_reservation?: string;
  
  // Métadonnées
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface ClientContact {
  id: number;
  client_id: number;
  nom: string;
  prenom: string;
  fonction?: string;
  email?: string;
  telephone?: string;
  telephone_mobile?: string;
  principal: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientDocument {
  id: number;
  client_id: number;
  type_document: string;
  nom_fichier: string;
  chemin_fichier: string;
  taille_fichier?: number;
  type_mime?: string;
  description?: string;
  date_upload: string;
  uploaded_by?: string;
  created_at: string;
}

export interface ClientInteraction {
  id: number;
  client_id: number;
  type_interaction: 'appel' | 'email' | 'rdv' | 'visite' | 'reservation';
  sujet?: string;
  description?: string;
  date_interaction: string;
  duree_minutes?: number;
  resultat?: string;
  prochaine_action?: string;
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule';
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientNote {
  id: number;
  client_id: number;
  titre?: string;
  contenu: string;
  type_note: 'general' | 'commercial' | 'technique' | 'administratif';
  privee: boolean;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientSegment {
  id: number;
  nom: string;
  description?: string;
  criteres?: Record<string, any>;
  couleur: string;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientSegmentAssignment {
  id: number;
  client_id: number;
  segment_id: number;
  date_assignment: string;
  assigned_by?: string;
}

// Interface pour les clients avec informations complètes
export interface ClientWithDetails extends Omit<Client, 'notes'> {
  type?: ClientType;
  contacts?: ClientContact[];
  documents?: ClientDocument[];
  interactions?: ClientInteraction[];
  notes?: ClientNote[];
  segments?: ClientSegment[];
  commercial?: User;
}

// Interface pour la recherche de clients
export interface ClientSearchResult {
  id: number;
  numero_client: string;
  nom_complet: string;
  type_nom: string;
  email?: string;
  telephone?: string;
  ville?: string;
  statut: string;
  nombre_reservations: number;
  montant_total_reservations: number;
}

// Interface pour les statistiques clients
export interface ClientStatistics {
  total_clients: number;
  clients_actifs: number;
  nouveaux_ce_mois: number;
  total_reservations: number;
  chiffre_affaires_total: number;
  repartition_par_type: Record<string, number>;
}

// Interface pour le formulaire d'ajout/modification de client
export interface ClientFormData {
  type_id: number;
  nom: string;
  prenom?: string;
  raison_sociale?: string;
  siret?: string;
  siren?: string;
  tva_intracommunautaire?: string;
  email?: string;
  telephone?: string;
  telephone_mobile?: string;
  fax?: string;
  site_web?: string;
  adresse?: string;
  complement_adresse?: string;
  code_postal?: string;
  ville?: string;
  pays: string;
  date_creation?: string;
  source_acquisition?: string;
  notes?: string;
  tags?: string[];
  conditions_paiement: string;
  limite_credit?: number;
  commercial_id?: string;
  secteur_activite?: string;
  taille_entreprise?: string;
  chiffre_affaires?: string;
  nombre_employes?: number;
  numero_agrement?: string;
  date_agrement?: string;
  domaine_action?: string[];
  nombre_adherents?: number;
  date_naissance?: string;
  lieu_naissance?: string;
  nationalite?: string;
  situation_familiale?: string;
  nombre_enfants: number;
  profession?: string;
  employeur?: string;
}

// Interface pour les filtres de recherche clients
export interface ClientSearchFilters {
  search_term?: string;
  type_id?: number;
  statut?: string;
  ville?: string;
  commercial_id?: string;
  date_creation_debut?: string;
  date_creation_fin?: string;
  segment_id?: number;
  limit?: number;
} 