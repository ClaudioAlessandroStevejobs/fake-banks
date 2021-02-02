import express from 'express';
import app from '../index';
import request from 'supertest';
const req = request(app);

const customerEmail = 'exampleCustomer@gmail.com';
const newCustomerEmail = 'exampleNewCustomer@gmail.com';
const password = '123';
const bankId = '280ec7a8-8a53-4c1e-aba8-0c06a6fabf5c';

describe('POST /auth/register', async () => {
    it('SUCCESS 201', async (done) => {
        const response = await req.post(`localhost:3001/auth/register`)
            .send({
                email: newCustomerEmail,
                password,
                bankId
            });
        expect(response.status).toBe(201);
        done();
    });
    it('Bad Request 404', async (done) => {
        const response = await req.post(`localhost:3001/auth/register`)
            .send({
                email: newCustomerEmail,
            });
        expect(response.status).toBe(404);
        done();
    });
    it('Conflict 409', async (done) => {
        const response = await req.post(`localhost:3001/auth/register`)
            .send({
                email: customerEmail,
                password,
                bankId
            });
        expect(response.status).toBe(409);
        done();
    });
    it('Not found 404', async (done) => {
        const response = await req.post(`localhost:3001/auth/register`)
            .send({
                email: newCustomerEmail,
                password,
                bankId: 'INVALID_ID',
            });
        expect(response.status).toBe(409);
        done();
    });
});

describe('POST /auth/login', async () => {
    it('SUCCESS 201', async (done) => {
        const response = await req.post(`localhost:3001/auth/login`)
            .send({
                email: customerEmail,
                password,
            });
        expect(response.status).toBe(201);
        done();
    });
    it('Bad request 400', async (done) => {
        const response = await req.post(`localhost:3001/auth/login`)
            .send({
                password,
            });
        expect(response.status).toBe(400);
        done();
    });
    it('Not found 404', async (done) => {
        const response = await req.post(`localhost:3001/auth/login`)
            .send({
                email: 'InvalidEmail@gmail.com',
                password,
            });
        expect(response.status).toBe(201);
        done();
    });
    it('Forbidden 403', async (done) => {
        const response = await req.post(`localhost:3001/auth/login`)
            .send({
                email: 'InvalidEmail@gmail.com',
                password : 'InvalidPassword',
            });
        expect(response.status).toBe(201);
        done();
    });
})

