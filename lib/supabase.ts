import { createClient } from '@supabase/supabase-js'

// Configuration Supabase Online - Production uniquement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types générés pour Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          nom: string
          prenom: string
          telephone: string | null
          role: 'admin' | 'manager' | 'comptable' | 'receptionniste'
          hotel_id: number | null
          statut: 'actif' | 'inactif'
          date_creation: string
          derniere_connexion: string | null
          permissions: Record<string, unknown> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          nom: string
          prenom: string
          telephone?: string | null
          role: 'admin' | 'manager' | 'comptable' | 'receptionniste'
          hotel_id?: number | null
          statut?: 'actif' | 'inactif'
          date_creation?: string
          derniere_connexion?: string | null
          permissions?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nom?: string
          prenom?: string
          telephone?: string | null
          role?: 'admin' | 'manager' | 'comptable' | 'receptionniste'
          hotel_id?: number | null
          statut?: 'actif' | 'inactif'
          date_creation?: string
          derniere_connexion?: string | null
          permissions?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
      }
      hotels: {
        Row: {
          id: number
          nom: string
          adresse: string
          ville: string
          code_postal: string
          telephone: string | null
          email: string | null
          gestionnaire: string | null
          statut: 'ACTIF' | 'INACTIF'
          chambres_total: number
          chambres_occupees: number
          taux_occupation: number
          siret: string | null
          tva_intracommunautaire: string | null
          directeur: string | null
          telephone_directeur: string | null
          email_directeur: string | null
          capacite: number | null
          categories: string[] | null
          services: string[] | null
          horaires: Record<string, unknown> | null
          // Nouveaux champs d'adresse
          adresse_ligne_2: string | null
          region: string | null
          pays: string | null
          telephone_2: string | null
          fax: string | null
          site_web: string | null
          // Nouveaux champs de description et branding
          description: string | null
          logo_url: string | null
          images: Record<string, unknown>[] | null
          amenities: Record<string, unknown>[] | null
          // Nouveaux champs opérationnels
          check_in_time: string | null
          check_out_time: string | null
          policies: Record<string, unknown> | null
          contact_info: Record<string, unknown> | null
          is_active: boolean | null
          // Nouveaux champs de gestion avancée
          type_etablissement: 'hotel' | 'residence' | 'foyer' | 'chrs' | 'chr' | 'autre' | null
          license_number: string | null
          date_ouverture: string | null
          classement_etoiles: number | null
          surface_totale: number | null
          nombre_etages: number | null
          parking_places: number | null
          accessibilite: Record<string, unknown> | null
          certifications: string[] | null
          notes_internes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          nom: string
          adresse: string
          ville: string
          code_postal: string
          telephone?: string | null
          email?: string | null
          gestionnaire?: string | null
          statut?: 'ACTIF' | 'INACTIF'
          chambres_total?: number
          chambres_occupees?: number
          taux_occupation?: number
          siret?: string | null
          tva_intracommunautaire?: string | null
          directeur?: string | null
          telephone_directeur?: string | null
          email_directeur?: string | null
          capacite?: number | null
          categories?: string[] | null
          services?: string[] | null
          horaires?: Record<string, unknown> | null
          // Nouveaux champs d'adresse
          adresse_ligne_2?: string | null
          region?: string | null
          pays?: string | null
          telephone_2?: string | null
          fax?: string | null
          site_web?: string | null
          // Nouveaux champs de description et branding
          description?: string | null
          logo_url?: string | null
          images?: Record<string, unknown>[] | null
          amenities?: Record<string, unknown>[] | null
          // Nouveaux champs opérationnels
          check_in_time?: string | null
          check_out_time?: string | null
          policies?: Record<string, unknown> | null
          contact_info?: Record<string, unknown> | null
          is_active?: boolean | null
          // Nouveaux champs de gestion avancée
          type_etablissement?: 'hotel' | 'residence' | 'foyer' | 'chrs' | 'chr' | 'autre' | null
          license_number?: string | null
          date_ouverture?: string | null
          classement_etoiles?: number | null
          surface_totale?: number | null
          nombre_etages?: number | null
          parking_places?: number | null
          accessibilite?: Record<string, unknown> | null
          certifications?: string[] | null
          notes_internes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          nom?: string
          adresse?: string
          ville?: string
          code_postal?: string
          telephone?: string | null
          email?: string | null
          gestionnaire?: string | null
          statut?: 'ACTIF' | 'INACTIF'
          chambres_total?: number
          chambres_occupees?: number
          taux_occupation?: number
          siret?: string | null
          tva_intracommunautaire?: string | null
          directeur?: string | null
          telephone_directeur?: string | null
          email_directeur?: string | null
          capacite?: number | null
          categories?: string[] | null
          services?: string[] | null
          horaires?: Record<string, unknown> | null
          // Nouveaux champs d'adresse
          adresse_ligne_2?: string | null
          region?: string | null
          pays?: string | null
          telephone_2?: string | null
          fax?: string | null
          site_web?: string | null
          // Nouveaux champs de description et branding
          description?: string | null
          logo_url?: string | null
          images?: Record<string, unknown>[] | null
          amenities?: Record<string, unknown>[] | null
          // Nouveaux champs opérationnels
          check_in_time?: string | null
          check_out_time?: string | null
          policies?: Record<string, unknown> | null
          contact_info?: Record<string, unknown> | null
          is_active?: boolean | null
          // Nouveaux champs de gestion avancée
          type_etablissement?: 'hotel' | 'residence' | 'foyer' | 'chrs' | 'chr' | 'autre' | null
          license_number?: string | null
          date_ouverture?: string | null
          classement_etoiles?: number | null
          surface_totale?: number | null
          nombre_etages?: number | null
          parking_places?: number | null
          accessibilite?: Record<string, unknown> | null
          certifications?: string[] | null
          notes_internes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rooms: {
        Row: {
          id: number
          hotel_id: number
          numero: string
          type: string
          prix: number
          statut: 'disponible' | 'occupee' | 'maintenance'
          description: string | null
          category_id: number | null
          floor: number | null
          room_size: number | null
          bed_type: string | null
          view_type: string | null
          is_smoking: boolean | null
          images: Record<string, unknown>[] | null
          amenities: Record<string, unknown>[] | null
          last_cleaned: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          hotel_id: number
          numero: string
          type: string
          prix: number
          statut?: 'disponible' | 'occupee' | 'maintenance'
          description?: string | null
          category_id?: number | null
          floor?: number | null
          room_size?: number | null
          bed_type?: string | null
          view_type?: string | null
          is_smoking?: boolean | null
          images?: Record<string, unknown>[] | null
          amenities?: Record<string, unknown>[] | null
          last_cleaned?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          hotel_id?: number
          numero?: string
          type?: string
          prix?: number
          statut?: 'disponible' | 'occupee' | 'maintenance'
          description?: string | null
          category_id?: number | null
          floor?: number | null
          room_size?: number | null
          bed_type?: string | null
          view_type?: string | null
          is_smoking?: boolean | null
          images?: Record<string, unknown>[] | null
          amenities?: Record<string, unknown>[] | null
          last_cleaned?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      usagers: {
        Row: {
          id: number
          nom: string
          prenom: string
          date_naissance: string | null
          adresse: string | null
          telephone: string | null
          email: string | null
          numero_secu: string | null
          situation_familiale: string | null
          nombre_enfants: number
          revenus: number | null
          prestations: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          nom: string
          prenom: string
          date_naissance?: string | null
          adresse?: string | null
          telephone?: string | null
          email?: string | null
          numero_secu?: string | null
          situation_familiale?: string | null
          nombre_enfants?: number
          revenus?: number | null
          prestations?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          nom?: string
          prenom?: string
          date_naissance?: string | null
          adresse?: string | null
          telephone?: string | null
          email?: string | null
          numero_secu?: string | null
          situation_familiale?: string | null
          nombre_enfants?: number
          revenus?: number | null
          prestations?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      operateurs_sociaux: {
        Row: {
          id: number
          nom: string
          prenom: string
          organisation: string
          telephone: string | null
          email: string | null
          statut: 'actif' | 'inactif'
          specialite: string | null
          zone_intervention: string | null
          nombre_reservations: number
          date_creation: string
          notes: string | null
          siret: string | null
          adresse: string | null
          responsable: string | null
          telephone_responsable: string | null
          email_responsable: string | null
          agrement: string | null
          date_agrement: string | null
          zone_intervention_array: string[] | null
          specialites: string[] | null
          partenariats: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          nom: string
          prenom: string
          organisation: string
          telephone?: string | null
          email?: string | null
          statut?: 'actif' | 'inactif'
          specialite?: string | null
          zone_intervention?: string | null
          nombre_reservations?: number
          date_creation?: string
          notes?: string | null
          siret?: string | null
          adresse?: string | null
          responsable?: string | null
          telephone_responsable?: string | null
          email_responsable?: string | null
          agrement?: string | null
          date_agrement?: string | null
          zone_intervention_array?: string[] | null
          specialites?: string[] | null
          partenariats?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          nom?: string
          prenom?: string
          organisation?: string
          telephone?: string | null
          email?: string | null
          statut?: 'actif' | 'inactif'
          specialite?: string | null
          zone_intervention?: string | null
          nombre_reservations?: number
          date_creation?: string
          notes?: string | null
          siret?: string | null
          adresse?: string | null
          responsable?: string | null
          telephone_responsable?: string | null
          email_responsable?: string | null
          agrement?: string | null
          date_agrement?: string | null
          zone_intervention_array?: string[] | null
          specialites?: string[] | null
          partenariats?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      reservations: {
        Row: {
          id: number
          usager_id: number
          chambre_id: number
          hotel_id: number
          date_arrivee: string
          date_depart: string
          statut: 'CONFIRMEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE'
          prescripteur: string
          prix: number
          duree: number
          operateur_id: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          usager_id: number
          chambre_id: number
          hotel_id: number
          date_arrivee: string
          date_depart: string
          statut?: 'CONFIRMEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE'
          prescripteur: string
          prix: number
          duree: number
          operateur_id?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          usager_id?: number
          chambre_id?: number
          hotel_id?: number
          date_arrivee?: string
          date_depart?: string
          statut?: 'CONFIRMEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE'
          prescripteur?: string
          prix?: number
          duree?: number
          operateur_id?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conventions_prix: {
        Row: {
          id: number
          operateur_id: number
          hotel_id: number
          type_chambre: string
          prix_conventionne: number
          prix_standard: number
          reduction: number
          date_debut: string
          date_fin: string | null
          statut: 'active' | 'expiree' | 'suspendue'
          conditions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          operateur_id: number
          hotel_id: number
          type_chambre: string
          prix_conventionne: number
          prix_standard: number
          reduction: number
          date_debut: string
          date_fin?: string | null
          statut?: 'active' | 'expiree' | 'suspendue'
          conditions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          operateur_id?: number
          hotel_id?: number
          type_chambre?: string
          prix_conventionne?: number
          prix_standard?: number
          reduction?: number
          date_debut?: string
          date_fin?: string | null
          statut?: 'active' | 'expiree' | 'suspendue'
          conditions?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      processus_reservations: {
        Row: {
          id: number
          reservation_id: number
          statut: 'en_cours' | 'termine' | 'annule'
          date_debut: string
          date_fin: string | null
          duree_estimee: number | null
          priorite: 'basse' | 'normale' | 'haute' | 'urgente'
          etapes: Record<string, unknown>[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          reservation_id: number
          statut?: 'en_cours' | 'termine' | 'annule'
          date_debut?: string
          date_fin?: string | null
          duree_estimee?: number | null
          priorite?: 'basse' | 'normale' | 'haute' | 'urgente'
          etapes?: Record<string, unknown>[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          reservation_id?: number
          statut?: 'en_cours' | 'termine' | 'annule'
          date_debut?: string
          date_fin?: string | null
          duree_estimee?: number | null
          priorite?: 'basse' | 'normale' | 'haute' | 'urgente'
          etapes?: Record<string, unknown>[] | null
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: number
          operateur_id: number
          admin_id: string | null
          sujet: string
          date_creation: string
          date_dernier_message: string
          nombre_messages: number
          statut: 'active' | 'terminee' | 'archivée'
          derniere_message: string | null
          non_lus: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          operateur_id: number
          admin_id?: string | null
          sujet: string
          date_creation?: string
          date_dernier_message?: string
          nombre_messages?: number
          statut?: 'active' | 'terminee' | 'archivée'
          derniere_message?: string | null
          non_lus?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          operateur_id?: number
          admin_id?: string | null
          sujet?: string
          date_creation?: string
          date_dernier_message?: string
          nombre_messages?: number
          statut?: 'active' | 'terminee' | 'archivée'
          derniere_message?: string | null
          non_lus?: number
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: number
          conversation_id: number
          expediteur_id: string | null
          expediteur_type: 'admin' | 'operateur'
          destinataire_id: number | null
          destinataire_type: 'admin' | 'operateur'
          sujet: string | null
          contenu: string
          date_envoi: string
          date_lecture: string | null
          statut: 'envoye' | 'lu' | 'repondu'
          priorite: 'normale' | 'importante' | 'urgente'
          piece_jointe: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          conversation_id: number
          expediteur_id?: string | null
          expediteur_type: 'admin' | 'operateur'
          destinataire_id?: number | null
          destinataire_type: 'admin' | 'operateur'
          sujet?: string | null
          contenu: string
          date_envoi?: string
          date_lecture?: string | null
          statut?: 'envoye' | 'lu' | 'repondu'
          priorite?: 'normale' | 'importante' | 'urgente'
          piece_jointe?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          conversation_id?: number
          expediteur_id?: string | null
          expediteur_type?: 'admin' | 'operateur'
          destinataire_id?: number | null
          destinataire_type?: 'admin' | 'operateur'
          sujet?: string | null
          contenu?: string
          date_envoi?: string
          date_lecture?: string | null
          statut?: 'envoye' | 'lu' | 'repondu'
          priorite?: 'normale' | 'importante' | 'urgente'
          piece_jointe?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      document_templates: {
        Row: {
          id: number
          nom: string
          type: 'facture' | 'bon_reservation' | 'prolongation_reservation' | 'fin_prise_charge'
          description: string | null
          contenu: string
          variables: Record<string, unknown> | null
          statut: 'actif' | 'inactif'
          date_creation: string
          date_modification: string
          version: string
          format: 'pdf' | 'docx' | 'html'
          en_tete: string | null
          pied_de_page: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          nom: string
          type: 'facture' | 'bon_reservation' | 'prolongation_reservation' | 'fin_prise_charge'
          description?: string | null
          contenu: string
          variables?: Record<string, unknown> | null
          statut?: 'actif' | 'inactif'
          date_creation?: string
          date_modification?: string
          version?: string
          format?: 'pdf' | 'docx' | 'html'
          en_tete?: string | null
          pied_de_page?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          nom?: string
          type?: 'facture' | 'bon_reservation' | 'prolongation_reservation' | 'fin_prise_charge'
          description?: string | null
          contenu?: string
          variables?: Record<string, unknown> | null
          statut?: 'actif' | 'inactif'
          date_creation?: string
          date_modification?: string
          version?: string
          format?: 'pdf' | 'docx' | 'html'
          en_tete?: string | null
          pied_de_page?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: number
          template_id: number
          reservation_id: number | null
          nom: string
          type: string
          contenu: string
          variables_remplies: Record<string, unknown> | null
          date_generation: string
          fichier_url: string | null
          statut: 'genere' | 'envoye' | 'archive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          template_id: number
          reservation_id?: number | null
          nom: string
          type: string
          contenu: string
          variables_remplies?: Record<string, unknown> | null
          date_generation?: string
          fichier_url?: string | null
          statut?: 'genere' | 'envoye' | 'archive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          template_id?: number
          reservation_id?: number | null
          nom?: string
          type?: string
          contenu?: string
          variables_remplies?: Record<string, unknown> | null
          date_generation?: string
          fichier_url?: string | null
          statut?: 'genere' | 'envoye' | 'archive'
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: number
          user_id: string | null
          type: 'success' | 'warning' | 'info' | 'error'
          message: string
          lu: boolean
          date_creation: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id?: string | null
          type: 'success' | 'warning' | 'info' | 'error'
          message: string
          lu?: boolean
          date_creation?: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string | null
          type?: 'success' | 'warning' | 'info' | 'error'
          message?: string
          lu?: boolean
          date_creation?: string
          created_at?: string
        }
      }
      clients: {
        Row: {
          id: number
          nom: string
          prenom: string
          email: string | null
          telephone: string | null
          adresse: string | null
          ville: string | null
          code_postal: string | null
          date_naissance: string | null
          numero_secu: string | null
          situation_familiale: string | null
          nombre_enfants: number
          revenus: number | null
          prestations: string[] | null
          prix_uniques: Record<string, unknown> | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          nom: string
          prenom: string
          email?: string | null
          telephone?: string | null
          adresse?: string | null
          ville?: string | null
          code_postal?: string | null
          date_naissance?: string | null
          numero_secu?: string | null
          situation_familiale?: string | null
          nombre_enfants?: number
          revenus?: number | null
          prestations?: string[] | null
          prix_uniques?: Record<string, unknown> | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          nom?: string
          prenom?: string
          email?: string | null
          telephone?: string | null
          adresse?: string | null
          ville?: string | null
          code_postal?: string | null
          date_naissance?: string | null
          numero_secu?: string | null
          situation_familiale?: string | null
          nombre_enfants?: number
          revenus?: number | null
          prestations?: string[] | null
          prix_uniques?: Record<string, unknown> | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      room_categories: {
        Row: {
          id: number
          hotel_id: number
          name: string
          description: string | null
          base_price: number
          max_occupancy: number
          amenities: Record<string, unknown>[] | null[] | null
          images: Record<string, unknown>[] | null[] | null
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          hotel_id: number
          name: string
          description?: string | null
          base_price: number
          max_occupancy?: number
          amenities?: Record<string, unknown>[] | null[] | null
          images?: Record<string, unknown>[] | null[] | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          hotel_id?: number
          name?: string
          description?: string | null
          base_price?: number
          max_occupancy?: number
          amenities?: Record<string, unknown>[] | null[] | null
          images?: Record<string, unknown>[] | null[] | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      establishments: {
        Row: {
          id: number
          name: string
          type: string
          address: string | null
          city: string | null
          postal_code: string | null
          country: string | null
          phone: string | null
          email: string | null
          website: string | null
          description: string | null
          logo: string | null
          facilities: Record<string, unknown>[] | null
          policies: Record<string, unknown> | null | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          type?: string
          address?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          description?: string | null
          logo?: string | null
          facilities?: Record<string, unknown>[] | null
          policies?: Record<string, unknown> | null | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          type?: string
          address?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          description?: string | null
          logo?: string | null
          facilities?: Record<string, unknown>[] | null
          policies?: Record<string, unknown> | null | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      equipments: {
        Row: {
          id: number
          nom: string
          nom_en: string | null
          description: string | null
          description_en: string | null
          icone: string | null
          categorie: 'connectivity' | 'services' | 'wellness' | 'accessibility' | 'security' | 'recreation' | 'general'
          couleur: string | null
          est_premium: boolean
          ordre_affichage: number
          est_actif: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          nom: string
          nom_en?: string | null
          description?: string | null
          description_en?: string | null
          icone?: string | null
          categorie?: 'connectivity' | 'services' | 'wellness' | 'accessibility' | 'security' | 'recreation' | 'general'
          couleur?: string | null
          est_premium?: boolean
          ordre_affichage?: number
          est_actif?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          nom?: string
          nom_en?: string | null
          description?: string | null
          description_en?: string | null
          icone?: string | null
          categorie?: 'connectivity' | 'services' | 'wellness' | 'accessibility' | 'security' | 'recreation' | 'general'
          couleur?: string | null
          est_premium?: boolean
          ordre_affichage?: number
          est_actif?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      hotel_equipments: {
        Row: {
          id: number
          hotel_id: number
          equipment_id: number
          est_disponible: boolean
          est_gratuit: boolean
          prix_supplement: number | null
          description_specifique: string | null
          horaires_disponibilite: Record<string, unknown> | null
          conditions_usage: string | null
          date_ajout: string
          date_derniere_maj: string
          notes_internes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          hotel_id: number
          equipment_id: number
          est_disponible?: boolean
          est_gratuit?: boolean
          prix_supplement?: number | null
          description_specifique?: string | null
          horaires_disponibilite?: Record<string, unknown> | null
          conditions_usage?: string | null
          date_ajout?: string
          date_derniere_maj?: string
          notes_internes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          hotel_id?: number
          equipment_id?: number
          est_disponible?: boolean
          est_gratuit?: boolean
          prix_supplement?: number | null
          description_specifique?: string | null
          horaires_disponibilite?: Record<string, unknown> | null
          conditions_usage?: string | null
          date_ajout?: string
          date_derniere_maj?: string
          notes_internes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Types utilitaires
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Types spécifiques
export type User = Tables<'users'>
export type Hotel = Tables<'hotels'>
export type Establishment = Tables<'hotels'> // Alias pour clarté
export type Room = Tables<'rooms'>
export type RoomInsert = Inserts<'rooms'>
export type RoomUpdate = Updates<'rooms'>
export type RoomCategory = Tables<'room_categories'>
export type Usager = Tables<'usagers'>
export type OperateurSocial = Tables<'operateurs_sociaux'>
export type Reservation = Tables<'reservations'>
export type ConventionPrix = Tables<'conventions_prix'>
export type ProcessusReservation = Tables<'processus_reservations'>
export type Conversation = Tables<'conversations'>
export type Message = Tables<'messages'>
export type DocumentTemplate = Tables<'document_templates'>
export type Document = Tables<'documents'>
export type Notification = Tables<'notifications'>
export type Client = Tables<'clients'>
export type Equipment = Tables<'equipments'>
export type EquipmentInsert = Inserts<'equipments'>
export type EquipmentUpdate = Updates<'equipments'>
export type HotelEquipment = Tables<'hotel_equipments'>
export type HotelEquipmentInsert = Inserts<'hotel_equipments'>
export type HotelEquipmentUpdate = Updates<'hotel_equipments'>

// Room-specific types for API responses
export interface RoomAvailabilityCheck {
  available: boolean
  conflictingReservations?: any[]
  reason?: string
}

export interface RoomFilters {
  statut?: 'disponible' | 'occupee' | 'maintenance'
  type?: string
  floor?: number
  bed_type?: string
  view_type?: string
  is_smoking?: boolean
  limit?: number
  offset?: number
}

export interface RoomStatistics {
  total: number
  available: number
  occupied: number
  maintenance: number
  occupancyRate: number
  averagePrice?: number
  roomsByType: Record<string, number>
  roomsByFloor?: Record<string, number>
  potentialRevenue?: number
}

// Fonctions helper pour les établissements
export const establishmentHelpers = {
  // Récupérer tous les établissements actifs
  async getActiveEstablishments() {
    return await supabase
      .from('hotels')
      .select('*')
      .eq('is_active', true)
      .order('nom')
  },

  // Récupérer un établissement avec ses catégories
  async getEstablishmentWithCategories(id: number) {
    return await supabase
      .from('hotels')
      .select(`
        *,
        room_categories (*)
      `)
      .eq('id', id)
      .single()
  },

  // Créer un établissement avec catégories par défaut
  async createEstablishmentWithDefaults(data: Inserts<'hotels'>) {
    const { data: establishment, error } = await supabase.rpc(
      'create_establishment_with_default_categories',
      {
        p_nom: data.nom,
        p_adresse: data.adresse,
        p_ville: data.ville,
        p_code_postal: data.code_postal,
        p_telephone: data.telephone,
        p_email: data.email,
        p_description: data.description,
        p_type_etablissement: data.type_etablissement || 'hotel'
      }
    )
    return { data: establishment, error }
  },

  // Obtenir les statistiques d'un établissement
  async getEstablishmentStatistics(id: number) {
    return await supabase.rpc('get_hotel_statistics', { p_hotel_id: id })
  }
}

// Fonctions helper pour les catégories de chambres
export const roomCategoryHelpers = {
  // Récupérer les catégories d'un établissement
  async getCategoriesByEstablishment(establishmentId: number) {
    return await supabase
      .from('room_categories')
      .select('*')
      .eq('establishment_id', establishmentId)
      .eq('is_active', true)
      .order('display_order')
  },

  // Créer une nouvelle catégorie
  async createCategory(data: Inserts<'room_categories'>) {
    return await supabase
      .from('room_categories')
      .insert(data)
      .select()
      .single()
  },

  // Mettre à jour une catégorie
  async updateCategory(id: number, data: Updates<'room_categories'>) {
    return await supabase
      .from('room_categories')
      .update(data)
      .eq('id', id)
      .select()
      .single()
  },

  // Supprimer une catégorie
  async deleteCategory(id: number) {
    return await supabase
      .from('room_categories')
      .delete()
      .eq('id', id)
  },

  // Créer des chambres en lot pour une catégorie
  async createRoomsBatch(
    hotelId: number,
    categoryId: number,
    floor: number,
    startNumber: number,
    endNumber: number,
    price?: number
  ) {
    return await supabase.rpc('create_rooms_batch', {
      p_hotel_id: hotelId,
      p_category_id: categoryId,
      p_floor: floor,
      p_start_number: startNumber,
      p_end_number: endNumber,
      p_price: price
    })
  }
}

// Fonctions helper pour les équipements
export const equipmentHelpers = {
  // Récupérer tous les équipements actifs
  async getAllEquipments() {
    return await supabase
      .from('equipments')
      .select('*')
      .eq('est_actif', true)
      .order('categorie, ordre_affichage')
  },

  // Récupérer les équipements par catégorie
  async getEquipmentsByCategory(category: string) {
    return await supabase
      .from('equipments')
      .select('*')
      .eq('categorie', category)
      .eq('est_actif', true)
      .order('ordre_affichage')
  },

  // Récupérer tous les équipements d'un hôtel
  async getHotelEquipments(hotelId: number) {
    return await supabase
      .from('hotel_equipments')
      .select(`
        *,
        equipments (*)
      `)
      .eq('hotel_id', hotelId)
      .eq('equipments.est_actif', true)
      .order('equipments.categorie, equipments.ordre_affichage')
  },

  // Ajouter un équipement à un hôtel
  async addEquipmentToHotel(data: HotelEquipmentInsert) {
    return await supabase
      .from('hotel_equipments')
      .insert(data)
      .select()
      .single()
  },

  // Supprimer un équipement d'un hôtel
  async removeEquipmentFromHotel(hotelId: number, equipmentId: number) {
    return await supabase
      .from('hotel_equipments')
      .delete()
      .eq('hotel_id', hotelId)
      .eq('equipment_id', equipmentId)
  },

  // Mettre à jour un équipement d'hôtel
  async updateHotelEquipment(id: number, data: HotelEquipmentUpdate) {
    return await supabase
      .from('hotel_equipments')
      .update(data)
      .eq('id', id)
      .select()
      .single()
  },

  // Obtenir les statistiques des équipements
  async getEquipmentStatistics() {
    return await supabase.rpc('get_equipment_statistics')
  }
}

// Types spécifiques pour les équipements
export interface EquipmentWithHotelInfo extends Equipment {
  est_disponible?: boolean
  est_gratuit?: boolean
  prix_supplement?: number
  description_specifique?: string
}

export interface HotelEquipmentsResponse {
  equipment_id: number
  nom: string
  nom_en: string | null
  description: string | null
  icone: string | null
  categorie: string
  couleur: string | null
  est_premium: boolean
  est_disponible: boolean
  est_gratuit: boolean
  prix_supplement: number | null
}

// API Layer References
// For establishments CRUD operations, use the dedicated API:
// import { establishmentsApi } from '@/lib/api/establishments'