// Validation middleware
const validateChargingStation = (req, res, next) => {
  const { name, location, powerOutput, connectorType } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
    errors.push('Valid latitude and longitude are required');
  }

  if (!powerOutput || powerOutput <= 0) {
    errors.push('Power output must be a positive number');
  }

  if (!connectorType || !['Type 1', 'Type 2', 'CCS', 'CHAdeMO', 'Tesla Supercharger'].includes(connectorType)) {
    errors.push('Valid connector type is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }

  next();
};

// Export the validation middleware
module.exports = { validateChargingStation }