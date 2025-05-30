const { Router } = require("express");
const UserController = require("../controllers/user-controller");
const { authenticateToken } = require("../middleware/verification");

const app = Router();

app.post('/api/auth/register', UserController.register);
app.post('/api/auth/login', UserController.login);
app.get('/api/auth/me', authenticateToken, UserController.getMe);

module.exports = app;
