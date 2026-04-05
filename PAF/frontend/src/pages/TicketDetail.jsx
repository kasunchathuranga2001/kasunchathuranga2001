import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ticketService, userService } from '../services/services'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import { ArrowLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'

const TicketDetail = () => {
  const { id } = useParams()
  const { user, isAdmin, isTechnician } = useAuth()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTicketData()
    if (isAdmin) {
      fetchTechnicians()
    }
  }, [id])

  const fetchTicketData = async () => {
    try {
      const [ticketRes, commentsRes] = await Promise.all([
        ticketService.getById(id),
        ticketService.getComments(id)
      ])
      setTicket(ticketRes.data.data)
      setComments(commentsRes.data.data || [])
    } catch (error) {
      toast.error('Failed to load ticket')
      navigate('/tickets')
    } finally {
      setLoading(false)
    }
  }

  const fetchTechnicians = async () => {
    try {
      const response = await userService.getByRole('TECHNICIAN')
      setTechnicians(response.data.data || [])
    } catch (error) {
      console.error('Failed to load technicians')
    }
  }

  const handleAssign = async (technicianId) => {
    try {
      const response = await ticketService.assign(id, technicianId)
      setTicket(response.data.data)
      toast.success('Ticket assigned')
    } catch (error) {
      toast.error('Failed to assign ticket')
    }
  }

  const handleStatusUpdate = async (status, notes = '') => {
    try {
      const response = await ticketService.updateStatus(id, status, notes)
      setTicket(response.data.data)
      toast.success('Status updated')
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      await ticketService.addComment(id, { content: newComment })
      setNewComment('')
      fetchTicketData()
      toast.success('Comment added')
    } catch (error) {
      toast.error('Failed to add comment')
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Delete this comment?')) {
      try {
        await ticketService.deleteComment(commentId)
        fetchTicketData()
        toast.success('Comment deleted')
      } catch (error) {
        toast.error('Failed to delete comment')
      }
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      OPEN: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
      REJECTED: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityBadge = (priority) => {
    const colors = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800'
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (!ticket) {
    return <div className="text-center py-12">Ticket not found</div>
  }

  return (
    <div>
      <button 
        onClick={() => navigate('/tickets')} 
        className="flex items-center text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Tickets
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <h1 className="text-2xl font-bold text-gray-800">{ticket.title}</h1>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(ticket.status)}`}>
                {ticket.status.replace('_', ' ')}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${getPriorityBadge(ticket.priority)}`}>
                {ticket.priority}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{ticket.description}</p>
            
            {ticket.attachments?.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium text-gray-800 mb-2">Attachments</h3>
                <div className="flex gap-2">
                  {ticket.attachments.map((url, index) => (
                    <a 
                      key={index} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 text-sm hover:underline"
                    >
                      Attachment {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {ticket.resolutionNotes && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-800 mb-1">Resolution Notes</h3>
                <p className="text-green-700">{ticket.resolutionNotes}</p>
              </div>
            )}

            {ticket.rejectionReason && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-medium text-red-800 mb-1">Rejection Reason</h3>
                <p className="text-red-700">{ticket.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Comments</h2>
            <div className="space-y-4 mb-4">
              {comments.length > 0 ? comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium text-gray-800">{comment.authorName}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {comment.authorId === user?.id && (
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-500 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">{comment.content}</p>
                </div>
              )) : (
                <p className="text-gray-500 text-center py-4">No comments yet</p>
              )}
            </div>
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary">
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-4">Details</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Category</dt>
                <dd className="text-gray-800">{ticket.category}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Location</dt>
                <dd className="text-gray-800">{ticket.location || 'Not specified'}</dd>
              </div>
              {ticket.resourceName && (
                <div>
                  <dt className="text-gray-500">Resource</dt>
                  <dd className="text-gray-800">{ticket.resourceName}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">Created By</dt>
                <dd className="text-gray-800">{ticket.createdByName}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Assigned To</dt>
                <dd className="text-gray-800">{ticket.assignedToName || 'Unassigned'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Created</dt>
                <dd className="text-gray-800">
                  {new Date(ticket.createdAt).toLocaleString()}
                </dd>
              </div>
              {ticket.contactEmail && (
                <div>
                  <dt className="text-gray-500">Contact Email</dt>
                  <dd className="text-gray-800">{ticket.contactEmail}</dd>
                </div>
              )}
              {ticket.contactPhone && (
                <div>
                  <dt className="text-gray-500">Contact Phone</dt>
                  <dd className="text-gray-800">{ticket.contactPhone}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Admin/Technician Actions */}
          {(isAdmin || isTechnician) && (
            <div className="card">
              <h2 className="font-semibold text-gray-800 mb-4">Actions</h2>
              
              {isAdmin && ticket.status === 'OPEN' && (
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-1">Assign to</label>
                  <select
                    onChange={(e) => handleAssign(e.target.value)}
                    className="input-field"
                    defaultValue=""
                  >
                    <option value="" disabled>Select technician</option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>{tech.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                {ticket.status === 'OPEN' && (
                  <button 
                    onClick={() => handleStatusUpdate('IN_PROGRESS')}
                    className="btn-primary w-full"
                  >
                    Start Work
                  </button>
                )}
                {ticket.status === 'IN_PROGRESS' && (
                  <>
                    <button 
                      onClick={() => {
                        const notes = prompt('Enter resolution notes:')
                        if (notes) handleStatusUpdate('RESOLVED', notes)
                      }}
                      className="btn-primary w-full"
                    >
                      Mark Resolved
                    </button>
                  </>
                )}
                {ticket.status === 'RESOLVED' && isAdmin && (
                  <button 
                    onClick={() => handleStatusUpdate('CLOSED')}
                    className="btn-secondary w-full"
                  >
                    Close Ticket
                  </button>
                )}
                {isAdmin && !['CLOSED', 'REJECTED'].includes(ticket.status) && (
                  <button 
                    onClick={() => {
                      const reason = prompt('Enter rejection reason:')
                      if (reason) handleStatusUpdate('REJECTED', reason)
                    }}
                    className="btn-danger w-full"
                  >
                    Reject Ticket
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TicketDetail
