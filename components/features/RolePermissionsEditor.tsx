'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Shield, 
  Edit, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Copy,
  Check,
  AlertTriangle,
  Lock,
  Unlock,
  Users,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Types
interface AppModule {
  id: number;
  nom: string;
  libelle: string;
  description: string;
  icone: string;
  ordre: number;
  actif: boolean;
}

interface AppAction {
  id: number;
  nom: string;
  libelle: string;
  description: string;
}

interface UserRole {
  id: string;
  nom: string;
  description: string;
  icone: string;
  couleur: string;
  ordre: number;
  actif: boolean;
  systeme: boolean;
}

interface RolePermission {
  id: number;
  role_id: string;
  module_id: number;
  action_id: number;
  accordee: boolean;
  module?: AppModule;
  action?: AppAction;
}

interface RolePermissionsEditorProps {
  onPermissionsChange?: () => void;
}

const actionIcons: Record<string, React.ReactNode> = {
  read: <Eye className="w-4 h-4" />,
  write: <Edit className="w-4 h-4" />,
  delete: <Trash2 className="w-4 h-4" />,
  export: <Copy className="w-4 h-4" />,
  import: <Plus className="w-4 h-4" />,
  admin: <Settings className="w-4 h-4" />
};

const actionColors: Record<string, string> = {
  read: 'bg-blue-100 text-blue-800',
  write: 'bg-green-100 text-green-800',
  delete: 'bg-red-100 text-red-800',
  export: 'bg-purple-100 text-purple-800',
  import: 'bg-orange-100 text-orange-800',
  admin: 'bg-gray-100 text-gray-800'
};

