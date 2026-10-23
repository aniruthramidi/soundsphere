/**
 * SoundSphere Back-End Unit Test Suite
 * Tests isolated middlewares, utility classes, and validation logic.
 */

const test = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');

const { AppError, asyncHandler, errorHandler } = require('../middleware/errorHandler');
const { generateToken, requireRole } = require('../middleware/auth');

test.describe('1. Error Handling & AppError Class Unit Tests', () => {
  test('1.1 AppError - Should initialize with status "fail" for 4xx errors', () => {
    const err = new AppError('Bad Request', 400);
    assert.strictEqual(err.message, 'Bad Request');
    assert.strictEqual(err.statusCode, 400);
    assert.strictEqual(err.status, 'fail');
    assert.strictEqual(err.isOperational, true);
  });

  test('1.2 AppError - Should initialize with status "error" for 5xx errors', () => {
    const err = new AppError('Database connection lost', 500);
    assert.strictEqual(err.statusCode, 500);
    assert.strictEqual(err.status, 'error');
  });

  test('1.3 AppError - Should attach optional error details array', () => {
    const details = [{ field: 'email', message: 'Invalid format' }];
    const err = new AppError('Validation failed', 422, details);
    assert.strictEqual(err.statusCode, 422);
    assert.deepStrictEqual(err.details, details);
  });

  test('1.4 asyncHandler - Should catch rejected promises and forward error to next()', async () => {
    let capturedError = null;
    const failingAsyncFn = async () => {
      throw new Error('Async failure test');
    };

    const middleware = asyncHandler(failingAsyncFn);
    const mockNext = (err) => {
      capturedError = err;
    };

    await middleware({}, {}, mockNext);
    assert.ok(capturedError);
    assert.strictEqual(capturedError.message, 'Async failure test');
  });

  test('1.5 errorHandler - Should format standardized JSON response envelope', () => {
    let responseStatus = 0;
    let responseJson = null;

    const mockRes = {
      status(code) {
        responseStatus = code;
        return this;
      },
      json(data) {
        responseJson = data;
        return this;
      }
    };

    const err = new AppError('Unauthorized access', 401);
    errorHandler(err, {}, mockRes, () => {});

    assert.strictEqual(responseStatus, 401);
    assert.strictEqual(responseJson.success, false);
    assert.strictEqual(responseJson.statusCode, 401);
    assert.strictEqual(responseJson.message, 'Unauthorized access');
  });
});

test.describe('2. Authentication & Authorization Middleware Unit Tests', () => {
  test('2.1 generateToken - Should generate valid JWT carrying user payload', () => {
    const mockUser = {
      id: 42,
      username: 'synth_fan',
      email: 'fan@soundsphere.io',
      role: 'listener'
    };

    const token = generateToken(mockUser);
    assert.ok(typeof token === 'string');
    assert.ok(token.split('.').length === 3); // Header.Payload.Signature

    const decoded = jwt.decode(token);
    assert.strictEqual(decoded.id, 42);
    assert.strictEqual(decoded.username, 'synth_fan');
    assert.strictEqual(decoded.role, 'listener');
  });

  test('2.2 requireRole - Should allow access if user has permitted role', () => {
    const middleware = requireRole('admin', 'creator');
    const mockReq = { user: { id: 1, role: 'admin' } };
    let calledNext = false;

    middleware(mockReq, {}, (err) => {
      assert.strictEqual(err, undefined);
      calledNext = true;
    });

    assert.strictEqual(calledNext, true);
  });

  test('2.3 requireRole - Should reject with 403 Forbidden if user lacks permitted role', () => {
    const middleware = requireRole('admin');
    const mockReq = { user: { id: 2, role: 'listener' } };
    let capturedError = null;

    middleware(mockReq, {}, (err) => {
      capturedError = err;
    });

    assert.ok(capturedError instanceof AppError);
    assert.strictEqual(capturedError.statusCode, 403);
    assert.ok(capturedError.message.includes('Forbidden'));
  });
});
