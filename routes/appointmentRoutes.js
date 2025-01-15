const express = require('express'); 
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authGuard } = require('../Middleware/authGuard'); // Adjusted path for middleware import

// Create Appointment
router.post('/appointments', authGuard, appointmentController.createAppointment);

// Get All Appointments (Admin)
router.get('/all_appointments', authGuard, appointmentController.getAllAppointments);

// Update Appointment Status (Admin)
router.put('/appointments/status', authGuard, appointmentController.updateAppointmentStatus);

// Get user appointments
router.get('/myappointments', authGuard, appointmentController.getUserAppointments);

// Update payment method
router.put('/appointments/payment', authGuard, appointmentController.updatePaymentMethod);

module.exports = router;
