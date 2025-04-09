const dotenv = require('dotenv');
const path = require('path');

console.log('Current working directory:', process.cwd());
console.log('Trying to load .env file...');

const result = dotenv.config();

if (result.error) {
  console.error('Error loading .env file:', result.error.message);
} else {
  console.log('.env file loaded successfully');
  console.log('BOT_TOKEN:', process.env.BOT_TOKEN || 'Not found');
} 