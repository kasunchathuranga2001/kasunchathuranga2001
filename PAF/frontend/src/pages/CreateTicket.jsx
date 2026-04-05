import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ticketService, resourceService } from '../services/services'
import { toast } from 'react-toastify'
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline'

const CreateTicket = () => {
  const navigate = useNavigate()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'MEDIUM',
    resourceId: '',
    location: '',
    contactEmail: '',
    contactPhone: ''
  })

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      const response = await resourceService.getAll()
      setResources(response.data.data || [])
    } catch (error) {
      console.error('Failed to load resources')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const submitData = new FormData()
      submitData.append('ticket', new Blob([JSON.stringify({
        ...formData,
        resourceId: formData.resourceId ? parseInt(formData.resourceId) : null
      })], { type: 'application/json' }))
      
      attachments.forEach(file => {
        submitData.append('attachments', file)
      })

      await ticketService.create(submitData)
      toast.success('Ticket created successfully!')
      navigate('/tickets')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create ticket')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (attachments.length + files.length > 3) {
      toast.error('Maximum 3 attachments allowed')
      return
    }
    setAttachments([...attachments, ...files])
  }

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const categories = [
    'ELECTRICAL', 'PLUMBING', 'HVAC', 'IT_EQUIPMENT', 
    'FURNITURE', 'CLEANING', 'SECURITY', 'OTHER'
  ]

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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Ticket</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              placeholder="Brief description of the issue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="input-field"
              placeholder="Provide detailed information about the issue"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Related Resource</label>
            <select
              name="resourceId"
              value={formData.resourceId}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">None (General issue)</option>
              {resources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name} - {resource.location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="input-field"
              placeholder="Where is the issue located?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                className="input-field"
                placeholder="Your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="input-field"
                placeholder="Your phone number"
              />
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachments (Max 3)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                id="attachments"
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
              />
              <label 
                htmlFor="attachments" 
                className="flex flex-col items-center cursor-pointer"
              >
                <PhotoIcon className="h-12 w-12 text-gray-400" />
                <span className="text-sm text-gray-500 mt-2">Click to upload images</span>
              </label>
            </div>
            {attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-600">{file.name}</span>
                    <button 
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Submitting...' : 'Submit Ticket'}
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

export default CreateTicket
