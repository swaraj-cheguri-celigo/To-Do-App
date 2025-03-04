const express = require('express');
const Todo = require('../models/Todo');
const router = express.Router();

// 1. Get all todos
router.get('/todos', async (req, res, next) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    // Convert query params to integers
    page = parseInt(page);
    limit = parseInt(limit);

    // Ensure valid values
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    const totalTodos = await Todo.countDocuments(); // Total count of todos
    const todos = await Todo.find()
      .skip((page - 1) * limit) // Skip previous pages
      .limit(limit); // Limit per page

    res.json({
      page,
      limit,
      totalPages: Math.ceil(totalTodos / limit),
      totalTodos,
      todos,
    });
  } catch (err) {
    next(err);
  }
});

// 2. Create a new todo
router.post('/todos', async (req, res,next) => {
  const { title, description } = req.body;
  const newTodo = new Todo({
    title,
    description,
  });

  try {
    const todo = await newTodo.save();
    res.status(201).json(todo);
  } catch (err) {
    next(err);
  }
});

// 3. Get todo by id
router.get('/todos/:id', async (req, res,next) => {
  const { id } = req.params;
  try {
    const todo = await Todo.findById(id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    res.json(todo);
  } catch (err) {
    next(err);
  }
});
router.put('/api/todos/:id', async (req, res,next) => {
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
      next(error);
    }
  });
module.exports = router;
