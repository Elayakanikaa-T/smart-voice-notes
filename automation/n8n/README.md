# n8n Automation Workflows for Smart Voice Note Application

This directory contains production-ready JSON workflow definitions for **n8n** (self-hosted or cloud):

### 1. `exam-reminders-workflow.json`
- **Trigger**: Receives exam date events via webhook (`POST /webhook/exam-reminder`).
- **Processing**: Calculates remaining days and formats rich alert notifications.
- **Actions**: Syncs the exam event with Google Calendar / Outlook Calendar and calls backend webhook `/api/v1/webhooks/calendar-event-created`.

### 2. `note-pipeline-workflow.json`
- **Trigger**: Webhook triggered upon voice note upload.
- **Actions**: Coordinates parallel execution of Flashcard Generation and Adaptive Quiz Generation, consolidating results and pushing notifications.

### 3. `auto-share-workflow.json`
- **Trigger**: Triggered when a lecture note is ready for distribution to study groups.
- **Actions**: Issues a secure signed share link and sends email summaries directly to collaborators.

### 4. `adaptive-difficulty-workflow.json`
- **Trigger**: Triggered when a student completes a quiz attempt.
- **Actions**: Evaluates mastery levels, automatically dynamically scales subsequent test difficulty (Easy $\leftrightarrow$ Medium $\leftrightarrow$ Hard), and recalculates exam readiness scores.

---

### Importing into n8n:
1. Open your n8n console (e.g. `http://localhost:5678`).
2. Click **Add Workflow** $\to$ **Import from File...**
3. Select any `.json` file from `automation/n8n/workflows/`.
4. Enable the workflow and set active credentials (Google Calendar, SMTP, etc.).
