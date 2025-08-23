import { Reservation, Hotel, OperateurSocial, DocumentTemplate } from '../types/index';
import { 
  getSyntheticUserData, 
  getSyntheticHotelData, 
  getSyntheticOperateurData,
  getOccupantsForReservation,
  getComplementaryInfo,
  getProlongationMotif,
  getFinPriseChargeMotif
} from './syntheticData';

export interface ReservationData {
  reservation: Reservation;
  hotel?: Hotel;
  operateur?: OperateurSocial;
  chambre?: {
    numero: string;
    type: string;
    prix: number;
  };
}

export interface PDFVariableMapping {
  [key: string]: string;
}

export class ReservationToPDFMapper {
  /**
   * Mappe les données de réservation vers les variables PDF
   */
  static mapReservationToVariables(
    reservationData: ReservationData,
    template: DocumentTemplate
  ): PDFVariableMapping {
    console.log('mapReservationToVariables - Input:', { reservationData, template });
    const { reservation, hotel, operateur, chambre } = reservationData;
    const variables: PDFVariableMapping = {};

    // Variables communes pour tous les templates
    variables['date_generation'] = new Date().toLocaleDateString('fr-FR');
    variables['DATE_ACTUELLE'] = new Date().toLocaleDateString('fr-FR');

    // Variables spécifiques à la réservation
    variables['numero_reservation'] = reservation.id.toString();
    variables['usager'] = reservation.usager;
    variables['date_arrivee'] = this.formatDate(reservation.dateArrivee);
    variables['date_depart'] = this.formatDate(reservation.dateDepart);
    variables['nombre_nuits'] = reservation.duree.toString();
    variables['prix_nuit'] = reservation.prix.toFixed(2);
    variables['total'] = (reservation.prix * reservation.duree).toFixed(2);
    variables['prescripteur'] = reservation.prescripteur;

    // Variables de l'hôtel
    if (hotel) {
      variables['nom_hotel'] = hotel.nom;
      variables['adresse_hotel'] = `${hotel.adresse}, ${hotel.codePostal} ${hotel.ville}`;
      variables['nom_etablissement'] = hotel.nom;
      variables['adresse_etablissement'] = `${hotel.adresse}, ${hotel.codePostal} ${hotel.ville}`;
      variables['telephone_etablissement'] = hotel.telephone;
      variables['email_etablissement'] = hotel.email;
      
      // Données synthétiques de l'hôtel
      const syntheticHotel = getSyntheticHotelData(hotel.nom);
      if (syntheticHotel) {
        variables['siret_etablissement'] = syntheticHotel.siret;
        variables['tva_etablissement'] = syntheticHotel.tvaIntracommunautaire;
        variables['directeur_etablissement'] = syntheticHotel.directeur;
        variables['telephone_directeur'] = syntheticHotel.telephoneDirecteur;
        variables['email_directeur'] = syntheticHotel.emailDirecteur;
        variables['capacite_etablissement'] = syntheticHotel.capacite.toString();
      }
    }

    // Variables de la chambre
    if (chambre) {
      variables['numero_chambre'] = chambre.numero;
      variables['type_chambre'] = chambre.type;
      variables['prix_chambre'] = chambre.prix.toFixed(2);
    }

    // Variables de l'opérateur social
    if (operateur) {
      variables['nom_prescripteur'] = `${operateur.prenom} ${operateur.nom}`;
      variables['organisme_prescripteur'] = operateur.organisation;
      variables['telephone_prescripteur'] = operateur.telephone;
      variables['email_prescripteur'] = operateur.email;
      
      // Données synthétiques de l'opérateur
      const syntheticOperateur = getSyntheticOperateurData(operateur.organisation);
      if (syntheticOperateur) {
        variables['siret_prescripteur'] = syntheticOperateur.siret;
        variables['adresse_prescripteur'] = syntheticOperateur.adresse;
        variables['responsable_prescripteur'] = syntheticOperateur.responsable;
        variables['telephone_responsable'] = syntheticOperateur.telephoneResponsable;
        variables['email_responsable'] = syntheticOperateur.emailResponsable;
        variables['agrement_prescripteur'] = syntheticOperateur.agrement;
        variables['date_agrement'] = syntheticOperateur.dateAgrement;
      }
    }

    // Mapping spécifique selon le type de template
    let result: PDFVariableMapping;
    switch (template.type) {
      case 'bon_reservation':
        result = this.mapBonReservation(reservationData, variables);
        break;
      case 'prolongation_reservation':
        result = this.mapProlongationReservation(reservationData, variables);
        break;
      case 'fin_prise_charge':
        result = this.mapFinPriseCharge(reservationData, variables);
        break;
      case 'facture':
        result = this.mapFacture(reservationData, variables);
        break;
      default:
        result = variables;
    }
    
    console.log('mapReservationToVariables - Result:', result);
    return result;
  }

