from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Configure MongoDB Connection
# app.config["MONGO_URI"] = "mongodb://localhost:27017/flashcards_app"
mongo = MongoClient("mongodb+srv://NAGESH:Nagesh22%4025$@hackathon.zqqxl.mongodb.net/")


db = mongo["flashcards_app"]
# User Registration
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    users = db.users

    if users.find_one({"email": data["email"]}):
        return jsonify({'success': False, 'message': 'Email already exists'}), 400
    
    new_user = {
        "email": data["email"],
        "password": data["password"],
        "created_at": datetime.utcnow()
    }
    
    user_id = users.insert_one(new_user).inserted_id
    return jsonify({'success': True, 'user': str(user_id)})

# User Login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    users = db.users
    user = users.find_one({"email": data["email"]})

    if user and user["password"] == data["password"]:
        return jsonify({'success': True, 'user': str(user["_id"])})
    
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

# Get Flashcards by User
@app.route('/api/flashcards', methods=['GET'])
def get_flashcards():
    user_id = request.args.get('user_id')
    flashcards = list(db.flashcards.find({"user_id": user_id}))
    
    for card in flashcards:
        card["_id"] = str(card["_id"])
        card["user_id"] = str(card["user_id"])
    
    return jsonify(flashcards)

# Create Flashcard
@app.route('/api/flashcards', methods=['POST'])
def create_flashcard():
    data = request.json
    flashcards = db.flashcards
    
    new_card = {
        "user_id": data["user_id"],
        "topic": data["topic"],
        "question": data["question"],
        "answer": data["answer"],
        "created_at": datetime.utcnow()
    }
    
    flashcard_id = flashcards.insert_one(new_card).inserted_id
    return jsonify({"success": True, "flashcard_id": str(flashcard_id)})

# Get Tasks by User
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    user_id = request.args.get('user_id')
    tasks = list(db.tasks.find({"user_id": user_id}))
    
    for task in tasks:
        task["_id"] = str(task["_id"])
        task["user_id"] = str(task["user_id"])
    
    return jsonify(tasks)

# Create Task
@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.json
    tasks = db.tasks

    new_task = {
        "user_id": data["user_id"],
        "title": data["title"],
        "description": data["description"],
        "importance": data["importance"],
        "status": "pending",
        "deadline": data["deadline"],
        "created_at": datetime.utcnow()
    }
    
    task_id = tasks.insert_one(new_task).inserted_id
    return jsonify({"success": True, "task_id": str(task_id)})

# Mark Task as Complete
@app.route('/api/tasks/<task_id>', methods=['PUT'])
def complete_task(task_id):
    tasks = db.tasks
    result = tasks.update_one({"_id": task_id}, {"$set": {"status": "completed"}})
    
    if result.modified_count > 0:
        return jsonify({"success": True, "message": "Task marked as completed"})
    
    return jsonify({"success": False, "message": "Task not found"}), 404

if __name__ == '__main__':
    app.run(debug=True,port=5000)
