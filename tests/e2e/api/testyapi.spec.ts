import { test, expect } from '@playwright/test';


test.describe('API Tests', () => {

    test('should get list of users from API', async ({ request }) => {
        // Send GET request to the API
        const response = await request.get('https://reqres.in/api/users?page=1');
        // Verify status code
        expect(response.status()).toBe(200);
        // Verify response body
        const body = await response.json();
        expect(body.page).toBe(1);
        expect(body.data).toHaveLength(6);
        expect(body.data[0]).toHaveProperty('email');
        // Print response for debugging
        console.log('Response:'
            , JSON.stringify(body, null, 2));
    });
    test('should create a new user via API', async ({ request }) => {
        // Send POST request to create a new user
        const newUser = { name: 'John Doe', job: 'Software Engineer' };
        const response = await request.post('https://reqres.in/api/users', {
            data: newUser,
        });
        // Verify status code
        expect(response.status()).toBe(201);
        // Verify response body
        const body = await response.json();
        expect(body).toHaveProperty('id');
        expect(body.name).toBe(newUser.name);
        expect(body.job).toBe(newUser.job);
    });

});


