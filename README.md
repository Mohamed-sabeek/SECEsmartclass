# 🎓 SECE SmartClass — Integrated Academic Management Platform

SECE SmartClass is a professional, full-stack classroom management ecosystem designed to streamline institutional workflows, automate attendance tracking, and facilitate secure live virtual instruction. Built with a focus on **reliability, responsiveness, and academic integrity**, it provides a unified interface for administrators, faculty, and students.

---

## 🏛️ System Architecture & Workflow

The platform operates through three distinct entry points, each tailored to specific institutional roles:

*   **Administrator**: Manages the core institutional structure, including Departments, Classes (Batches), and Teacher-Subject mappings.
*   **Teacher**: Conducts live sessions, manages subject-specific rosters, and monitors real-time student engagement and attendance analytics.
*   **Student**: Accesses a personalized learning portal to join active sessions, track attendance history, and manage academic profiles.

---

## 🚀 Core Capabilities

### 1. Unified Academic Mapping
The system enforces a strict **Teacher → Class → Subject** relationship, ensuring that students only see the correct assigned faculty for their specific batch and academic year.

### 2. Automated Live Sessions
Integrates **Jitsi Meet API** for secure, high-fidelity video conferencing directly within the dashboard.
*   **Seamless Authentication**: Students join via secure JWT-authenticated bridges without requiring external session codes.
*   **Role-Based Access**: Automatic moderator privileges for faculty and participant roles for students.
*   **Session Persistence**: Advanced handling of browser refreshes to ensure active sessions remain connected for both parties.

### 3. Precision Attendance Tracking
*   **Event-Driven Logging**: Attendance is captured based on actual meeting join/leave events via the Jitsi API.
*   **Engagement Monitoring**: Tracks student tab visibility to provide insights into classroom participation.
*   **Analytical Reporting**: Generates automated attendance percentages and historical trends for institutional audits.
*   **Standardized Timezone Engine**: Enforces Indian Standard Time (IST - Asia/Kolkata) across all UI views and exports, eliminating UTC mismatches.
*   **Consolidated Section Normalization Engine**: Intelligently handles unspecified (`NONE`/`null`/`empty`) sections across students and session registries, guaranteeing seamless class-wide broadcast delivery.
*   **Premium Native Excel/PDF Exports**: One-click generation of beautifully formatted, autofitted Excel spreadsheets (via `exceljs`) and structured, high-fidelity PDF reports (via `pdfkit-table`) for institutional storage.

### 4. Interactive Student Roster Search
*   **Instant Search Pipeline**: Enables rapid filtering by student name or roll number with custom query highlighting.
*   **Clean Pagination & Counts**: Displays dynamically updated row index indices and total records count under active search.

### 5. Professional Design System
*   **Premium Dashboard UI**: A clean, modern interface utilizing a gold-and-white aesthetic for high readability.
*   **Full Responsiveness**: Optimized grid systems that adapt seamlessly from desktop administration to mobile participation.
*   **Accessibility**: Built with Headless UI to ensure high standards of interaction and consistency.

### 6. High-Performance Optimization Architecture
To ensure high scalability and sub-second response times even under heavy academic cohorts, the platform integrates a modern performance layer:
*   **Projection & Lean Querying**: Employs Mongoose `.select()` and `.lean()` to load only necessary fields, eliminating the overhead of full document hydration.
*   **Strategic Database Indexing**: Multi-field compound indexes on `Attendance` (`studentId`, `sessionId`), `Session` (`teacherId`, `classId`, `startTime`), and `Class` (`departmentId`, `year`) ensure index-covered scans for zero-latency reports.
*   **Backend Aggregated Analytics**: Aggregates calculation overhead (e.g. attendance ratios, counts, and averages) directly within server queries, offloading CPU-intensive loops from the client's browser.
*   **Server-Side Search & Pagination**: Enforces pagination (`page`, `limit`) and server-side debounced regex searching (`search`) to limit DOM nodes and network transport sizes to 6-10 rows per view.
*   **Lazy Loading & Suspense Shimmering**: Implements React `lazy` routing boundaries wrapped in custom shimmering skeleton layouts (`TableSkeleton`, `ProfileSkeleton`) to maximize initial paint speeds.
*   **Cloudinary Asset Pipeline**: Auto-transforms profile images on the fly via CDN parameters (`w_200,h_200,c_fill,q_auto,f_auto`) to achieve lightweight assets and microsecond rendering.

---

## 💻 Technical Stack

### **Frontend**
- **Framework**: React.js 19 (Vite)
- **Styling**: Tailwind CSS 3.4
- **Components**: Headless UI
- **Icons**: Lucide React
- **Analytics**: Recharts

### **Backend**
- **Environment**: Node.js & Express.js 5
- **Database**: MongoDB (via Mongoose ODM)
- **Spreadsheets & Reporting**: ExcelJS & PDFKit-Table
- **File Management**: Multer (Local/Transient)
- **Security**: JWT (JSON Web Tokens), Bcryptjs (Password Hashing)

### **Cloud Services**
- **Media**: Cloudinary (Image Hosting & CDN)
- **Communication**: Jitsi Meet API (Video Conferencing)
- **Notifications**: Resend API / Nodemailer (Email Alerts)

---

## 📸 Screenshots

| Login Interface | Teacher Dashboard |
| :---: | :---: |
| ![Login Interface](./README-assets/login.png) | ![Teacher Dashboard](./README-assets/teacher-dashboard.png) |

| Live Session Hub | Attendance Reports |
| :---: | :---: |
| ![Live Session](./README-assets/live-session.png) | ![Reports](./README-assets/report.png) |

---

## 🏁 Deployment

- **Frontend**: [https://sec-esmartclass.vercel.app/](https://sec-esmartclass.vercel.app/)
- **Backend API**: [https://sece-smartclass.onrender.com](https://sece-smartclass.onrender.com)

---

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- Cloudinary & Jitsi JaaS Credentials

### 2. Environment Configuration
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_backend_auth_secret

# Jitsi API Configuration
JITSI_APP_ID=your_jaas_app_id
JITSI_API_KEY_ID=your_api_key_id
JITSI_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Media Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Installation & Local Development
```bash
# Install all dependencies
cd server && npm install
cd ../client && npm install

# Run Backend (Port 5000)
cd server && npm run dev

# Run Frontend (Port 5173)
cd client && npm run dev
```
---
## 👨‍💻 Author

Developed by Mohamed Sabeek H  
SECE SmartClass Project — 2026

---

© 2026 SECE SmartClass. Dedicated to excellence in digital academic infrastructure.
