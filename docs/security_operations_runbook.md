# HireSense — Security Architecture & Operations Runbook

**Document Version**: 1.0.0 (Production Release)  
**Security Classification**: Internal / Operational  
**Audience**: DevOps Engineers, Security Admins, Site Reliability Engineers  

---

## 1. Security Architecture Overview

HireSense enforces defense-in-depth security principles across identity, data storage, network perimeter, and algorithmic execution.

```
Internet / Client Requests
       │ (HTTPS / TLS 1.3)
       ▼
   [ NGINX ] ──► Security Headers (CSP, HSTS, X-Frame-Options)
       │ (Internal Network)
       ▼
[ FastAPI Backend ] ──► JWT Bearer Authentication (HS256)
       │             ──► Role-Based Access Control (RBAC)
       │             ──► Parameter Validation (Pydantic v2)
       ▼
[ Storage Layers ]
 ├── PostgreSQL / SQLite (bcrypt hashed passwords, parameterized SQL)
 ├── Local / Object Storage (restricted upload directory, UUID names)
 └── Audit Log Ledger (immutable human decision audit trails)
```

---

## 2. Authentication & Authorization Controls

### 2.1 Password Security
- Passwords are encrypted using **bcrypt** with automated cryptographic salt generation.
- Passwords are **never** logged, cached, or stored in plaintext.
- Verification occurs in constant time via `bcrypt.checkpw()` to prevent timing attacks.

### 2.2 JWT Token Lifecycle
- Tokens are signed with HMAC-SHA256 (`HS256`) using the system `JWT_SECRET`.
- Payload contains user ID (`sub`) and role (`role`).
- Expiration default: 24 hours (1440 minutes).
- Expired or tampered tokens are rejected with `401 Unauthorized` and `WWW-Authenticate: Bearer` challenge.

### 2.3 Role-Based Access Control (RBAC) Matrix
| Route Group | Candidate | Recruiter | Admin |
|---|---|---|---|
| `/auth/login`, `/auth/register` | ✅ | ✅ | ✅ |
| `/jobs` (Create / Update / Delete) | ❌ (403) | ✅ | ✅ |
| `/applications` (Apply) | ✅ | ❌ (403) | ✅ |
| `/applications/{id}/status` | ❌ (403) | ✅ (own jobs) | ✅ (all) |
| `/applications/{id}/report` | ❌ (403) | ✅ (own jobs) | ✅ (all) |
| `/applications/{id}/decision` | ❌ (403) | ✅ (own jobs) | ✅ (all) |
| `/applications/{id}/feedback` | ✅ (own app) | ✅ | ✅ |
| `/interviews/upload` | ✅ (own app) | ✅ | ✅ |

---

## 3. Data Protection & Perimeter Hardening

### 3.1 Data in Transit
- In production, all client communication must terminate on HTTPS/TLS 1.3.
- Nginx reverse-proxy injects HTTP Strict Transport Security (`HSTS`).

### 3.2 HTTP Security Headers
Nginx enforces strict header controls on every HTTP response:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:;" always;
```

### 3.3 File Upload Security
- Resumes are validated for PDF file signatures (`%PDF-`).
- Audio files are restricted to standard audio formats (`.mp3`, `.wav`, `.m4a`, `.webm`, `.mp4`).
- Uploaded files are stored with sanitized names under isolated paths outside the web root.
- Maximum payload limit is enforced at the reverse-proxy level (`client_max_body_size 50M`).

---

## 4. Operational Runbooks

### Runbook 1: Database Backup & Recovery

#### PostgreSQL Production Backup:
```bash
# Automated daily logical dump:
docker exec hiresense-postgres pg_dump -U hiresense_user -d hiresense_prod -F c -b -v -f /var/lib/postgresql/data/backup_$(date +%Y%m%d).dump
```

#### PostgreSQL Recovery:
```bash
docker exec -i hiresense-postgres pg_restore -U hiresense_user -d hiresense_prod -c -v < backup_20261120.dump
```

#### SQLite Local Backup:
```bash
# SQLite atomic online backup
sqlite3 hiresense.db ".backup 'hiresense_backup_$(date +%Y%m%d).db'"
```

---

### Runbook 2: Secret Key Rotation

If `JWT_SECRET` is suspected of compromise:
1. Generate new 64-character secret:
   ```bash
   openssl rand -hex 32
   ```
2. Update `JWT_SECRET` in `.env` or deployment environment.
3. Restart backend service:
   ```bash
   docker-compose restart backend
   ```
4. *Effect*: All existing active JWT tokens are immediately invalidated, forcing all active sessions to re-authenticate securely.

---

### Runbook 3: Audit Log Compliance Inspection

All recruiter decisions are indelibly logged to the `audit_logs` table. To audit hiring decisions:
```sql
SELECT 
    a.id, 
    u.name AS recruiter_name, 
    u.email, 
    a.action, 
    a.object_type, 
    a.object_id, 
    a.created_at, 
    a.metadata_json
FROM audit_logs a
JOIN users u ON a.user_id = u.id
ORDER BY a.created_at DESC 
LIMIT 50;
```

---

### Runbook 4: Incident Response Workflow

1. **Detection**: Monitoring alert triggers (elevated 401/403 rates, unexpected API latency).
2. **Containment**: Isolate affected user accounts by toggling `is_active = False` in the `users` table.
3. **Investigation**: Query `audit_logs` for user actions and review Nginx access logs for IP addresses.
4. **Remediation**: Invalidate JWT sessions, rotate secrets if necessary, apply hotfix.
5. **Post-Mortem**: Document root cause, impact duration, and preventive hardening.
