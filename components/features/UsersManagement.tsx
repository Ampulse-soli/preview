"use client";

import React, { useState } from 'react';
import { User, RoleDefinition, Hotel, UserRole } from '../../types';
import { roleDefinitions } from '../../utils/dataGenerators';
import RolePermissionsEditor from './RolePermissionsEditor';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  UserPlus, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Building2,
  Save,
  X,
  AlertCircle,
  Search,
  Lock,
  Unlock
} from 'lucide-react';

interface UsersManagementProps {
  users: User[];
  hotels: Array<{ id: number; nom: string }>;
  onUserCreate: (user: Omit<User, 'id'>) => void;
  onUserUpdate: (id: number, updates: Partial<User>) => void;
  onUserDelete: (id: number) => void;
  onUserToggleStatus: (id: number) => void;
}

interface UserFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: UserRole;
  hotelId?: number;
  statut: 'actif' | 'inactif';
}

export default function UsersManagement({
  users,
  hotels,
  onUserCreate,
  onUserUpdate,
  onUserDelete,
  onUserToggleStatus
}: UsersManagementProps) {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  // État du formulaire
  const [formData, setFormData] = useState<UserFormData>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: 'receptionniste',
    hotelId: undefined,
    statut: 'actif'
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterRole !== 'all' && user.role !== filterRole) return false;
    if (filterStatus !== 'all' && user.statut !== filterStatus) return false;
    return matchesSearch;
  });

  const getRoleDefinition = (role: string): RoleDefinition | undefined => {
    return roleDefinitions.find(r => r.id === role);
  };

  const getHotelName = (hotelId?: number): string => {
    if (!hotelId) return 'Tous les établissements';
    const hotel = hotels.find(h => h.id === hotelId);
    return hotel?.nom || 'Établissement inconnu';
  };

  const getStatusIcon = (statut: string) => {
    return statut === 'actif' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getRoleIcon = (role: string) => {
    const roleDef = getRoleDefinition(role);
    return roleDef?.icon || '👤';
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      role: 'receptionniste',
      hotelId: undefined,
      statut: 'actif'
    });
  };

  const handleCreateUser = () => {
    if (formData.nom && formData.prenom && formData.email) {
      onUserCreate({
        ...formData,
        dateCreation: new Date().toLocaleDateString('fr-FR'),
        derniereConnexion: undefined,
        permissions: getRoleDefinition(formData.role)?.permissions || []
      });
      setIsCreating(false);
      resetForm();
    }
  };

  const handleUpdateUser = () => {
    if (selectedUser && formData.nom && formData.prenom && formData.email) {
      onUserUpdate(selectedUser.id, {
        ...formData,
        permissions: getRoleDefinition(formData.role)?.permissions || []
      });
      setIsEditing(false);
      setSelectedUser(null);
      resetForm();
    }
  };

  const handleEditUser = (user: User) => {
    setFormData({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      role: user.role,
      hotelId: user.hotelId,
      statut: user.statut
    });
    setSelectedUser(user);
    setIsEditing(true);
  };

  const handleDeleteUser = (userId: number) => {
    onUserDelete(userId);
    setShowDeleteConfirm(null);
  };



  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900"></h2>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Nouvel utilisateur
        </Button>
      </div>



      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Liste des utilisateurs</TabsTrigger>
          <TabsTrigger value="roles">Rôles et permissions</TabsTrigger>
          <TabsTrigger value="permissions">Gestion des permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filtres et recherche */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher un utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md"
                >
                  <option value="all">Tous les rôles</option>
                  {roleDefinitions.map(role => (
                    <option key={role.id} value={role.id}>{role.nom}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                </select>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des utilisateurs */}
          <div className="grid gap-4">
            {filteredUsers.map(user => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{getRoleIcon(user.role)}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{user.prenom} {user.nom}</h3>
                          {getStatusIcon(user.statut)}
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>
                        {user.telephone && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.telephone}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={user.statut === 'actif' ? 'default' : 'secondary'}>
                            {getRoleDefinition(user.role)?.nom}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {getHotelName(user.hotelId)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUserToggleStatus(user.id)}
                        title={user.statut === 'actif' ? 'Désactiver' : 'Activer'}
                      >
                        {user.statut === 'actif' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(user.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <span>Créé le {user.dateCreation}</span>
                      {user.derniereConnexion && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Dernière connexion : {user.derniereConnexion}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4">
            {roleDefinitions.map(role => (
              <Card key={role.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{role.icon}</span>
                    {role.nom}
                  </CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-semibold">Permissions :</h4>
                    <div className="grid gap-2">
                      {role.permissions.map((permission, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-medium">{permission.module}</span>
                          <div className="flex gap-1">
                            {permission.actions.map(action => (
                              <Badge key={action} variant="outline" className="text-xs">
                                {action}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <RolePermissionsEditor 
            onPermissionsChange={() => {
              // Recharger les données si nécessaire
              // Permissions updated successfully
            }}
          />
        </TabsContent>


      </Tabs>

      {/* Modal de création d'utilisateur */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Nouvel utilisateur</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prenom">Prénom *</Label>
                  <Input
                    id="prenom"
                    value={formData.prenom}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                    placeholder="Prénom"
                  />
                </div>
                <div>
                  <Label htmlFor="nom">Nom *</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    placeholder="Nom"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@exemple.com"
                />
              </div>
              
              <div>
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                  placeholder="06 12 34 56 78"
                />
              </div>
              
              <div>
                <Label htmlFor="role">Rôle *</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {roleDefinitions.map(role => (
                    <option key={role.id} value={role.id}>{role.nom}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="hotel">Établissement</Label>
                <select
                  id="hotel"
                  value={formData.hotelId || ''}
                  onChange={(e) => setFormData({...formData, hotelId: e.target.value ? Number(e.target.value) : undefined})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Tous les établissements</option>
                  {hotels.map(hotel => (
                    <option key={hotel.id} value={hotel.id}>{hotel.nom}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="statut">Statut</Label>
                <select
                  id="statut"
                  value={formData.statut}
                  onChange={(e) => setFormData({...formData, statut: e.target.value as 'actif' | 'inactif'})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateUser} disabled={!formData.nom || !formData.prenom || !formData.email}>
                <Save className="h-4 w-4 mr-2" />
                Créer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition d'utilisateur */}
      {isEditing && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Modifier {selectedUser.prenom} {selectedUser.nom}</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-prenom">Prénom *</Label>
                  <Input
                    id="edit-prenom"
                    value={formData.prenom}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                    placeholder="Prénom"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-nom">Nom *</Label>
                  <Input
                    id="edit-nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    placeholder="Nom"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@exemple.com"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-telephone">Téléphone</Label>
                <Input
                  id="edit-telephone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                  placeholder="06 12 34 56 78"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-role">Rôle *</Label>
                <select
                  id="edit-role"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {roleDefinitions.map(role => (
                    <option key={role.id} value={role.id}>{role.nom}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="edit-hotel">Établissement</Label>
                <select
                  id="edit-hotel"
                  value={formData.hotelId || ''}
                  onChange={(e) => setFormData({...formData, hotelId: e.target.value ? Number(e.target.value) : undefined})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Tous les établissements</option>
                  {hotels.map(hotel => (
                    <option key={hotel.id} value={hotel.id}>{hotel.nom}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="edit-statut">Statut</Label>
                <select
                  id="edit-statut"
                  value={formData.statut}
                  onChange={(e) => setFormData({...formData, statut: e.target.value as 'actif' | 'inactif'})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateUser} disabled={!formData.nom || !formData.prenom || !formData.email}>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-bold">Confirmer la suppression</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </p>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
                Annuler
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleDeleteUser(showDeleteConfirm)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
