


// const axios = require("axios");
// const Payment = require("../models/paymentModel");
// const PurchasedItem = require("../models/purchasedItemsModel");
 
// // Function to verify Khalti Payment
// const verifyKhaltiPayment = async (pidx) => {
//   const headersList = {
//     Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
//     "Content-Type": "application/json",
//   };
 
//   const bodyContent = JSON.stringify({ pidx });
 
//   const reqOptions = {
//     url: `${process.env.KHALTI_GATEWAY_URL}/api/v2/epayment/lookup/`,
//     method: "POST",
//     headers: headersList,
//     data: bodyContent,
//   };
 
//   try {
//     const response = await axios.request(reqOptions);
//     return response.data;
//   } catch (error) {
//     console.error(
//       "Error verifying Khalti payment:",
//       error.response ? error.response.data : error.message
//     );
//     throw error;
//   }
// };
 
// // Function to initialize Khalti Payment
// const initializeKhaltiPayment = async (details) => {
//   const headersList = {
//     Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
//     "Content-Type": "application/json",
//   };
 
//   const bodyContent = JSON.stringify({
//     return_url: details.website_url + "/payment/success",
//     website_url: details.website_url,
//     amount: details.amount, // Amount in paisa
//     purchase_order_id: details.itemId,
//     purchase_order_name: "Product Purchase",
//   });
 
//   const reqOptions = {
//     url: `${process.env.KHALTI_GATEWAY_URL}/api/v2/epayment/initiate/`,
//     method: "POST",
//     headers: headersList,
//     data: bodyContent,
//   };
 
//   try {
//     const response = await axios.request(reqOptions);
//     return {
//       success: true,
//       payment_url: response.data.payment_url,
//       pidx: response.data.pidx,
//     };
//   } catch (error) {
//     console.error(
//       "Error initializing Khalti payment:",
//       error.response ? error.response.data : error.message
//     );
//     throw error;
//   }
// };
 
// // Route handler to initialize Khalti payment
// const initializeKhalti = async (req, res) => {
//   try {
//     const { itemId, totalPrice, website_url } = req.body;
 
//     // Verify product data
//     const productData = await PurchasedItem.findById(itemId);
//     if (!productData || productData.totalPrice * 100 !== totalPrice) {
//       return res.status(400).json({
//         success: false,
//         message: "Product not found or price mismatch",
//       });
//     }
 
//     // Initialize Khalti payment
//     const paymentInitiate = await initializeKhaltiPayment({
//       amount: totalPrice, // Ensure this is in paisa
//       itemId: productData._id,
//       website_url: website_url || "http://localhost:3000",
//     });
 
//     res.status(200).json({
//       success: true,
//       payment_url: paymentInitiate.payment_url,
//       pidx: paymentInitiate.pidx,
//     });
//   } catch (error) {
//     console.error("Error initializing Khalti payment:", error);
//     res.status(500).json({
//       success: false,
//       message: "An error occurred while initializing Khalti payment",
//       error: error.message,
//     });
//   }
// };
 
// // Route handler to complete Khalti payment
// const completeKhaltiPayment = async (req, res) => {
//   const { pidx, amount, productId, transactionId } = req.query;
 
//   try {
//     const paymentInfo = await verifyKhaltiPayment(pidx);
 
//     // Check if payment is completed and details match
//     if (
//       paymentInfo?.status !== "Completed" ||
//       paymentInfo.transaction_id !== transactionId ||
//       Number(paymentInfo.total_amount) !== Number(amount)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Incomplete information",
//         paymentInfo,
//       });
//     }
 
//     // Check if payment done in valid item
//     const purchasedItemData = await PurchasedItem.findOne({
//       _id: productId,
//       totalPrice: amount,
//     });
 
//     if (!purchasedItemData) {
//       return res.status(400).send({
//         success: false,
//         message: "Purchased data not found",
//       });
//     }
 
//     // Update purchase record status to completed
//     await PurchasedItem.findByIdAndUpdate(
//       productId,
//       { $set: { status: "completed" } },
//       { new: true }
//     );
 
//     // Create or update payment record
//     const paymentData = await Payment.findOneAndUpdate(
//       { transactionId: transactionId },
//       {
//         pidx,
//         productId: productId,
//         amount,
//         dataFromVerificationReq: paymentInfo,
//         apiQueryFromUser: req.query,
//         paymentGateway: "khalti",
//         status: "success",
//       },
//       { upsert: true, new: true }
//     );
 
