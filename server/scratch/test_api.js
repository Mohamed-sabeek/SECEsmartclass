const axios = require('axios');

async function testAddTeacher() {
    try {
        const formData = {
            name: 'Test Teacher',
            email: 'testteacher' + Date.now() + '@sece.ac.in',
            department: 'CSE',
            subject: 'Algorithms'
        };
        
        console.log('Sending request to add teacher...');
        const response = await axios.post('http://localhost:5000/api/users', { ...formData, role: 'teacher' }, {
            headers: { 
                // We need a token here, but I don't have one easily.
                // However, I can check if it even reaches the controller.
                // Wait, the routes have `protect` and `adminOnly`.
                Authorization: `Bearer YOUR_TOKEN_HERE` 
            }
        });
        
        console.log('Response:', response.data);
    } catch (error) {
        console.log('Error Status:', error.response?.status);
        console.log('Error Data:', error.response?.data);
    }
}

// I can't easily get an admin token without logging in.
// But I can check if the server is throwing 500 or 401.
// If it's 401, then the route logic is okay but I need a token.
// The user said they got a 500.

testAddTeacher();
