import { Hotel, Reservation, OperateurSocial, ConventionPrix, ProcessusReservation, Message, Conversation, User, RoleDefinition, DocumentTemplate, DocumentVariable } from '../types/index';

// Définitions des rôles
export const roleDefinitions: RoleDefinition[] = [
  {
    id: 'admin',
    nom: 'Administrateur / Direction',
    description: 'Accès complet (lecture/écriture), gestion des utilisateurs, rôles, intégrations, supervision reporting global, export comptable',
    icon: '👑',
    permissions: [
      { module: 'dashboard', actions: ['read', 'write', 'export'] },
      { module: 'reservations', actions: ['read', 'write', 'delete', 'export'] },
      { module: 'chambres', actions: ['read', 'write', 'delete', 'export'] },
      { module: 'gestion', actions: ['read', 'write', 'delete', 'export'] },
      { module: 'operateurs', actions: ['read', 'write', 'delete', 'export'] },
      
      { module: 'parametres', actions: ['read', 'write', 'delete', 'export'] },
      { module: 'utilisateurs', actions: ['read', 'write', 'delete', 'export'] },
      { module: 'comptabilite', actions: ['read', 'write', 'delete', 'export'] }
    ]
  },
  {
    id: 'manager',
    nom: 'Manager (Responsable établissement)',
    description: 'Accès à tous les modules sauf paramètres globaux, création et modification de réservations, attribution des tâches, validation des factures',
    icon: '🧑‍💼',
    permissions: [
      { module: 'dashboard', actions: ['read', 'write'] },
      { module: 'reservations', actions: ['read', 'write', 'delete'] },
      { module: 'chambres', actions: ['read', 'write'] },
      { module: 'gestion', actions: ['read', 'write'] },
      { module: 'operateurs', actions: ['read', 'write'] },
      
      { module: 'comptabilite', actions: ['read', 'write'] }
    ]
  },
  {
    id: 'comptable',
    nom: 'Comptable / Back-office',
    description: 'Accès lecture/écriture : Facturation, Paiements, TVA, taxe de séjour, Journal comptable. Pas d\'accès au planning ou aux clients',
    icon: '🧾',
    permissions: [
      { module: 'dashboard', actions: ['read'] },
      { module: 'gestion', actions: ['read', 'write'] },
      { module: 'comptabilite', actions: ['read', 'write', 'export'] }
    ]
  },
  {
    id: 'receptionniste',
    nom: 'Réceptionniste',
    description: 'Accès : Réservations (création/modif), Clients (check-in/check-out), Facturation de base, Extras. Pas d\'accès aux paramètres ni à la comptabilité',
    icon: '💁',
    permissions: [
      { module: 'dashboard', actions: ['read'] },
      { module: 'reservations', actions: ['read', 'write'] },
      { module: 'chambres', actions: ['read'] },
      { module: 'gestion', actions: ['read'] }
    ]
  },
  {
    id: 'technicien_maintenance',
    nom: 'Technicien de Maintenance',
    description: 'Accès : Gestion des chambres (maintenance, réparations), Statut des équipements, Signalement des problèmes. Accès limité au dashboard.',
    icon: '🔧',
    permissions: [
      { module: 'dashboard', actions: ['read'] },
      { module: 'chambres', actions: ['read', 'write'] },
      { module: 'gestion', actions: ['read'] }
    ]
  },
  {
    id: 'femme_menage',
    nom: 'Femme de Ménage',
    description: 'Accès : Statut des chambres (nettoyage, préparation), Planning de ménage, Signalement des problèmes. Consultation limitée des réservations.',
    icon: '🧹',
    permissions: [
      { module: 'dashboard', actions: ['read'] },
      { module: 'chambres', actions: ['read', 'write'] },
      { module: 'reservations', actions: ['read'] }
    ]
  }
];

export const generateUsers = (hotels: Hotel[]): User[] => {
  const noms = ["Dubois", "Martin", "Bernard", "Thomas", "Petit", "Robert", "Richard", "Durand", "Leroy", "Moreau"];
  const prenoms = ["Marie", "Sophie", "Catherine", "Isabelle", "Anne", "Claire", "Nathalie", "Valérie", "Sandrine", "Laure", "Jean", "Pierre", "Michel", "André", "Philippe", "Alain", "Bernard", "Daniel", "Christian"];
  
  const users: User[] = [];
  let id = 1;

  // Administrateur principal
  users.push({
    id: id++,
    nom: "Admin",
    prenom: "Principal",
    email: "admin@soli-reserve.fr",
    telephone: "01.42.00.00.01",
    role: 'admin',
    statut: 'actif',
    dateCreation: new Date().toLocaleDateString('fr-FR'),
    derniereConnexion: new Date().toLocaleDateString('fr-FR'),
    permissions: roleDefinitions.find(r => r.id === 'admin')?.permissions || []
  });

  // Managers (1 par hôtel)
  hotels.slice(0, 5).forEach((hotel, index) => {
    users.push({
      id: id++,
      nom: noms[index % noms.length],
      prenom: prenoms[index % prenoms.length],
      email: `manager.${hotel.nom.toLowerCase().replace(/[^a-z]/g, '')}@soli-reserve.fr`,
      telephone: `01.${40 + index}.${10 + index}.${10 + index}.${10 + index}`,
      role: 'manager',
      hotelId: hotel.id,
      statut: 'actif',
      dateCreation: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
      derniereConnexion: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
      permissions: roleDefinitions.find(r => r.id === 'manager')?.permissions || []
    });
  });

  // Comptables
  for (let i = 0; i < 3; i++) {
    users.push({
      id: id++,
      nom: noms[(i + 5) % noms.length],
      prenom: prenoms[(i + 10) % prenoms.length],
      email: `comptable${i + 1}@soli-reserve.fr`,
      telephone: `01.${50 + i}.${20 + i}.${20 + i}.${20 + i}`,
      role: 'comptable',
      statut: 'actif',
      dateCreation: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
      derniereConnexion: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
      permissions: roleDefinitions.find(r => r.id === 'comptable')?.permissions || []
    });
  }

  // Réceptionnistes (2-3 par hôtel)
  hotels.slice(0, 8).forEach((hotel, hotelIndex) => {
    const nbReceptionnistes = Math.floor(Math.random() * 2) + 2; // 2-3 réceptionnistes
    for (let i = 0; i < nbReceptionnistes; i++) {
      users.push({
        id: id++,
        nom: noms[(hotelIndex * 3 + i) % noms.length],
        prenom: prenoms[(hotelIndex * 3 + i + 15) % prenoms.length],
        email: `receptionniste${hotelIndex + 1}.${i + 1}@soli-reserve.fr`,
        telephone: `01.${60 + hotelIndex}.${30 + i}.${30 + i}.${30 + i}`,
        role: 'receptionniste',
        hotelId: hotel.id,
        statut: Math.random() > 0.1 ? 'actif' : 'inactif',
        dateCreation: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
        derniereConnexion: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
        permissions: roleDefinitions.find(r => r.id === 'receptionniste')?.permissions || []
      });
    }
  });

  // Techniciens de maintenance (1 par hôtel)
  hotels.slice(0, 10).forEach((hotel, hotelIndex) => {
    users.push({
      id: id++,
      nom: noms[(hotelIndex + 2) % noms.length],
      prenom: prenoms[(hotelIndex + 5) % prenoms.length],
      email: `technicien${hotelIndex + 1}@soli-reserve.fr`,
      telephone: `01.${70 + hotelIndex}.${40 + hotelIndex}.${40 + hotelIndex}.${40 + hotelIndex}`,
      role: 'technicien_maintenance',
      hotelId: hotel.id,
      statut: Math.random() > 0.05 ? 'actif' : 'inactif',
      dateCreation: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
      derniereConnexion: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
      permissions: roleDefinitions.find(r => r.id === 'technicien_maintenance')?.permissions || []
    });
  });

  // Femmes de ménage (2-4 par hôtel)
  hotels.slice(0, 12).forEach((hotel, hotelIndex) => {
    const nbFemmesMenage = Math.floor(Math.random() * 3) + 2; // 2-4 femmes de ménage
    for (let i = 0; i < nbFemmesMenage; i++) {
      users.push({
        id: id++,
        nom: noms[(hotelIndex * 2 + i + 3) % noms.length],
        prenom: prenoms[(hotelIndex * 2 + i + 8) % prenoms.length],
        email: `menage${hotelIndex + 1}.${i + 1}@soli-reserve.fr`,
        telephone: `01.${80 + hotelIndex}.${50 + i}.${50 + i}.${50 + i}`,
        role: 'femme_menage',
        hotelId: hotel.id,
        statut: Math.random() > 0.08 ? 'actif' : 'inactif',
        dateCreation: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
        derniereConnexion: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
        permissions: roleDefinitions.find(r => r.id === 'femme_menage')?.permissions || []
      });
    }
  });

  return users;
};

