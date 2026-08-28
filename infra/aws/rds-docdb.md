# AWS Cloud Architecture & Deployment Guide

## 1. Cloud Architecture Overview

```
                          [ Route 53 / CloudFront CDN ]
                                        │
                                        ▼
                        [ Application Load Balancer (ALB) ]
                         (TLS 1.3 Termination, WAF Rules)
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             ▼                                                     ▼
 [ ECS Fargate: Backend API ]                          [ ECS Fargate: AI Workers ]
   (Auto-scaling 2 - 10 tasks)                           (Auto-scaling based on Queue Depth)
             │                                                     │
             ├──────────────────────────┬──────────────────────────┤
             ▼                          ▼                          ▼
   [ Amazon RDS PostgreSQL ]    [ Amazon DocumentDB ]     [ ElastiCache Redis ]
   (Users, Subjects, Folders,   (Transcripts, Summaries,  (BullMQ Event Queues,
    Quizzes, Readiness Scores)   Flashcards, Questions)    Rate-limit Cache)
                                        │
                                        ▼
                           [ Amazon S3 Audio Bucket ]
                          (KMS SSE, Signed URLs Only)
```

---

## 2. Infrastructure Setup Steps

### A. S3 Audio Storage Bucket
1. Create private S3 bucket: `smart-voice-notes-audio`
2. Block all public access.
3. Apply `infra/aws/s3-bucket-policy.json` enforcing HTTPS TLS 1.3 and KMS SSE encryption.
4. Configure CORS to allow `PUT` requests from your frontend domain with `Content-Type: audio/*`.

### B. Amazon RDS (PostgreSQL 16)
1. Launch `db.t4g.medium` Multi-AZ instance.
2. Enable automated backups and storage encryption (AWS KMS).
3. Run `database/postgres/schema.sql` via AWS Systems Manager or migration runner.

### C. Amazon DocumentDB / MongoDB Atlas
1. Launch 3-node DocumentDB cluster or MongoDB Atlas dedicated tier (`M10`).
2. Whitelist VPC security groups from the ECS task subnets.

### D. AWS Secrets Manager
Store sensitive environment variables:
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `OPENAI_API_KEY` / `GEMINI_API_KEY`
- `PG_PASSWORD`
- `MONGODB_URI`

### E. ECS Fargate Service & Task Definitions
1. Push Docker images (`smartnotes-backend`, `smartnotes-ai-worker`) to AWS ECR.
2. Configure Task CPU: `1 vCPU`, Memory: `2 GB`.
3. Configure Target Tracking Auto Scaling Policy on ALB request count (> 1000 req/min) and BullMQ queue latency.
