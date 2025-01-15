const path = require('path');
const doctorModel = require('../models/doctorModel');
const fs = require('fs'); // filesystem

// const createDoctor = async (req, res) => {
//     console.log(req.body);
//     console.log(req.files);

//     const {
//         doctorName,
//         doctorSpecialization,
//         doctorFees,
//         doctorDescription,
        
//     } = req.body;

//     if (!doctorName || !doctorSpecialization || !doctorFees || !doctorDescription) {
//         return res.status(400).json({
//             "success": false,
//             "message": "Please enter all fields"
//         });
//     }

//     if (!req.files || !req.files.doctorImage) {
//         return res.status(400).json({
//             "success": false,
//             "message": "Image not found"
//         });
//     }

//     const { doctorImage } = req.files;

//     const imageName = `${Date.now()}-${doctorImage.name}`;
//     // const imageUploadPath = path.join(__dirname, `../public/doctors${imageName}`);
//     const imageUploadPath = path.join(__dirname, `../public/doctors${imageName}`);


//     try {
//         await doctorImage.mv(imageUploadPath);

//         const newDoctor = new doctorModel({
//             doctorName: doctorName,
//             doctorSpecialization: doctorSpecialization,
//             doctorFees: doctorFees,
//             doctorDescription: doctorDescription,
//             doctorImage: imageName
//         });
//         const doctor = await newDoctor.save();
//         res.status(201).json({
//             "success": true,
//             "message": "Doctor Created Successfully",
//             "data": doctor
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             "success": false,
//             "message": "Internal server error",
//             "error": error
//         });
//     }
// };

