# 🎓 SECE SmartClass — Advanced Academic Orchestration

SECE SmartClass is a premium, real-time classroom management system designed to bridge the gap between physical instruction and digital presence. Featuring a **futuristic, mobile-first interface**, it provides a seamless experience for administrators, faculty, and students to manage academic cycles with millisecond precision.

---

## 🚀 Key Innovations

### 1. Futuristic UI/UX Modernization
The platform has undergone a full visual overhaul, adopting a **high-end, glassmorphic aesthetic**.
*   **Identity Verification Hub**: A redesigned, split-pane login interface for secure and intuitive entry.
*   **Command Center Dashboards**: Role-specific portals for Students, Teachers, and Admins with vibrant metrics and real-time status tracking.
*   **Premium Iconography**: Integrated `lucide-react` for a sharp, modern visual language.

### 2. Mobile-First Responsive Architecture
Engineered for the modern campus, the entire platform is now **fully responsive**.
*   **Adaptive Grid Systems**: Dashboards automatically transition from complex desktop layouts to streamlined, touch-optimized mobile views.
*   **Locked-in Mobile Experience**: Critical management pages (Departments, Roster, Reports) are precision-aligned to eliminate horizontal overflow and ensure seamless administrative control on any device.

### 3. Real-Time Virtual Broadcasts
The core of SECE SmartClass is its **Automated Live Session Hub**, which integrates **Jitsi JaaS (8x8.vc)** for high-fidelity video conferencing.
*   **Zero-Code Entry**: Students join via a secure JWT-authenticated bridge—no session codes required.
*   **Role-Based Access**: System dynamically signs tokens for faculty (**Moderators**) and students (**Participants**).
*   **Automated Attendance**: Presence is synchronized the moment a student enters the secure video channel.

---

## 🛠 Features by Persona

### 👨‍🏫 Faculty Dashboard
*   **Session Command Center**: Start and manage live video broadcasts directly within the portal.
*   **Attendance Tracking 2.0**: Searchable rosters with deep academic mapping (Department, Batch, and Section).
*   **Precision Audit Logs**: View expanded student engagement data, including **Tab Visibility (Engagement Monitoring)** and join/leave timestamps.
*   **Historical Archives**: Access detailed reports of past sessions and exportable attendance trends (CSV/PDF).

### 🎓 Student Dashboard
*   **Academic Command Center**: View personal attendance stats and percentage across all subjects with futuristic progress tracking.
*   **My Teachers Section**: Intelligent academic mapping displaying assigned faculty by Department and Batch/Section.
*   **Profile Security**: Modernized profile management with secure Cloudinary-powered photo uploads and a resilient password reset flow.
*   **Sync Status**: Real-time presence verification during live broadcasts.

### 🔒 Administrator Portal
*   **Institutional Mapping**: Full CRUD controls for Departments, Classes (Batches), and Faculty assignments with unified administrative viewing.
*   **User Directory**: Unified identity management for the entire campus population.
*   **Responsive Management**: Mobile-optimized administrative tables for managing academic units on the go.

---

## 💻 Tech Stack
*   **Frontend**: React.js (Vite), Tailwind CSS, Headless UI, Lucide Icons.
*   **Backend**: Node.js, Express.js, Multer (Transient storage).
*   **Cloud Services**: **Cloudinary** (Image CDN), **Jitsi JaaS** (Video).
*   **Database**: MongoDB (Mongoose ODM).
*   **Security**: JWT (JSON Web Tokens), RS256 Asymmetric Encryption, Bcrypt Password Hashing.

---

## 🏁 Getting Started

### 1. Prerequisites
*   Node.js (v18+)
*   MongoDB Atlas Account
*   Jitsi JaaS Account & Cloudinary Account

### 2. Environment Setup
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_backend_auth_secret

# Jitsi JaaS (8x8.vc)
JITSI_APP_ID=your_jaas_app_id
JITSI_API_KEY_ID=your_api_key_id
JITSI_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Installation
```powershell
# Install Dependencies
cd server; npm install
cd ../client; npm install
```

### 4. Running the Project
```powershell
# Start Backend
cd server; npm run dev

# Start Frontend
cd client; npm run dev
```

---

© 2026 SECE SmartClass. Powering the next generation of academic excellence.
