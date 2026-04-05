import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bookingService } from '../services/services'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import { PlusIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

const Bookings = () => {
  const { isAdmin } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    fetchBookings()
  }, [isAdmin])

  const fetchBookings = async () => {
    try {
      const response = isAdmin 
        ? await bookingService.getAll()
        : await bookingService.getMyBookings()
      setBookings(response.data.data || [])
    } catch (error) {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      await bookingService.approve(id, 'Approved by admin')
      toast.success('Booking approved')
      fetchBookings()
    } catch (error) {
      toast.error('Failed to approve booking')
    }
  }

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:')
    if (reason) {
      try {
        await bookingService.reject(id, reason)
        toast.success('Booking rejected')
        fetchBookings()
      } catch (error) {
        toast.error('Failed to reject booking')
      }
    }
  }

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingService.cancel(id)
        toast.success('Booking cancelled')
        fetchBookings()
      } catch (error) {
        toast.error('Failed to cancel booking')
      }
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const filteredBookings = bookings.filter(b => 
    filter === 'ALL' ? true : b.status === filter
  )

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bookings</h1>
          <p className="text-gray-500">
            {isAdmin ? 'Manage all bookings' : 'View and manage your bookings'}
          </p>
        </div>
        <Link to="/bookings/create" className="btn-primary mt-4 md:mt-0 flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          New Booking
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              filter === status 
                ? 'bg-primary-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">Loading...</div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="card">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-800">{booking.resourceName}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>📅 {booking.bookingDate} | 🕐 {booking.startTime} - {booking.endTime}</p>
                    <p>📝 {booking.purpose}</p>
                    {booking.expectedAttendees && <p>👥 {booking.expectedAttendees} attendees</p>}
                    {isAdmin && <p>👤 Requested by: {booking.userName}</p>}
                    {booking.adminRemarks && <p>💬 Admin: {booking.adminRemarks}</p>}
                  </div>
                </div>
                <div className="flex space-x-2 mt-4 md:mt-0">
                  {isAdmin && booking.status === 'PENDING' && (
                    <>
                      <button 
                        onClick={() => handleApprove(booking.id)}
                        className="btn-primary flex items-center"
                      >
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Approve
                      </button>
                      <button 
                        onClick={() => handleReject(booking.id)}
                        className="btn-danger flex items-center"
                      >
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        Reject
                      </button>
                    </>
                  )}
                  {!isAdmin && booking.status === 'APPROVED' && (
                    <button 
                      onClick={() => handleCancel(booking.id)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500">No bookings found</p>
          <Link to="/bookings/create" className="btn-primary mt-4 inline-block">
            Create your first booking
          </Link>
        </div>
      )}
    </div>
  )
}

export default Bookings
