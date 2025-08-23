import { useState } from 'react';
import TopBar from '../layout/TopBar';
import { 
  Settings, 
  Building2,
  Plus,
  X,
  Users,
  FileText,
  Bed,
  UserCheck,
  History,
  Wrench
} from 'lucide-react';
import { User, Hotel, DocumentTemplate } from '../../types';
import UsersManagement from '../features/UsersManagement';
import DocumentsManagement from '../features/DocumentsManagement';
import ChambresPage from '../pages/ChambresPage';
import OperateursTable from '../features/OperateursTable';
import ModificationHistory from '../features/ModificationHistory';
import EstablishmentsSection from '../features/EstablishmentsSection';
import RoomsSection from '../features/RoomsSection';
import EquipmentsSection from '../features/EquipmentsSection';

interface ParametresPageProps {
  features: {
    operateursSociaux: boolean;
  
    statistiques: boolean;
    notifications: boolean;
  };
  selectedHotel?: number | null;
  hotels?: Array<{ id: number; nom: string }>;
  users?: User[];
  templates?: DocumentTemplate[];
  operateurs?: any[];
  reservations?: Array<{ id: number; numero: string; usager: string; hotel: string }>;
  agents?: Array<{ id: number; nom: string; prenom: string; role: string }>;
  onFeatureToggle: (feature: string, enabled: boolean) => void;
  onHotelSelect: (hotelId: number | null) => void;
  onHotelCreate?: (hotel: Omit<Hotel, 'id'>) => void;
  onSaveSettings: () => void;
  onResetSettings: () => void;
  onUserCreate?: (user: Omit<User, 'id'>) => void;
  onUserUpdate?: (id: number, updates: Partial<User>) => void;
  onUserDelete?: (id: number) => void;
  onUserToggleStatus?: (id: number) => void;
  onTemplateCreate?: (template: Omit<DocumentTemplate, 'id'>) => void;
  onTemplateUpdate?: (id: number, updates: Partial<DocumentTemplate>) => void;
  onTemplateDelete?: (id: number) => void;
  onTemplateDuplicate?: (id: number) => void;
  onOperateurSelect?: (operateur: any) => void;
}

export default function ParametresPage({
  features,
  selectedHotel,
  hotels,
  users,
  templates,
  operateurs,
  reservations = [],
  agents = [],
  onFeatureToggle,
  onHotelSelect,
  onHotelCreate,
  onSaveSettings,
  onResetSettings,
  onUserCreate,
  onUserUpdate,
  onUserDelete,
  onUserToggleStatus,
  onTemplateCreate,
  onTemplateUpdate,
  onTemplateDelete,
  onTemplateDuplicate,
  onOperateurSelect
}: ParametresPageProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [showAddHotelForm, setShowAddHotelForm] = useState(false);
  const [newHotel, setNewHotel] = useState({
    nom: '',
    adresse: '',
    telephone: '',
    email: '',
    ville: '',
    codePostal: ''
  });

  const topBarItems = [
    {
      id: 'general',
      label: 'Général',
      icon: <Settings className="h-4 w-4" />
    },
    {
      id: 'etablissement',
      label: 'Établissement',
      icon: <Building2 className="h-4 w-4" />
    },
    {
      id: 'chambres',
      label: 'Chambres',
      icon: <Bed className="h-4 w-4" />
    },
    {
      id: 'equipements',
      label: 'Équipements',
      icon: <Wrench className="h-4 w-4" />
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: <UserCheck className="h-4 w-4" />
    },
    {
      id: 'utilisateurs',
      label: 'Utilisateurs',
      icon: <Users className="h-4 w-4" />
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: 'historique',
      label: 'Historique',
      icon: <History className="h-4 w-4" />
    }
  ];

  const handleAddHotel = () => {
    if (newHotel.nom.trim() && onHotelCreate) {
      onHotelCreate({
        ...newHotel,
        gestionnaire: '',
        statut: 'actif',
        chambresTotal: 0,
        chambresOccupees: 0,
        tauxOccupation: 0
      });
      setNewHotel({
        nom: '',
        adresse: '',
        telephone: '',
        email: '',
        ville: '',
        codePostal: ''
      });
      setShowAddHotelForm(false);
    }
  };

  const handleCancelAddHotel = () => {
    setNewHotel({
      nom: '',
      adresse: '',
      telephone: '',
      email: '',
      ville: '',
      codePostal: ''
    });
    setShowAddHotelForm(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Paramètres généraux</h2>
              <p className="text-gray-600 mb-6">Configurez les fonctionnalités principales de votre application</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Fonctionnalités principales</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium">Gestion des clients</div>
                      <div className="text-sm text-gray-600">Associations, entreprises et particuliers</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        features.operateursSociaux ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {features.operateursSociaux ? 'Activé' : 'Désactivé'}
                      </span>
                      <button
                        onClick={() => onFeatureToggle('operateursSociaux', !features.operateursSociaux)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {features.operateursSociaux ? 'Désactiver' : 'Activer'}
                      </button>
                    </div>
                  </div>
                  

                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Fonctionnalités avancées</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium">Statistiques</div>
                      <div className="text-sm text-gray-600">Tableaux de bord et rapports</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        features.statistiques ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {features.statistiques ? 'Activé' : 'Désactivé'}
                      </span>
                      <button
                        onClick={() => onFeatureToggle('statistiques', !features.statistiques)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {features.statistiques ? 'Désactiver' : 'Activer'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium">Notifications</div>
                      <div className="text-sm text-gray-600">Alertes en temps réel</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        features.notifications ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {features.notifications ? 'Activé' : 'Désactivé'}
                      </span>
                      <button
                        onClick={() => onFeatureToggle('notifications', !features.notifications)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {features.notifications ? 'Désactiver' : 'Activer'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'etablissement':
        return <EstablishmentsSection />;
         
               case 'chambres':
          return <RoomsSection />;
         
               case 'equipements':
          return <EquipmentsSection />;
         
               case 'clients':
          return (
            <OperateursTable
              operateurs={operateurs || []}
              onOperateurSelect={onOperateurSelect || (() => {})}
            />
          );
         
               case 'utilisateurs':
          return (
            <UsersManagement
              users={users || []}
              hotels={hotels || []}
              onUserCreate={onUserCreate || (() => {})}
              onUserUpdate={onUserUpdate || (() => {})}
              onUserDelete={onUserDelete || (() => {})}
              onUserToggleStatus={onUserToggleStatus || (() => {})}
            />
          );
         
                     case 'documents':
        return (
          <DocumentsManagement
            templates={templates || []}
            onTemplateCreate={onTemplateCreate || (() => {})}
            onTemplateUpdate={onTemplateUpdate || (() => {})}
            onTemplateDelete={onTemplateDelete || (() => {})}
            onTemplateDuplicate={onTemplateDuplicate || (() => {})}
          />
        );
      
      case 'historique':
        return (
          <div className="space-y-6">
            <ModificationHistory 
              reservations={reservations}
              agents={agents}
            />
          </div>
        );
      
      default:
        return <div>Page non trouvée</div>;
    }
  };

  return (
    <div>
      <TopBar
        items={topBarItems}
        activeItem={activeTab}
        onItemClick={setActiveTab}
      />
      <div className="px-6">
        {renderContent()}
      </div>
    </div>
  );
} 
