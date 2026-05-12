# Security Testing Guide

## Overview
This document provides comprehensive security testing procedures for HAGUMI-APP to ensure all security measures are properly implemented and functioning.

## Testing Categories

### 1. Authentication & Authorization Testing

#### 1.1 JWT Token Validation
**Objective**: Verify JWT tokens are properly validated and secured

**Test Cases**:
- [ ] Test with valid JWT token
- [ ] Test with expired JWT token
- [ ] Test with malformed JWT token
- [ ] Test with invalid signature
- [ ] Test token refresh mechanism
- [ ] Verify token expiration after 24 hours
- [ ] Test session timeout

**Expected Results**:
- Valid tokens should be accepted
- Invalid/expired tokens should return 401 Unauthorized
- Token refresh should work seamlessly
- Sessions should timeout after 24 hours

**Testing Commands**:
```bash
# Test WebSocket connection with valid token
wscat -c "ws://localhost:3001/ws?token=VALID_JWT_TOKEN"

# Test with expired token
wscat -c "ws://localhost:3001/ws?token=EXPIRED_JWT_TOKEN"

# Test with invalid token
wscat -c "ws://localhost:3001/ws?token=INVALID_TOKEN"
```

#### 1.2 Supabase Auth Integration
**Objective**: Verify Supabase authentication integration

**Test Cases**:
- [ ] Test user registration
- [ ] Test user login
- [ ] Test user logout
- [ ] Test password reset
- [ ] Verify email verification
- [ ] Test session management

**Expected Results**:
- Registration should create user in Supabase
- Login should return valid tokens
- Logout should clear session
- Password reset should send email

### 2. Input Validation & Sanitization Testing

#### 2.1 Email Validation
**Objective**: Verify email input validation

**Test Cases**:
- [ ] Test with valid email
- [ ] Test with invalid email format
- [ ] Test with email > 255 characters
- [ ] Test with SQL injection attempts
- [ ] Test with XSS attempts

**Test Data**:
```
Valid: user@example.com
Invalid: user@invalid
Too Long: a...a@b.com (256 chars)
SQL Injection: ' OR '1'='1
XSS: <script>alert('xss')</script>@example.com
```

**Expected Results**:
- Valid emails should be accepted
- Invalid emails should be rejected with appropriate error message
- Malicious inputs should be sanitized

#### 2.2 Password Validation
**Objective**: Verify password strength requirements

**Test Cases**:
- [ ] Test with password < 8 characters
- [ ] Test with password > 128 characters
- [ ] Test without uppercase letter
- [ ] Test without lowercase letter
- [ ] Test without number
- [ ] Test without special character
- [ ] Test with valid password

**Test Data**:
```
Too Short: pass
Too Long: a...a (129 chars)
No Upper: password123!
No Lower: PASSWORD123!
No Number: Password!
No Special: Password123
Valid: Password123!
```

**Expected Results**:
- Invalid passwords should be rejected with specific error messages
- Valid passwords should be accepted

#### 2.3 Pet Name Validation
**Objective**: Verify pet name input validation

**Test Cases**:
- [ ] Test with empty name
- [ ] Test with name > 20 characters
- [ ] Test with special characters
- [ ] Test with SQL injection
- [ ] Test with XSS attempts
- [ ] Test with valid name

**Test Data**:
```
Empty: ""
Too Long: VeryLongPetNameThatExceedsLimit
SQL Injection: pet'; DROP TABLE pets;--
XSS: <script>alert('xss')</script>
Valid: Fluffy
```

**Expected Results**:
- Invalid names should be rejected
- Malicious inputs should be sanitized
- Valid names should be accepted

#### 2.4 WebSocket Message Validation
**Objective**: Verify WebSocket message validation

**Test Cases**:
- [ ] Test with valid message type
- [ ] Test with invalid message type
- [ ] Test with payload > 10KB
- [ ] Test with malformed JSON
- [ ] Test with missing required fields

**Expected Results**:
- Valid messages should be processed
- Invalid messages should be rejected
- Oversized payloads should be rejected

### 3. Rate Limiting Testing

