🧠 FitGenie – AI Fitness & Meal Planner

FitGenie is a full-stack AI-powered fitness and nutrition planner built using the MERN Stack + OpenAI.
It generates personalized 7-day workout and meal plans based on user profile data.

🚀 Tech Stack
🔵 Frontend (fitgenie-frontend)

React 19

Vite

Tailwind CSS v4

Framer Motion

React Router DOM v7

Axios

🟢 Backend (fitgenie-backend)

Node.js

Express 5

MongoDB

Mongoose

JWT Authentication

bcryptjs (password hashing)

CORS

Morgan (request logging)

dotenv

OpenAI API integration

📂 Project Structure
FitGenie/
│
├── fitgenie-frontend/
│   ├── src/
│   ├── public/
│   └── vite.config.js
│
└── fitgenie-backend/
    ├── controllers/
    ├── models/
    ├── routes/
    ├── utils/
    │   └── buildPlanPrompt.js
    └── server.js
🧠 AI Plan Generation

The backend uses a custom utility:

utils/buildPlanPrompt.js

It dynamically builds a structured AI prompt based on:

Age

Gender

Height & Weight

Activity Level

Fitness Goal

Diet Type

Allergies

Sleep & Wake Time

The AI strictly returns structured JSON:

{
  "workouts": [],
  "meals": [],
  "groceryList": []
}

This ensures clean parsing on the frontend.

🔐 Authentication Flow

User registers

Password is hashed using bcrypt

JWT token is generated

Protected routes verify token

User data stored in MongoDB

⚙️ Environment Variables

Create a .env file inside fitgenie-backend:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
🛠 Installation & Setup
1️⃣ Clone Repository
git clone https://github.com/yourusername/fitgenie.git
cd fitgenie
2️⃣ Backend Setup
cd fitgenie-backend
npm install
npm run dev
3️⃣ Frontend Setup

Open a new terminal:

cd fitgenie-frontend
npm install
npm run dev

Frontend runs on:

http://localhost:5173

Backend runs on:

http://localhost:5000
🎯 Core Features

AI-generated 7-day workout plan

AI-generated 7-day meal plan

Grocery list auto generation

Calorie & macro breakdown

JWT-based authentication

Secure password hashing

Responsive UI

Clean JSON AI responses

📌 Future Improvements

BMI auto-calculation

Progress tracking dashboard

Payment integration

Admin analytics panel

Workout video integration

PDF export of plans

👨‍💻 Author

Bhagvan singh lodhi
Engineering Student | MERN Stack Developer

📜 License

ISC License
