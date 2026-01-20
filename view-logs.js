const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== AgentHub 服务日志查看器 ===\n');

// 检查后端日志
console.log('📋 后端服务状态:');
try {
  const backendProcesses = execSync('netstat -ano | findstr :3001', { encoding: 'utf-8' });
  console.log('✅ 后端服务正在运行 (端口 3001)');
  console.log(backendProcesses.split('\n').filter(line => line.includes('LISTENING')).map(line => {
    const parts = line.trim().split(/\s+/);
    return `   PID: ${parts[parts.length - 1]}`;
  }).join('\n'));
} catch (error) {
  console.log('❌ 后端服务未运行');
}

console.log('\n📋 前端服务状态:');
try {
  const frontendProcess3000 = execSync('netstat -ano | findstr ":3000.*LISTENING"', { encoding: 'utf-8' });
  console.log('✅ 前端服务正在运行 (端口 3000)');
} catch (error) {
  try {
    const frontendProcess3002 = execSync('netstat -ano | findstr ":3002.*LISTENING"', { encoding: 'utf-8' });
    console.log('✅ 前端服务正在运行 (端口 3002)');
  } catch (error2) {
    console.log('❌ 前端服务未运行');
  }
}

console.log('\n📋 Redis 服务状态:');
try {
  const redisProcess = execSync('netstat -ano | findstr ":6379.*LISTENING"', { encoding: 'utf-8' });
  console.log('✅ Redis 服务正在运行 (端口 6379)');
} catch (error) {
  console.log('❌ Redis 服务未运行');
}

console.log('\n📋 MySQL 服务状态:');
try {
  const mysqlProcess = execSync('netstat -ano | findstr ":3306.*LISTENING"', { encoding: 'utf-8' });
  console.log('✅ MySQL 服务正在运行 (端口 3306)');
} catch (error) {
  console.log('❌ MySQL 服务未运行');
}

console.log('\n📋 最近创建的用户:');
try {
  const checkUsersScript = path.join(__dirname, 'backend', 'check-users.js');
  if (fs.existsSync(checkUsersScript)) {
    const users = execSync(`node "${checkUsersScript}"`, { encoding: 'utf-8' });
    console.log(users);
  }
} catch (error) {
  console.log('无法获取用户信息');
}

console.log('\n📋 访问地址:');
console.log('   前端: http://localhost:3002 或 http://localhost:3000');
console.log('   后端: http://localhost:3001');
console.log('   登录页: http://localhost:3002/auth/login');
console.log('\n📋 默认登录账号:');
console.log('   邮箱: admin@agenthub.com');
console.log('   密码: admin123');

console.log('\n=== 查看实时日志 ===');
console.log('提示: 要查看实时日志，请使用以下命令:');
console.log('  - 后端日志: cd backend && npm start (在新的终端窗口中运行)');
console.log('  - 前端日志: cd frontend && npm run dev (在新的终端窗口中运行)');
