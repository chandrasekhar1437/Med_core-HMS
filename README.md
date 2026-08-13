# MedCore HMS — Hospital Operations & Management System

MedCore HMS is a comprehensive, full-stack Hospital Management System built using **FastAPI (Python)**, **React (Vite)**, and **MongoDB**. It provides streamlined workflows for hospital administration, doctor scheduling, patient records, billing, pharmacy inventory, and lab diagnostics.

---

## 🚀 Features & Modules

- **🔐 Authentication & Security:** Secure login/registration using JWT (JSON Web Tokens) and passlib/bcrypt password hashing.
- **👥 Role-Based Access Control (RBAC):** Custom permissions and interface views for Administrators, Doctors, Patients, and Staff.
- **📋 Patient Management:** Registration, profiles, and electronic health record (EHR) management.
- **👨‍⚕️ Doctor Management:** Profiles, department tracking, and specialization directories.
- **📅 Appointment Scheduling:** Real-time appointment booking and status updates.
- **📂 Medical Records:** Visit logs, clinical observations, and diagnosis history.
- **💊 Prescription Module:** E-prescriptions with dosage and frequency details.
- **🧪 Laboratory Module:** Test requests, tracking, and diagnostic report logs.
- **🏥 Pharmacy Module:** Medication inventory management and dispensing records.
- **💳 Billing Module:** Itemized invoice generation and payment status tracking.
- **⚙️ Settings Module:** Hospital profile management, administrator settings, and system preferences.

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, React Router DOM, Lucide Icons, Axios
- **Backend:** FastAPI, Python, Uvicorn, Pydantic
- **Database:** MongoDB (Motor async driver)

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB running locally or a MongoDB Atlas URI

---

### Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend

# MedCore HMS — Hospital Management System

MedCore HMS is a full-stack, role-based Healthcare Management System designed for hospital administration, physicians, nursing staff, and patients.

## 🚀 Live Demo
- **Frontend App**: [Your Render Frontend URL]
- **Backend API**: [Your FastAPI Render API URL]

## 🌟 Key Features
- **Role-Based Access Control (RBAC)**: Custom views and permissions for Admin, Doctor, Nurse, Staff, and Patient roles.
- **Ward & Bed Allocation**: Real-time bed tracking across ICU, General, Emergency, and Private suites with vital signs logging.
- **EHR & E-Prescriptions**: Complete digital health records and prescription management.
- **Billing & Financial Exports**: Invoice processing, UPI payments, and PDF/CSV statement generation.
- **Pharmacy & Laboratory**: Real-time inventory alerts and diagnostic test tracking.
- **Dark Theme Support**: Built-in system theme toggle with local storage persistence.

## 🛠 Tech Stack
- **Frontend**: React, React Router v6, Lucide React Icons, CSS Design Tokens
- **Backend**: FastAPI (Python)
- **Deployment**: Render / Vercel

## ⚙️ Local Setup
1. Clone the repository: `git clone https://github.com/your-username/Med-core_HMS.git`
2. Install frontend dependencies: `npm install`
3. Start development server: `npm run dev`
4

# MedCore HMS — Hospital Management System

MedCore HMS is a comprehensive, full-stack Healthcare Management System featuring role-based access control (RBAC), real-time inventory management, ward & bed allocation tracking, electronic health records (EHR), digital prescriptions, and automated financial billing.

---

## 🌟 Key Features

- **Role-Based Access Control (RBAC)**: Custom-tailored portals and dynamic sidebar navigation for **Admin**, **Doctor**, **Nurse**, **Staff**, and **Patient** roles.
- **Ward & Bed Allocation**: Real-time tracking across ICU, General Ward, Emergency, and Private Suites with patient vital signs logging.
- **EHR & Medical Records**: Digital diagnosis management, clinical treatment notes, and patient health histories.
- **Electronic Prescriptions (e-Rx)**: Digital medication orders with dosage instructions, refill tracking, and pharmacy fulfillment.
- **Pharmacy & Laboratory**: Stock level monitoring with low-inventory badges, category filtering, and diagnostic lab test tracking.
- **Billing & Financials**: Invoice processing, UPI payment verification, and downloadable PDF/CSV financial reports.
- **Dark Theme System**: Full CSS variable design token synchronization with local storage persistence.

---

## 🛠 Tech Stack

- **Frontend**: React, React Router v6, Lucide React, CSS Variables (Design Tokens)
- **Backend**: FastAPI (Python)
- **Authentication**: JWT-based session state (`AuthContext`)
- **Deployment**: Render

---

## 📋 Role Access Matrix

| Feature / Module | Admin | Doctor | Nurse & Staff | Patient |
| :--- | :---: | :---: | :---: | :---: |
| **Doctors Directory (`/doctors`)** | Full Control | View Directory | View Directory | View Directory |
| **Patient Registration (`/patients`)** | Register & Edit | View Directory | Register & Edit | View Profile |
| **Appointments (`/appointments`)** | Full Schedule | View Queue | Book & Schedule | Book / Reschedule |
| **Medical Records (`/medical-records`)** | View & Manage | Create & Edit EHR | Log Vitals / Notes | View Own Records |
| **Ward Management (`/ward-management`)** | Manage Beds | View Occupancy | Allocate & Log Vitals | Read Only |
| **Prescriptions (`/prescriptions`)** | View & Fulfill | Write E-Prescriptions | View & Fulfill | View Active Dosage |
| **Pharmacy (`/pharmacy`)** | Inventory Control | View Stock | Manage Stock | View Medicine List |
| **Laboratory (`/laboratory`)** | Order Management | Request Tests | Process Tests | View Lab Reports |
| **Billing & Invoices (`/billing`)** | Manage & Export | View Charges | Manage Invoices | Pay Invoices (UPI) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone [https://github.com/your-username/Med-core_HMS.git](https://github.com/your-username/Med-core_HMS.git)