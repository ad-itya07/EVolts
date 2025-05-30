const { default: mongoose } = require("mongoose");

// Charging Station Schema
const chargingStationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },
    address: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Maintenance'],
    default: 'Active'
  },
  powerOutput: {
    type: Number,
    required: true,
    min: 0,
    unit: 'kW'
  },
  connectorType: {
    type: String,
    required: true,
    enum: ['Type 1', 'Type 2', 'CCS', 'CHAdeMO', 'Tesla Supercharger']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const ChargingStation = mongoose.model('ChargingStation', chargingStationSchema);

module.exports = ChargingStation;