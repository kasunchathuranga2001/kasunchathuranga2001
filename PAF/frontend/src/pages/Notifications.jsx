import { useState, useEffect } from 'react'
import { notificationService } from '../services/services'
import { toast } from 'react-toastify'
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getAll()
      setNotifications(response.data.data || [])
    } catch (error) {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ))
    } catch (error) {
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(notifications.map(n => ({ ...n, read: true })))
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  const getTypeIcon = (type) => {
    const icons = {
      BOOKING_APPROVED: '✅',
      BOOKING_REJECTED: '❌',
      BOOKING_CANCELLED: '🚫',
      TICKET_STATUS_CHANGED: '🔄',
      TICKET_ASSIGNED: '👷',
      NEW_COMMENT: '💬',
      TICKET_RESOLVED: '✔️'
    }
    return icons[type] || '📢'
  }

  const filteredNotifications = notifications.filter(n => 
    filter === 'ALL' ? true : filter === 'UNREAD' ? !n.read : n.read
  )

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-500">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead} className="btn-secondary mt-4 md:mt-0 flex items-center">
            <CheckIcon className="h-5 w-5 mr-2" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6">
        {['ALL', 'UNREAD', 'READ'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg ${
              filter === f 
                ? 'bg-primary-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">Loading...</div>
      ) : filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`card flex items-start ${!notification.read ? 'border-l-4 border-primary-500' : ''}`}
            >
              <span className="text-2xl mr-4">{getTypeIcon(notification.type)}</span>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-sm text-gray-400">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-1">{notification.message}</p>
              </div>
              {!notification.read && (
                <button 
                  onClick={() => handleMarkAsRead(notification.id)}
                  className="ml-4 text-primary-600 text-sm hover:underline"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No notifications</p>
        </div>
      )}
    </div>
  )
}

export default Notifications
