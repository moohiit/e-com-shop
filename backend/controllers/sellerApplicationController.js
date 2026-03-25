import SellerApplication from "../models/SellerApplication.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import { sellerApplicationStatusEmail } from "../utils/emailTemplates.js";

// User: Submit seller application
export const submitApplication = async (req, res) => {
  try {
    const { businessName, businessType, businessAddress, phone, description, gstNumber } = req.body;

    if (!businessName || !businessType || !businessAddress || !phone || !description) {
      return res.status(400).json({ success: false, message: "All required fields must be filled" });
    }

    // Check if user already has a pending application
    const existing = await SellerApplication.findOne({
      user: req.user._id,
      status: "Pending",
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending application",
      });
    }

    // Check if user is already a seller
    if (req.user.role === "seller") {
      return res.status(400).json({
        success: false,
        message: "You are already a seller",
      });
    }

    const application = await SellerApplication.create({
      user: req.user._id,
      businessName,
      businessType,
      businessAddress,
      phone,
      description,
      gstNumber: gstNumber || "",
    });

    res.status(201).json({ success: true, application, message: "Application submitted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// User: Get my application status
export const getMyApplication = async (req, res) => {
  try {
    const applications = await SellerApplication.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all applications
export const getAllApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await SellerApplication.countDocuments(query);
    const applications = await SellerApplication.find(query)
      .populate("user", "name email avatar")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      applications,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Review application (approve/reject)
export const reviewApplication = async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be Approved or Rejected" });
    }

    const application = await SellerApplication.findById(req.params.id).populate("user", "name email");
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (application.status !== "Pending") {
      return res.status(400).json({ success: false, message: "Application already reviewed" });
    }

    application.status = status;
    application.adminNote = adminNote || "";
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    await application.save();

    // If approved, upgrade user role to seller
    if (status === "Approved") {
      await User.findByIdAndUpdate(application.user._id, { role: "seller" });
    }

    // Send email notification
    try {
      const { subject, html } = sellerApplicationStatusEmail(
        application.user.name,
        status,
        application.businessName,
        adminNote
      );
      await sendEmail(application.user.email, subject, html);
    } catch (emailErr) {
      console.error("Seller application email failed:", emailErr.message);
    }

    res.json({ success: true, application, message: `Application ${status.toLowerCase()}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
