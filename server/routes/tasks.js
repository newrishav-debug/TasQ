import express from 'express';
import { getDb, saveDatabase } from '../database.js';

const router = express.Router();

// GET all tasks
router.get('/', (req, res) => {
    try {
        const db = getDb();
        const stmt = db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC');
        const tasks = [];
        while (stmt.step()) {
            tasks.push(stmt.getAsObject());
        }
        stmt.free();
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// POST create task
router.post('/', (req, res) => {
    try {
        const db = getDb();
        const {
            id,
            title,
            description,
            userUrgency,
            userImportance,
            aiUrgency,
            aiImportance,
            justification,
            completeBy,
            status,
            createdAt
        } = req.body;

        // Convert undefined to null for SQLite compatibility
        db.run(
            `INSERT INTO tasks (id, title, description, userUrgency, userImportance, aiUrgency, aiImportance, justification, completeBy, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id || null,
                title || null,
                description || null,
                userUrgency || null,
                userImportance || null,
                aiUrgency || null,
                aiImportance || null,
                justification || null,
                completeBy || null,
                status || null,
                createdAt || null
            ]
        );

        saveDatabase();
        res.status(201).json(req.body);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// PUT update task
router.put('/:id', (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;
        const {
            title,
            description,
            userUrgency,
            userImportance,
            aiUrgency,
            aiImportance,
            justification,
            completeBy,
            status
        } = req.body;

        // Convert undefined to null for SQLite compatibility
        db.run(
            `UPDATE tasks 
       SET title = ?, description = ?, userUrgency = ?, userImportance = ?, aiUrgency = ?, aiImportance = ?, justification = ?, completeBy = ?, status = ?
       WHERE id = ?`,
            [
                title || null,
                description || null,
                userUrgency || null,
                userImportance || null,
                aiUrgency || null,
                aiImportance || null,
                justification || null,
                completeBy || null,
                status || null,
                id
            ]
        );

        saveDatabase();
        res.json({ id, ...req.body });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// DELETE task
router.delete('/:id', (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;
        db.run('DELETE FROM tasks WHERE id = ?', [id]);
        saveDatabase();
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

export default router;
