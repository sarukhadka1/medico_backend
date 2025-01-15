const router = require('express').Router(); 
const doctorController = require('../controllers/doctorController'); // Adjust the path if necessary
const { authGuard } = require('../Middleware/authGuard');

// Create a doctor
router.post('/create',authGuard, doctorController.createDoctor);

// Fetch all doctors
router.get('/get_all_doctors', doctorController.getAllDoctors);

// Get a single doctor
router.get('/get_single_doctor/:id', doctorController.getSingleDoctor);

// Delete a doctor
router.delete('/delete_doctor/:id', doctorController.deleteDoctor);

// Update a doctor
router.put('/update_doctor/:id', doctorController.updateDoctor);

// Pagination for doctors
router.get('/pagination', doctorController.paginationDoctors); // Assume function name, check if it exists

// Count number of doctors
router.get("/get_doctors_count", doctorController.getDoctorsCount);

module.exports = router;
