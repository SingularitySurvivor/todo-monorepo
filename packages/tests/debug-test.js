const axios = require('axios');

async function testAPI() {
  try {
    // Register user
    const userRes = await axios.post('http://localhost:3001/api/auth/register', {
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`,
      password: 'Password123!'
    });
    
    console.log('User registered:', userRes.data);
    
    // Create todo list
    const token = userRes.data.data.token;
    const listRes = await axios.post('http://localhost:3001/api/lists', {
      name: 'Test List',
      description: 'Test Description'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Todo list created:', JSON.stringify(listRes.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAPI();