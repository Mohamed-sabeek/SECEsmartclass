# 🎓 SECE SmartClass — Advanced Academic Orchestration

SECE SmartClass is a premium, real-time classroom management system designed to bridge the gap between physical instruction and digital presence. Built with a "Stripe-style" gold-and-white aesthetic, it provides a seamless experience for administrators, faculty, and students to manage academic cycles with millisecond precision.

---

## 🚀 Key Innovations

### 1. Real-Time Virtual Broadcasts
The core of SECE SmartClass is its **Automated Live Session Hub**, which integrates **Jitsi JaaS (8x8.vc)** for high-fidelity video conferencing.
*   **Zero-Code Entry**: Students join via a secure JWT-authenticated bridge—no session codes required.
*   **Role-Based Access**: System dynamically signs tokens for faculty (**Moderators**) and students (**Participants**).
*   **Automated Attendance**: Presence is synchronized the moment a student enters the secure video channel.

### 2. Cloudinary-Powered Profile Management
A production-ready identity system for faculty and students.
*   **Scalable Storage**: Profile images are offloaded to **Cloudinary**, ensuring fast delivery via CDN.
*   **Automatic Overwrite**: New uploads replace old versions using the same `public_id`, keeping storage clean.
*   **Intelligent Fallbacks**: Implements a robust local fallback system (`default-avatar.jpg`) for users without custom photos.

---

## 🛠 Features by Persona

### 👨‍🏫 Faculty Dashboard
*   **Session Command Center**: Start and manage live video broadcasts directly within the portal.
*   **Profile Personalization**: Update identity details and profile photos with instant Cloudinary sync.
*   **Batch Intelligence**: View assigned classes, student rosters, and real-time attendance percentages.
*   **Historical Analytics**: Access detailed reports of past sessions and attendance trends.

### 🎓 Student Dashboard
*   **Academic Archives**: Enhanced history view with real-time sync status (Present/Absent) and class metadata.
*   **Profile Customization**: Modernized profile page with optional photo upload and "Edit Mode" state.
*   **Participation Tracking**: View personal attendance stats and percentage across all subjects.
*   **Direct Join**: One-click access to live video classes with automatic presence logging.

### 🔒 Administrator Portal
*   **Directory Management**: Full CRUD controls for Students and Teachers with unified identity viewing.
*   **Departmental Control**: Manage Departments, Classes (Batches), and Faculty assignments.
*   **Unified Monitoring**: Overlook the entire institution's academic activity from a single pane of glass.

---

## 💻 Tech Stack
*   **Frontend**: React.js, Tailwind CSS, **Headless UI**, Lucide Icons, Vite.
*   **Backend**: Node.js, Express.js, **Multer** (Transient storage).
*   **Cloud Services**: **Cloudinary** (Image CDN), Jitsi JaaS (Video).
*   **Database**: MongoDB (Mongoose ODM).
*   **Security**: JWT (JSON Web Tokens), RS256 Asymmetric Encryption.

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
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 4. Running the Project
```powershell
# Start Backend (from server directory)
npm run dev

# Start Frontend (from client directory)
npm run dev
```

---

## 📂 Project Structure
```
sece-smartclass/
├── client/              # React + Vite Frontend
│   ├── src/components/  # Dashboard Modules & UI components
│   ├── src/pages/       # Unified Layouts (Student/Teacher/Admin)
│   └── src/assets/      # Static fallbacks and branding
├── server/              # Express Backend
│   ├── src/models/      # Mongoose Schemas (Session, User, Attendance)
│   ├── src/controllers/ # API Logic (Profile, Sessions, Auth)
│   ├── src/config/      # Cloudinary & DB configurations
│   └── src/middleware/  # Auth & File Upload (Multer) logic
└── .gitignore           # Hardened security rules (ignores .env, uploads, temp)
```

---

© 2026 SECE SmartClass. Powering the next generation of academic excellence.