#### 3.1 IP-based Rate Limiting
**Objective**: Verify IP-based rate limiting works

**Test Cases**:
- [ ] Test within rate limit (100 req/min)
- [ ] Test exceeding rate limit
- [ ] Verify rate limit headers
- [ ] Test rate limit reset

**Testing Commands**:
```bash
# Send 100 requests (should succeed)
for i in {1..100}; do curl -I http://localhost:3001/health; done

# Send 101st request (should be rate limited)
curl -I http://localhost:3001/health
```

**Expected Results**:
- First 100 requests should succeed
- 101st request should return 429 Too Many Requests
- Response should include rate limit headers

#### 3.2 User-based Rate Limiting
**Objective**: Verify user-based rate limiting works

**Test Cases**:
- [ ] Test authenticated user within limit (200 req/min)
- [ ] Test authenticated user exceeding limit
- [ ] Verify different users have separate limits

**Expected Results**:
- Each user should have independent rate limits
- Exceeding limit should return 429

### 4. CORS Testing

#### 4.1 CORS Configuration
**Objective**: Verify CORS headers are properly set

**Test Cases**:
- [ ] Test with allowed origin
- [ ] Test with disallowed origin
- [ ] Test preflight OPTIONS request
- [ ] Verify CORS headers in response

**Testing Commands**:
```bash
# Test with allowed origin
curl -H "Origin: http://localhost:5173" -I http://localhost:3001/health

# Test with disallowed origin
curl -H "Origin: http://evil.com" -I http://localhost:3001/health

# Test preflight request
curl -X OPTIONS -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -I http://localhost:3001/health
```

**Expected Results**:
- Allowed origins should receive CORS headers
- Disallowed origins should not receive CORS headers
- Preflight requests should return 204 No Content

### 5. Security Headers Testing

#### 5.1 Security Headers Verification
**Objective**: Verify all security headers are present

**Test Cases**:
- [ ] Verify X-Frame-Options: DENY
- [ ] Verify X-Content-Type-Options: nosniff
- [ ] Verify X-XSS-Protection: 1; mode=block
- [ ] Verify Content-Security-Policy
- [ ] Verify Referrer-Policy
- [ ] Verify Permissions-Policy

**Testing Commands**:
```bash
# Check all security headers
curl -I http://localhost:3001/health
```

**Expected Results**:
All security headers should be present and properly configured

### 6. Request Size Limiting Testing

#### 6.1 Payload Size Validation
**Objective**: Verify request size limits are enforced

**Test Cases**:
- [ ] Test with payload < 10MB
- [ ] Test with payload = 10MB
- [ ] Test with payload > 10MB

**Testing Commands**:
```bash
# Test with small payload
curl -X POST -H "Content-Type: application/json" \
  -d '{"test":"data"}' http://localhost:3001/health

# Test with large payload (>10MB)
dd if=/dev/zero bs=1M count=11 | curl -X POST \
  -H "Content-Type: application/json" \
  --data-binary @- http://localhost:3001/health
```

**Expected Results**:
- Small payloads should be accepted
- Large payloads (>10MB) should be rejected with 413

### 7. SQL Injection Testing

#### 7.1 SQL Injection Prevention
**Objective**: Verify SQL injection attempts are blocked

**Test Cases**:
- [ ] Test pet ID with SQL injection
- [ ] Test pet name with SQL injection
- [ ] Test action with SQL injection

**Test Data**:
```
Pet ID: pet' OR '1'='1
Pet Name: pet'; DROP TABLE pets;--
Action: feed'; DELETE FROM pets;--
```

**Expected Results**:
- All SQL injection attempts should be sanitized
- No SQL errors should occur
- Application should continue normally

### 8. XSS Testing

#### 8.1 XSS Prevention
**Objective**: Verify XSS attempts are blocked

**Test Cases**:
- [ ] Test pet name with XSS
- [ ] Test with script tags
- [ ] Test with event handlers
- [ ] Test with javascript: protocol

**Test Data**:
```
Pet Name: <script>alert('xss')</script>
Pet Name: <img src=x onerror=alert('xss')>
Pet Name: javascript:alert('xss')
```

