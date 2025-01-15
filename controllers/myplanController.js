const MyPlan = require('../models/myplanModel');
const Doctor = require('../models/doctorModel');



const getUserMyPlan = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }

        const myPlan = await MyPlan.findOne({ user: req.user._id }).populate('doctors');

        if (!myPlan) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        res.status(200).json({
            success: true,
            data: myPlan.doctors
        });
    } catch (error) {
        console.error('Error fetching user plan:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};




// Add to My Plan
const addToMyPlan = async (req, res) => {
    try {
        const { doctorId } = req.body;
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        let myPlan = await MyPlan.findOne({ user: req.user._id });
        if (!myPlan) {
            myPlan = new MyPlan({ user: req.user._id, doctors: [doctorId] });
        } else {
            if (!myPlan.doctors.includes(doctorId)) {
                myPlan.doctors.push(doctorId);
            }
        }

        await myPlan.save();
        res.status(200).json({
            success: true,
            message: 'Doctor added to My Plan',
            data: myPlan
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Remove from My Plan
const removeFromMyPlan = async (req, res) => {
    try {
        const { doctorId } = req.params;
        let myPlan = await MyPlan.findOne({ user: req.user._id });

        if (myPlan) {
            myPlan.doctors = myPlan.doctors.filter(id => id.toString() !== doctorId);
            await myPlan.save();
        }

        res.status(200).json({
            success: true,
            message: 'Doctor removed from My Plan',
            data: myPlan
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    getUserMyPlan,
    addToMyPlan,
    removeFromMyPlan
};