  /**
   * Mapping pour les bons de réservation
   */
  private static mapBonReservation(
    reservationData: ReservationData,
    baseVariables: PDFVariableMapping
  ): PDFVariableMapping {
    const { reservation, hotel } = reservationData;
    const variables = { ...baseVariables };

    // Variables spécifiques aux bons de réservation
    variables['numero_bon'] = `BR-${reservation.id.toString().padStart(6, '0')}`;
    
    // Données synthétiques de l'usager
    const usagerParts = reservation.usager.split(' ');
    const nomUsager = usagerParts[0] || '';
    const prenomUsager = usagerParts[1] || '';
    const syntheticUser = getSyntheticUserData(nomUsager, prenomUsager);
    
    variables['nom_beneficiaire'] = nomUsager;
    variables['prenom_beneficiaire'] = prenomUsager;
    variables['date_naissance'] = syntheticUser?.dateNaissance || '01/01/1980';
    variables['adresse_beneficiaire'] = syntheticUser?.adresse || 'Adresse à compléter';
    variables['telephone_beneficiaire'] = syntheticUser?.telephone || 'Téléphone à compléter';
    variables['email_beneficiaire'] = syntheticUser?.email || '';
    variables['numero_secu'] = syntheticUser?.numeroSecu || '';
    variables['situation_familiale'] = syntheticUser?.situationFamiliale || 'Célibataire';
    variables['nombre_enfants'] = syntheticUser?.nombreEnfants?.toString() || '0';
    variables['revenus'] = syntheticUser?.revenus?.toString() || '0';
    variables['prestations'] = syntheticUser?.prestations?.join(', ') || '';
    
    variables['prise_charge'] = variables['total'];
    variables['reste_charge'] = '0.00';
    variables['conditions_particulieres'] = 'Conditions standard';
    variables['date_signature'] = new Date().toLocaleDateString('fr-FR');

    // Variables pour le bon de confirmation VSP
    variables['nom_destinataire'] = 'SAMUSOCIAL DE PARIS';
    variables['numero_marche'] = '2024-SSP-DELTA';
    variables['tva_intracommunautaire'] = 'FR92187509013';
    variables['service_destinataire'] = 'Service Comptabilité Hôtel';
    variables['adresse_destinataire'] = '15 rue Jean Baptiste Berlier 75013 Paris';
    variables['email_destinataire'] = 'coordination-reservations.phrh@samusocial-75.fr';
    variables['date_debut'] = this.formatDateLong(reservation.dateArrivee);
    variables['date_fin'] = this.formatDateLong(reservation.dateDepart);
    variables['nombre_personnes'] = syntheticUser?.nombreEnfants ? (syntheticUser.nombreEnfants + 1).toString() : '1';
    
    // Occupants basés sur les données synthétiques
    const occupants = getOccupantsForReservation(reservation.id);
    variables['chef_famille'] = occupants[0] || reservation.usager;
    variables['occupant_1'] = occupants[1] || '';
    variables['occupant_2'] = occupants[2] || '';
    variables['occupant_3'] = occupants[3] || '';
    
    variables['informations_complementaires'] = getComplementaryInfo(reservation.id);
    variables['cout_prestation'] = `${reservation.prix.toFixed(1)} Euro TTC`;

    return variables;
  }

