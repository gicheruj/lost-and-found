from datetime import datetime, timezone
from bson import ObjectId
import bcrypt


class UserModel:
    def __init__(self, db):
        self.collection = db['users']

    def create_user(self, name, email, password, phone=''):
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        user = {
            'name': name,
            'email': email,
            'phone': phone,
            'password': hashed,
            'created_at': datetime.now(timezone.utc)
        }
        result = self.collection.insert_one(user)
        return str(result.inserted_id)

    def find_by_email(self, email):
        return self.collection.find_one({'email': email})

    def find_by_id(self, user_id):
        return self.collection.find_one({'_id': ObjectId(user_id)})

    def verify_password(self, plain_password, hashed_password):
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password)


class ItemModel:
    def __init__(self, db):
        self.collection = db['items']

    def create_item(self, data):
        item = {
            'title': data.get('title'),
            'category': data.get('category'),
            'item_type': data.get('item_type'),
            'description': data.get('description'),
            'location': data.get('location'),
            'date_time': data.get('date_time'),
            'contact': data.get('contact'),
            'image_url': data.get('image_url', None),
            'status': 'Open',
            'posted_by': data.get('posted_by'),
            'posted_by_name': data.get('posted_by_name'),
            'matches': [],
            'created_at': datetime.now(timezone.utc)
        }
        result = self.collection.insert_one(item)
        return str(result.inserted_id)

    def get_all_items(self, filters=None):
        query = {}
        if filters:
            if filters.get('item_type'):
                query['item_type'] = filters['item_type']
            if filters.get('category'):
                query['category'] = filters['category']
            if filters.get('status'):
                query['status'] = filters['status']
            if filters.get('search'):
                search = filters['search']
                query['$or'] = [
                    {'title': {'$regex': search, '$options': 'i'}},
                    {'description': {'$regex': search, '$options': 'i'}},
                    {'location': {'$regex': search, '$options': 'i'}}
                ]
        items = list(self.collection.find(query).sort('created_at', -1))
        return items

    def get_item_by_id(self, item_id):
        return self.collection.find_one({'_id': ObjectId(item_id)})

    def get_items_by_user(self, user_id):
        return list(self.collection.find({'posted_by': user_id}).sort('created_at', -1))

    def update_status(self, item_id, status):
        self.collection.update_one(
            {'_id': ObjectId(item_id)},
            {'$set': {'status': status}}
        )

    def update_matches(self, item_id, matches):
        self.collection.update_one(
            {'_id': ObjectId(item_id)},
            {'$set': {'matches': matches}}
        )

    def delete_item(self, item_id):
        self.collection.delete_one({'_id': ObjectId(item_id)})

    def serialize(self, item):
        item['_id'] = str(item['_id'])
        if 'created_at' in item:
            item['created_at'] = item['created_at'].isoformat()
        return item


def calculate_match_score(item1, item2):
    if item1['item_type'] == item2['item_type']:
        return 0.0

    score = 0.0

    if item1['category'] == item2['category']:
        score += 0.4

    words1 = set(item1['title'].lower().split() +
                 item1['description'].lower().split())
    words2 = set(item2['title'].lower().split() +
                 item2['description'].lower().split())

    stopwords = {'the', 'a', 'an', 'is', 'it', 'i', 'my', 'was', 'and', 'or', 'in', 'at', 'on'}
    words1 = words1 - stopwords
    words2 = words2 - stopwords

    if words1 and words2:
        common = words1.intersection(words2)
        keyword_score = len(common) / max(len(words1), len(words2))
        score += keyword_score * 0.4

    loc1 = item1['location'].lower()
    loc2 = item2['location'].lower()
    loc_words1 = set(loc1.split())
    loc_words2 = set(loc2.split())
    if loc_words1.intersection(loc_words2):
        score += 0.2

    return round(score, 2)