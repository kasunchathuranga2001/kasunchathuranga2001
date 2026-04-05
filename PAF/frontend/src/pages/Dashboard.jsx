import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { resourceService, bookingService, ticketService } from '../services/services'
import { 
  BuildingOfficeIcon, 
  CalendarIcon, 
  TicketIcon, 
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const Dashboard = () => {
  const { user, isAdmin } = useAuth()
  const [stats, setStats] = useState({
    resources: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    openTickets: 0,
    inProgressTickets: 0
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [recentTickets, setRecentTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [resourcesRes, bookingsRes, ticketsRes] = await Promise.all([
        resourceService.getAll(),
        isAdmin ? bookingService.getAll() : bookingService.getMyBookings(),
        isAdmin ? ticketService.getAll() : ticketService.getMyTickets()
      ])

      const bookings = bookingsRes.data.data || []
      const tickets = ticketsRes.data.data || []

      setStats({
        resources: resourcesRes.data.data?.length || 0,
        pendingBookings: bookings.filter(b => b.status === 'PENDING').length,
        approvedBookings: bookings.filter(b => b.status === 'APPROVED').length,
        openTickets: tickets.filter(t => t.status === 'OPEN').length,
        inProgressTickets: tickets.filter(t => t.status === 'IN_PROGRESS').length
      })

      setRecentBookings(bookings.slice(0, 5))
      setRecentTickets(tickets.slice(0, 5))
    } catch (error) {
      console.error('Failed to fetch dashboard data', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { name: 'Total Resources', value: stats.resources, icon: BuildingOfficeIcon, color: 'bg-blue-500' },
    { name: 'Pending Bookings', value: stats.pendingBookings, icon: ClockIcon, color: 'bg-yellow-500' },
    { name: 'Approved Bookings', value: stats.approvedBookings, icon: CheckCircleIcon, color: 'bg-green-500' },
    { name: 'Open Tickets', value: stats.openTickets, icon: ExclamationTriangleIcon, color: 'bg-red-500' },
    { name: 'In Progress Tickets', value: stats.inProgressTickets, icon: TicketIcon, color: 'bg-purple-500' },
  ]

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
      OPEN: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name}!</h1>
        <p className="text-gray-500">Here's what's happening with your campus today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="card flex items-center">
            <div className={`p-3 rounded-lg ${stat.color}`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link to="/bookings/create" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <CalendarIcon className="h-10 w-10 text-primary-600" />
            <div className="ml-4">
              <h3 className="font-semibold text-gray-800">Book a Resource</h3>
              <p className="text-sm text-gray-500">Reserve rooms, labs, or equipment</p>
            </div>
          </div>
        </Link>
        <Link to="/tickets/create" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <TicketIcon className="h-10 w-10 text-primary-600" />
            <div className="ml-4">
              <h3 className="font-semibold text-gray-800">Report an Issue</h3>
              <p className="text-sm text-gray-500">Create a maintenance ticket</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Bookings</h2>
            <Link to="/bookings" className="text-primary-600 text-sm hover:underline">View all</Link>
          </div>
          {recentBookings.length > 0 ? (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{booking.resourceName}</p>
                    <p className="text-sm text-gray-500">{booking.bookingDate}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No bookings yet</p>
          )}
        </div>

        {/* Recent Tickets */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Tickets</h2>
            <Link to="/tickets" className="text-primary-600 text-sm hover:underline">View all</Link>
          </div>
          {recentTickets.length > 0 ? (
            <div className="space-y-3">
              {recentTickets.map((ticket) => (
                <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div>
                    <p className="font-medium text-gray-800">{ticket.title}</p>
                    <p className="text-sm text-gray-500">{ticket.category}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No tickets yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