export const generateHotels = (): Hotel[] => {
  const noms = [
    "Résidence Saint-Martin", "Foyer Solidaire Belleville", "Hôtel d'Accueil Républicain",
    "Centre d'Hébergement Voltaire", "Résidence Temporaire Victor Hugo", "Foyer d'Urgence Gambetta",
    "Hôtel Social Charonne", "Centre Diderot", "Résidence Solidaire Ménilmontant",
    "Foyer d'Accueil Père Lachaise", "Hôtel d'Urgence Bastille", "Centre Social République",
    "Résidence d'Insertion Oberkampf", "Foyer Temporaire Nation", "Hôtel Solidaire Picpus",
    "Centre d'Accueil Vincennes", "Résidence Saint-Antoine", "Foyer d'Urgence Ledru-Rollin",
    "Hôtel Social Faubourg", "Centre Temporaire Quinze-Vingts", "Résidence d'Aide Bercy",
    "Foyer Solidaire Gare de Lyon", "Hôtel d'Accueil Austerlitz", "Centre Social Salpêtrière",
    "Résidence Temporaire Gobelins", "Hôtel d'Accueil République", "Centre d'Hébergement Nation",
    "Résidence Solidaire Bastille", "Foyer d'Urgence Voltaire", "Hôtel Social Belleville"
  ];
  
  const rues = [
    "12 rue de la République", "45 avenue Jean Jaurès", "23 boulevard Voltaire",
    "67 rue Saint-Antoine", "89 avenue Parmentier", "34 rue de Charonne",
    "56 boulevard Ménilmontant", "78 rue Oberkampf", "91 avenue de la République",
    "123 rue du Faubourg Saint-Antoine", "45 boulevard Beaumarchais", "67 rue de Lappe",
    "89 avenue Ledru-Rollin", "12 rue de Lyon", "34 boulevard Diderot",
    "56 rue de Bercy", "78 avenue Daumesnil", "91 rue de Picpus",
    "123 boulevard de Vincennes", "45 rue de Montreuil", "67 avenue du Trône",
    "89 rue de Reuilly", "12 place de la Nation", "34 rue de Charenton",
    "56 avenue de Saint-Mandé", "78 rue de Belleville", "91 boulevard de la Villette",
    "123 rue de Flandre", "45 avenue de la Porte de Montreuil", "67 rue de Bagnolet"
  ];

  const villes = ["Paris 11e", "Paris 12e", "Paris 20e", "Montreuil", "Vincennes"];
  const gestionnaires = [
    "Marie Dubois", "Pierre Martin", "Sophie Lemoine", "Jean Moreau", "Anne Petit",
    "Michel Durand", "Catherine Bernard", "François Rousseau", "Isabelle Leroy", "Patrick Garnier"
  ];

  return Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    nom: noms[i],
    adresse: rues[i],
    ville: villes[i % villes.length],
    codePostal: `750${10 + (i % 3)}`,
    telephone: `01.${40 + (i % 60)}.${10 + (i % 90)}.${10 + (i % 90)}.${10 + (i % 90)}`,
    email: `contact@${noms[i].toLowerCase().replace(/[^a-z]/g, '').replace(/\s+/g, '')}.fr`,
    gestionnaire: gestionnaires[i % gestionnaires.length],
    statut: Math.random() > 0.2 ? 'ACTIF' : 'INACTIF',
    chambresTotal: 8 + Math.floor(Math.random() * 20),
    chambresOccupees: Math.floor(Math.random() * 15) + 2,
    tauxOccupation: Math.floor(Math.random() * 40) + 60
  }));
};

export const generateReservations = (): Reservation[] => {
  const noms = ["Dubois", "Martin", "Bernard", "Thomas", "Petit", "Robert", "Richard", "Durand", "Leroy", "Moreau", "Simon", "Michel", "Lefebvre", "Leroy", "Roux", "David", "Bertrand", "Morel", "Fournier", "Girard"];
  const prenoms = ["Jean", "Marie", "Pierre", "Michel", "André", "Philippe", "Alain", "Bernard", "Daniel", "Christian", "Sophie", "Catherine", "Isabelle", "Anne", "Claire", "Nathalie", "Valérie", "Sandrine", "Laure", "Emmanuelle"];
  const prescripteurs = ["SIAO 75", "SIAO 93", "Emmaüs", "Secours Catholique", "CCAS", "Mission locale", "SAMUSOCIAL DE PARIS", "Croix-Rouge", "Armée du Salut", "Fondation de France"];
  const statuts = ["CONFIRMEE", "EN_COURS", "TERMINEE", "ANNULEE"];
  const hotels = [
    "Résidence Saint-Martin", "Foyer Solidaire Belleville", "Hôtel d'Accueil Républicain", 
    "Centre d'Hébergement Voltaire", "Résidence Temporaire Victor Hugo", "Foyer d'Urgence Gambetta",
    "Hôtel Social Charonne", "Centre Diderot", "Résidence Solidaire Ménilmontant",
    "Foyer d'Accueil Père Lachaise", "Hôtel d'Urgence Bastille", "Centre Social République",
    "Résidence d'Insertion Oberkampf", "Foyer Temporaire Nation", "Hôtel Solidaire Picpus"
  ];
  const chambres = ["101", "102", "103", "201", "202", "203", "301", "302", "303", "401", "402", "403", "501", "502", "503"];
  
  return Array.from({ length: 120 }, (_, i) => {
    const dateArrivee = new Date();
    dateArrivee.setDate(dateArrivee.getDate() - Math.floor(Math.random() * 30) + Math.floor(Math.random() * 60));
    const dateDepart = new Date(dateArrivee);
    dateDepart.setDate(dateDepart.getDate() + Math.floor(Math.random() * 20) + 3);
    
    return {
      id: i + 1,
      usager: `${prenoms[i % prenoms.length]} ${noms[i % noms.length]}`,
      chambre: chambres[i % chambres.length],
      hotel: hotels[i % hotels.length],
      dateArrivee: dateArrivee.toLocaleDateString('fr-FR'),
      dateDepart: dateDepart.toLocaleDateString('fr-FR'),
      statut: statuts[Math.floor(Math.random() * statuts.length)],
      prescripteur: prescripteurs[Math.floor(Math.random() * prescripteurs.length)],
      prix: Math.floor(Math.random() * 40) + 45, // Prix entre 45€ et 85€ par nuit
      duree: Math.floor((dateDepart.getTime() - dateArrivee.getTime()) / (1000 * 60 * 60 * 24))
    };
  });
};

