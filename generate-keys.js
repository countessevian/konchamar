#!/usr/bin/env node

/**
 * Generate secure keys for production deployment
 * Run with: node generate-keys.js
 */

const crypto = require('crypto');

console.log('\n==============================================');
console.log('  KONCHAMAR RESORT - SECURITY KEY GENERATOR');
console.log('==============================================\n');

console.log('Copy these values into Render Environment Variables:\n');

console.log('ENCRYPTION_KEY:');
console.log(crypto.randomBytes(32).toString('hex'));
console.log('');

console.log('JWT_SECRET:');
console.log(crypto.randomBytes(64).toString('hex'));
console.log('');

console.log('==============================================');
console.log('Keep these keys secure and never commit them!');
console.log('==============================================\n');
