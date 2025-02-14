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
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Course Referral</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: #f9fafb;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .header {
                text-align: center;
                padding: 20px 0;
                background: linear-gradient(to right, #7c3aed, #2563eb);
                color: white;
                border-radius: 8px 8px 0 0;
                margin: -20px -20px 20px -20px;
              }
              .content {
                padding: 20px;
              }
              .cta-button {
                display: inline-block;
                padding: 12px 24px;
                background: linear-gradient(to right, #7c3aed, #2563eb);
                color: white;
                text-decoration: none;
                border-radius: 25px;
                font-weight: bold;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 0.875rem;
              }
              .highlight {
                color: #7c3aed;
                font-weight: bold;
              }
              .discount-badge {
                background-color: #fee2e2;
                color: #dc2626;
                padding: 4px 12px;
                border-radius: 15px;
                font-size: 0.875rem;
                font-weight: bold;
                display: inline-block;
                margin: 10px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Special Course Invitation!</h1>
              </div>
              <div class="content">
                <h2>Hello ${referee.name}! 👋</h2>
                
                <p>Great news! <span class="highlight">${
                  referrer.name
                }</span> thinks you'd be interested in our amazing courses.</p>
                
                <div style="text-align: center;">
                  <span class="discount-badge">Special 20% OFF for referred friends!</span>
                </div>
                
                <p>You've been referred to our <span class="highlight">${
                  referee.course
                }</span> course. Here's what you'll get:</p>
                
                <ul>
                  <li>🎯 Industry-relevant curriculum</li>
                  <li>👨‍🏫 Expert instructors</li>
                  <li>🎖️ Certification upon completion</li>
                  <li>💰 Special referral discount</li>
                </ul>
                
                <div style="text-align: center; color: #ffffff;">
                  <a style="color: #ffffff; text-decoration: none;" href="${
                    process.env.FRONTEND_URL
                  }
      }" class="cta-button">
                    Start Learning Now
                  </a>
                </div>
                
                <p style="font-size: 0.875rem; color: #ffffff;">
                  This special offer is exclusive to referred friends and expires in 7 days.
                </p>
              </div>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} Accredian. All rights reserved.</p>
                <p>
                  Questions? Email us at 
                  <a href="mailto:support@accredian.com" style="color: #7c3aed;">support@accredian.com</a>
                </p>
              </div>
            </div>
          </body>
        </html>
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

app.get("/", async (req, res) => {
  res.send("Hello World");
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
