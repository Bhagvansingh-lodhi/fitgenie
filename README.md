FitGenie – AI Fitness & Meal Planner
<p align="center"> <img src="https://img.shields.io/badge/FitGenie-AI_Fitness_Coach-00C853?style=for-the-badge"/> <img src="https://img.shields.io/badge/MERN-Stack-47A248?style=for-the-badge"/> <img src="https://img.shields.io/badge/OpenAI-Integration-412991?style=for-the-badge"/> </p><p align="center"> <b>Your Personal AI-Powered Fitness & Nutrition Assistant</b><br/> Generate customized 7-day workout and meal plans with just a few clicks! </p><hr/>
🌟 Features
<table> <tr> <td width="50%"> <h3>🤖 AI Plan Generation</h3> <ul> <li>7-day personalized workout routines</li> <li>Custom meal plans with macros</li> <li>Auto-generated grocery lists</li> <li>Calorie & nutrition breakdown</li> </ul> </td> <td width="50%"> <h3>🔐 User Authentication</h3> <ul> <li>Secure JWT-based auth</li> <li>Password hashing with bcrypt</li> <li>Profile management</li> <li>Save multiple plans</li> </ul> </td> </tr> <tr> <td width="50%"> <h3>📱 Responsive Design</h3> <ul> <li>Works on all devices</li> <li>Smooth animations</li> <li>Clean UI/UX</li> <li>Real-time updates</li> </ul> </td> <td width="50%"> <h3>⚡ Fast Performance</h3> <ul> <li>Vite for frontend</li> <li>Optimized API calls</li> <li>Structured JSON responses</li> <li>Efficient state management</li> </ul> </td> </tr> </table><hr/>
🛠️ Tech Stack
Backend
├── Node.js + Express 5     - Server framework
├── MongoDB + Mongoose       - Database & ODM
├── JWT + bcryptjs          - Authentication
├── OpenAI API              - AI integration
├── CORS + dotenv           - Security
└── Morgan                  - Request logging

Frontend 
├── React 19                - UI library
├── Vite                    - Build tool
├── Tailwind CSS v4         - Styling
├── Framer Motion           - Animations
├── React Router v7         - Navigation
└── Axios                   - API calls
<hr/>
📁 Project Structure
FitGenie/
│
├── fitgenie-frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Route pages
│   │   ├── context/       # React context
│   │   └── utils/         # Helper functions
│   ├── public/            # Static assets
│   └── vite.config.js
│
└── fitgenie-backend/
    ├── controllers/       # Business logic
    ├── models/           # MongoDB schemas
    ├── routes/           # API endpoints
    ├── middleware/       # Auth middleware
    ├── utils/
    │   └── buildPlanPrompt.js  # AI prompt builder
    └── server.js
    <hr/>
👨‍💻 Author
Bhagvan Singh Lodhi

<table> <tr> <td>🎓</td> <td>Engineering Student</td> </tr> <tr> <td>💻</td> <td>MERN Stack Developer</td> </tr> <tr> <td>🤖</td> <td>AI Enthusiast</td> </tr> </table><hr/>
📄 License
This project is licensed under the ISC License.

<p align="center"> <b>Made with ❤️ by Bhagvan Singh Lodhi</b><br/> ⭐ Star this repo if you find it useful! </p>
