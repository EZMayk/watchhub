'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
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
  XCircle
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
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? Crown : Shield;
  };

  if (loading) {
    return (
      <AdminLayout title="Gestión de Usuarios" description="Administrar usuarios del sistema">
        <div className="animate-pulse">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
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
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Header y búsqueda */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-gray-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Usuarios del Sistema</h2>
              <p className="text-sm text-gray-600">
                {filteredUsers.length} de {users.length} usuarios
              </p>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-80"
            />
          </div>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último acceso
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const RoleIcon = getRoleIcon(user.rol);
                const isCurrentUser = user.id === userAccount?.id;
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.nombre.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.nombre} {user.apellido}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-gray-500">(Tú)</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Activo
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(user.creada_en)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Usuario seleccionado:</p>
              <p className="font-medium">
                {selectedUser.nombre} {selectedUser.apellido}
              </p>
              <p className="text-sm text-gray-500">{selectedUser.correo}</p>
              <p className="text-sm">
                <span className="text-gray-600">Rol actual: </span>
                <span className="font-medium">
                  {selectedUser.rol === 'admin' ? 'Administrador' : 'Usuario'}
                </span>
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-900">Selecciona el nuevo rol:</p>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={selectedUser.rol === 'usuario' ? 'default' : 'outline'}
                  onClick={() => handleRoleChange('usuario')}
                  disabled={changingRole || selectedUser.rol === 'usuario'}
                  className="flex items-center justify-center space-x-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Usuario</span>
                </Button>
                
                <Button
                  variant={selectedUser.rol === 'admin' ? 'default' : 'outline'}
                  onClick={() => handleRoleChange('admin')}
                  disabled={changingRole || selectedUser.rol === 'admin'}
                  className="flex items-center justify-center space-x-2"
                >
                  <Crown className="w-4 h-4" />
                  <span>Administrador</span>
                </Button>
              </div>
            </div>

            {changingRole && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Cambiando rol...</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
