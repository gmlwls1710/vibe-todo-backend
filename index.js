require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Todo = require('./models/Todo');

const app = express();
const PORT = process.env.PORT;

// MongoDB 연결
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-db';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('연결성공');
  })
  .catch((err) => {
    console.error('MongoDB 연결 실패:', err);
  });

// 미들웨어
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'Todo Backend API가 정상 작동 중입니다!' });
});

// ========== Todo API ==========

// 모든 할 일 조회
app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 새 할 일 추가
app.post('/todos', async (req, res) => {
  try {
    const todo = new Todo({
      title: req.body.title
    });
    const savedTodo = await todo.save();
    res.status(201).json(savedTodo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 할 일 수정 (완료 상태 변경)
app.patch('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!todo) {
      return res.status(404).json({ error: '할 일을 찾을 수 없습니다.' });
    }
    res.json(todo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 할 일 삭제
app.delete('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: '할 일을 찾을 수 없습니다.' });
    }
    res.json({ message: '삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
