// controllers/stationController.js

const ChargingStation = require('../models/charging-station');
const { calculateDistance } = require('../lib/calculate-distance');

const StationController = {
  // Create Charging Station
  async createStation(req, res) {
    try {
      const chargingStation = new ChargingStation({
        ...req.body,
        createdBy: req.user._id
      });

      await chargingStation.save();
      await chargingStation.populate('createdBy', 'name email');

      res.status(201).json({
        success: true,
        message: 'Charging station created successfully',
        data: chargingStation
      });
    } catch (error) {
      console.error('Create charging station error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create charging station'
      });
    }
  },

  // Get All Charging Stations
  async getAllStations(req, res) {
    try {
      const { page = 1, limit = 10, status, connectorType, search } = req.query;

      const filter = {};

      if (status) filter.status = status;
      if (connectorType) filter.connectorType = connectorType;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { 'location.address': { $regex: search, $options: 'i' } }
        ];
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 }
      };

      const chargingStations = await ChargingStation.find(filter)
        .populate('createdBy', 'name email')
        .sort(options.sort)
        .limit(options.limit)
        .skip((options.page - 1) * options.limit);

      const total = await ChargingStation.countDocuments(filter);

      res.json({
        success: true,
        data: chargingStations,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit)
        }
      });
    } catch (error) {
      console.error('Get charging stations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch charging stations'
      });
    }
  },

  // Get Single Charging Station
  async getStationById(req, res) {
    try {
      const chargingStation = await ChargingStation.findById(req.params.id)
        .populate('createdBy', 'name email');

      if (!chargingStation) {
        return res.status(404).json({
          success: false,
          message: 'Charging station not found'
        });
      }

      res.json({
        success: true,
        data: chargingStation
      });
    } catch (error) {
      console.error('Get charging station error:', error);
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid charging station ID'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to fetch charging station'
      });
    }
  },

  // Update Charging Station
  async updateStation(req, res) {
    try {
      const chargingStation = await ChargingStation.findById(req.params.id);

      if (!chargingStation) {
        return res.status(404).json({
          success: false,
          message: 'Charging station not found'
        });
      }

      if (chargingStation.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own charging stations'
        });
      }

      const updatedChargingStation = await ChargingStation.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('createdBy', 'name email');

      res.json({
        success: true,
        message: 'Charging station updated successfully',
        data: updatedChargingStation
      });
    } catch (error) {
      console.error('Update charging station error:', error);
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid charging station ID'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to update charging station'
      });
    }
  },

  // Delete Charging Station
  async deleteStation(req, res) {
    try {
      const chargingStation = await ChargingStation.findById(req.params.id);

      if (!chargingStation) {
        return res.status(404).json({
          success: false,
          message: 'Charging station not found'
        });
      }

      if (chargingStation.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own charging stations'
        });
      }

      await ChargingStation.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'Charging station deleted successfully'
      });
    } catch (error) {
      console.error('Delete charging station error:', error);
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid charging station ID'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to delete charging station'
      });
    }
  },

  // Get Charging Stations By Location
  async getNearbyStations(req, res) {
    try {
      const { latitude, longitude } = req.params;
      const { radius = 10 } = req.query;

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid latitude or longitude'
        });
      }

      const stations = await ChargingStation.find({ status: 'Active' }).populate('createdBy', 'name email');

      const nearbyStations = stations.filter(station => {
        return calculateDistance(lat, lng, station.location.latitude, station.location.longitude) <= +radius;
      });

      res.json({
        success: true,
        data: nearbyStations,
        center: { latitude: lat, longitude: lng },
        radius: `${radius} km`
      });
    } catch (error) {
      console.error('Get nearby charging stations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch nearby charging stations'
      });
    }
  }
};

module.exports = StationController;