**Expected Results**:
- All XSS attempts should be sanitized
- No JavaScript should execute
- Sanitized output should be safe

### 9. WebSocket Security Testing

#### 9.1 WebSocket Authentication
**Objective**: Verify WebSocket connections require authentication

**Test Cases**:
- [ ] Test connection without token
- [ ] Test connection with invalid token
- [ ] Test connection with valid token
- [ ] Test message sending without authentication

**Expected Results**:
- Unauthenticated connections should be rejected
- Authenticated connections should be accepted

#### 9.2 WebSocket Message Validation
**Objective**: Verify WebSocket messages are validated

**Test Cases**:
- [ ] Test with valid message type
- [ ] Test with invalid message type
- [ ] Test with oversized payload
- [ ] Test with malformed JSON

**Expected Results**:
- Valid messages should be processed
- Invalid messages should be rejected

### 10. Automated Security Scanning

#### 10.1 OWASP ZAP Scan
**Objective**: Run automated security scan

**Commands**:
```bash
# Start ZAP in daemon mode
zap.sh -daemon -port 8080

# Run baseline scan
zap-cli quick-scan --self-contained \
  --start-options '-config api.disablekey=true' \
  http://localhost:3001

# Generate report
zap-cli report -o security-report.html -f html
```

**Expected Results**:
- No critical vulnerabilities
- No high-risk vulnerabilities
- Medium/low vulnerabilities documented

#### 10.2 Dependency Vulnerability Scan
**Objective**: Check for vulnerable dependencies

**Commands**:
```bash
# For Go backend
cd backend
go list -json -m all | nancy sleuth

# For Node.js frontend
npm audit
npm audit fix
```

**Expected Results**:
- No critical vulnerabilities
- No high-risk vulnerabilities
- All dependencies up to date

## Testing Checklist

### Pre-Deployment Checklist
- [ ] All authentication tests pass
- [ ] All input validation tests pass
- [ ] All rate limiting tests pass
- [ ] All CORS tests pass
- [ ] All security headers are present
- [ ] All request size limits are enforced
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] WebSocket security verified
- [ ] Automated security scan completed
- [ ] Dependency scan completed
- [ ] Security report generated

### Continuous Monitoring
- [ ] Set up automated security scanning in CI/CD
- [ ] Configure dependency vulnerability alerts
- [ ] Monitor for security incidents
- [ ] Regular security audits scheduled

## Security Testing Tools

### Recommended Tools
1. **OWASP ZAP** - Web application security scanner
2. **Burp Suite** - Web security testing tool
3. **SQLMap** - SQL injection testing tool
4. **Nmap** - Network security scanner
5. **Nancy** - Go dependency vulnerability scanner
6. **npm audit** - Node.js dependency scanner

### Installation
```bash
# OWASP ZAP
brew install --cask zap

# Burp Suite
brew install --cask burp-suite

# SQLMap
pip install sqlmap

# Nmap
brew install nmap

# Nancy (Go)
go install github.com/sonatypecommunity/nancy/cmd/nancy@latest

# npm audit (included with npm)
```

## Reporting

### Security Report Template
```markdown
# Security Test Report

**Date**: [Date]
**Tester**: [Name]
**Environment**: [Development/Staging/Production]

## Executive Summary
- Total Tests: [Number]
- Passed: [Number]
- Failed: [Number]
- Critical Issues: [Number]
- High Issues: [Number]
- Medium Issues: [Number]
- Low Issues: [Number]

## Test Results
[Detailed results for each test category]

## Vulnerabilities Found
[List of vulnerabilities found]

## Recommendations
[List of recommendations]

## Conclusion
[Overall assessment]
```

## Remediation Timeline

### Critical Issues
- Fix within 24 hours
- Deploy hotfix immediately
- Notify stakeholders

### High Issues
- Fix within 1 week
- Include in next release
- Document workaround

### Medium Issues
- Fix within 1 month
- Plan for next sprint
- Monitor for exploitation

### Low Issues
- Fix within 3 months
- Add to backlog
- Monitor for changes

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)
- [Security Testing Best Practices](https://owasp.org/www-community/Security_Testing)