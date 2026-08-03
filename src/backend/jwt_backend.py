"""
VitalLead JWT Authentication Backend
Secure user registration & login with Flask + JWT + SQLite
"""

from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import sqlite3
import datetime
from functools import wraps

app = Flask(__name__)

# ====== CONFIGURATION ======
app.config['JWT_SECRET_KEY'] = 'your-secret-key-change-this-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(hours=24)
app.config['DEBUG'] = True

# Initialize extensions
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
CORS(app)

# ====== DATABASE SETUP ======
DATABASE = 'vitallead_users.db'

def init_db():
    """Initialize SQLite database"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT,
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def get_db():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# ====== AUTHENTICATION ROUTES ======

@app.route('/auth/register', methods=['POST'])
def register():
    """
    Register a new user
    
    Request:
    {
        "username": "manne",
        "email": "manne@example.com",
        "password": "secure_password",
        "full_name": "Manne Sai Teja"
    }
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data or not all(k in data for k in ['username', 'email', 'password']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        username = data['username'].strip()
        email = data['email'].strip()
        password = data['password']
        full_name = data.get('full_name', username)
        
        # Validate password strength
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        # Hash password
        password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        
        # Insert into database
        conn = get_db()
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                'INSERT INTO users (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
                (username, email, password_hash, full_name, 'user')
            )
            conn.commit()
            user_id = cursor.lastrowid
            
            return jsonify({
                'success': True,
                'message': 'User registered successfully',
                'user_id': user_id,
                'username': username
            }), 201
            
        except sqlite3.IntegrityError:
            return jsonify({'error': 'Username or email already exists'}), 409
        finally:
            conn.close()
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/auth/login', methods=['POST'])
def login():
    """
    Login and get JWT token
    
    Request:
    {
        "username": "manne",
        "password": "secure_password"
    }
    
    Response:
    {
        "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "user": {
            "id": 1,
            "username": "manne",
            "email": "manne@example.com",
            "full_name": "Manne Sai Teja"
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ['username', 'password']):
            return jsonify({'error': 'Missing username or password'}), 400
        
        username = data['username']
        password = data['password']
        
        # Find user in database
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()
        
        if not user or not bcrypt.check_password_hash(user['password_hash'], password):
            conn.close()
            return jsonify({'error': 'Invalid username or password'}), 401
        
        # Update last login
        cursor.execute(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            (user['id'],)
        )
        conn.commit()
        conn.close()
        
        # Generate JWT token
        access_token = create_access_token(
            identity={
                'user_id': user['id'],
                'username': user['username'],
                'role': user['role']
            }
        )
        
        return jsonify({
            'success': True,
            'access_token': access_token,
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'full_name': user['full_name'],
                'role': user['role']
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/auth/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile (protected route)"""
    try:
        current_user = get_jwt_identity()
        
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT id, username, email, full_name, role, created_at FROM users WHERE id = ?', 
                      (current_user['user_id'],))
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'id': user['id'],
            'username': user['username'],
            'email': user['email'],
            'full_name': user['full_name'],
            'role': user['role'],
            'created_at': user['created_at']
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/auth/refresh', methods=['POST'])
@jwt_required()
def refresh_token():
    """Refresh JWT token"""
    try:
        current_user = get_jwt_identity()
        new_token = create_access_token(identity=current_user)
        
        return jsonify({
            'success': True,
            'access_token': new_token
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user (invalidate token on client side)"""
    return jsonify({
        'success': True,
        'message': 'Logged out successfully'
    }), 200


# ====== ERROR HANDLERS ======

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Route not found'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Internal server error'}), 500


# ====== HEALTH CHECK ======

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'VitalLead JWT API is running'}), 200


# ====== RUN APP ======

if __name__ == '__main__':
    init_db()
    print("✅ VitalLead JWT Backend running on http://localhost:5000")
    print("📚 API Routes:")
    print("   POST   /auth/register  - Register new user")
    print("   POST   /auth/login     - Login & get JWT token")
    print("   GET    /auth/profile   - Get user profile (requires token)")
    print("   POST   /auth/refresh   - Refresh JWT token")
    print("   POST   /auth/logout    - Logout user")
    app.run(debug=True, port=5000)
