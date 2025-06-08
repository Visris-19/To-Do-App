const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');

describe('Task API', () => {
    test('should create a new task', async () => {
        const res = await request(app)
            .post('/api/addTask')
            .send({
                title: 'Test Task',
                body: 'Test Description',
                email: 'test@example.com'
            });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('list');
    });
});