export default function RolePermissionsEditor({ onPermissionsChange }: RolePermissionsEditorProps) {
  const [modules, setModules] = useState<AppModule[]>([]);
  const [actions, setActions] = useState<AppAction[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);
  const [isNewRole, setIsNewRole] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Charger les données initiales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('app_modules')
        .select('*')
        .order('ordre');

      if (modulesError) throw modulesError;

      // Charger les actions
      const { data: actionsData, error: actionsError } = await supabase
        .from('app_actions')
        .select('*')
        .order('nom');

      if (actionsError) throw actionsError;

      // Charger les rôles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('ordre');

      if (rolesError) throw rolesError;

      // Charger les permissions avec les relations
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('role_permissions')
        .select(`
          *,
          module:app_modules(*),
          action:app_actions(*)
        `);

      if (permissionsError) throw permissionsError;

      setModules((modulesData as any[]) || []);
      setActions((actionsData as any[]) || []);
      setRoles((rolesData as any[]) || []);
      setPermissions((permissionsData as any[]) || []);

      // Sélectionner le premier rôle par défaut
      if (rolesData && (rolesData as any[]).length > 0) {
        setSelectedRole((rolesData as any[])[0].id);
      }

    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Obtenir les permissions pour un rôle donné
  const getRolePermissions = (roleId: string) => {
    return permissions.filter(p => p.role_id === roleId && p.accordee);
  };

  // Vérifier si une permission est accordée
  const hasPermission = (roleId: string, moduleId: number, actionId: number) => {
    return permissions.some(p => 
      p.role_id === roleId && 
      p.module_id === moduleId && 
      p.action_id === actionId && 
      p.accordee
    );
  };

  // Basculer une permission
  const togglePermission = async (roleId: string, moduleId: number, actionId: number) => {
    try {
      const currentPermission = permissions.find(p => 
        p.role_id === roleId && 
        p.module_id === moduleId && 
        p.action_id === actionId
      );

      if (currentPermission) {
        // Mettre à jour la permission existante
        const { error } = await supabase
          .from('role_permissions')
          .update({ accordee: !currentPermission.accordee })
          .eq('id', currentPermission.id);

        if (error) throw error;

        // Mettre à jour l'état local
        setPermissions(prev => prev.map(p => 
          p.id === currentPermission.id 
            ? { ...p, accordee: !p.accordee }
            : p
        ));
      } else {
        // Créer une nouvelle permission
        const { data, error } = await supabase
          .from('role_permissions')
          .insert({
            role_id: roleId,
            module_id: moduleId,
            action_id: actionId,
            accordee: true
          })
          .select(`
            *,
            module:app_modules(*),
            action:app_actions(*)
          `);

        if (error) throw error;

        if (data && data[0]) {
          setPermissions(prev => [...prev, data[0]]);
        }
      }

      onPermissionsChange?.();
      showSuccess('Permission mise à jour avec succès');

    } catch (err) {
      console.error('Erreur lors de la mise à jour de la permission:', err);
      setError('Erreur lors de la mise à jour de la permission');
    }
  };

  // Sauvegarder un rôle
  const saveRole = async () => {
    if (!editingRole) return;

    try {
      setSaving(true);
      setError(null);

      if (isNewRole) {
        // Créer un nouveau rôle
        const { error } = await supabase
          .from('user_roles')
          .insert({
            id: editingRole.id,
            nom: editingRole.nom,
            description: editingRole.description,
            icone: editingRole.icone,
            couleur: editingRole.couleur,
            ordre: editingRole.ordre,
            actif: editingRole.actif,
            systeme: false
          });

        if (error) throw error;

        setRoles(prev => [...prev, editingRole].sort((a, b) => a.ordre - b.ordre));
      } else {
        // Mettre à jour le rôle existant
        const { error } = await supabase
          .from('user_roles')
          .update({
            nom: editingRole.nom,
            description: editingRole.description,
            icone: editingRole.icone,
            couleur: editingRole.couleur,
            ordre: editingRole.ordre,
            actif: editingRole.actif
          })
          .eq('id', editingRole.id);

        if (error) throw error;

        setRoles(prev => prev.map(r => r.id === editingRole.id ? editingRole : r));
      }

      setEditingRole(null);
      setIsNewRole(false);
      showSuccess('Rôle sauvegardé avec succès');
      onPermissionsChange?.();

    } catch (err) {
      console.error('Erreur lors de la sauvegarde du rôle:', err);
      setError('Erreur lors de la sauvegarde du rôle');
    } finally {
      setSaving(false);
    }
  };

  // Dupliquer un rôle
  const duplicateRole = (role: UserRole) => {
    const newRole: UserRole = {
      ...role,
      id: `${role.id}_copy`,
      nom: `${role.nom} (Copie)`,
      systeme: false,
      ordre: Math.max(...roles.map(r => r.ordre)) + 1
    };
    setEditingRole(newRole);
    setIsNewRole(true);
  };

  // Supprimer un rôle
  const deleteRole = async (roleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rôle ? Cette action est irréversible.')) {
      return;
    }

    try {
      // Vérifier s'il y a des utilisateurs avec ce rôle
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .eq('role', roleId)
        .limit(1);

      if (users && users.length > 0) {
        setError('Impossible de supprimer ce rôle car il est utilisé par des utilisateurs');
        return;
      }

      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      setRoles(prev => prev.filter(r => r.id !== roleId));
      setPermissions(prev => prev.filter(p => p.role_id !== roleId));
      
      if (selectedRole === roleId && roles.length > 1) {
        setSelectedRole(roles.find(r => r.id !== roleId)?.id || '');
      }

      showSuccess('Rôle supprimé avec succès');
      onPermissionsChange?.();

    } catch (err) {
      console.error('Erreur lors de la suppression du rôle:', err);
      setError('Erreur lors de la suppression du rôle');
    }
  };

  // Basculer l'état actif d'un rôle
  const toggleRoleStatus = async (roleId: string) => {
    try {
      const role = roles.find(r => r.id === roleId);
      if (!role) return;

      const { error } = await supabase
        .from('user_roles')
        .update({ actif: !role.actif })
        .eq('id', roleId);

      if (error) throw error;

      setRoles(prev => prev.map(r => r.id === roleId ? { ...r, actif: !r.actif } : r));
      showSuccess(`Rôle ${role.actif ? 'désactivé' : 'activé'} avec succès`);
      onPermissionsChange?.();

    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      setError('Erreur lors de la mise à jour du statut');
    }
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement des permissions...</span>
      </div>
    );
  }

  const selectedRoleData = roles.find(r => r.id === selectedRole);

  return (
    <div className="space-y-6">
      {/* Messages d'état */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
          <Button variant="outline" size="sm" onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-800">{success}</span>
          <Button variant="outline" size="sm" onClick={() => setSuccess(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <Tabs defaultValue="permissions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="permissions">Gestion des permissions</TabsTrigger>
          <TabsTrigger value="roles">Gestion des rôles</TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="space-y-6">
          {/* Sélecteur de rôle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Sélection du rôle
              </CardTitle>
              <CardDescription>
                Choisissez le rôle pour lequel vous souhaitez modifier les permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {roles.filter(r => r.actif).map(role => (
                  <Card 
                    key={role.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedRole === role.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{role.icone}</span>
                        <span className="font-medium text-sm">{role.nom}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={role.systeme ? 'secondary' : 'default'}
                          className="text-xs"
                        >
                          {role.systeme ? 'Système' : 'Personnalisé'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {getRolePermissions(role.id).length} permissions
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Matrice des permissions */}
          {selectedRoleData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-lg">{selectedRoleData.icone}</span>
                  Permissions pour {selectedRoleData.nom}
                </CardTitle>
                <CardDescription>
                  {selectedRoleData.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Module</th>
                        {actions.map(action => (
                          <th key={action.id} className="text-center p-3 font-medium min-w-[100px]">
                            <div className="flex flex-col items-center gap-1">
                              {actionIcons[action.nom]}
                              <span className="text-xs">{action.libelle}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {modules.filter(m => m.actif).map(module => (
                        <tr key={module.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div>
                              <div className="font-medium">{module.libelle}</div>
                              <div className="text-sm text-gray-500">{module.description}</div>
                            </div>
                          </td>
                          {actions.map(action => (
                            <td key={action.id} className="p-3 text-center">
                              <Button
                                variant={hasPermission(selectedRole, module.id, action.id) ? 'default' : 'outline'}
                                size="sm"
                                className={`w-8 h-8 p-0 ${
                                  hasPermission(selectedRole, module.id, action.id)
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'hover:bg-gray-100'
                                }`}
                                onClick={() => togglePermission(selectedRole, module.id, action.id)}
                                disabled={selectedRoleData.systeme}
                              >
                                {hasPermission(selectedRole, module.id, action.id) ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <X className="w-4 h-4" />
                                )}
                              </Button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {selectedRoleData.systeme && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-yellow-600" />
                      <span className="text-yellow-800 text-sm">
                        Ce rôle système ne peut pas être modifié. Dupliquez-le pour créer une version personnalisée.
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          {/* Gestion des rôles */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Gestion des rôles
                  </CardTitle>
                  <CardDescription>
                    Créez, modifiez et gérez les rôles utilisateur
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => {
                    setEditingRole({
                      id: '',
                      nom: '',
                      description: '',
                      icone: '👤',
                      couleur: '#6B7280',
                      ordre: Math.max(...roles.map(r => r.ordre)) + 1,
                      actif: true,
                      systeme: false
                    });
                    setIsNewRole(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nouveau rôle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.map(role => (
                  <Card key={role.id} className={role.actif ? '' : 'opacity-60'}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{role.icone}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{role.nom}</h3>
                              <Badge variant={role.systeme ? 'secondary' : 'default'}>
                                {role.systeme ? 'Système' : 'Personnalisé'}
                              </Badge>
                              <Badge variant={role.actif ? 'default' : 'secondary'}>
                                {role.actif ? 'Actif' : 'Inactif'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{role.description}</p>
                            <div className="text-xs text-gray-500 mt-1">
                              {getRolePermissions(role.id).length} permission(s) accordée(s)
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleRoleStatus(role.id)}
                            disabled={role.systeme}
                          >
                            {role.actif ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => duplicateRole(role)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingRole(role);
                              setIsNewRole(false);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {!role.systeme && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteRole(role.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal d'édition de rôle */}
      {editingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg m-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                {isNewRole ? 'Nouveau rôle' : 'Modifier le rôle'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role-id">Identifiant</Label>
                  <Input
                    id="role-id"
                    value={editingRole.id}
                    onChange={(e) => setEditingRole({ ...editingRole, id: e.target.value })}
                    placeholder="Ex: manager_hotel"
                    disabled={!isNewRole}
                  />
                </div>
                <div>
                  <Label htmlFor="role-icon">Icône</Label>
                  <Input
                    id="role-icon"
                    value={editingRole.icone}
                    onChange={(e) => setEditingRole({ ...editingRole, icone: e.target.value })}
                    placeholder="Ex: 🧑‍💼"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="role-name">Nom</Label>
                <Input
                  id="role-name"
                  value={editingRole.nom}
                  onChange={(e) => setEditingRole({ ...editingRole, nom: e.target.value })}
                  placeholder="Ex: Manager Hôtel"
                />
              </div>

              <div>
                <Label htmlFor="role-description">Description</Label>
                <Textarea
                  id="role-description"
                  value={editingRole.description}
                  onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                  placeholder="Description des responsabilités de ce rôle"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role-color">Couleur</Label>
                  <div className="flex gap-2">
                    <Input
                      id="role-color"
                      type="color"
                      value={editingRole.couleur}
                      onChange={(e) => setEditingRole({ ...editingRole, couleur: e.target.value })}
                      className="w-16"
                    />
                    <Input
                      value={editingRole.couleur}
                      onChange={(e) => setEditingRole({ ...editingRole, couleur: e.target.value })}
                      placeholder="#6B7280"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="role-order">Ordre</Label>
                  <Input
                    id="role-order"
                    type="number"
                    value={editingRole.ordre}
                    onChange={(e) => setEditingRole({ ...editingRole, ordre: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="role-active"
                  checked={editingRole.actif}
                  onChange={(e) => setEditingRole({ ...editingRole, actif: e.target.checked })}
                />
                <Label htmlFor="role-active">Rôle actif</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingRole(null);
                    setIsNewRole(false);
                  }}
                >
                  Annuler
                </Button>
                <Button
                  onClick={saveRole}
                  disabled={saving || !editingRole.nom || (isNewRole && !editingRole.id)}
                  className="flex items-center gap-2"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 
