# Referral System Backend

A robust Node.js backend service for managing course referrals, built with Express.js and Prisma ORM.

## 🚀 Features

- RESTful API endpoints for referral management
- Email notification system using Gmail SMTP
- User and referral statistics tracking
- MySQL database integration with Prisma ORM
- Input validation and error handling
- CORS support for frontend integration
- Environment-based configuration

## 🛠️ Tech Stack

- Node.js
- Express.js
- Prisma ORM
- MySQL
- Nodemailer
- CORS

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## ⚙️ Installation

1. Clone the repository:

```bash
git clone https://github.com/Manav-Chudasama/Accredian-backend-task.git
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.sample`:

```bash
cp .env.sample .env
```

4. Update the `.env` file with your configurations:

```env
DATABASE_URL="mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME"
SHADOW_DATABASE_URL="mysql://USERNAME:PASSWORD@HOST:PORT/SHADOW_DATABASE_NAME"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-specific-password"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
PORT=3000
```

5. Generate Prisma client:

```bash
npm run prisma:generate
```

6. Run database migrations:

```bash
npm run prisma:migrate
```

## 🚀 Running the Server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## 📚 API Documentation

### Referral Endpoints

#### Create Referral

- **POST** `/api/referrals`
- Creates a new referral and sends an email to the referee
- **Request Body:**

```json
{
  "referrer": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "referee": {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "course": "web-development"
  }
}
```

- **Response (201):**

```json
{
  "message": "Referral created successfully",
  "referralId": 1
}
```

- **Error Response (400):**

```json
{
  "error": "Missing required fields"
}
```

### Statistics Endpoints

#### Get User Statistics

- **GET** `/api/users/stats`
- Returns statistics about users in the system
- **Response (200):**

```json
{
  "totalUniqueUsers": 10,
  "uniqueReferrers": 5,
  "uniqueReferees": 7,
  "users": [
    {
      "email": "user@example.com",
      "name": "User Name",
      "type": "referrer"
    }
  ]
}
```

#### Get Referral Statistics

- **GET** `/api/referrals/stats`
- Returns statistics about referrals
- **Response (200):**

```json
{
  "emailsSent": 15
}
```

### Error Responses

All endpoints may return these error responses:

- **400 Bad Request:**

```json
{
  "error": "Error message describing the issue"
}
```

- **500 Internal Server Error:**

```json
{
  "error": "Something went wrong!",
  "details": "Detailed error message (only in development)"
}
```

## 🔒 Security

- Input validation for all endpoints
- Email format validation
- Environment-based error details
- CORS configuration
- Rate limiting (TODO)

## 📦 Database Schema

### Referral Table

```prisma
model Referral {
  id            Int      @id @default(autoincrement())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  referrerName  String   @db.VarChar(255)
  referrerEmail String   @db.VarChar(255)
  refereeName   String   @db.VarChar(255)
  refereeEmail  String   @db.VarChar(255)
  courseId      String   @db.VarChar(255)

  status        String   @default("PENDING") @db.VarChar(50)
  emailSent     Boolean  @default(false)

  @@index([referrerEmail])
  @@index([refereeEmail])
}
```

## 🚀 Deployment

### Vercel Deployment

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Login to Vercel:

```bash
vercel login
```

3. Deploy:

```bash
vercel
```

4. Set environment variables in Vercel dashboard

## 📝 Environment Variables

| Variable            | Description                          | Required |
| ------------------- | ------------------------------------ | -------- |
| DATABASE_URL        | MySQL connection URL                 | Yes      |
| SHADOW_DATABASE_URL | Shadow database URL for migrations   | Yes      |
| EMAIL_USER          | Gmail address for sending emails     | Yes      |
| EMAIL_PASSWORD      | Gmail app-specific password          | Yes      |
| FRONTEND_URL        | Frontend application URL             | Yes      |
| PORT                | Server port (default: 3000)          | No       |
| NODE_ENV            | Environment (development/production) | No       |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details
