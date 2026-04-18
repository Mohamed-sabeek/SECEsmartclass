# 🎓 SECE SmartClass — Advanced Academic Orchestration

SECE SmartClass is a premium, real-time classroom management system designed to bridge the gap between physical instruction and digital presence. Built with a "Stripe-style" gold-and-white aesthetic, it provides a seamless experience for administrators, faculty, and students to manage academic cycles with millisecond precision.

---

## 🚀 Key Innovation: Real-Time Virtual Broadcasts
The core of SECE SmartClass is its **Automated Live Session Hub**, which integrates **Jitsi JaaS (8x8.vc)** for high-fidelity video conferencing.

*   **Zero-Code Entry**: Students are automatically notified of live broadcasts and join via a secure JWT-authenticated bridge—no session codes or manual entry required.
*   **Role-Based Access (JWT)**: The system dynamically signs tokens to enforce classroom hierarchies. Faculty join as **Moderators** (admin controls), while students join as **Participants**.
*   **Automated Attendance**: Presence is synchronized the moment a student enters the secure video channel, eliminating manual roll calls.

---

## 🛠 Features by Persona

### 👨‍🏫 Faculty Dashboard
*   **Session Command Center**: Start and manage live video broadcasts directly within the portal.
*   **Batch Intelligence**: View assigned classes, student rosters, and real-time attendance percentages.
*   **Historical Analytics**: Access detailed reports of past sessions and attendance trends.
*   **Integrated Meeting Controls**: Moderate video sessions (mute, kick, record) through the secure JaaS bridge.

### 🎓 Student Dashboard
*   **Broadcast Synchronization**: Automatically detect live classes intended for your specific batch.
*   **Participation Tracking**: View personal attendance stats and percentage across all subjects.
*   **Direct Join**: One-click access to live video classes with automatic presence logging.

### 🔒 Administrator Portal
*   **Departmental Control**: Manage Departments, Classes (Batches), and Faculty assignments.
*   **Unified Monitoring**: Overlook the entire institution's academic activity from a single pane of glass.
*   **Identity Management**: Securely manage user roles and authentication.

---

## 💻 Tech Stack
*   **Frontend**: React.js, Tailwind CSS, Lucide Icons, Vite (Build Tool).
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB (Mongoose ODM).
*   **Security**: JSON Web Tokens (JWT), RS256 Asymmetric Encryption for Jitsi.
*   **Video**: Jitsi JaaS (8x8.vc).

---

## 🏁 Getting Started

### 1. Prerequisites
*   Node.js (v18+)
*   MongoDB Atlas Account
*   Jitsi JaaS (8x8.vc) Account & Private Key

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
│   ├── src/components/  # Dashboard Modules
│   └── src/pages/       # Unified Layouts
├── server/              # Express Backend
│   ├── src/models/      # Mongoose Schemas (Session, User, Attendance)
│   ├── src/controllers/ # API Logic
│   └── src/routes/      # Endpoint Definitions
└── .gitignore           # Root Security Rules
```

---

© 2024 SECE SmartClass. Powering the next generation of academic excellence.
