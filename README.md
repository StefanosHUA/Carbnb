# 🚗 Carbnb - Car Rental Platform

A modern car rental platform built with React, inspired by Airbnb but specifically designed for car rentals. Users can search for cars, register their vehicles, and manage listings through an intuitive interface.

## ✨ Features

### 🏠 **Landing Page**
- **Car-focused search** with brand, model, location, and date filters
- **Popular car brands** section with interactive cards
- **Most popular models** with pricing information
- **Modern hero section** with comprehensive search functionality
- **Responsive design** that works on all devices

### 🔍 **Car Search & Listing**
- **Advanced filtering system**:
  - Brand and model selection
  - Location-based search
  - Price range filtering
  - Fuel type, transmission, seats
  - Year range filtering
- **Real-time search results**
- **Car cards** with ratings, reviews, and pricing
- **Delete functionality** for car owners

### 👤 **User Authentication**
- **Login page** with email/password
- **Registration page** with comprehensive user details
- **Social login options** (Google, Facebook, Apple)
- **Guest mode** for car registration

### 🚗 **Car Registration**
- **Two-step registration process**:
  - Choose login or guest mode
  - Comprehensive car information form
- **Complete car data structure**:
  - Basic info (title, description, make, model, year)
  - Vehicle details (type, license plate, color, seats, doors)
  - Technical specs (transmission, fuel type, mileage)
  - Pricing (price per day, dynamic pricing)
  - Location (full address with coordinates)
  - Media uploads (multiple images/videos)
  - Availability scheduling

### ⚙️ **Admin Panel**
- **Dashboard** with key metrics and recent activity
- **User management** with status controls
- **Car management** with approval/suspension features
- **Booking management** system
- **Platform settings** for commission rates, security, notifications

### 🔌 **Backend Integration**
- **RESTful API integration** with proper endpoints:
  - `GET /api/v1/vehicles` - Fetch all cars
  - `POST /api/v1/vehicles` - Create new car
  - `DELETE /api/v1/vehicles/:vehicle_id` - Delete car
  - `GET /api/v1/users/profile` - Get current user
  - `POST /api/v1/users` - Create user
- **Environment variable support** for API URL
- **Error handling** and user feedback

## 🛠️ Technology Stack

### Frontend
- **React 18**, React Router DOM
- **CSS3** with modern design patterns
- **Font Awesome** icons
- **Fetch API** with RESTful endpoints
- **Responsive Design** using CSS Grid and Flexbox

### Backend (Microservices Architecture)
- **FastAPI** - Python web framework
- **PostgreSQL** - Relational databases (3 separate DBs)
- **Redis** - Caching and session management
- **Elasticsearch** - Search functionality
- **RabbitMQ** - Message queue for async operations
- **SQLAlchemy** - ORM
- **Alembic** - Database migrations

### DevOps
- **Docker** & **Docker Compose** - Containerization
- **Nginx** - Production web server
- **Uvicorn** - ASGI server

## 🚀 Getting Started

### 🐳 Quick Start with Docker (Recommended!)

**The fastest way to get everything running:**

**Windows:**
```cmd
docker-start-dev.bat
```

**Mac/Linux:**
```bash
chmod +x docker-start-dev.sh
./docker-start-dev.sh
```

That's it! Everything will be running in under 2 minutes:
- **Frontend**: http://localhost:3000 (with hot-reload)
- **API Gateway**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

All backend services, databases, and dependencies are automatically set up!

📚 **For detailed Docker instructions, see [DOCKER.md](DOCKER.md)**

### 💻 Manual Setup (Without Docker)

#### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Python 3.10+
- PostgreSQL 15
- Redis
- Elasticsearch
- RabbitMQ

#### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/carbnb.git
   cd carbnb
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Set up backend services**
   ```bash
   cd newBackend/car-rental-backend-v2
   # Set up each service individually (see backend documentation)
   ```

4. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:8000
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
carbnb/
├── src/                        # Frontend React application
│   ├── components/             # Reusable React components
│   ├── pages/                  # Page components
│   ├── utils/                  # Utility functions
│   ├── context/                # React context
│   └── styles/                 # CSS styles
├── public/                     # Static assets
├── newBackend/                 # Backend microservices
│   └── car-rental-backend-v2/
│       ├── gateway_api/        # API Gateway (port 8000)
│       ├── user_service/       # User management (port 8001)
│       ├── car_service/        # Vehicle management (port 8002)
│       ├── booking_service/    # Booking management (port 8003)
│       └── search_service/     # Search functionality (port 8004)
├── docker-compose.dev.yml      # Development Docker setup
├── docker-compose.yml          # Production Docker setup
├── Dockerfile                  # Frontend Docker image
├── docker-start-dev.bat/sh     # Start development environment
├── docker-start-prod.bat/sh    # Start production environment
├── DOCKER.md                   # Docker documentation
├── package.json                # Frontend dependencies
└── README.md                   # This file
```

## 🎨 Design Features

- **Modern UI/UX** inspired by Airbnb
- **Responsive design** for all screen sizes
- **Smooth animations** and hover effects
- **Professional color scheme** (#ff385c primary)
- **Clean typography** and spacing
- **Card-based design** for listings

## 🔧 Available Scripts

### Docker Commands (Recommended)
- `docker-start-dev.bat` / `./docker-start-dev.sh` - Start all services in development mode
- `docker-start-prod.bat` / `./docker-start-prod.sh` - Start all services in production mode
- `docker-stop.bat` / `./docker-stop.sh` - Stop all services
- `docker-clean.bat` / `./docker-clean.sh` - Clean all Docker resources

### NPM Commands (Frontend Only)
- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## 🌐 Pages

1. **Home** (`/`) - Landing page with car search
2. **Login** (`/login`) - User authentication
3. **Register** (`/register`) - User registration
4. **Car Registration** (`/register-car`) - Car listing form
5. **Cars** (`/cars`) - All cars with filters
6. **Admin** (`/admin`) - Management dashboard

## 🔄 Development Workflow

### Making Changes with Docker

The Docker development setup includes **hot-reloading**:

**Frontend:**
- Edit files in `src/` or `public/`
- Changes automatically reflected in browser
- No container restart needed!

**Backend:**
- Edit Python files in any service
- Uvicorn auto-reloads the service
- No container restart needed!

### Adding Dependencies

**Frontend:**
```bash
# Add to package.json, then:
docker-compose -f docker-compose.dev.yml up -d --build frontend
```

**Backend:**
```bash
# Add to requirements.txt, then:
docker-compose -f docker-compose.dev.yml up -d --build <service-name>
```

## 📦 Preparing for Frontend/Backend Separation

When you're ready to separate this into two repositories:

**Backend Repo:**
- Copy `newBackend/car-rental-backend-v2/`
- Include backend docker-compose files
- Remove frontend service from docker-compose

**Frontend Repo:**
- Keep root directory (exclude `newBackend/`)
- Update `REACT_APP_API_URL` to backend domain
- Use simplified docker-compose for frontend only

Both will communicate via HTTP API! 🚀

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes (Docker hot-reload handles the rest!)
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request


## 🙏 Acknowledgments

- Inspired by Airbnb's design and functionality
- Built with modern React best practices
- Designed for car rental market needs

---

**Carbnb** - Where car sharing meets modern technology! 🚗✨ 
