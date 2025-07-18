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

- **Frontend**: React 18, React Router DOM
- **Styling**: CSS3 with modern design patterns
- **Icons**: Font Awesome
- **API**: Fetch API with RESTful endpoints
- **Responsive Design**: CSS Grid and Flexbox

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/carbnb.git
   cd carbnb
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:3001
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
carbnb/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── service-worker.js
├── src/
│   ├── components/
│   │   ├── CarCard.js
│   │   ├── Footer.js
│   │   └── Header.js
│   ├── pages/
│   │   ├── Admin.js
│   │   ├── CarRegistration.js
│   │   ├── Cars.js
│   │   ├── Home.js
│   │   ├── Login.js
│   │   └── Register.js
│   ├── styles/
│   │   └── App.css
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## 🎨 Design Features

- **Modern UI/UX** inspired by Airbnb
- **Responsive design** for all screen sizes
- **Smooth animations** and hover effects
- **Professional color scheme** (#ff385c primary)
- **Clean typography** and spacing
- **Card-based design** for listings

## 🔧 Available Scripts

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Airbnb's design and functionality
- Built with modern React best practices
- Designed for car rental market needs

---

**Carbnb** - Where car sharing meets modern technology! 🚗✨ 