export const generateOperateursSociaux = (): OperateurSocial[] => {
  const noms = ["Dubois", "Martin", "Bernard", "Thomas", "Petit", "Robert", "Richard", "Durand", "Leroy", "Moreau", "Simon", "Michel", "Lefebvre", "Roux", "David", "Bertrand", "Morel", "Fournier", "Girard", "Bonnet"];
  const prenoms = ["Marie", "Sophie", "Catherine", "Isabelle", "Anne", "Claire", "Nathalie", "Valérie", "Sandrine", "Laure", "Emmanuelle", "Aurélie", "Céline", "Delphine", "Émilie", "Florence", "Gaëlle", "Hélène", "Ingrid", "Julie"];
  const organisations = [
    "SIAO 75 - Paris", "SIAO 93 - Seine-Saint-Denis", "Emmaüs Solidarité", 
    "Secours Catholique", "CCAS Paris 11e", "CCAS Paris 12e", "Mission locale Paris",
    "Croix-Rouge française", "Fondation de l'Armée du Salut", "Association Aurore",
    "Fondation Abbé Pierre", "Médecins du Monde", "SOS Amitié", "UDAF 75",
    "SAMUSOCIAL DE PARIS", "Croix-Rouge", "Armée du Salut", "Fondation de France",
    "Association Aurore", "Fondation Abbé Pierre", "Médecins du Monde"
  ];
  const specialites = [
    "Accompagnement global", "Urgence sociale", "Insertion professionnelle",
    "Accompagnement santé", "Accompagnement famille", "Accompagnement jeunes",
    "Accompagnement seniors", "Accompagnement migrants", "Accompagnement femmes"
  ];
  const zonesIntervention = [
    "Paris 11e", "Paris 12e", "Paris 20e", "Montreuil", "Vincennes",
    "Paris 13e", "Paris 14e", "Paris 15e", "Paris 16e", "Paris 17e",
    "Paris 18e", "Paris 19e", "Paris 10e", "Paris 9e", "Paris 8e"
  ];

  return Array.from({ length: 35 }, (_, i) => {
    const dateCreation = new Date();
    dateCreation.setDate(dateCreation.getDate() - Math.floor(Math.random() * 365));
    
    return {
      id: i + 1,
      nom: noms[i % noms.length],
      prenom: prenoms[i % prenoms.length],
      organisation: organisations[i % organisations.length],
      telephone: `01.${40 + (i % 60)}.${10 + (i % 90)}.${10 + (i % 90)}.${10 + (i % 90)}`,
      email: `${prenoms[i % prenoms.length].toLowerCase()}.${noms[i % noms.length].toLowerCase()}@${organisations[i % organisations.length].toLowerCase().replace(/[^a-z]/g, '').replace(/\s+/g, '')}.fr`,
      statut: Math.random() > 0.15 ? 'actif' : 'inactif',
      specialite: specialites[i % specialites.length],
      zoneIntervention: zonesIntervention[i % zonesIntervention.length],
      nombreReservations: Math.floor(Math.random() * 50) + 5,
      dateCreation: dateCreation.toLocaleDateString('fr-FR'),
      notes: Math.random() > 0.7 ? `Opérateur expérimenté dans ${specialites[i % specialites.length].toLowerCase()}` : undefined
    };
  });
};

export const generateConventionsPrix = (operateurs: OperateurSocial[], hotels: Hotel[]): ConventionPrix[] => {
  const typesChambres = ["Simple", "Double", "Familiale", "Adaptée"];
  const statuts = ["active", "expiree", "suspendue"];
  const conditions = [
    "Réservation minimum 3 nuits",
    "Paiement à l'avance requis",
    "Accompagnement social obligatoire",
    "Durée maximale 30 jours",
    "Disponible uniquement en semaine",
    "Réservation 48h à l'avance"
  ];
  
  const mois = ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'];

  const conventions: ConventionPrix[] = [];
  let id = 1;

  operateurs.forEach(operateur => {
    // Chaque opérateur a des conventions avec 3-8 établissements
    const nbConventions = Math.floor(Math.random() * 6) + 3;
    const hotelsSelectionnes = hotels
      .sort(() => 0.5 - Math.random())
      .slice(0, nbConventions);

    hotelsSelectionnes.forEach(hotel => {
      // 1-3 types de chambres par convention
      const nbTypesChambres = Math.floor(Math.random() * 3) + 1;
      const typesSelectionnes = typesChambres
        .sort(() => 0.5 - Math.random())
        .slice(0, nbTypesChambres);

      typesSelectionnes.forEach(typeChambre => {
        const prixStandard = typeChambre === "Simple" ? 45 + Math.floor(Math.random() * 15) :
                           typeChambre === "Double" ? 65 + Math.floor(Math.random() * 20) :
                           typeChambre === "Familiale" ? 85 + Math.floor(Math.random() * 25) : 75 + Math.floor(Math.random() * 20);
        
        const reduction = Math.floor(Math.random() * 20) + 5; // 5-25% de réduction
        const prixConventionne = Math.round(prixStandard * (1 - reduction / 100));

        // Générer des tarifs mensuels pour certains mois
        const tarifsMensuels: any = {};
        const nbMoisAvecTarifs = Math.floor(Math.random() * 8) + 4; // 4-12 mois avec tarifs
        const moisSelectionnes = mois.sort(() => 0.5 - Math.random()).slice(0, nbMoisAvecTarifs);
        
        moisSelectionnes.forEach(mois => {
          const prixParPersonne = Math.round(prixConventionne * (0.7 + Math.random() * 0.4)); // ±30% variation
          const prixParChambre = Math.round(prixConventionne * (0.8 + Math.random() * 0.4)); // ±20% variation
          
          tarifsMensuels[mois] = {
            prixParPersonne: Math.random() > 0.3 ? prixParPersonne : undefined,
            prixParChambre: Math.random() > 0.3 ? prixParChambre : undefined
          };
        });

        const dateDebut = new Date();
        dateDebut.setDate(dateDebut.getDate() - Math.floor(Math.random() * 365));

        const dateFin = new Date(dateDebut);
        dateFin.setDate(dateFin.getDate() + 365 + Math.floor(Math.random() * 365));

        const statut = Math.random() > 0.8 ? statuts[Math.floor(Math.random() * statuts.length)] : 'active';

        conventions.push({
          id: id++,
          operateurId: operateur.id,
          hotelId: hotel.id,
          hotelNom: hotel.nom,
          typeChambre,
          prixConventionne,
          prixStandard,
          reduction,
          dateDebut: dateDebut.toLocaleDateString('fr-FR'),
          dateFin: statut === 'active' ? dateFin.toLocaleDateString('fr-FR') : undefined,
          statut: statut as 'active' | 'expiree' | 'suspendue',
          conditions: Math.random() > 0.5 ? conditions[Math.floor(Math.random() * conditions.length)] : undefined,
          conditionsSpeciales: Object.keys(tarifsMensuels).length > 0 ? 
            `Tarification personnalisée sur ${Object.keys(tarifsMensuels).length} mois` : undefined,
          tarifsMensuels: Object.keys(tarifsMensuels).length > 0 ? tarifsMensuels : undefined
        });
      });
    });
  });

  return conventions;
};

