# 🏥 MediQueue — Smart Hospital Queue & Appointment System

> **Spring Boot 3 · React 18 · WebSocket · JWT · AI Wait-Time Prediction · PostgreSQL · Swagger**

A production-grade hospital queue management system featuring **real-time queue updates via WebSocket**, **AI-powered wait-time prediction**, **JWT-secured REST APIs**, and an **analytics dashboard** with live charts.

---

## 🤖 AI Feature — Wait-Time Predictor

The `WaitTimePredictorService` uses a **weighted moving-average model** to predict patient wait times dynamically:

```
predictedWait = baseDuration × loadFactor × timeOfDayWeight × dayOfWeekWeight × historicalCorrection
```

| Factor | Logic |
|--------|-------|
| **Load Factor** | +15% per patient currently in queue |
| **Time-of-Day** | Peak hours (9–11am, 2–4pm) → up to 1.4× |
| **Day-of-Week** | Monday/Friday → 1.3×, Sunday → 0.6× |
| **Historical Correction** | Self-corrects from last 7 days of actual vs predicted data |

When a patient **checks in**, the system re-runs the prediction and sends a personalised WebSocket alert:
> *"✅ You're checked in! Estimated wait: 8 mins — head to Cardiology"*

---

## ✨ Features

- 📅 **Appointment Booking** — Book with department, doctor, and time slot
- 🤖 **AI Wait Prediction** — Per-department dynamic wait time on every booking & check-in
- 📡 **Real-Time WebSocket** — Live queue updates via STOMP over SockJS
- 🔔 **Smart Alerts** — AI-triggered patient notifications on status changes
- 🔐 **JWT Auth** — Spring Security with role-based access (ADMIN / DOCTOR / RECEPTIONIST)
- 📊 **Analytics Dashboard** — Bar charts, pie charts, KPI cards (Recharts)
- 📖 **Swagger UI** — Full API docs at `/swagger-ui.html`
- 🐳 **Docker Ready** — `docker-compose up` for instant local setup

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.2, Spring Security, Spring Data JPA |
| Real-Time | Spring WebSocket (STOMP + SockJS) |
| Auth | JWT (jjwt 0.11), BCrypt |
| AI | Custom weighted moving-average predictor (WaitTimePredictorService) |
| Database | PostgreSQL 15 |
| Frontend | React 18, React Router 6, Tailwind CSS |
| Charts | Recharts |
| API Docs | SpringDoc OpenAPI 3 (Swagger UI) |

---

## 🚀 Getting Started

### Prerequisites
- Java 17+, Maven 3.8+
- Node.js 18+
- PostgreSQL 15

### Backend
```bash
cd backend
# Update DB credentials in src/main/resources/application.yml
mvn spring-boot:run
# API running at http://localhost:8080
# Swagger UI at http://localhost:8080/swagger-ui.html
```

### Frontend
```bash
cd frontend
npm install
npm start
# App running at http://localhost:3000
```

### With Docker Compose
```bash
docker-compose up --build
```

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register staff user |
| POST | `/api/auth/login` | Login → JWT token |
| POST | `/api/appointments` | Book appointment (AI predicts wait) |
| GET  | `/api/appointments` | Get all appointments |
| GET  | `/api/appointments/department/{dept}` | Queue by department |
| PATCH| `/api/appointments/{id}/status` | Update status → triggers WebSocket |

### WebSocket Channels
```
SUBSCRIBE /topic/queue/{department}   → Live queue updates
SUBSCRIBE /user/queue/alerts          → Personal AI alerts
```

---

## 🏗 Project Structure

```
hospital-queue-system/
├── backend/
│   ├── src/main/java/com/hospital/queue/
│   │   ├── config/         # Security, WebSocket, AppConfig
│   │   ├── controller/     # REST controllers (Auth, Appointment)
│   │   ├── dto/            # Request/Response DTOs
│   │   ├── model/          # JPA entities (User, Patient, Appointment)
│   │   ├── repository/     # Spring Data JPA repositories
│   │   ├── security/       # JwtService, JwtAuthFilter
│   │   ├── service/        # AppointmentService, WaitTimePredictorService
│   │   └── websocket/      # QueueNotificationService
│   └── pom.xml
├── frontend/
│   └── src/
│       ├── context/        # AuthContext
│       ├── hooks/          # useQueueSocket (WebSocket)
│       ├── pages/          # Login, Dashboard
│       └── services/       # API layer (axios)
└── README.md
```

---

## 👨‍💻 Author

**Mohamed Rifnas** — Full Stack & AI Engineer  
[github.com/ribnuu](https://github.com/ribnuu) · [linkedin.com/in/mohamed-rifnas-dev](https://linkedin.com/in/mohamed-rifnas-dev)
