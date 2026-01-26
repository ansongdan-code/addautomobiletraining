const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

const User = require('../models/User');
const WebPage = require('../models/WebPage');
const WebsiteSettings = require('../models/WebsiteSettings');
const { generateToken } = require('../middleware/auth');
const appEditorRoutes = require('../routes/app-editor');

// Mock express app
const app = express();
app.use(express.json());
app.use('/api/editor', appEditorRoutes);

describe('App Editor API Endpoints', () => {
    let mongod;
    let adminUser, superAdminUser, regularUser;
    let adminToken, superAdminToken, regularToken;

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const mongoUri = mongod.getUri();
        await mongoose.connect(mongoUri);
    });

    beforeEach(async () => {
        await User.deleteMany({});
        await WebPage.deleteMany({});
        await WebsiteSettings.deleteMany({});

        const plainPassword = 'password123';

        superAdminUser = new User({ name: 'Super Admin', email: 'superadmin@test.com', password: plainPassword, role: 'super_admin' });
        adminUser = new User({ name: 'Admin User', email: 'admin@test.com', password: plainPassword, role: 'admin' });
        regularUser = new User({ name: 'Regular User', email: 'user@test.com', password: plainPassword, role: 'student' });

        await superAdminUser.save();
        await adminUser.save();
        await regularUser.save();

        superAdminToken = generateToken(superAdminUser._id);
        adminToken = generateToken(adminUser._id);
        regularToken = generateToken(regularUser._id);

        // Create a dummy page for testing updates and deletions
        const page = new WebPage({ title: 'Test Page', slug: 'test-page', content: '[]', author: adminUser._id });
        await page.save();
    });

    afterAll(async () => {
        await mongoose.connection.close();
        await mongod.stop();
    });

    // --- Pages API Tests ---
    describe('GET /api/editor/app/pages', () => {
        it('should get all pages for an admin', async () => {
            const res = await request(app)
                .get('/api/editor/app/pages')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBe(1);
        });

        it('should be forbidden for a regular user', async () => {
            const res = await request(app)
                .get('/api/editor/app/pages')
                .set('Authorization', `Bearer ${regularToken}`);
            expect(res.statusCode).toEqual(403);
        });
    });

    describe('POST /api/editor/app/pages', () => {
        it('should create a new page for a super_admin', async () => {
            const res = await request(app)
                .post('/api/editor/app/pages')
                .set('Authorization', `Bearer ${superAdminToken}`)
                .send({ title: 'New Page', slug: 'new-page', name: 'New Page' });
            
            expect(res.statusCode).toEqual(201);
            expect(res.body.data.title).toBe('New Page');
            const page = await WebPage.findOne({ slug: 'new-page' });
            expect(page).not.toBeNull();
        });

        it('should not create a page with a duplicate slug', async () => {
            const res = await request(app)
                .post('/api/editor/app/pages')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ title: 'Test Page', slug: 'test-page' });
            expect(res.statusCode).toEqual(400);
        });
    });

    describe('PUT /api/editor/app/pages/:id', () => {
        it('should update a page for an admin', async () => {
            const page = await WebPage.findOne({ slug: 'test-page' });
            const res = await request(app)
                .put(`/api/editor/app/pages/${page._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ title: 'Updated Title' });
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.data.title).toBe('Updated Title');
        });
    });

    describe('DELETE /api/editor/app/pages/:id', () => {
        it('should delete a page for a super_admin', async () => {
            const page = await WebPage.findOne({ slug: 'test-page' });
            const res = await request(app)
                .delete(`/api/editor/app/pages/${page._id}`)
                .set('Authorization', `Bearer ${superAdminToken}`);
            
            expect(res.statusCode).toEqual(200);
            const deletedPage = await WebPage.findById(page._id);
            expect(deletedPage).toBeNull();
        });

        it('should be forbidden for an admin to delete a page', async () => {
            const page = await WebPage.findOne({ slug: 'test-page' });
            const res = await request(app)
                .delete(`/api/editor/app/pages/${page._id}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(403);
        });
    });

    // --- Styles API Tests ---
    describe('GET /api/editor/app/styles', () => {
        it('should get styles for an admin', async () => {
            await new WebsiteSettings({theme: {primaryColor: '#000000'}}).save();
            const res = await request(app)
                .get('/api/editor/app/styles')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toHaveProperty('primaryColor');
        });
    });

    describe('PUT /api/editor/app/styles', () => {
        it('should update styles for an admin', async () => {
            await new WebsiteSettings().save();
            const res = await request(app)
                .put('/api/editor/app/styles')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ primaryColor: '#ff0000' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.primaryColor).toBe('#ff0000');
        });
    });

    // --- Components API Tests ---
    describe('POST /api/editor/app/pages/:pageId/components', () => {
        it('should add a component to a page for an admin', async () => {
            const page = await WebPage.findOne({ slug: 'test-page' });
            const res = await request(app)
                .post(`/api/editor/app/pages/${page._id}/components`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ type: 'header', content: { title: 'New Header' } });

            expect(res.statusCode).toEqual(201);
            expect(res.body.data).toBeDefined();
            const updatedPage = await WebPage.findById(page._id);
            const content = JSON.parse(updatedPage.content);
            expect(content.length).toBe(1);
            expect(content[0].type).toBe('header');
        });
    });

    describe('DELETE /api/editor/app/pages/:pageId/components/:compId', () => {
        it('should delete a component from a page for an admin', async () => {
            const page = await WebPage.findOne({ slug: 'test-page' });
            const component = { _id: new mongoose.Types.ObjectId(), type: 'header', content: { title: 'Header' } };
            page.content = JSON.stringify([component]);
            await page.save();

            const res = await request(app)
                .delete(`/api/editor/app/pages/${page._id}/components/${component._id.toString()}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            const updatedPage = await WebPage.findById(page._id);
            const content = JSON.parse(updatedPage.content);
            expect(content.length).toBe(0);
        });
    });
    
    // --- Preview API Test ---
    describe('GET /api/editor/page/:slug', () => {
        it('should get page for preview', async () => {
            const page = await WebPage.findOne({ slug: 'test-page' });
            page.isPublished = true;
            await page.save();
            const res = await request(app)
                .get('/api/editor/page/test-page')
            expect(res.statusCode).toEqual(200);
            expect(res.text).toContain('Test Page');
        });

        it('should return 404 for a non-existent slug', async () => {
            const res = await request(app)
                .get('/api/editor/page/non-existent-slug')
            expect(res.statusCode).toEqual(404);
        });
    });
});
