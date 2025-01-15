const Appointment = require('../models/appointmentModel');
const User = require('../models/userModel');
const Doctor = require('../models/doctorModel');

// Create Appointment
const createAppointment = async (req, res) => {
  const { userId, doctorId, date, time } = req.body;

  // Validate input
  if (!userId || !doctorId || !date || !time) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    // Create new appointment
    const newAppointment = new Appointment({ user: userId, doctor: doctorId, date, time });
    await newAppointment.save();

    res.status(201).json({ success: true, message: 'Appointment created successfully', appointment: newAppointment });
  } catch (error) {
    console.error('Error creating appointment:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get All Appointments
const getAllAppointments = async (req, res) => {
  try {
    let appointments;
    if (req.user.isAdmin) {
      appointments = await Appointment.find()
        .populate('user', 'firstName lastName')
        .populate('doctor', 'doctorName');
    } else {
      appointments = await Appointment.find({ user: req.user._id })
        .populate('user', 'firstName lastName')
        .populate('doctor', 'doctorName');
    }
    return res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get User Appointments
const getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id }).populate('doctor', 'doctorName');
    return res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update Appointment Status
const updateAppointmentStatus = async (req, res) => {
  const { appointmentId, status } = req.body;

  // Validate input
  if (!appointmentId || !status) {
    return res.status(400).json({ success: false, message: 'Appointment ID and status are required' });
  }

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({ success: true, message: 'Appointment status updated successfully', appointment });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update Payment Method
const updatePaymentMethod = async (req, res) => {
  const { appointmentId, paymentMethod } = req.body;

  // Validate input
  if (!appointmentId || !paymentMethod) {
    return res.status(400).json({ success: false, message: 'Appointment ID and payment method are required' });
  }

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    appointment.paymentMethod = paymentMethod;
    await appointment.save();
    res.status(200).json({ success: true, message: 'Payment method updated successfully', appointment });
  } catch (error) {
    console.error("Error updating payment method:", error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  updateAppointmentStatus,
  getUserAppointments,
  updatePaymentMethod
};
