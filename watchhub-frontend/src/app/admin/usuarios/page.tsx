'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/exports';
import { getAllUsers, changeUserRole } from '@/lib/admin';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  Crown, 
  Shield, 
  Search,
  MoreVertical,
  Calendar,
  Mail,
  CheckCircle,
  XCircle,
  User,
  RefreshCw
} from 'lucide-react';
import { Button, Input, Modal } from '@/components/ui';

interface UserAccount {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: 'usuario' | 'admin';
  creada_en: string;
}

export default function AdminUsers() {
  const { userAccount } = useAuth();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [changingRole, setChangingRole] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (newRole: 'usuario' | 'admin') => {
    if (!selectedUser) return;

    try {
      setChangingRole(true);
      setError('');
      
      await changeUserRole(selectedUser.id, newRole);
      
      // Actualizar la lista local
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, rol: newRole }
          : user
      ));
      
      setSuccess(`Rol cambiado a ${newRole} exitosamente`);
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error changing role:', error);
      setError('Error al cambiar el rol del usuario');
    } finally {
      setChangingRole(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' 
      ? 'bg-red-600/20 text-red-300 border border-red-600/30' 
      : 'bg-blue-600/20 text-blue-300 border border-blue-600/30';
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? Crown : User;
  };

  if (loading) {
    return (
      <AdminLayout title="Gestión de Usuarios" description="Administrar usuarios del sistema">
        <div className="animate-pulse">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <div className="h-8 bg-gray-600 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={`loading-user-${i}`} className="h-16 bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Gestión de Usuarios" 
      description={`${users.length} usuarios registrados`}
    >
      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-800/50 rounded-lg">
          <p className="text-red-300">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-900/30 border border-green-800/50 rounded-lg">
          <p className="text-green-300">{success}</p>
        </div>
      )}

      {/* Header y búsqueda */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-red-600" />
            <div>
              <h2 className="text-xl font-bold text-white">Usuarios del Sistema</h2>
              <p className="text-sm text-gray-400">
                {filteredUsers.length} de {users.length} usuarios
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={loadUsers}
              disabled={loading}
              className="flex items-center space-x-2 bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </Button>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-80 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-red-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
            </h3>
            <p className="text-gray-400">
              {searchTerm 
                ? `No hay usuarios que coincidan con "${searchTerm}"`
                : 'Aún no hay usuarios registrados en el sistema'
              }
            </p>
            {searchTerm && (
              <Button
                onClick={() => setSearchTerm('')}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white"
              >
                Limpiar búsqueda
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Registro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Último acceso
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-700">
                {filteredUsers.map((user) => {
                  const RoleIcon = getRoleIcon(user.rol);
                  const isCurrentUser = user.id === userAccount?.id;
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {user.nombre.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {user.nombre} {user.apellido}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-red-400">(Tú)</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-400 flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              {user.correo}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.rol)}`}>
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {user.rol === 'admin' ? 'Administrador' : 'Usuario'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-300 border border-green-800/50">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Activo
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(user.creada_en)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        Reciente
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {!isCurrentUser && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowRoleModal(true);
                            }}
                            className="hover:bg-gray-700 text-gray-300 hover:text-white"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para cambiar rol */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false);
          setSelectedUser(null);
        }}
        title="Cambiar Rol de Usuario"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
              <p className="text-sm text-gray-400">Usuario seleccionado:</p>
              <div className="flex items-center space-x-3 mt-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {selectedUser.nombre.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-white">
                    {selectedUser.nombre} {selectedUser.apellido}
                  </p>
                  <p className="text-sm text-gray-400">{selectedUser.correo}</p>
                  <p className="text-sm">
                    <span className="text-gray-400">Rol actual: </span>
                    <span className="font-medium text-white">
                      {selectedUser.rol === 'admin' ? 'Administrador' : 'Usuario'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-300">Selecciona el nuevo rol:</p>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={selectedUser.rol === 'usuario' ? 'default' : 'outline'}
                  onClick={() => handleRoleChange('usuario')}
                  disabled={changingRole || selectedUser.rol === 'usuario'}
                  className="flex items-center justify-center space-x-2 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50"
                >
                  <User className="w-4 h-4" />
                  <span>Usuario</span>
                </Button>
                
                <Button
                  variant={selectedUser.rol === 'admin' ? 'default' : 'outline'}
                  onClick={() => handleRoleChange('admin')}
                  disabled={changingRole || selectedUser.rol === 'admin'}
                  className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                >
                  <Crown className="w-4 h-4" />
                  <span>Administrador</span>
                </Button>
              </div>
            </div>

            {changingRole && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                <p className="text-sm text-gray-400 mt-2">Cambiando rol...</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
