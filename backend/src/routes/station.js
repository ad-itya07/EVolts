const StationController = require("../controllers/station-controller");
const { validateChargingStation } = require("../middleware/validation");
const { authenticateToken } = require("../middleware/verification");
const { Router } = require("express");

const app = Router();

// Create Charging Station (Protected)
app.post('/api/charging-stations', authenticateToken, validateChargingStation, StationController.createStation);

// Get All Charging Stations (Protected)
app.get('/api/charging-stations', authenticateToken, StationController.getAllStations);

// Get Single Charging Station (Protected)
app.get('/api/charging-stations/:id', authenticateToken, StationController.getStationById);

// Update Charging Station (Protected)
app.put('/api/charging-stations/:id', authenticateToken, validateChargingStation, StationController.updateStation);

// Delete Charging Station (Protected)
app.delete('/api/charging-stations/:id', authenticateToken, StationController.deleteStation);

// Get Charging Stations by Location (Protected) - Bonus feature
app.get('/api/charging-stations/nearby/:latitude/:longitude', authenticateToken, StationController.getNearbyStations);

module.exports = app;