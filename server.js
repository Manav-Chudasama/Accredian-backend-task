//express server template
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Validation middleware
const validateReferralData = (req, res, next) => {
  const { referrer, referee } = req.body;

  if (
    !referrer?.name ||
    !referrer?.email ||
    !referee?.name ||
    !referee?.email ||
    !referee?.course
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(referrer.email) || !emailRegex.test(referee.email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  next();
};

// API Routes
app.post("/api/referrals", validateReferralData, async (req, res) => {
  try {
    const { referrer, referee } = req.body;

    // Create referral record
    const referral = await prisma.referral.create({
      data: {
        referrerName: referrer.name,
        referrerEmail: referrer.email,
        refereeName: referee.name,
        refereeEmail: referee.email,
        courseId: referee.course,
      },
    });

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: referee.email,
      subject: `${referrer.name} has referred you to a course!`,
      html: `
        <h1>Hello ${referee.name}!</h1>
        <p>${referrer.name} thinks you'd be interested in our courses.</p>
        <p>You've been referred to: ${referee.course}</p>
        <p>Click the link below to get started with a special discount:</p>
        <a href="${process.env.FRONTEND_URL}/signup?ref=${referral.id}">
          Start Learning Now
        </a>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Update referral status
    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        emailSent: true,
        status: "SENT",
      },
    });

    res.status(201).json({
      message: "Referral created successfully",
      referralId: referral.id,
    });
  } catch (error) {
    console.error("Referral error:", error);
    res.status(500).json({
      error: "Failed to process referral",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get all unique users and count
app.get("/api/users/stats", async (req, res) => {
  try {
    // Get unique referees
    const uniqueReferees = await prisma.referral.findMany({
      select: {
        refereeEmail: true,
        refereeName: true,
      },
      distinct: ["refereeEmail"],
    });

    // Get unique referrers
    const uniqueReferrers = await prisma.referral.findMany({
      select: {
        referrerEmail: true,
        referrerName: true,
      },
      distinct: ["referrerEmail"],
    });

    // Combine unique users (both referrers and referees)
    const allUsers = new Map();

    // Add referrers to the map
    uniqueReferrers.forEach((referrer) => {
      allUsers.set(referrer.referrerEmail, {
        email: referrer.referrerEmail,
        name: referrer.referrerName,
        type: "referrer",
      });
    });

    // Add referees to the map
    uniqueReferees.forEach((referee) => {
      if (!allUsers.has(referee.refereeEmail)) {
        allUsers.set(referee.refereeEmail, {
          email: referee.refereeEmail,
          name: referee.refereeName,
          type: "referee",
        });
      }
    });

    // Convert map to array
    const uniqueUsers = Array.from(allUsers.values());

    res.json({
      totalUniqueUsers: uniqueUsers.length,
      uniqueReferrers: uniqueReferrers.length,
      uniqueReferees: uniqueReferees.length,
      users: uniqueUsers,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({
      error: "Failed to fetch user statistics",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get referral statistics
app.get("/api/referrals/stats", async (req, res) => {
  try {
    const emailsSent = await prisma.referral.count({
      where: {
        status: "SENT",
      },
    });

    res.json({
      emailsSent,
    });
  } catch (error) {
    console.error("Error fetching referral stats:", error);
    res.status(500).json({
      error: "Failed to fetch referral statistics",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