const createDoctor = async (req, res) => {
    console.log(req.body);
    console.log(req.files);

    const { doctorName, doctorSpecialization, doctorFees, doctorDescription } = req.body;

    // Validate input fields
    if (!doctorName || !doctorSpecialization || !doctorFees || !doctorDescription) {
        return res.status(400).json({
            success: false,
            message: "Please enter all fields",
        });
    }

    // Check if an image is uploaded
    if (!req.files || !req.files.doctorImage) {
        return res.status(400).json({
            success: false,
            message: "Image not found",
        });
    }

    const { doctorImage } = req.files;

    // Ensure the `doctors` directory exists
    const doctorsDir = path.join(__dirname, '../public/doctors');
    if (!fs.existsSync(doctorsDir)) {
        fs.mkdirSync(doctorsDir, { recursive: true });
    }

    // Define the image path
    const imageName = `${Date.now()}-${doctorImage.name}`;
    const imageUploadPath = path.join(doctorsDir, imageName);

    try {
        // Move the image to the `doctors` folder
        await doctorImage.mv(imageUploadPath);

        // Save doctor details to the database
        const newDoctor = new doctorModel({
            doctorName,
            doctorSpecialization,
            doctorFees,
            doctorDescription,
            doctorImage: imageName,
        });

        const doctor = await newDoctor.save();

        res.status(201).json({
            success: true,
            message: "Doctor Created Successfully",
            data: doctor,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};


const getAllDoctors = async (req, res) => {
    try {
        const allDoctors = await doctorModel.find({});
        res.status(201).json({
            "success": true,
            "message": "Doctors Fetched Successfully",
            "doctors": allDoctors
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "success": false,
            "message": "Internal server error",
            "error": error
        });
    }
};

const getSingleDoctor = async (req, res) => {
    const doctorId = req.params.id;

    try {
        const doctor = await doctorModel.findById(doctorId);
        res.status(201).json({
            "success": true,
            "message": "Doctor Fetched!",
            "doctor": doctor
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "success": false,
            "message": "Internal server error",
            "error": error
        });
    }
};

const deleteDoctor = async (req, res) => {
    try {
        await doctorModel.findByIdAndDelete(req.params.id);
        res.status(201).json({
            "success": true,
            "message": "Doctor deleted successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "success": false,
            "message": "Internal server error",
            "error": error
        });
    }
};

const updateDoctor = async (req, res) => {
    try {
        let updateFields = { ...req.body };

        if (req.files && req.files.doctorImage) {
            const { doctorImage } = req.files;

            // Validate the file type
            if (!doctorImage.mimetype.startsWith("image")) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid file type. Only images are allowed.",
                });
            }

            // Generate a unique name for the file
            const imageName = `${Date.now()}-${doctorImage.name}`;
            const imageUploadPath = path.join(__dirname, `../public/doctors/${imageName}`);

            // Move the file to the upload directory
            await doctorImage.mv(imageUploadPath);

            // Add the new image name to the updateFields
            updateFields.doctorImage = imageName;

            // Delete the old image if it exists
            const existingDoctor = await doctorModel.findById(req.params.id);
            if (existingDoctor && existingDoctor.doctorImage) {
                const oldImagePath = path.join(__dirname, `../public/doctors/${existingDoctor.doctorImage}`);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        // Update the doctor in the database
        const updatedDoctor = await doctorModel.findByIdAndUpdate(req.params.id, updateFields, { new: true, runValidators: true });
        if (!updatedDoctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Doctor updated successfully.",
            doctor: updatedDoctor,
        });
    } catch (error) {
        console.error("Error updating doctor:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};
// const updateDoctor = async (req, res) => {
//     try {
//         let imageName;

//         // Handle new image upload
//         if (req.files && req.files.doctorImage) {
//             const { doctorImage } = req.files;

//             // Generate a unique filename for the new image
//             imageName = `${Date.now()}-${doctorImage.name}`;
//             const imageUploadPath = path.join(__dirname, `../public/doctors/${imageName}`);

//             // Move the uploaded image to the server
//             await doctorImage.mv(imageUploadPath);

//             // Set the image name in req.body
//             req.body.doctorImage = imageName;

//             // Delete the old image if it exists
//             const existingDoctor = await doctorModel.findById(req.params.id);
//             if (existingDoctor && existingDoctor.doctorImage) {
//                 const oldImagePath = path.join(__dirname, `../public/doctors/${existingDoctor.doctorImage}`);
//                 if (fs.existsSync(oldImagePath)) {
//                     fs.unlinkSync(oldImagePath); // Safely delete the old image
//                 }
//             }
//         }

//         // Ensure doctorImage is either undefined or a valid string
//         if (req.body.doctorImage && typeof req.body.doctorImage !== 'string') {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid image format",
//             });
//         }

//         // Update the doctor's information
//         const updatedDoctor = await doctorModel.findByIdAndUpdate(
//             req.params.id,
//             req.body,
//             { new: true, runValidators: true } // Ensure validation runs
//         );

//         if (!updatedDoctor) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Doctor not found",
//             });
//         }

//         res.status(201).json({
//             success: true,
//             message: "Doctor Updated Successfully",
//             doctor: updatedDoctor,
//         });
//     } catch (error) {
//         console.error(error); // Log the full error for debugging
//         res.status(500).json({
//             success: false,
//             message: "Internal Server Error",
//             error: error.message,
//         });
//     }
// };




// Pagination
const paginationDoctors = async (req, res) => {
    try {
        //Page number
        const PageNo = parseInt(req.query.page) || 1;

        //Result per page
        const resultPerPage = parseInt(req.query.limit) || 2;
        //Search
        const searchQuery = req.query.q || '';
        const sortOrder = req.query.sort || 'asc';

        const filter = {};
        if (searchQuery) {
            filter.doctorName = { $regex: searchQuery, $options: 'i' };
        }
        //Sorting

        const sort = sortOrder === 'asc' ? { doctorFees: 1 } : { doctorFees: -1 };
        //find doctors with filter, sort and pagination

        const doctors = await doctorModel
            .find(filter)
            .skip((PageNo - 1) * resultPerPage)
            .limit(resultPerPage)
            .sort(sort);

            // If the result is empty

        if (doctors.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No doctors found",
            });
        }

        //send response

        res.status(200).json({
            success: true,
            message: "Doctors fetched successfully",
            doctors: doctors,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error,
        });
    }
};

const getDoctorsCount = async (req, res) => {
    try {
        const doctorCount = await doctorModel.countDocuments({});
        res.status(200).json({
            success: true,
            message: 'Doctor count fetched successfully',
            doctorCount: doctorCount,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error,
        });
    }
};

const getCurrentProfile = async (req, res) => {
    try{
        const token = req.headers.authorization.split(" ")[1];
        const decoded =jwt.verify(token,process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found',
            });
        }
        res.status(200).json({
            success: true,
            message: 'User fetched successfully',
            user: user,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error,
        });
    }
    }

module.exports = {
    createDoctor,
    getAllDoctors,
    getSingleDoctor,
    deleteDoctor,
    updateDoctor,
    paginationDoctors,
    getDoctorsCount
};