  /**
   * Mapping pour les prolongations de réservation
   */
  private static mapProlongationReservation(
    reservationData: ReservationData,
    baseVariables: PDFVariableMapping
  ): PDFVariableMapping {
    const { reservation, hotel } = reservationData;
    const variables = { ...baseVariables };

    // Variables spécifiques aux prolongations
    variables['numero_prolongation'] = `PROL-${reservation.id.toString().padStart(6, '0')}`;
    variables['numero_bon_initial'] = `BR-${reservation.id.toString().padStart(6, '0')}`;
    variables['date_arrivee_initial'] = this.formatDate(reservation.dateArrivee);
    variables['date_depart_initial'] = this.formatDate(reservation.dateDepart);
    variables['nouvelle_date_depart'] = this.formatDate(reservation.dateDepart);
    variables['nuits_supplementaires'] = '15';
    variables['motif_prolongation'] = getProlongationMotif(reservation.id);
    variables['total_supplement'] = (reservation.prix * 15).toFixed(2);
    variables['prise_charge'] = variables['total_supplement'];
    variables['reste_charge'] = '0.00';
    variables['date_signature'] = new Date().toLocaleDateString('fr-FR');

    // Variables pour la prolongation VSP
    variables['nom_destinataire'] = 'SAMUSOCIAL DE PARIS';
    variables['numero_marche'] = '2024-SSP-DELTA';
    variables['tva_intracommunautaire'] = 'FR92187509013';
    variables['service_destinataire'] = 'Service Comptabilité Hôtel';
    variables['adresse_destinataire'] = '15 rue Jean Baptiste Berlier 75013 Paris';
    variables['email_destinataire'] = 'coordination-reservations.phrh@samusocial-75.fr';
    variables['date_debut'] = this.formatDateLong(reservation.dateArrivee);
    variables['date_fin'] = this.formatDateLong(reservation.dateDepart);
    
    // Données synthétiques de l'usager
    const usagerParts = reservation.usager.split(' ');
    const nomUsager = usagerParts[0] || '';
    const prenomUsager = usagerParts[1] || '';
    const syntheticUser = getSyntheticUserData(nomUsager, prenomUsager);
    
    variables['nombre_personnes'] = syntheticUser?.nombreEnfants ? (syntheticUser.nombreEnfants + 1).toString() : '1';
    
    // Occupants basés sur les données synthétiques
    const occupants = getOccupantsForReservation(reservation.id);
    variables['occupant_principal'] = occupants[0] || reservation.usager;
    variables['occupant_2'] = occupants[1] || '';
    variables['occupant_3'] = occupants[2] || '';
    
    variables['informations_complementaires'] = getComplementaryInfo(reservation.id);
    variables['cout_prestation'] = `${(reservation.prix * reservation.duree).toFixed(1)} Euro TTC`;

    return variables;
  }

  /**
   * Mapping pour les fins de prise en charge
   */
  private static mapFinPriseCharge(
    reservationData: ReservationData,
    baseVariables: PDFVariableMapping
  ): PDFVariableMapping {
    const { reservation, hotel } = reservationData;
    const variables = { ...baseVariables };

    // Variables spécifiques aux fins de prise en charge
    variables['numero_fin_charge'] = `FIN-${reservation.id.toString().padStart(6, '0')}`;
    variables['numero_bon_initial'] = `BR-${reservation.id.toString().padStart(6, '0')}`;
    variables['duree_totale'] = reservation.duree.toString();
    variables['motif_fin_charge'] = getFinPriseChargeMotif(reservation.id);
    variables['total_facture'] = (reservation.prix * reservation.duree).toFixed(2);
    variables['total_prise_charge'] = variables['total_facture'];
    variables['reste_charge'] = '0.00';
    variables['montant_regle'] = '0.00';
    variables['solde'] = '0.00';
    variables['observations'] = 'Séjour sans incident - Accompagnement social terminé avec succès';
    variables['date_signature'] = new Date().toLocaleDateString('fr-FR');

    // Variables pour la fin de prise en charge VSP
    variables['nom_destinataire'] = 'SAMUSOCIAL DE PARIS';
    variables['numero_marche'] = '2024-SSP-DELTA';
    variables['tva_intracommunautaire'] = 'FR92187509013';
    variables['service_destinataire'] = 'Service Comptabilité Hôtel';
    variables['adresse_destinataire'] = '15 rue Jean Baptiste Berlier 75013 Paris';
    variables['email_destinataire'] = 'coordination-reservations.phrh@samusocial-75.fr';
    variables['date_fin_prise_charge'] = this.formatDateLong(reservation.dateDepart);
    
    // Données synthétiques de l'usager
    const usagerParts = reservation.usager.split(' ');
    const nomUsager = usagerParts[0] || '';
    const prenomUsager = usagerParts[1] || '';
    const syntheticUser = getSyntheticUserData(nomUsager, prenomUsager);
    
    variables['nombre_personnes'] = syntheticUser?.nombreEnfants ? (syntheticUser.nombreEnfants + 1).toString() : '1';
    
    // Occupants basés sur les données synthétiques
    const occupants = getOccupantsForReservation(reservation.id);
    variables['chef_famille'] = occupants[0] || reservation.usager;
    variables['occupant_1'] = occupants[1] || '';
    variables['occupant_2'] = occupants[2] || '';
    
    variables['date_limite_liberation'] = this.formatDateShort(reservation.dateDepart);
    variables['informations_complementaires'] = getFinPriseChargeMotif(reservation.id);
    variables['client_vsp'] = 'SAMUSOCIAL DE PARIS';

    return variables;
  }

