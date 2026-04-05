import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { userService } from '../services/services'
import { toast } from 'react-toastify'
import { UserIcon } from '@heroicons/react/24/outline'

const Profile = () => {
  const { user, logout } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await userService.updateProfile({ name })
      toast.success('Profile updated successfully')
      // Update local storage
      const updatedUser = { ...user, name }
      localStorage.setItem('user', JSON.stringify(updatedUser))
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile</h1>

      <div className="card mb-6">
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
            {user?.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt={user.name} 
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <UserIcon className="h-10 w-10 text-primary-600" />
            )}
          </div>
          <div className="ml-6">
            <h2 className="text-xl font-semibold text-gray-800">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={user?.email}
              className="input-field bg-gray-50"
              disabled
            />
            <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Account</h2>
        <button
          onClick={logout}
          className="btn-danger"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Profile
