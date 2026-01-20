const axios = require('axios');

async function testFrontendToBackend() {
  try {
    console.log('Testing connection from frontend to backend...');
    console.log('Backend URL:', 'http://localhost:3001/v1');

    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:3001/health', {
      timeout: 5000
    });
    console.log('Health check:', healthResponse.data);

    // Test login endpoint
    const loginResponse = await axios.post('http://localhost:3001/v1/auth/login', {
      email: 'admin@agenthub.com',
      password: 'admin123'
    });
    console.log('Login successful!');
    console.log('User:', loginResponse.data.user);

  } catch (error) {
    console.error('Connection failed!');
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testFrontendToBackend();
