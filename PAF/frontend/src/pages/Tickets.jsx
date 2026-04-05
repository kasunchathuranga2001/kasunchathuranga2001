import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ticketService } from '../services/services'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import { PlusIcon } from '@heroicons/react/24/outline'

const Tickets = () => {
  const { isAdmin, isTechnician } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    fetchTickets()
  }, [isAdmin, isTechnician])

  const fetchTickets = async () => {
    try {
      let response
      if (isAdmin) {
        response = await ticketService.getAll()
      } else if (isTechnician) {
        response = await ticketService.getAssigned()
      } else {
        response = await ticketService.getMyTickets()
      }
      setTickets(response.data.data || [])
    } catch (error) {
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
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

  const filteredTickets = tickets.filter(t => 
    filter === 'ALL' ? true : t.status === filter
  )

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tickets</h1>
          <p className="text-gray-500">
            {isAdmin ? 'Manage all maintenance tickets' : 
             isTechnician ? 'View assigned tickets' : 'Your maintenance requests'}
          </p>
        </div>
        <Link to="/tickets/create" className="btn-primary mt-4 md:mt-0 flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          New Ticket
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              filter === status 
                ? 'bg-primary-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {status === 'ALL' ? 'All' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">Loading...</div>
      ) : filteredTickets.length > 0 ? (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <Link 
              key={ticket.id} 
              to={`/tickets/${ticket.id}`}
              className="card block hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800">{ticket.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityBadge(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">{ticket.description}</p>
                  <div className="text-sm text-gray-500 space-x-4">
                    <span>🏷️ {ticket.category}</span>
                    {ticket.location && <span>📍 {ticket.location}</span>}
                    {ticket.assignedToName && <span>👷 {ticket.assignedToName}</span>}
                  </div>
                </div>
                <div className="text-sm text-gray-400 mt-2 md:mt-0">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500">No tickets found</p>
          <Link to="/tickets/create" className="btn-primary mt-4 inline-block">
            Create your first ticket
          </Link>
        </div>
      )}
    </div>
  )
}

export default Tickets
