const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login to:', 'http://localhost:3001/v1/auth/login');
    console.log('Email:', 'admin@agenthub.com');
    console.log('Password:', 'admin123');

    const response = await axios.post('http://localhost:3001/v1/auth/login', {
      email: 'admin@agenthub.com',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Login successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Login failed!');
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testLogin();
