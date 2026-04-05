# 🏫 Smart Campus Operations Hub

**IT3030 - Programming Applications and Frameworks (PAF) Assignment 2026**  
**Faculty of Computing, SLIIT**

A comprehensive web platform for managing university facility bookings and maintenance operations.

## 📋 Project Overview

Smart Campus Operations Hub is a full-stack web application designed to modernize university day-to-day operations. The platform enables:

- **Facility & Asset Booking**: Reserve lecture halls, labs, meeting rooms, and equipment
- **Maintenance Ticketing**: Report and track maintenance issues with workflow management
- **Real-time Notifications**: Stay updated on booking approvals and ticket progress
- **Role-based Access Control**: Secure access with USER, ADMIN, TECHNICIAN, and MANAGER roles

## 🛠️ Tech Stack

### Backend
- **Java 17** with **Spring Boot 3.2**
- **Spring Security** with JWT Authentication
- **Spring Data JPA** with **H2/MySQL** database
- **OAuth 2.0** (Google Sign-in)
- **OpenAPI/Swagger** documentation

### Frontend
- **React 18** with **Vite**
- **React Router** for navigation
- **TailwindCSS** for styling
- **Axios** for API communication
- **React Toastify** for notifications

## 🚀 Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 18+ and npm
- Maven 3.8+
- Git

### Backend Setup

```bash
# Navigate to backend directory
cd PAF/backend

# Install dependencies and build
mvn clean install

# Run the application
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

### Frontend Setup

```bash
# Navigate to frontend directory
cd PAF/frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📚 API Documentation

After starting the backend, access Swagger UI at:
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **API Docs**: `http://localhost:8080/api-docs`

## 📁 Project Structure

```
PAF/
├── backend/
│   ├── src/main/java/com/smartcampus/
│   │   ├── config/          # Configuration classes
│   │   ├── controller/      # REST Controllers
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── entity/          # JPA Entities
│   │   ├── enums/           # Enum types
│   │   ├── exception/       # Exception handling
│   │   ├── repository/      # Data repositories
│   │   ├── security/        # Security configuration
│   │   └── service/         # Business logic
│   └── src/main/resources/
│       └── application.properties
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── utils/           # Utility functions
│   └── public/
└── .github/workflows/       # CI/CD configuration
```

## 🔐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with credentials |
| POST | `/api/auth/google` | Google OAuth login |

### Resources (Module A)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resources` | Get all resources |
| GET | `/api/resources/{id}` | Get resource by ID |
| GET | `/api/resources/search` | Search with filters |
| POST | `/api/resources` | Create resource (Admin) |
| PUT | `/api/resources/{id}` | Update resource (Admin) |
| DELETE | `/api/resources/{id}` | Delete resource (Admin) |

### Bookings (Module B)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | Get all bookings (Admin) |
| GET | `/api/bookings/my-bookings` | Get user's bookings |
| POST | `/api/bookings` | Create booking request |
| PATCH | `/api/bookings/{id}/approve` | Approve booking (Admin) |
| PATCH | `/api/bookings/{id}/reject` | Reject booking (Admin) |
| PATCH | `/api/bookings/{id}/cancel` | Cancel booking |

### Tickets (Module C)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets` | Get all tickets |
| GET | `/api/tickets/{id}` | Get ticket details |
| POST | `/api/tickets` | Create new ticket |
| PATCH | `/api/tickets/{id}/assign/{techId}` | Assign technician |
| PATCH | `/api/tickets/{id}/status` | Update status |
| POST | `/api/tickets/{id}/comments` | Add comment |

### Notifications (Module D)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get all notifications |
| GET | `/api/notifications/unread` | Get unread notifications |
| PATCH | `/api/notifications/{id}/read` | Mark as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |

### Users (Module E)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (Admin) |
| GET | `/api/users/me` | Get current user |
| PUT | `/api/users/me` | Update profile |
| PATCH | `/api/users/{id}/role` | Update user role (Admin) |

## 👥 Team Contributions

| Member | Responsibilities |
|--------|-----------------|
| Member 1 | Facilities catalogue + Resource management endpoints |
| Member 2 | Booking workflow + Conflict checking |
| Member 3 | Incident tickets + Attachments + Technician updates |
| Member 4 | Notifications + Role management + OAuth integration |

## 🧪 Testing

### Backend Tests
```bash
cd PAF/backend
mvn test
```

### API Testing with Postman
Import the Postman collection from `/docs/postman_collection.json`

## 🔒 Security Features

- JWT-based authentication
- OAuth 2.0 Google Sign-in
- Role-based access control (RBAC)
- Input validation
- CORS configuration
- Secure file upload handling

## 📝 License

This project is developed for educational purposes as part of IT3030 PAF Assignment 2026.

---

**Smart Campus Operations Hub** - Modernizing University Operations
