const express = require('express');
const Todo = require('../models/Todo');
const router = express.Router();

// 1. Get all todos
router.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Create a new todo
router.post('/todos', async (req, res) => {
  const { title, description } = req.body;
  const newTodo = new Todo({
    title,
    description,
  });

  try {
    const todo = await newTodo.save();
    res.status(201).json(todo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. Get todo by id
router.get('/todos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const todo = await Todo.findById(id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    res.json(todo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.put('/api/todos/:id', async (req, res) => {
    const todoId = req.params.id;
    const { title, completed } = req.body;
  
    try {
      // Find the todo by ID and update its fields
      const updatedTodo = await Todo.findByIdAndUpdate(todoId, { title, completed }, { new: true });
  
      if (!updatedTodo) {
        return res.status(404).json({ error: 'Todo not found' });
      }
  
      // Return the updated todo
      res.json(updatedTodo);
    } catch (error) {
      console.error('Error updating todo:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
module.exports = router;
