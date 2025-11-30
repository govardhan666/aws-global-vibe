/**
 * Sample Vulnerable Code for Demo
 *
 * This file contains intentional security vulnerabilities for demonstration purposes.
 * DO NOT use this code in production!
 */

// ============================================================================
// 1. SQL INJECTION VULNERABILITY (Critical)
// ============================================================================

function getUserById(userId) {
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  // VULNERABLE: Direct string concatenation allows SQL injection
  // Attacker can pass: 1 OR 1=1 --
  return database.query(query);
}

// SECURE VERSION:
function getUserByIdSecure(userId) {
  const query = 'SELECT * FROM users WHERE id = ?';
  return database.query(query, [userId]);
}

// ============================================================================
// 2. XSS (Cross-Site Scripting) VULNERABILITY (Critical)
// ============================================================================

function displayUserComment(comment) {
  // VULNERABLE: Directly inserting user input into HTML
  document.getElementById('comments').innerHTML = comment;
  // Attacker can inject: <script>alert('XSS')</script>
}

// SECURE VERSION:
function displayUserCommentSecure(comment) {
  const element = document.getElementById('comments');
  element.textContent = comment; // Use textContent instead of innerHTML
  // Or use a sanitization library like DOMPurify
}

// ============================================================================
// 3. HARDCODED SECRETS (Critical)
// ============================================================================

// VULNERABLE: API keys hardcoded in source code
// NOTE: These are EXAMPLE values for demonstration only
const API_KEY = 'EXAMPLE_KEY_DO_NOT_USE_1234567890';
const DATABASE_PASSWORD = 'admin123';
const AWS_SECRET = 'EXAMPLE_AWS_KEY_NOT_REAL';

// SECURE VERSION:
const API_KEY_SECURE = process.env.API_KEY;
const DATABASE_PASSWORD_SECURE = process.env.DATABASE_PASSWORD;
const AWS_SECRET_SECURE = process.env.AWS_SECRET_ACCESS_KEY;

// ============================================================================
// 4. INSECURE AUTHENTICATION (High)
// ============================================================================

function authenticateUser(username, password) {
  // VULNERABLE: Plain text password comparison
  const user = database.query(`SELECT * FROM users WHERE username = '${username}'`);
  if (user && user.password === password) {
    return { authenticated: true, user };
  }
  return { authenticated: false };
}

// SECURE VERSION:
import bcrypt from 'bcrypt';

async function authenticateUserSecure(username, password) {
  const user = await database.query('SELECT * FROM users WHERE username = ?', [username]);
  if (user && await bcrypt.compare(password, user.password_hash)) {
    return { authenticated: true, user: { id: user.id, username: user.username } };
  }
  return { authenticated: false };
}

// ============================================================================
// 5. PATH TRAVERSAL VULNERABILITY (High)
// ============================================================================

function readFile(filename) {
  // VULNERABLE: No validation on filename
  const fs = require('fs');
  return fs.readFileSync('/uploads/' + filename);
  // Attacker can pass: ../../etc/passwd
}

// SECURE VERSION:
function readFileSecure(filename) {
  const path = require('path');
  const fs = require('fs');

  // Validate filename
  if (filename.includes('..') || filename.includes('/')) {
    throw new Error('Invalid filename');
  }

  const safePath = path.join('/uploads', path.basename(filename));
  return fs.readFileSync(safePath);
}

// ============================================================================
// 6. COMMAND INJECTION (Critical)
// ============================================================================

function pingHost(hostname) {
  // VULNERABLE: Directly using user input in shell command
  const { execSync } = require('child_process');
  return execSync(`ping -c 4 ${hostname}`).toString();
  // Attacker can pass: google.com; rm -rf /
}

// SECURE VERSION:
function pingHostSecure(hostname) {
  const { execSync } = require('child_process');

  // Validate hostname format
  if (!/^[a-zA-Z0-9.-]+$/.test(hostname)) {
    throw new Error('Invalid hostname');
  }

  // Use array syntax to prevent injection
  return execSync('ping', ['-c', '4', hostname]).toString();
}

// ============================================================================
// 7. INSECURE DESERIALIZATION (High)
// ============================================================================

function deserializeUserData(data) {
  // VULNERABLE: Eval on untrusted data
  return eval('(' + data + ')');
}

// SECURE VERSION:
function deserializeUserDataSecure(data) {
  return JSON.parse(data); // Use JSON.parse instead of eval
}

