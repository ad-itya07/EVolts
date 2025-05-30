# EV Charging Station API Documentation

## Overview
This is a REST API for managing Electric Vehicle (EV) charging stations with JWT-based authentication. Built with Node.js, Express, and MongoDB.

## Base URL
```
http://localhost:5000/api
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication Endpoints

#### 1. Register User
- **POST** `/auth/register`
- **Description**: Register a new user
- **Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt_token_here"
  }
}
```

#### 2. Login User
- **POST** `/auth/login`
- **Description**: Login with existing credentials
- **Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt_token_here"
  }
}
```

#### 3. Get Current User
- **GET** `/auth/me`
- **Description**: Get current authenticated user details
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### Charging Station Endpoints

#### 1. Create Charging Station
- **POST** `/charging-stations`
- **Description**: Create a new charging station
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "name": "Tesla Supercharger Station 1",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Main St, New York, NY"
  },
  "status": "Active",
  "powerOutput": 150,
  "connectorType": "Tesla Supercharger"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Charging station created successfully",
  "data": {
    "_id": "station_id",
    "name": "Tesla Supercharger Station 1",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "123 Main St, New York, NY"
    },
    "status": "Active",
    "powerOutput": 150,
    "connectorType": "Tesla Supercharger",
    "createdBy": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 2. Get All Charging Stations
- **GET** `/charging-stations`
- **Description**: Get list of all charging stations with pagination and filtering
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `status` (optional): Filter by status (Active/Inactive/Maintenance)
  - `connectorType` (optional): Filter by connector type
  - `search` (optional): Search by name or address
- **Example**: `/charging-stations?page=1&limit=5&status=Active&search=Tesla`
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "station_id",
      "name": "Tesla Supercharger Station 1",
      "location": {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "address": "123 Main St, New York, NY"
      },
      "status": "Active",
      "powerOutput": 150,
      "connectorType": "Tesla Supercharger",
      "createdBy": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### 3. Get Single Charging Station
- **GET** `/charging-stations/:id`
- **Description**: Get details of a specific charging station
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "data": {
    "_id": "station_id",
    "name": "Tesla Supercharger Station 1",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "123 Main St, New York, NY"
    },
    "status": "Active",
    "powerOutput": 150,
    "connectorType": "Tesla Supercharger",
    "createdBy": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 4. Update Charging Station
- **PUT** `/charging-stations/:id`
- **Description**: Update an existing charging station
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Same as create, but all fields are optional
```json
{
  "name": "Updated Tesla Supercharger Station",
  "status": "Maintenance",
  "powerOutput": 180
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Charging station updated successfully",
  "data": {
    // Updated charging station object
  }
}
```

#### 5. Delete Charging Station
- **DELETE** `/charging-stations/:id`
- **Description**: Delete a charging station
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "message": "Charging station deleted successfully"
}
```

#### 6. Get Nearby Charging Stations (Bonus Feature)
- **GET** `/charging-stations/nearby/:latitude/:longitude`
- **Description**: Get charging stations within a specified radius
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `radius` (optional): Search radius in kilometers (default: 10km)
- **Example**: `/charging-stations/nearby/40.7128/-74.0060?radius=5`
- **Response**:
```json
{
  "success": true,
  "data": [
    // Array of nearby charging stations
  ],
  "center": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "radius": "5 km"
}
```

## Data Models

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, min: 6 characters),
  createdAt: Date,
  updatedAt: Date
}
```

### Charging Station Model
```javascript
{
  name: String (required),
  location: {
    latitude: Number (required, -90 to 90),
    longitude: Number (required, -180 to 180),
    address: String (optional)
  },
  status: String (enum: ['Active', 'Inactive', 'Maintenance'], default: 'Active'),
  powerOutput: Number (required, min: 0, unit: kW),
  connectorType: String (enum: ['Type 1', 'Type 2', 'CCS', 'CHAdeMO', 'Tesla Supercharger']),
  createdBy: ObjectId (reference to User),
  createdAt: Date,
  updatedAt: Date
}
```

## Error Responses

### Validation Errors
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "Name is required",
    "Valid latitude and longitude are required"
  ]
}
```

### Authentication Errors
```json
{
  "success": false,
  "message": "Access token required"
}
```

### Not Found Errors
```json
{
  "success": false,
  "message": "Charging station not found"
}
```

### Server Errors
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Setup Instructions

1. **Install Dependencies**:
```bash
npm install
```

2. **Environment Variables**:
Create a `.env` file with:
```
MONGODB_URI=mongodb://localhost:27017/ev-charging-stations
JWT_SECRET=your-super-secret-jwt-key
PORT=5