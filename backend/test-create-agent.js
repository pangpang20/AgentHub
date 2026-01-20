const axios = require('axios');

async function testCreateAgent() {
  try {
    console.log('Step 1: Logging in...');
    const loginResponse = await axios.post('http://localhost:3001/v1/auth/login', {
      email: 'admin@agenthub.com',
      password: 'admin123'
    });
    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    console.log('\nStep 2: Creating agent...');
    const createAgentResponse = await axios.post('http://localhost:3001/v1/agents', {
      name: 'Test Agent',
      description: 'A test agent for debugging',
      systemPrompt: 'You are a helpful assistant.',
      llmProvider: 'openai',
      llmModel: 'gpt-4',
      llmTemperature: 0.7,
      llmMaxTokens: 4096
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 seconds timeout
    });

    console.log('✅ Agent created successfully!');
    console.log('Agent data:', JSON.stringify(createAgentResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error occurred:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testCreateAgent();