// ============================================================================
// 8. WEAK CRYPTOGRAPHY (Medium)
// ============================================================================

function hashPassword(password) {
  // VULNERABLE: Using MD5 (broken hash algorithm)
  const crypto = require('crypto');
  return crypto.createHash('md5').update(password).digest('hex');
}

// SECURE VERSION:
async function hashPasswordSecure(password) {
  const bcrypt = require('bcrypt');
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// ============================================================================
// 9. CSRF VULNERABILITY (High)
// ============================================================================

// VULNERABLE: No CSRF token validation
app.post('/transfer-money', (req, res) => {
  const { to, amount } = req.body;
  transferMoney(req.user.id, to, amount);
  res.json({ success: true });
});

// SECURE VERSION:
app.post('/transfer-money-secure', csrfProtection, (req, res) => {
  const { to, amount, csrfToken } = req.body;

  if (!validateCsrfToken(req.session.csrfToken, csrfToken)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  transferMoney(req.user.id, to, amount);
  res.json({ success: true });
});

// ============================================================================
// 10. INSUFFICIENT INPUT VALIDATION (Medium)
// ============================================================================

function createUser(email, age) {
  // VULNERABLE: No validation
  return database.insert('users', { email, age });
}

// SECURE VERSION:
function createUserSecure(email, age) {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  // Validate age
  const ageNum = parseInt(age);
  if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
    throw new Error('Invalid age');
  }

  return database.insert('users', { email, age: ageNum });
}

// ============================================================================
// 11. SENSITIVE DATA EXPOSURE (High)
// ============================================================================

function getUser(userId) {
  // VULNERABLE: Returning sensitive data
  return database.query('SELECT * FROM users WHERE id = ?', [userId]);
  // Returns: { id, username, password_hash, ssn, credit_card, ... }
}

// SECURE VERSION:
function getUserSecure(userId) {
  const user = database.query('SELECT id, username, email, created_at FROM users WHERE id = ?', [userId]);
  // Only return non-sensitive fields
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    created_at: user.created_at
  };
}

// ============================================================================
// 12. INSECURE DIRECT OBJECT REFERENCE (IDOR) (High)
// ============================================================================

// VULNERABLE: No authorization check
app.get('/api/orders/:orderId', (req, res) => {
  const order = database.getOrder(req.params.orderId);
  res.json(order);
  // Any user can access any order by changing the ID
});

// SECURE VERSION:
app.get('/api/orders/:orderId', authenticate, (req, res) => {
  const order = database.getOrder(req.params.orderId);

  // Check if the order belongs to the authenticated user
  if (order.userId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  res.json(order);
});

// ============================================================================
// DEMO SUMMARY
// ============================================================================

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                  VULNERABLE CODE SAMPLES                       ║
║                    FOR DEMO PURPOSES ONLY                      ║
╟────────────────────────────────────────────────────────────────╢
║  This file demonstrates 12 common security vulnerabilities:   ║
║  1. SQL Injection                    [CRITICAL]                ║
║  2. XSS (Cross-Site Scripting)      [CRITICAL]                ║
║  3. Hardcoded Secrets                [CRITICAL]                ║
║  4. Insecure Authentication          [HIGH]                    ║
║  5. Path Traversal                   [HIGH]                    ║
║  6. Command Injection                [CRITICAL]                ║
║  7. Insecure Deserialization        [HIGH]                    ║
║  8. Weak Cryptography                [MEDIUM]                  ║
║  9. CSRF Vulnerability               [HIGH]                    ║
║  10. Insufficient Input Validation   [MEDIUM]                  ║
║  11. Sensitive Data Exposure         [HIGH]                    ║
║  12. IDOR (Insecure Direct Object)  [HIGH]                    ║
║                                                                ║
║  DevSecOps AI Guardian will detect ALL of these! 🛡️           ║
╚════════════════════════════════════════════════════════════════╝
`);

module.exports = {
  // Vulnerable functions for testing
  getUserById,
  displayUserComment,
  authenticateUser,
  readFile,
  pingHost,
  deserializeUserData,
  hashPassword,
  createUser,
  getUser,

  // Secure versions for comparison
  getUserByIdSecure,
  displayUserCommentSecure,
  authenticateUserSecure,
  readFileSecure,
  pingHostSecure,
  deserializeUserDataSecure,
  hashPasswordSecure,
  createUserSecure,
  getUserSecure
};