  /**
   * Mapping pour les factures
   */
  private static mapFacture(
    reservationData: ReservationData,
    baseVariables: PDFVariableMapping
  ): PDFVariableMapping {
    const { reservation, hotel, operateur } = reservationData;
    const variables = { ...baseVariables };

    // Variables spécifiques aux factures
    const currentDate = new Date();
    const dueDate = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    variables['numero_facture'] = `FAC-${currentDate.getFullYear()}-${reservation.id.toString().padStart(6, '0')}`;
    variables['date_facture'] = currentDate.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    variables['date_echeance'] = dueDate.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    variables['reference_client'] = `${currentDate.getFullYear()}-SSP-DELTA`;
    variables['periode_facturation'] = currentDate.toLocaleDateString('fr-FR', { 
      month: 'long', 
      year: 'numeric' 
    });

    // Informations destinataire (client facturé)
    variables['nom_destinataire'] = 'SAMUSOCIAL DE PARIS';
    variables['numero_marche'] = '2024-SSP-DELTA';
    variables['tva_destinataire'] = 'FR92187509013';
    variables['service_destinataire'] = 'Service Comptabilité Hôtel';
    variables['adresse_destinataire'] = '15 rue Jean Baptiste Berlier 75013 Paris';
    variables['email_destinataire'] = 'coordination-reservations.phrh@samusocial-75.fr';

    // Calculs financiers
    const sousTotalHT = reservation.prix * reservation.duree;
    const tva = sousTotalHT * 0.20; // 20% de TVA
    const totalTTC = sousTotalHT + tva;
    
    variables['sous_total_ht'] = sousTotalHT.toFixed(2);
    variables['tva'] = tva.toFixed(2);
    variables['total_ttc'] = totalTTC.toFixed(2);

    // Informations de paiement
    variables['mode_paiement'] = 'Virement bancaire';
    variables['iban'] = 'FR76 XXXX XXXX XXXX XXXX XXXX XXX';
    variables['bic'] = 'XXXXXXXX';

    // Données synthétiques de l'usager pour les prestations
    const usagerParts = reservation.usager.split(' ');
    const nomUsager = usagerParts[0] || '';
    const prenomUsager = usagerParts[1] || '';
    const syntheticUser = getSyntheticUserData(nomUsager, prenomUsager);
    
    // Variables pour les prestations (pour le tableau)
    variables['description_prestation'] = `Hébergement T1DB - Famille ${nomUsager.toUpperCase()}`;
    variables['periode_prestation'] = `${this.formatDate(reservation.dateArrivee)} au ${this.formatDate(reservation.dateDepart)}`;
    variables['nombre_nuits_prestation'] = reservation.duree.toString();
    variables['prix_unitaire_prestation'] = reservation.prix.toFixed(2);
    variables['total_ht_prestation'] = sousTotalHT.toFixed(2);

    return variables;
  }

  /**
   * Formate une date au format court (DD/MM/YYYY)
   */
  private static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  /**
   * Formate une date au format court pour libération (DD-MM-YYYY)
   */
  private static formatDateShort(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  /**
   * Formate une date au format long (Jour DD Mois YYYY)
   */
  private static formatDateLong(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return date.toLocaleDateString('fr-FR', options);
  }

  /**
   * Obtient les templates compatibles pour une réservation
   */
  static getCompatibleTemplates(
    templates: DocumentTemplate[],
    reservationData: ReservationData
  ): DocumentTemplate[] {
    return templates.filter(template => template.statut === 'actif');
  }

  /**
   * Valide si une réservation peut générer un type de document
   */
  static canGenerateDocument(
    template: DocumentTemplate,
    reservationData: ReservationData
  ): { canGenerate: boolean; missingData: string[] } {
    const missingData: string[] = [];

    // Vérifications de base
    if (!reservationData.reservation) {
      missingData.push('Données de réservation');
    }

    if (!reservationData.hotel) {
      missingData.push('Informations de l\'hôtel');
    }

    // Vérifications spécifiques selon le type
    switch (template.type) {
      case 'bon_reservation':
        if (!reservationData.operateur) {
          missingData.push('Informations du prescripteur');
        }
        break;
      case 'prolongation_reservation':
        if (!reservationData.operateur) {
          missingData.push('Informations du prescripteur');
        }
        break;
      case 'fin_prise_charge':
        // Pas de vérifications supplémentaires
        break;
      case 'facture':
        // Pas de vérifications supplémentaires
        break;
    }

    return {
      canGenerate: missingData.length === 0,
      missingData
    };
  }
} 