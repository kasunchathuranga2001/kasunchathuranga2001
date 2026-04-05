import { useState, useEffect } from 'react'
import { userService } from '../services/services'
import { toast } from 'react-toastify'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll()
      setUsers(response.data.data || [])
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, role) => {
    try {
      await userService.updateRole(userId, role)
      setUsers(users.map(u => u.id === userId ? { ...u, role } : u))
      toast.success('Role updated')
    } catch (error) {
      toast.error('Failed to update role')
    }
  }

  const handleToggleActive = async (userId, active) => {
    try {
      if (active) {
        await userService.deactivate(userId)
      } else {
        await userService.activate(userId)
      }
      setUsers(users.map(u => u.id === userId ? { ...u, active: !active } : u))
      toast.success(`User ${active ? 'deactivated' : 'activated'}`)
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }

  const getRoleBadge = (role) => {
    const colors = {
      ADMIN: 'bg-purple-100 text-purple-800',
      USER: 'bg-blue-100 text-blue-800',
      TECHNICIAN: 'bg-green-100 text-green-800',
      MANAGER: 'bg-orange-100 text-orange-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-500">Manage user roles and access</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">Loading...</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Role</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{u.name}</td>
                  <td className="py-3 px-4 text-gray-500">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadge(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      u.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {u.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                        <option value="TECHNICIAN">Technician</option>
                        <option value="MANAGER">Manager</option>
                      </select>
                      <button
                        onClick={() => handleToggleActive(u.id, u.active)}
                        className={`text-sm px-3 py-1 rounded ${
                          u.active ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
