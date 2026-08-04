# Vital-lead - Unified Healthcare & CRM Platform

**All-in-One application combining Healthcare CRM, Sales CRM, and JWT Authentication.**

## 🎯 Features

✅ **Healthcare CRM (VitalLead)**
- Patient database management (140+ patients)
- AI-powered patient scoring algorithm (0-100)
- Priority-based classification (Critical/High/Moderate/Routine)
- Clinical condition analytics

✅ **Sales CRM (CRM Hub)**
- Lead management system
- Conversation intelligence
- Sentiment analysis (Positive/Neutral/Negative)
- Status tracking & pipelines

✅ **JWT Authentication**
- Secure user registration & login
- Bcrypt password hashing
- Token-based access control
- Protected API endpoints

✅ **Analytics Dashboard**
- Patient priority distribution
- Lead sentiment analysis
- Real-time charts & visualizations
- Cross-module insights

---

## 📊 Project Statistics

| Component | Lines | Technology |
|-----------|-------|-----------|
| Backend | 279 | Flask + SQLite + JWT |
| Frontend | 495 | React + Recharts + Tailwind |
| **Total** | **774** | **Production Ready** |

---

## 📁 Folder Structure

```
VitalHub/
├── backend/
│   ├── jwt_backend.py           (Main Flask app)
│   ├── requirements.txt          (Python dependencies)
│   ├── .env.example             (Environment variables template)
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              (Main React component)
│   │   ├── main.jsx             (React entry point)
│   │   └── index.css            (Global styles)
│   ├── public/
│   ├── index.html               (HTML entry point)
│   ├── package.json             (Dependencies)
│   ├── vite.config.js           (Vite config)
│   ├── .env.example             (Environment variables template)
│   └── .gitignore
│
├── docs/
│   └── SETUP.md                 (Detailed setup guide)
│
├── .gitignore                   (Root .gitignore)
└── README.md                    (This file)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- Python >= 3.8
- npm >= 8.0.0

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate venv
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Run Flask server
python jwt_backend.py
```

✅ Backend runs on: `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run development server
npm run dev
```

✅ Frontend runs on: `http://localhost:5173`

---

## 🧪 Testing

### Demo Credentials
```
Username: manne
Password: password123
```

### Test Flow
1. Navigate to `http://localhost:5173`
2. Register or login with demo credentials
3. Access Dashboard
4. Navigate to VitalLead (Healthcare CRM)
5. Navigate to CRM Hub (Sales CRM)
6. View Analytics
7. Logout

---

## 🔐 API Endpoints

### Public Endpoints
```
POST   /auth/register   - Register new user
POST   /auth/login      - Login & get JWT token
GET    /health          - Health check
```

### Protected Endpoints
```
GET    /auth/profile    - Get user profile (requires token)
POST   /auth/refresh    - Refresh JWT token (requires token)
POST   /auth/logout     - Logout user (requires token)
```

---

## 🔒 Security Features

✅ **Password Hashing**
- Bcrypt hashing with 10 salt rounds
- No plain text passwords

✅ **JWT Token**
- 24-hour token expiration
- Secret key signed
- Stateless authentication

✅ **CORS Protection**
- Origin validation
- Credentials handling

✅ **Protected Routes**
- @jwt_required() decorator
- Token validation on all protected endpoints

✅ **Input Validation**
- Password requirements (6+ characters)
- Email validation
- Username uniqueness

---

## 📦 Build for Production

### Frontend Build
```bash
cd frontend
npm run build
```

This creates an optimized `dist/` folder ready for deployment.

---

## 🌐 Deployment

### Frontend (Vercel)
```bash
1. Push to GitHub
2. Connect repo to Vercel
3. Deploy (automatic)
```

### Backend (Railway)
```bash
1. Push to GitHub
2. Connect repo to Railway
3. Set environment variables
4. Deploy (automatic)
```

See `docs/SETUP.md` for detailed deployment instructions.

---

## 📝 Environment Variables

### Backend (.env)
```
FLASK_ENV=production
JWT_SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///vitallead_users.db
SERVER_PORT=5000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Flask 2.3.2
- **Authentication:** Flask-JWT-Extended 4.4.4
- **Password Hashing:** Flask-Bcrypt 1.0.1
- **Database:** SQLite
- **CORS:** Flask-CORS 4.0.0

### Frontend
- **Framework:** React 18.2.0
- **Build Tool:** Vite 5.0.8
- **Charts:** Recharts 2.10.0
- **Icons:** Lucide-react 0.294.0
- **Styling:** Inline styles + Tailwind CSS concepts

---

## 🎯 Demo Modules

### 1. Dashboard
- Welcome message
- Quick statistics
- Module overview
- System health

### 2. VitalLead (Healthcare CRM)
- Patient list with filtering
- AI-powered scoring (0-100)
- Priority classification
- Clinical analytics

### 3. CRM Hub (Sales CRM)
- Lead management
- Conversation tracking
- Sentiment analysis
- Status pipelines

### 4. Analytics
- Visual dashboards
- Charts and graphs
- Patient priority distribution
- Lead sentiment breakdown

---

## 📚 Documentation

See `docs/SETUP.md` for:
- Detailed setup instructions
- API endpoint examples
- Testing procedures
- Production deployment
- Troubleshooting guide

---

## 🐛 Troubleshooting

### Backend issues
```bash
# Clear Python cache
rm -rf __pycache__
rm -rf .pytest_cache

# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

### Frontend issues
```bash
# Clear node modules
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm cache clean --force
```

### Port conflicts
- Frontend: Change port in `vite.config.js`
- Backend: Change port in `jwt_backend.py`

---

## 📊 Performance Metrics

- **Backend Response Time:** < 100ms
- **Frontend Load Time:** < 2s
- **Database Queries:** Optimized
- **Bundle Size:** < 300KB (gzipped)

---

## 🔄 Git Workflow

```bash
# Clone repo
git clone https://github.com/mannetej11-gif/VitalHub.git
cd VitalHub

# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to GitHub
git push origin feature/your-feature

# Create Pull Request
```

---

## 📄 License

MIT License - Feel free to use for personal and commercial projects.

---

## 👨‍💻 Author

**Manne Sai Teja**
- GitHub: [@mannetej11-gif](https://github.com/mannetej11-gif)
- Email: manne@example.com
- Internship: Infosys Springboard 7.0

---

## 🙏 Acknowledgments

- Mentor: Saranya (Infosys)
- Vardhaman College of Engineering
- Open source community

---

## 📞 Support

For issues or questions:
1. Check `docs/SETUP.md`
2. Review troubleshooting section
3. Check GitHub issues
4. Contact maintainer

---

**VitalHub - Building Tomorrow's Healthcare Solutions Today** 🏥💼
