import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { bookingService, resourceService } from '../services/services'
import { toast } from 'react-toastify'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const CreateBooking = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    resourceId: searchParams.get('resourceId') || '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: ''
  })

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      const response = await resourceService.search({ status: 'ACTIVE' })
      setResources(response.data.data || [])
    } catch (error) {
      toast.error('Failed to load resources')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await bookingService.create({
        ...formData,
        resourceId: parseInt(formData.resourceId),
        expectedAttendees: formData.expectedAttendees ? parseInt(formData.expectedAttendees) : null
      })
      toast.success('Booking request submitted!')
      navigate('/bookings')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back
      </button>

      <div className="card">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Booking</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resource *
            </label>
            <select
              name="resourceId"
              value={formData.resourceId}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select a resource</option>
              {resources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name} ({resource.type.replace('_', ' ')}) - {resource.location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              name="bookingDate"
              value={formData.bookingDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose *
            </label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              rows={3}
              className="input-field"
              placeholder="Describe the purpose of your booking"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Attendees
            </label>
            <input
              type="number"
              name="expectedAttendees"
              value={formData.expectedAttendees}
              onChange={handleChange}
              min="1"
              className="input-field"
              placeholder="Number of people expected"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Submitting...' : 'Submit Booking Request'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateBooking
