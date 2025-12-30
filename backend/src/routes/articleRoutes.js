import express from 'express';
import { ArticleController } from '../controllers/articleController.js';

const router = express.Router();
const articleController = new ArticleController();

// CRUD routes
router.post('/', (req, res) => articleController.create(req, res));
router.get('/', (req, res) => articleController.getAll(req, res));
router.get('/:id', (req, res) => articleController.getById(req, res));
router.put('/:id', (req, res) => articleController.update(req, res));
router.delete('/:id', (req, res) => articleController.delete(req, res));

export default router;

