import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { resourceService } from '../services/services'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const Resources = () => {
  const { isAdmin } = useAuth()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useState({
    type: '',
    status: '',
    location: '',
    minCapacity: ''
  })

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      const response = await resourceService.getAll()
      setResources(response.data.data || [])
    } catch (error) {
      toast.error('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const params = {}
      if (searchParams.type) params.type = searchParams.type
      if (searchParams.status) params.status = searchParams.status
      if (searchParams.location) params.location = searchParams.location
      if (searchParams.minCapacity) params.minCapacity = parseInt(searchParams.minCapacity)
      
      const response = await resourceService.search(params)
      setResources(response.data.data || [])
    } catch (error) {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      OUT_OF_SERVICE: 'bg-red-100 text-red-800',
      MAINTENANCE: 'bg-yellow-100 text-yellow-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getTypeIcon = (type) => {
    const icons = {
      LECTURE_HALL: '🏛️',
      LAB: '🔬',
      MEETING_ROOM: '🏢',
      PROJECTOR: '📽️',
      CAMERA: '📷',
      COMPUTER: '💻',
      OTHER_EQUIPMENT: '🔧'
    }
    return icons[type] || '📦'
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Resources</h1>
          <p className="text-gray-500">Browse and book campus facilities and equipment</p>
        </div>
        {isAdmin && (
          <Link to="/resources/new" className="btn-primary mt-4 md:mt-0 flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Resource
          </Link>
        )}
      </div>

      {/* Search & Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            value={searchParams.type}
            onChange={(e) => setSearchParams({...searchParams, type: e.target.value})}
            className="input-field"
          >
            <option value="">All Types</option>
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="LAB">Lab</option>
            <option value="MEETING_ROOM">Meeting Room</option>
            <option value="PROJECTOR">Projector</option>
            <option value="CAMERA">Camera</option>
            <option value="COMPUTER">Computer</option>
            <option value="OTHER_EQUIPMENT">Other Equipment</option>
          </select>
          
          <select
            value={searchParams.status}
            onChange={(e) => setSearchParams({...searchParams, status: e.target.value})}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
          
          <input
            type="text"
            placeholder="Location"
            value={searchParams.location}
            onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
            className="input-field"
          />
          
          <input
            type="number"
            placeholder="Min Capacity"
            value={searchParams.minCapacity}
            onChange={(e) => setSearchParams({...searchParams, minCapacity: e.target.value})}
            className="input-field"
          />
          
          <button onClick={handleSearch} className="btn-primary flex items-center justify-center">
            <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
            Search
          </button>
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">Loading...</div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <Link 
              key={resource.id} 
              to={`/resources/${resource.id}`}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{getTypeIcon(resource.type)}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(resource.status)}`}>
                  {resource.status}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{resource.name}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{resource.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>📍 {resource.location}</span>
                {resource.capacity && <span>👥 {resource.capacity}</span>}
              </div>
              <div className="mt-3 pt-3 border-t text-sm text-gray-500">
                <span>🕐 {resource.availableFrom} - {resource.availableTo}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500">No resources found</p>
        </div>
      )}
    </div>
  )
}

export default Resources
