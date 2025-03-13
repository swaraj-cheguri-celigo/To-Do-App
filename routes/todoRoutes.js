const express = require('express');
const Todo = require('../models/Todo');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

const upload = require('../middlewares/uploadMiddleware');
/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: Get all todos
 *     description: Retrieve a list of all todos
 *     responses:
 *       200:
 *         description: A list of todos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "65fc9e29bcd2dbb0e8a293bd"
 *                   title:
 *                     type: string
 *                     example: "Buy groceries"
 *                   description:
 *                     type: string
 *                     example: "Milk, Eggs, Bread"
 *                   completed:
 *                     type: boolean
 *                     example: false
 */
router.get('/todos',authMiddleware, async (req, res, next) => {
  try {
    let { page = 1, limit = 10,search } = req.query;

    // Convert query params to integers
    page = parseInt(page);
    limit = parseInt(limit);

    // Ensure valid values
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    const query = {};

    // 🔍 If "search" is provided, filter by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } }, // Case-insensitive search
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    const totalTodos = await Todo.countDocuments(); // Total count of todos
    const todos = await Todo.find(query)
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

/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: Create a new todo
 *     description: Adds a new todo item to the list.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Buy groceries"
 *               description:
 *                 type: string
 *                 example: "Milk, Eggs, Bread"
 *     responses:
 *       201:
 *         description: Todo created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 */
router.post('/todos',authMiddleware, async (req, res,next) => {
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

/**
 * @swagger
 * /api/todos/{id}:
 *   get:
 *     summary: Get a todo by ID
 *     description: Retrieve a single todo item by its ID.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the todo.
 *     responses:
 *       200:
 *         description: A todo item.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Todo not found.
 */
router.get('/todos/:id',authMiddleware, async (req, res,next) => {
  const { id } = req.params;
  try {
    const todo = await Todo.findById(id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    res.json(todo);
  } catch (err) {
    next(err);
  }
});
/**
 * @swagger
 * /api/todos/{id}:
 *   put:
 *     summary: Update a todo
 *     description: Update a todo item by ID.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the todo to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Task Title"
 *               completed:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Updated todo item.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Todo not found.
 */
router.put('/api/todos/:id',authMiddleware, async (req, res,next) => {
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

  /**
 * @swagger
 * /api/todos/{id}/upload:
 *   post:
 *     summary: Upload an image for a todo
 *     description: Uploads an image and attaches it to the specified todo item.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the todo to upload the image for.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully.
 *       404:
 *         description: Todo not found.
 */
  router.post('/todos/:id/upload', authMiddleware, upload.single('image'), async (req, res, next) => {
    try {
      const { id } = req.params;
      const todo = await Todo.findById(id);
      if (!todo) return res.status(404).json({ message: 'Todo not found' });
  
      // Save image path
      todo.image = `/uploads/${req.file.filename}`;
      await todo.save();
  
      res.json({ message: 'Image uploaded successfully', imagePath: todo.image });
    } catch (err) {
      next(err);
    }
  });
module.exports = router;