export const generateProcessusReservations = (reservations: Reservation[]): ProcessusReservation[] => {
  const validateurs = ["Marie Dubois", "Pierre Martin", "Sophie Lemoine", "Jean Moreau", "Anne Petit"];
  const priorites = ["basse", "normale", "haute", "urgente"];
  const commentaires = [
    "Validation automatique",
    "Dossier complet",
    "Urgence sociale confirmée",
    "Accompagnement en cours",
    "En attente de documents",
    "Validation manuelle requise",
    "Paiement partiel effectué",
    "Relance envoyée"
  ];

  return reservations.map((reservation, index) => {
    const dateDebut = new Date();
    dateDebut.setDate(dateDebut.getDate() - Math.floor(Math.random() * 30));
    
    const dureeEstimee = Math.floor(Math.random() * 15) + 5; // 5-20 jours
    const dateFin = new Date(dateDebut);
    dateFin.setDate(dateFin.getDate() + dureeEstimee);

    // Déterminer le statut global basé sur la progression
    const progression = Math.random();
    let statutGlobal: 'en_cours' | 'termine' | 'annule';
    if (progression < 0.1) statutGlobal = 'annule';
    else if (progression > 0.8) statutGlobal = 'termine';
    else statutGlobal = 'en_cours';

    // Générer les étapes du processus
    const bonHebergement = {
      statut: progression < 0.2 ? 'en_attente' : 
              progression < 0.3 ? 'refuse' : 
              progression < 0.4 ? 'expire' : 'valide' as 'en_attente' | 'valide' | 'refuse' | 'expire',
      dateCreation: dateDebut.toLocaleDateString('fr-FR'),
      dateValidation: progression > 0.4 ? new Date(dateDebut.getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR') : undefined,
      numero: `BH-${String(reservation.id).padStart(4, '0')}-${new Date().getFullYear()}`,
      validateur: progression > 0.4 ? validateurs[Math.floor(Math.random() * validateurs.length)] : undefined,
      commentaires: Math.random() > 0.7 ? commentaires[Math.floor(Math.random() * commentaires.length)] : undefined
    };

    const bonCommande = {
      statut: progression < 0.5 ? 'en_attente' : 
              progression < 0.6 ? 'refuse' : 
              progression < 0.7 ? 'expire' : 'valide' as 'en_attente' | 'valide' | 'refuse' | 'expire',
      dateCreation: progression > 0.4 ? new Date(dateDebut.getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR') : undefined,
      dateValidation: progression > 0.7 ? new Date(dateDebut.getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR') : undefined,
      numero: progression > 0.4 ? `BC-${String(reservation.id).padStart(4, '0')}-${new Date().getFullYear()}` : undefined,
      validateur: progression > 0.7 ? validateurs[Math.floor(Math.random() * validateurs.length)] : undefined,
      montant: reservation.prix * reservation.duree,
      commentaires: Math.random() > 0.7 ? commentaires[Math.floor(Math.random() * commentaires.length)] : undefined
    };

    const facture = {
      statut: progression < 0.7 ? 'en_attente' : 
              progression < 0.8 ? 'generee' : 
              progression < 0.85 ? 'envoyee' : 
              progression < 0.9 ? 'impayee' : 'payee' as 'en_attente' | 'generee' | 'envoyee' | 'payee' | 'impayee',
      dateCreation: progression > 0.6 ? new Date(dateDebut.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR') : undefined,
      dateEnvoi: progression > 0.8 ? new Date(dateDebut.getTime() + 8 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR') : undefined,
      datePaiement: progression > 0.9 ? new Date(dateDebut.getTime() + 12 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR') : undefined,
      numero: progression > 0.6 ? `FACT-${String(reservation.id).padStart(4, '0')}-${new Date().getFullYear()}` : undefined,
      montant: reservation.prix * reservation.duree,
      montantPaye: progression > 0.9 ? reservation.prix * reservation.duree : 
                   progression > 0.85 ? Math.floor((reservation.prix * reservation.duree) * 0.7) : 0,
      commentaires: Math.random() > 0.7 ? commentaires[Math.floor(Math.random() * commentaires.length)] : undefined
    };

    return {
      id: index + 1,
      reservationId: reservation.id,
      statut: statutGlobal,
      etapes: {
        bonHebergement,
        bonCommande,
        facture
      },
      dateDebut: dateDebut.toLocaleDateString('fr-FR'),
      dateFin: statutGlobal === 'termine' ? dateFin.toLocaleDateString('fr-FR') : undefined,
      dureeEstimee,
      priorite: priorites[Math.floor(Math.random() * priorites.length)] as 'basse' | 'normale' | 'haute' | 'urgente'
    };
  });
};

export const generateConversations = (operateurs: OperateurSocial[]): Conversation[] => {
  const sujets = [
    "Demande de réservation urgente",
    "Question sur les conventions de prix",
    "Problème avec une réservation",
    "Demande d'information sur un établissement",
    "Renouvellement de convention",
    "Signalement d'un problème",
    "Demande de modification de dates",
    "Question sur les conditions d'hébergement",
    "Demande de documents",
    "Coordination pour un usager"
  ];

  const admins = ["Admin Principal", "Gestionnaire RH", "Coordinateur Social", "Responsable Hébergement"];

  return operateurs.map((operateur, index) => {
    const dateCreation = new Date();
    dateCreation.setDate(dateCreation.getDate() - Math.floor(Math.random() * 30));
    
    const dateDernierMessage = new Date(dateCreation);
    dateDernierMessage.setDate(dateDernierMessage.getDate() + Math.floor(Math.random() * 7));

    const nombreMessages = Math.floor(Math.random() * 10) + 1;
    const nonLus = Math.floor(Math.random() * 3);

    return {
      id: index + 1,
      operateurId: operateur.id,
      operateurNom: `${operateur.prenom} ${operateur.nom}`,
      adminId: 1,
      adminNom: admins[Math.floor(Math.random() * admins.length)],
      sujet: sujets[Math.floor(Math.random() * sujets.length)],
      dateCreation: dateCreation.toLocaleDateString('fr-FR'),
      dateDernierMessage: dateDernierMessage.toLocaleDateString('fr-FR'),
      nombreMessages,
      statut: Math.random() > 0.8 ? 'terminee' : 'active',
      derniereMessage: "Dernier message de la conversation...",
      nonLus
    };
  });
};

export const generateMessages = (conversations: Conversation[]): Message[] => {
  const contenus = [
    "Bonjour, j'ai une demande urgente pour un usager en situation de détresse.",
    "Pouvez-vous me confirmer les disponibilités pour la semaine prochaine ?",
    "Merci pour votre réponse rapide, c'est parfait.",
    "J'ai besoin d'informations supplémentaires sur les conditions d'hébergement.",
    "La réservation a été confirmée, merci beaucoup.",
    "Il y a eu un changement de dates, pouvez-vous modifier ?",
    "L'usager a des besoins spécifiques, pouvez-vous adapter ?",
    "Je vous envoie les documents demandés en pièce jointe.",
    "La convention de prix a été mise à jour, merci.",
    "Nous avons un problème avec le paiement, pouvez-vous nous aider ?"
  ];

  const messages: Message[] = [];
  let messageId = 1;

  conversations.forEach(conversation => {
    const nbMessages = conversation.nombreMessages;
    
    for (let i = 0; i < nbMessages; i++) {
      const dateEnvoi = new Date();
      dateEnvoi.setDate(dateEnvoi.getDate() - Math.floor(Math.random() * 7));
      
      const isFromOperateur = i % 2 === 0;
      const statut = i === nbMessages - 1 ? 'envoye' : 
                    i === nbMessages - 2 ? 'lu' : 'repondu';
      
      const dateLecture = statut === 'lu' || statut === 'repondu' ? 
        new Date(dateEnvoi.getTime() + Math.floor(Math.random() * 24 * 60 * 60 * 1000)).toLocaleDateString('fr-FR') : undefined;

      messages.push({
        id: messageId++,
        expediteurId: isFromOperateur ? conversation.operateurId : conversation.adminId,
        expediteurNom: isFromOperateur ? conversation.operateurNom : conversation.adminNom,
        expediteurType: isFromOperateur ? 'operateur' : 'admin',
        destinataireId: isFromOperateur ? conversation.adminId : conversation.operateurId,
        destinataireNom: isFromOperateur ? conversation.adminNom : conversation.operateurNom,
        destinataireType: isFromOperateur ? 'admin' : 'operateur',
        sujet: conversation.sujet,
        contenu: contenus[Math.floor(Math.random() * contenus.length)],
        dateEnvoi: dateEnvoi.toLocaleDateString('fr-FR'),
        dateLecture,
        statut: statut as 'envoye' | 'lu' | 'repondu',
        priorite: Math.random() > 0.8 ? 'urgente' : Math.random() > 0.6 ? 'importante' : 'normale',
        pieceJointe: Math.random() > 0.9 ? 'document.pdf' : undefined,
        conversationId: conversation.id
      });
    }
  });

  return messages;
};

// Variables communes pour tous les documents
const variablesCommunes: DocumentVariable[] = [
  {
    nom: 'nom_etablissement',
    description: 'Nom de l\'établissement',
    type: 'texte',
    obligatoire: true,
    exemple: 'Résidence Saint-Martin'
  },
  {
    nom: 'adresse_etablissement',
    description: 'Adresse complète de l\'établissement',
    type: 'adresse',
    obligatoire: true,
    exemple: '12 rue de la République, 75011 Paris'
  },
  {
    nom: 'telephone_etablissement',
    description: 'Téléphone de l\'établissement',
    type: 'telephone',
    obligatoire: true,
    exemple: '01.42.00.00.01'
  },
  {
    nom: 'email_etablissement',
    description: 'Email de l\'établissement',
    type: 'email',
    obligatoire: true,
    exemple: 'contact@residence-saint-martin.fr'
  },
  {
    nom: 'date_generation',
    description: 'Date de génération du document',
    type: 'date',
    obligatoire: true,
    valeurParDefaut: '{{DATE_ACTUELLE}}'
  }
];

export const generateDocumentTemplates = (): DocumentTemplate[] => {
  const templates: DocumentTemplate[] = [];

  // Template Facture
  templates.push({
    id: 1,
    nom: 'Facture Standard',
    type: 'facture',
    description: 'Modèle de facture pour les hébergements sociaux',
    contenu: `FACTURE

{{nom_etablissement}}
{{adresse_etablissement}}
Tél: {{telephone_etablissement}}
Email: {{email_etablissement}}

FACTURE N° {{numero_facture}}
Date: {{date_generation}}

CLIENT:
{{nom_client}} {{prenom_client}}
{{adresse_client}}
{{telephone_client}}

DÉTAIL DES PRESTATIONS:
Chambre: {{numero_chambre}}
Type: {{type_chambre}}
Période: Du {{date_arrivee}} au {{date_depart}}
Nombre de nuits: {{nombre_nuits}}

TARIFS:
Prix par nuit: {{prix_nuit}} €
Total HT: {{total_ht}} €
TVA (10%): {{tva}} €
Total TTC: {{total_ttc}} €

MODE DE PAIEMENT:
{{mode_paiement}}

ÉCHÉANCE:
{{date_echeance}}

Merci de votre confiance.`,
    variables: [
      ...variablesCommunes,
      {
        nom: 'numero_facture',
        description: 'Numéro de facture',
        type: 'texte',
        obligatoire: true,
        exemple: 'FAC-2024-001'
      },
      {
        nom: 'nom_client',
        description: 'Nom du client',
        type: 'texte',
        obligatoire: true,
        exemple: 'Dupont'
      },
      {
        nom: 'prenom_client',
        description: 'Prénom du client',
        type: 'texte',
        obligatoire: true,
        exemple: 'Jean'
      },
      {
        nom: 'adresse_client',
        description: 'Adresse du client',
        type: 'adresse',
        obligatoire: true,
        exemple: '123 rue de la Paix, 75001 Paris'
      },
      {
        nom: 'telephone_client',
        description: 'Téléphone du client',
        type: 'telephone',
        obligatoire: false,
        exemple: '01.23.45.67.89'
      },
      {
        nom: 'numero_chambre',
        description: 'Numéro de chambre',
        type: 'texte',
        obligatoire: true,
        exemple: '101'
      },
      {
        nom: 'type_chambre',
        description: 'Type de chambre',
        type: 'texte',
        obligatoire: true,
        exemple: 'Simple'
      },
      {
        nom: 'date_arrivee',
        description: 'Date d\'arrivée',
        type: 'date',
        obligatoire: true,
        exemple: '01/01/2024'
      },
      {
        nom: 'date_depart',
        description: 'Date de départ',
        type: 'date',
        obligatoire: true,
        exemple: '15/01/2024'
      },
      {
        nom: 'nombre_nuits',
        description: 'Nombre de nuits',
        type: 'nombre',
        obligatoire: true,
        exemple: '14'
      },
      {
        nom: 'prix_nuit',
        description: 'Prix par nuit',
        type: 'montant',
        obligatoire: true,
        exemple: '45.00'
      },
      {
        nom: 'total_ht',
        description: 'Total HT',
        type: 'montant',
        obligatoire: true,
        exemple: '630.00'
      },
      {
        nom: 'tva',
        description: 'Montant TVA',
        type: 'montant',
        obligatoire: true,
        exemple: '63.00'
      },
      {
        nom: 'total_ttc',
        description: 'Total TTC',
        type: 'montant',
        obligatoire: true,
        exemple: '693.00'
      },
      {
        nom: 'mode_paiement',
        description: 'Mode de paiement',
        type: 'texte',
        obligatoire: true,
        exemple: 'Virement bancaire'
      },
      {
        nom: 'date_echeance',
        description: 'Date d\'échéance',
        type: 'date',
        obligatoire: true,
        exemple: '30/01/2024'
      }
    ],
    statut: 'actif',
    dateCreation: '2024-01-01',
    dateModification: '2024-01-15',
    version: '1.0',
    format: 'pdf',
    enTete: 'SoliReserve - Gestion d\'hébergements sociaux',
    piedDePage: 'Document généré automatiquement le {{date_generation}}'
  });

  // Template Bon de Réservation
  templates.push({
    id: 2,
    nom: 'Bon de Réservation',
    type: 'bon_reservation',
    description: 'Bon de réservation pour hébergement social avec design moderne',
    contenu: `BON DE RÉSERVATION

{{nom_etablissement}}
{{adresse_etablissement}}
Tél: {{telephone_etablissement}}

BON N° {{numero_bon}}
Date: {{date_generation}}

PRESCRIPTEUR:
{{nom_prescripteur}}
{{organisme_prescripteur}}
{{telephone_prescripteur}}

BÉNÉFICIAIRE:
{{nom_beneficiaire}} {{prenom_beneficiaire}}
Date de naissance: {{date_naissance}}
{{adresse_beneficiaire}}
{{telephone_beneficiaire}}

HÉBERGEMENT:
Établissement: {{nom_etablissement}}
Chambre: {{numero_chambre}}
Type: {{type_chambre}}
Date d'arrivée: {{date_arrivee}}
Date de départ: {{date_depart}}
Nombre de nuits: {{nombre_nuits}}

TARIF:
Prix par nuit: {{prix_nuit}} €
Total: {{total_ttc}} €

Merci de votre confiance.`,
    variables: [
      ...variablesCommunes,
      {
        nom: 'numero_bon',
        description: 'Numéro du bon',
        type: 'texte',
        obligatoire: true,
        exemple: 'BR-2024-001'
      },
      {
        nom: 'nom_prescripteur',
        description: 'Nom du prescripteur',
        type: 'texte',
        obligatoire: true,
        exemple: 'Martin'
      },
      {
        nom: 'organisme_prescripteur',
        description: 'Organisme prescripteur',
        type: 'texte',
        obligatoire: true,
        exemple: 'SIAO 75'
      },
      {
        nom: 'telephone_prescripteur',
        description: 'Téléphone du prescripteur',
        type: 'telephone',
        obligatoire: true,
        exemple: '01.42.00.00.02'
      },
      {
        nom: 'nom_beneficiaire',
        description: 'Nom du bénéficiaire',
        type: 'texte',
        obligatoire: true,
        exemple: 'Dupont'
      },
      {
        nom: 'prenom_beneficiaire',
        description: 'Prénom du bénéficiaire',
        type: 'texte',
        obligatoire: true,
        exemple: 'Marie'
      },
      {
        nom: 'date_naissance',
        description: 'Date de naissance',
        type: 'date',
        obligatoire: true,
        exemple: '15/03/1980'
      },
      {
        nom: 'adresse_beneficiaire',
        description: 'Adresse du bénéficiaire',
        type: 'adresse',
        obligatoire: true,
        exemple: '456 rue de la Liberté, 75002 Paris'
      },
      {
        nom: 'telephone_beneficiaire',
        description: 'Téléphone du bénéficiaire',
        type: 'telephone',
        obligatoire: false,
        exemple: '06.12.34.56.78'
      },
      {
        nom: 'numero_chambre',
        description: 'Numéro de chambre',
        type: 'texte',
        obligatoire: true,
        exemple: '205'
      },
      {
        nom: 'type_chambre',
        description: 'Type de chambre',
        type: 'texte',
        obligatoire: true,
        exemple: 'Double'
      },
      {
        nom: 'date_arrivee',
        description: 'Date d\'arrivée',
        type: 'date',
        obligatoire: true,
        exemple: '01/02/2024'
      },
      {
        nom: 'date_depart',
        description: 'Date de départ',
        type: 'date',
        obligatoire: true,
        exemple: '28/02/2024'
      },
      {
        nom: 'nombre_nuits',
        description: 'Nombre de nuits',
        type: 'nombre',
        obligatoire: true,
        exemple: '28'
      },
      {
        nom: 'prix_nuit',
        description: 'Prix par nuit',
        type: 'montant',
        obligatoire: true,
        exemple: '50.00'
      },
      {
        nom: 'total',
        description: 'Total',
        type: 'montant',
        obligatoire: true,
        exemple: '1400.00'
      },
      {
        nom: 'prise_charge',
        description: 'Montant pris en charge',
        type: 'montant',
        obligatoire: true,
        exemple: '1400.00'
      },
      {
        nom: 'reste_charge',
        description: 'Reste à charge',
        type: 'montant',
        obligatoire: true,
        exemple: '0.00'
      },
      {
        nom: 'conditions_particulieres',
        description: 'Conditions particulières',
        type: 'texte',
        obligatoire: false,
        exemple: 'Accompagnement social obligatoire'
      },
      {
        nom: 'date_signature',
        description: 'Date de signature',
        type: 'date',
        obligatoire: true,
        exemple: '25/01/2024'
      }
    ],
    statut: 'actif',
    dateCreation: '2024-01-01',
    dateModification: '2024-01-15',
    version: '1.0',
    format: 'pdf',
    enTete: 'SoliReserve - Bon de réservation',
    piedDePage: 'Document généré le {{date_generation}}'
  });

  // Template Prolongation de Réservation
  templates.push({
    id: 3,
    nom: 'Prolongation de Réservation',
    type: 'prolongation_reservation',
    description: 'Document de prolongation de séjour avec en-tête Voyages Services Plus',
    contenu: `PROLONGATION DE RÉSERVATION

EN-TÊTE EXPÉDITEUR:
Expéditeur (NOUVELLE ADRESSE)
Voyages Services Plus
Tour Liberty 17 place des Reflets
92400 Courbevoie
Email: reservation@vesta-operateursolidaire.fr

STRUCTURE DU DOCUMENT:

Titre principal: Prolongation de Réservation
Phrase d'introduction: Nous vous confirmons la prolongation suivante :

INFORMATIONS DESTINATAIRE:
Nom destinataire: {{nom_destinataire}}
Numéro de marché: {{numero_marche}}
TVA Intracommunautaire: {{tva_intracommunautaire}}
Service: {{service_destinataire}}
Adresse destinataire: {{adresse_destinataire}}
Email destinataire: {{email_destinataire}}

DÉTAILS DE LA PROLONGATION:
Du: {{date_debut}}
Au: {{date_fin}}
Nombre de nuit(s): {{nombre_nuits}}
N° réservation: {{numero_reservation}}
Type de chambre: {{type_chambre}}
N° de chambre: {{numero_chambre}}
Nombre de personne: {{nombre_personnes}}

OCCUPANTS:
Nom & Prénom occupant principal: {{occupant_principal}}
Nom & Prénom occupant 2: {{occupant_2}}
Nom & Prénom occupant 3: {{occupant_3}}

INFORMATIONS COMPLÉMENTAIRES:
{{informations_complementaires}}

Hôtel VSP: {{nom_hotel}}
Adresse hôtel: {{adresse_hotel}}

INFORMATIONS FINANCIÈRES:
Coût prestation: {{cout_prestation}}

MISE EN FORME:
Bandeau orange pour le titre "Prolongation de Réservation"
Numérotation de page "page 1/1"
Section "Destinataire" en haut à droite

Signature du responsable: _________________
Date: {{date_signature}}`,
    variables: [
      {
        nom: 'nom_destinataire',
        description: 'Nom du destinataire',
        type: 'texte',
        obligatoire: true,
        exemple: 'SAMUSOCIAL DE PARIS'
      },
      {
        nom: 'numero_marche',
        description: 'Numéro de marché',
        type: 'texte',
        obligatoire: true,
        exemple: '2024-SSP-DELTA'
      },
      {
        nom: 'tva_intracommunautaire',
        description: 'TVA Intracommunautaire',
        type: 'texte',
        obligatoire: true,
        exemple: 'FR92187509013'
      },
      {
        nom: 'service_destinataire',
        description: 'Service du destinataire',
        type: 'texte',
        obligatoire: true,
        exemple: 'Service Comptabilité Hôtel'
      },
      {
        nom: 'adresse_destinataire',
        description: 'Adresse du destinataire',
        type: 'adresse',
        obligatoire: true,
        exemple: '15 rue Jean Baptiste Berlier 75013 Paris'
      },
      {
        nom: 'email_destinataire',
        description: 'Email du destinataire',
        type: 'email',
        obligatoire: true,
        exemple: 'coordination-reservations.phrh@samusocial-75.fr'
      },
      {
        nom: 'date_debut',
        description: 'Date de début de la prolongation',
        type: 'date',
        obligatoire: true,
        exemple: 'Samedi 01 Février 2025'
      },
      {
        nom: 'date_fin',
        description: 'Date de fin de la prolongation',
        type: 'date',
        obligatoire: true,
        exemple: 'Samedi 01 Mars 2025'
      },
      {
        nom: 'nombre_nuits',
        description: 'Nombre de nuits',
        type: 'nombre',
        obligatoire: true,
        exemple: '28'
      },
      {
        nom: 'numero_reservation',
        description: 'Numéro de réservation',
        type: 'texte',
        obligatoire: true,
        exemple: '1120733'
      },
      {
        nom: 'type_chambre',
        description: 'Type de chambre',
        type: 'texte',
        obligatoire: true,
        exemple: 'T1DB'
      },
      {
        nom: 'numero_chambre',
        description: 'Numéro de chambre',
        type: 'texte',
        obligatoire: true,
        exemple: 'B0211'
      },
      {
        nom: 'nombre_personnes',
        description: 'Nombre de personnes',
        type: 'nombre',
        obligatoire: true,
        exemple: '2'
      },
      {
        nom: 'occupant_principal',
        description: 'Nom & Prénom occupant principal',
        type: 'texte',
        obligatoire: true,
        exemple: 'DIABY Amara'
      },
      {
        nom: 'occupant_2',
        description: 'Nom & Prénom occupant 2',
        type: 'texte',
        obligatoire: true,
        exemple: 'DIABY Matrou'
      },
      {
        nom: 'occupant_3',
        description: 'Nom & Prénom occupant 3',
        type: 'texte',
        obligatoire: false,
        exemple: 'DIABY Almamy- MoustaphaJunior'
      },
      {
        nom: 'informations_complementaires',
        description: 'Informations complémentaires',
        type: 'texte',
        obligatoire: false,
        exemple: 'Accompagnement social en cours'
      },
      {
        nom: 'nom_hotel',
        description: 'Nom de l\'hôtel',
        type: 'texte',
        obligatoire: true,
        exemple: 'Logely Bobigny'
      },
      {
        nom: 'adresse_hotel',
        description: 'Adresse de l\'hôtel',
        type: 'adresse',
        obligatoire: true,
        exemple: '19 Rue Honore d Estienne d Orves 93000 Bobigny'
      },
      {
        nom: 'cout_prestation',
        description: 'Coût de la prestation',
        type: 'montant',
        obligatoire: true,
        exemple: '1262.8 Euro TTC'
      },
      {
        nom: 'date_signature',
        description: 'Date de signature',
        type: 'date',
        obligatoire: true,
        exemple: '01/02/2025'
      }
    ],
    statut: 'actif',
    dateCreation: '2024-01-01',
    dateModification: '2024-01-15',
    version: '1.0',
    format: 'pdf',
    enTete: 'Voyages Services Plus - Prolongation de Réservation',
    piedDePage: 'Document généré le {{date_generation}} - Page 1/1'
  });

  // Template Bon de Confirmation
  templates.push({
    id: 4,
    nom: 'Bon de Confirmation',
    type: 'bon_reservation',
    description: 'Confirmation de réservation avec en-tête Voyages Services Plus',
    contenu: `CONFIRMATION DE RÉSERVATION

EN-TÊTE EXPÉDITEUR:
Expéditeur (NOUVELLE ADRESSE)
Voyages Services Plus
Tour Liberty 17 place des Reflets
92400 Courbevoie
Email: reservation@vesta-operateursolidaire.fr

STRUCTURE DU DOCUMENT:

Titre principal: Confirmation de Réservation
Phrase d'introduction: Nous vous confirmons la réservation suivante :

INFORMATIONS DESTINATAIRE:
Nom destinataire: {{nom_destinataire}}
Numéro de marché: {{numero_marche}}
TVA Intracommunautaire: {{tva_intracommunautaire}}
Service: {{service_destinataire}}
Adresse destinataire: {{adresse_destinataire}}
Email destinataire: {{email_destinataire}}

DÉTAILS DE LA RÉSERVATION:
Du: {{date_debut}}
Au: {{date_fin}}
Nombre de nuit(s): {{nombre_nuits}}
N° réservation: {{numero_reservation}}
Type de chambre: {{type_chambre}}
N° de chambre: {{numero_chambre}}
Nombre de personne: {{nombre_personnes}}

OCCUPANTS:
Nom & Prénom Chef de famille: {{chef_famille}}
Nom & Prénom occupant 1: {{occupant_1}}
Nom & Prénom occupant 2: {{occupant_2}}

INFORMATIONS COMPLÉMENTAIRES:
{{informations_complementaires}}

Hôtel VSP: {{nom_hotel}}
Adresse hôtel: {{adresse_hotel}}

INFORMATIONS FINANCIÈRES:
Coût prestation: {{cout_prestation}}

MISE EN FORME:
Bandeau orange pour le titre "Confirmation de Réservation"
Numérotation de page "page 1/1"

Signature du responsable: _________________
Date: {{date_signature}}`,
    variables: [
      {
        nom: 'nom_destinataire',
        description: 'Nom du destinataire',
        type: 'texte',
        obligatoire: true,
        exemple: 'SAMUSOCIAL DE PARIS'
      },
      {
        nom: 'numero_marche',
        description: 'Numéro de marché',
        type: 'texte',
        obligatoire: true,
        exemple: '2024-SSP-DELTA'
      },
      {
        nom: 'tva_intracommunautaire',
        description: 'TVA Intracommunautaire',
        type: 'texte',
        obligatoire: true,
        exemple: 'FR92187509013'
      },
      {
        nom: 'service_destinataire',
        description: 'Service du destinataire',
        type: 'texte',
        obligatoire: true,
        exemple: 'Service Comptabilité Hôtel'
      },
      {
        nom: 'adresse_destinataire',
        description: 'Adresse du destinataire',
        type: 'adresse',
        obligatoire: true,
        exemple: '15 rue Jean Baptiste Berlier 75013 Paris'
      },
      {
        nom: 'email_destinataire',
        description: 'Email du destinataire',
        type: 'email',
        obligatoire: true,
        exemple: 'coordination-reservations.phrh@samusocial-75.fr'
      },
      {
        nom: 'date_debut',
        description: 'Date de début',
        type: 'date',
        obligatoire: true,
        exemple: 'Mardi 31 Mai 2022'
      },
      {
        nom: 'date_fin',
        description: 'Date de fin',
        type: 'date',
        obligatoire: true,
        exemple: 'Mercredi 01 Juin 2022'
      },
      {
        nom: 'nombre_nuits',
        description: 'Nombre de nuits',
        type: 'nombre',
        obligatoire: true,
        exemple: '1'
      },
      {
        nom: 'numero_reservation',
        description: 'Numéro de réservation',
        type: 'texte',
        obligatoire: true,
        exemple: '553009'
      },
      {
        nom: 'type_chambre',
        description: 'Type de chambre',
        type: 'texte',
        obligatoire: true,
        exemple: 'T1DB'
      },
      {
        nom: 'numero_chambre',
        description: 'Numéro de chambre',
        type: 'texte',
        obligatoire: true,
        exemple: 'B0913'
      },
      {
        nom: 'nombre_personnes',
        description: 'Nombre de personnes',
        type: 'nombre',
        obligatoire: true,
        exemple: '2'
      },
      {
        nom: 'chef_famille',
        description: 'Nom & Prénom Chef de famille',
        type: 'texte',
        obligatoire: true,
        exemple: 'DIABY Amara'
      },
      {
        nom: 'occupant_1',
        description: 'Nom & Prénom occupant 1',
        type: 'texte',
        obligatoire: true,
        exemple: 'DIABY Matrou'
      },
      {
        nom: 'occupant_2',
        description: 'Nom & Prénom occupant 2',
        type: 'texte',
        obligatoire: false,
        exemple: 'DIABY Almamy- MoustaphaJunior'
      },
      {
        nom: 'informations_complementaires',
        description: 'Informations complémentaires',
        type: 'texte',
        obligatoire: false,
        exemple: 'Accompagnement social en cours'
      },
      {
        nom: 'nom_hotel',
        description: 'Nom de l\'hôtel',
        type: 'texte',
        obligatoire: true,
        exemple: 'Logely Bobigny'
      },
      {
        nom: 'adresse_hotel',
        description: 'Adresse de l\'hôtel',
        type: 'adresse',
        obligatoire: true,
        exemple: '19 Rue Honore d Estienne d Orves 93000 Bobigny'
      },
      {
        nom: 'cout_prestation',
        description: 'Coût de la prestation',
        type: 'montant',
        obligatoire: true,
        exemple: '49.8 Euro TTC'
      },
      {
        nom: 'date_signature',
        description: 'Date de signature',
        type: 'date',
        obligatoire: true,
        exemple: '30/05/2022'
      }
    ],
    statut: 'actif',
    dateCreation: '2024-01-01',
    dateModification: '2024-01-15',
    version: '1.0',
    format: 'pdf',
    enTete: 'Voyages Services Plus - Confirmation de Réservation',
    piedDePage: 'Document généré le {{date_generation}} - Page 1/1'
  });

  // Template Fin de Prise en Charge
  templates.push({
    id: 5,
    nom: 'Fin de Prise en Charge',
    type: 'fin_prise_charge',
    description: 'Document de fin de prise en charge avec en-tête Voyages Services Plus',
    contenu: `FIN DE PRISE EN CHARGE

EN-TÊTE EXPÉDITEUR:
Expéditeur (NOUVELLE ADRESSE)
Voyages Services Plus
Tour Liberty 17 place des Reflets
92400 Courbevoie
Email: reservation@vesta-operateursolidaire.fr

STRUCTURE DU DOCUMENT:

Titre principal: Fin de Prise en Charge
Phrase d'introduction: Nous vous confirmons la fin de prise en charge, {{date_fin_prise_charge}}, de la reservation suivante :

INFORMATIONS DESTINATAIRE:
Nom destinataire: {{nom_destinataire}}
Numéro de marché: {{numero_marche}}
TVA Intracommunautaire: {{tva_intracommunautaire}}
Service: {{service_destinataire}}
Adresse destinataire: {{adresse_destinataire}}
Email destinataire: {{email_destinataire}}

INFORMATIONS DE FIN DE PRISE EN CHARGE:
N° réservation: {{numero_reservation}}
Type de chambre: {{type_chambre}}
N° de chambre: {{numero_chambre}}
Nombre de personne: {{nombre_personnes}}

OCCUPANTS:
Nom & Prénom Chef de famille: {{chef_famille}}
Nom & Prénom occupant 1: {{occupant_1}}
Nom & Prénom occupant 2: {{occupant_2}}

INSTRUCTION DE LIBÉRATION:
Les occupants devront libérer leur chambre avant midi le {{date_limite_liberation}}

INFORMATIONS COMPLÉMENTAIRES:
{{informations_complementaires}}

Client VSP: {{client_vsp}}

MISE EN FORME:
Bandeau orange pour le titre "Fin de Prise en Charge"
Numérotation de page "page 1/1"
Section "Destinataire" en haut à droite
Instruction de libération en ligne séparée centrée

Signature du responsable: _________________
Date: {{date_signature}}`,
    variables: [
      {
        nom: 'nom_destinataire',
        description: 'Nom du destinataire',
        type: 'texte',
        obligatoire: true,
        exemple: 'SAMUSOCIAL DE PARIS'
      },
      {
        nom: 'numero_marche',
        description: 'Numéro de marché',
        type: 'texte',
        obligatoire: true,
        exemple: '2024-SSP-DELTA'
      },
      {
        nom: 'tva_intracommunautaire',
        description: 'TVA Intracommunautaire',
        type: 'texte',
        obligatoire: true,
        exemple: 'FR92187509013'
      },
      {
        nom: 'service_destinataire',
        description: 'Service du destinataire',
        type: 'texte',
        obligatoire: true,
        exemple: 'Service Comptabilité Hôtel'
      },
      {
        nom: 'adresse_destinataire',
        description: 'Adresse du destinataire',
        type: 'adresse',
        obligatoire: true,
        exemple: '15 rue Jean Baptiste Berlier 75013 Paris'
      },
      {
        nom: 'email_destinataire',
        description: 'Email du destinataire',
        type: 'email',
        obligatoire: true,
        exemple: 'coordination-reservations.phrh@samusocial-75.fr'
      },
      {
        nom: 'date_fin_prise_charge',
        description: 'Date de fin de prise en charge',
        type: 'date',
        obligatoire: true,
        exemple: 'Mercredi 22 Janvier 2025'
      },
      {
        nom: 'numero_reservation',
        description: 'Numéro de réservation',
        type: 'texte',
        obligatoire: true,
        exemple: '1120733'
      },
      {
        nom: 'type_chambre',
        description: 'Type de chambre',
        type: 'texte',
        obligatoire: true,
        exemple: 'T1DB'
      },
      {
        nom: 'numero_chambre',
        description: 'Numéro de chambre',
        type: 'texte',
        obligatoire: true,
        exemple: 'B0211'
      },
      {
        nom: 'nombre_personnes',
        description: 'Nombre de personnes',
        type: 'nombre',
        obligatoire: true,
        exemple: '2'
      },
      {
        nom: 'chef_famille',
        description: 'Nom & Prénom Chef de famille',
        type: 'texte',
        obligatoire: true,
        exemple: 'DIABY Amara'
      },
      {
        nom: 'occupant_1',
        description: 'Nom & Prénom occupant 1',
        type: 'texte',
        obligatoire: true,
        exemple: 'DIABY Matrou'
      },
      {
        nom: 'occupant_2',
        description: 'Nom & Prénom occupant 2',
        type: 'texte',
        obligatoire: false,
        exemple: 'DIABY Almamy- MoustaphaJunior'
      },
      {
        nom: 'date_limite_liberation',
        description: 'Date limite de libération (format court)',
        type: 'date',
        obligatoire: true,
        exemple: '22-01-2025'
      },
      {
        nom: 'informations_complementaires',
        description: 'Informations complémentaires',
        type: 'texte',
        obligatoire: false,
        exemple: 'Accompagnement social terminé'
      },
      {
        nom: 'client_vsp',
        description: 'Client VSP',
        type: 'texte',
        obligatoire: true,
        exemple: 'SAMUSOCIAL DE PARIS'
      },
      {
        nom: 'date_signature',
        description: 'Date de signature',
        type: 'date',
        obligatoire: true,
        exemple: '22/01/2025'
      }
    ],
    statut: 'actif',
    dateCreation: '2024-01-01',
    dateModification: '2024-01-15',
    version: '1.0',
    format: 'pdf',
    enTete: 'Voyages Services Plus - Fin de Prise en Charge',
    piedDePage: 'Document généré le {{date_generation}} - Page 1/1'
  });

  return templates;
}; 