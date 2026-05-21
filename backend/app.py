import os
import uuid
from datetime import timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)
from pymongo import MongoClient
from config import Config
from models import UserModel, ItemModel, calculate_match_score

app = Flask(__name__)
app.config.from_object(Config)
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)

CORS(app, origins=['http://localhost:5173'])
jwt = JWTManager(app)

# Database
client = MongoClient(app.config['MONGO_URI'])
db = client['lostfound']
user_model = UserModel(db)
item_model = ItemModel(db)

# Upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS


# ─── AUTH ROUTES ────────────────────────────────────────────

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        phone = data.get('phone', '').strip()

        if not name or not email or not password:
            return jsonify({'message': 'Name, email and password are required'}), 400

        if len(password) < 6:
            return jsonify({'message': 'Password must be at least 6 characters'}), 400

        if user_model.find_by_email(email):
            return jsonify({'message': 'Email already registered'}), 409

        user_id = user_model.create_user(name, email, password, phone)
        token = create_access_token(identity=user_id)

        return jsonify({
            'token': token,
            'user': {
                'id': user_id,
                'name': name,
                'email': email,
                'phone': phone
            }
        }), 201

    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400

        user = user_model.find_by_email(email)
        if not user:
            return jsonify({'message': 'Invalid email or password'}), 401

        if not user_model.verify_password(password, user['password']):
            return jsonify({'message': 'Invalid email or password'}), 401

        user_id = str(user['_id'])
        token = create_access_token(identity=user_id)

        return jsonify({
            'token': token,
            'user': {
                'id': user_id,
                'name': user['name'],
                'email': user['email'],
                'phone': user.get('phone', '')
            }
        }), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500


# ─── ITEM ROUTES ────────────────────────────────────────────

@app.route('/api/items', methods=['GET'])
def get_items():
    try:
        filters = {
            'item_type': request.args.get('item_type'),
            'category': request.args.get('category'),
            'status': request.args.get('status'),
            'search': request.args.get('search')
        }
        filters = {k: v for k, v in filters.items() if v}
        items = item_model.get_all_items(filters)
        serialized = [item_model.serialize(item) for item in items]
        return jsonify({'items': serialized}), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/api/items', methods=['POST'])
@jwt_required()
def create_item():
    try:
        user_id = get_jwt_identity()
        user = user_model.find_by_id(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        image_url = None
        if 'image' in request.files:
            file = request.files['image']
            if file and allowed_file(file.filename):
                ext = file.filename.rsplit('.', 1)[1].lower()
                filename = f"{uuid.uuid4().hex}.{ext}"
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                file.save(filepath)
                image_url = f"http://localhost:5000/uploads/{filename}"

        data = {
            'title': request.form.get('title'),
            'category': request.form.get('category'),
            'item_type': request.form.get('item_type'),
            'description': request.form.get('description'),
            'location': request.form.get('location'),
            'date_time': request.form.get('date_time'),
            'contact': request.form.get('contact'),
            'image_url': image_url,
            'posted_by': user_id,
            'posted_by_name': user['name']
        }

        if not all([data['title'], data['category'], data['item_type'],
                    data['description'], data['location'], data['contact']]):
            return jsonify({'message': 'All fields are required'}), 400

        item_id = item_model.create_item(data)

        # Find matches
        all_items = item_model.get_all_items()
        new_item = item_model.get_item_by_id(item_id)
        matches = []

        for existing in all_items:
            if str(existing['_id']) == item_id:
                continue
            score = calculate_match_score(new_item, existing)
            if score >= 0.3:
                matches.append({
                    'item_id': str(existing['_id']),
                    'title': existing['title'],
                    'description': existing['description'],
                    'location': existing['location'],
                    'contact': existing['contact'],
                    'item_type': existing['item_type'],
                    'score': score
                })

        matches.sort(key=lambda x: x['score'], reverse=True)
        if matches:
            item_model.update_matches(item_id, matches)

        return jsonify({
            'message': 'Item posted successfully',
            'item_id': item_id,
            'matches_found': len(matches)
        }), 201

    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/api/items/my-items', methods=['GET'])
@jwt_required()
def get_my_items():
    try:
        user_id = get_jwt_identity()
        items = item_model.get_items_by_user(user_id)
        serialized = [item_model.serialize(item) for item in items]
        return jsonify({'items': serialized}), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/api/items/<item_id>', methods=['DELETE'])
@jwt_required()
def delete_item(item_id):
    try:
        user_id = get_jwt_identity()
        item = item_model.get_item_by_id(item_id)

        if not item:
            return jsonify({'message': 'Item not found'}), 404

        if item['posted_by'] != user_id:
            return jsonify({'message': 'Unauthorized'}), 403

        item_model.delete_item(item_id)
        return jsonify({'message': 'Item deleted successfully'}), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/api/items/<item_id>/status', methods=['PATCH'])
@jwt_required()
def update_status(item_id):
    try:
        user_id = get_jwt_identity()
        item = item_model.get_item_by_id(item_id)

        if not item:
            return jsonify({'message': 'Item not found'}), 404

        if item['posted_by'] != user_id:
            return jsonify({'message': 'Unauthorized'}), 403

        data = request.get_json()
        status = data.get('status')

        if status not in ['Open', 'Matched', 'Claimed']:
            return jsonify({'message': 'Invalid status'}), 400

        item_model.update_status(item_id, status)
        return jsonify({'message': 'Status updated successfully'}), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500


# ─── SERVE UPLOADS ──────────────────────────────────────────

@app.route('/uploads/<filename>')
def serve_upload(filename):
    from flask import send_from_directory
    return send_from_directory(UPLOAD_FOLDER, filename)


# ─── HEALTH CHECK ───────────────────────────────────────────

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok', 'message': 'Lost and Found API running'}), 200


if __name__ == '__main__':
    app.run(debug=True, port=5000)