//     res.status(201).json({
//       success: true,
//       message: "Payment Successful",
//       paymentData,
//     });
//   } catch (error) {
//     console.error("Error in complete-khalti-payment:", error);
//     res.status(500).json({
//       success: false,
//       message: "An error occurred",
//       error: error.message,
//     });
//   }
// };
 
// module.exports = {
//   initializeKhaltiPayment,
//   verifyKhaltiPayment,
//   initializeKhalti,
//   completeKhaltiPayment,
// };



// controllers/paymentController.js

const Payment = require("../models/paymentModel");
const PurchasedItem = require("../models/purchasedItemsModel"); // or your relevant model
const { verifyKhaltiPayment, initializeKhaltiPayment } = require("../service/khaltiService");

// 1) INITIALIZE KHALTI
exports.initializeKhalti = async (req, res) => {
  try {
    const { itemId, totalPrice, website_url } = req.body;

    // 1a) Validate input
    if (!itemId || !totalPrice) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (itemId or totalPrice).",
      });
    }

    // 1b) Check purchased item (or appointment) validity
    const purchasedItem = await PurchasedItem.findById(itemId);
    if (!purchasedItem) {
      return res.status(404).json({
        success: false,
        message: "Purchased item not found.",
      });
    }

    // 1c) For test environment, ensure price < 200 or your logic
    if (purchasedItem.totalPrice !== Number(totalPrice)) {
      return res.status(400).json({
        success: false,
        message: "Price mismatch with the item record.",
      });
    }

    // 1d) Prepare details for Khalti
    const details = {
      return_url: `${website_url}/payment/success`, // or wherever you handle success
      website_url: website_url,
      amount: totalPrice * 100, // if your totalPrice is in NPR, multiply by 100 for paisa
      purchase_order_id: purchasedItem._id,
      purchase_order_name: "Service Payment",
    };

    // 1e) Call service to initialize
    const khaltiResponse = await initializeKhaltiPayment(details);

    return res.status(200).json({
      success: true,
      message: "Khalti payment initialized.",
      payment_url: khaltiResponse.payment_url,
      pidx: khaltiResponse.pidx,
    });
  } catch (error) {
    console.error("Error in initializeKhalti:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while initializing Khalti.",
      error: error.message,
    });
  }
};

// 2) COMPLETE KHALTI PAYMENT
exports.completeKhaltiPayment = async (req, res) => {
  try {
    const { pidx, amount, productId, transactionId } = req.query;

    if (!pidx || !amount || !productId || !transactionId) {
      return res.status(400).json({
        success: false,
        message: "Missing required query parameters.",
      });
    }

    // 2a) Verify with Khalti
    const paymentInfo = await verifyKhaltiPayment(pidx);

    // 2b) Check if completed
    const isCompleted = paymentInfo?.status === "Completed";
    const isTransactionMatched = paymentInfo?.transaction_id === transactionId;
    // If you used *paisa*, paymentInfo.total_amount is in paisa. Compare carefully
    const isAmountMatched = Number(paymentInfo?.total_amount) === Number(amount);

    if (!isCompleted || !isTransactionMatched || !isAmountMatched) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed or mismatch.",
        paymentInfo,
      });
    }

    // 2c) Check the purchased item (or appointment)
    const purchasedItem = await PurchasedItem.findOne({
      _id: productId,
      totalPrice: amount / 100, // if your DB stores in NPR, and Khalti's amount is in paisa
    });
    if (!purchasedItem) {
      return res.status(400).json({
        success: false,
        message: "No matching purchased item found.",
      });
    }

    // 2d) Mark the purchased item status as completed
    purchasedItem.status = "completed";
    await purchasedItem.save();

    // 2e) Create or Update the Payment record
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: transactionId },
      {
        pidx,
        productId,
        amount,
        dataFromVerificationReq: paymentInfo,
        apiQueryFromUser: req.query,
        paymentGateway: "khalti",
        status: "success",
      },
      { upsert: true, new: true }
    );

    return res.status(201).json({
      success: true,
      message: "Payment successfully verified.",
      paymentData: updatedPayment,
    });
  } catch (error) {
    console.error("Error completing Khalti payment:", error);
    res.status(500).json({
      success: false,
      message: "Error completing Khalti payment.",
      error: error.message,
    });
  }
};
