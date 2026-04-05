import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { resourceService } from '../services/services'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import { ArrowLeftIcon, CalendarIcon } from '@heroicons/react/24/outline'

const ResourceDetail = () => {
  const { id } = useParams()
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResource()
  }, [id])

  const fetchResource = async () => {
    try {
      const response = await resourceService.getById(id)
      setResource(response.data.data)
    } catch (error) {
      toast.error('Failed to load resource')
      navigate('/resources')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await resourceService.delete(id)
        toast.success('Resource deleted')
        navigate('/resources')
      } catch (error) {
        toast.error('Failed to delete resource')
      }
    }
  }

  const handleStatusChange = async (status) => {
    try {
      const response = await resourceService.updateStatus(id, status)
      setResource(response.data.data)
      toast.success('Status updated')
    } catch (error) {
      toast.error('Failed to update status')
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

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (!resource) {
    return <div className="text-center py-12">Resource not found</div>
  }

  return (
    <div>
      <Link to="/resources" className="flex items-center text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Resources
      </Link>

      <div className="card">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{resource.name}</h1>
            <p className="text-gray-500 mt-1">{resource.type.replace('_', ' ')}</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <span className={`px-3 py-1 text-sm rounded-full ${getStatusBadge(resource.status)}`}>
              {resource.status}
            </span>
            <Link 
              to={`/bookings/create?resourceId=${resource.id}`}
              className="btn-primary flex items-center"
            >
              <CalendarIcon className="h-5 w-5 mr-2" />
              Book Now
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Details</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Description</dt>
                <dd className="text-gray-800">{resource.description || 'No description'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Location</dt>
                <dd className="text-gray-800">{resource.location}</dd>
              </div>
              {resource.building && (
                <div>
                  <dt className="text-sm text-gray-500">Building</dt>
                  <dd className="text-gray-800">{resource.building}</dd>
                </div>
              )}
              {resource.floor && (
                <div>
                  <dt className="text-sm text-gray-500">Floor</dt>
                  <dd className="text-gray-800">{resource.floor}</dd>
                </div>
              )}
            </dl>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Availability</h2>
            <dl className="space-y-3">
              {resource.capacity && (
                <div>
                  <dt className="text-sm text-gray-500">Capacity</dt>
                  <dd className="text-gray-800">{resource.capacity} people</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-gray-500">Available Hours</dt>
                <dd className="text-gray-800">{resource.availableFrom} - {resource.availableTo}</dd>
              </div>
            </dl>
          </div>
        </div>

        {isAdmin && (
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Admin Actions</h2>
            <div className="flex flex-wrap gap-3">
              <select
                value={resource.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="input-field w-auto"
              >
                <option value="ACTIVE">Active</option>
                <option value="OUT_OF_SERVICE">Out of Service</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
              <button onClick={handleDelete} className="btn-danger">
                Delete Resource
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResourceDetail
