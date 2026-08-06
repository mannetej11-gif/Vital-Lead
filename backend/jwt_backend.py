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
import os


app = Flask(__name__)

# ====== CONFIGURATION ======
app.config['JWT_SECRET_KEY'] = os.environ.get(
    'JWT_SECRET_KEY',
    'your-secret-key-change-this-in-production'
)
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(hours=24)
app.config['DEBUG'] = False

# Initialize extensions
jwt = JWTManager(app)
bcrypt = Bcrypt(app)

CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    supports_credentials=True
)
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

# Initialize database when app starts
init_db()

# ====== AUTHENTICATION ROUTES ======

@app.route('/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        if not data or not all(k in data for k in ['username', 'email', 'password']):
            return jsonify({'error': 'Missing required fields'}), 400

        username = data['username'].strip()
        email = data['email'].strip()
        password = data['password']
        full_name = data.get('full_name', username)

        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400

        password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

        conn = get_db()
        cursor = conn.cursor()

        try:
            cursor.execute(
                '''
                INSERT INTO users
                (username, email, password_hash, full_name, role)
                VALUES (?, ?, ?, ?, ?)
                ''',
                (username, email, password_hash, full_name, 'user')
            )

            conn.commit()

            return jsonify({
                'success': True,
                'message': 'User registered successfully',
                'user_id': cursor.lastrowid,
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
    try:
        data = request.get_json()

        if not data or not all(k in data for k in ['username', 'password']):
            return jsonify({'error': 'Missing username or password'}), 400

        username = data['username']
        password = data['password']

        conn = get_db()
        cursor = conn.cursor()

        cursor.execute(
            'SELECT * FROM users WHERE username = ?',
            (username,)
        )

        user = cursor.fetchone()

        if not user or not bcrypt.check_password_hash(
            user['password_hash'],
            password
        ):
            conn.close()
            return jsonify({'error': 'Invalid username or password'}), 401

        cursor.execute(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            (user['id'],)
        )

        conn.commit()
        conn.close()

        access_token = create_access_token(
            identity=str(user['id'])
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
    try:
        user_id = int(get_jwt_identity())

        conn = get_db()
        cursor = conn.cursor()

        cursor.execute(
            '''
            SELECT
                id,
                username,
                email,
                full_name,
                role,
                created_at
            FROM users
            WHERE id = ?
            ''',
            (user_id,)
        )

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
    try:
        user_id = get_jwt_identity()

        new_token = create_access_token(
            identity=user_id
        )

        return jsonify({
            'success': True,
            'access_token': new_token
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({
        'success': True,
        'message': 'Logged out successfully'
    }), 200

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Route not found'}), 404


@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# ====== HOME ROUTE ======

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'VitalLead API Running',
        'message': 'Backend is working successfully'
    }), 200


# ====== HEALTH CHECK ======

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'VitalLead JWT API is running'}), 200


# ====== RUN APP ======

if __name__ == '__main__':
    print("✅ VitalLead JWT Backend running")
    print("📚 API Routes:")
    print("   POST   /auth/register")
    print("   POST   /auth/login")
    print("   GET    /auth/profile")
    print("   POST   /auth/refresh")
    print("   POST   /auth/logout")

    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
