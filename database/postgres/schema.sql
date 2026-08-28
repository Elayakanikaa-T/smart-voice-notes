-- ============================================================================
-- Smart Voice Note Application — PostgreSQL Relational Schema
-- Version: 1.0.0
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enum types
DO $$ BEGIN
    CREATE TYPE note_status_enum AS ENUM ('recording', 'uploaded', 'transcribing', 'processing', 'ready', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE quiz_type_enum AS ENUM ('flashcard', 'quiz');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE share_permission_enum AS ENUM ('view', 'edit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    theme_pref VARCHAR(50) DEFAULT 'system',
    biometric_pubkey TEXT,
    settings_json JSONB DEFAULT '{"autoSummarize": true, "autoGenerateQuiz": true, "audioQuality": "high", "offlineSync": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Refresh Tokens Table (for rotating refresh token auth)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    color VARCHAR(30) DEFAULT '#6366F1',
    icon VARCHAR(50) DEFAULT 'folder',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_subject_name UNIQUE (user_id, name)
);

-- 4. Folders Table (Hierarchical nested folders)
CREATE TABLE IF NOT EXISTS folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    parent_folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Notes Metadata Table
CREATE TABLE IF NOT EXISTS notes_meta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    audio_s3_key VARCHAR(512),
    audio_url VARCHAR(1024),
    duration_seconds INTEGER DEFAULT 0,
    file_size_bytes BIGINT DEFAULT 0,
    status note_status_enum DEFAULT 'recording',
    sync_version INTEGER DEFAULT 1,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    note_id UUID REFERENCES notes_meta(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    type quiz_type_enum DEFAULT 'quiz',
    difficulty_level VARCHAR(20) DEFAULT 'medium',
    total_questions INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_count INTEGER NOT NULL,
    answers_json JSONB NOT NULL,
    time_spent_seconds INTEGER DEFAULT 0,
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Progress & Readiness Scores Table
CREATE TABLE IF NOT EXISTS progress_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    readiness_score NUMERIC(5,2) DEFAULT 0.00,
    quiz_accuracy_avg NUMERIC(5,2) DEFAULT 0.00,
    material_coverage_pct NUMERIC(5,2) DEFAULT 0.00,
    review_recency_score NUMERIC(5,2) DEFAULT 0.00,
    weak_areas_json JSONB DEFAULT '[]'::jsonb,
    study_streak_days INTEGER DEFAULT 0,
    total_study_minutes INTEGER DEFAULT 0,
    last_studied_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_subject_progress UNIQUE (user_id, subject_id)
);

-- 9. Exam Reminders Table
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    exam_date TIMESTAMP WITH TIME ZONE NOT NULL,
    reminder_rule JSONB DEFAULT '["1d_before", "3d_before", "1w_before"]'::jsonb,
    calendar_event_id VARCHAR(255),
    synced_to_calendar BOOLEAN DEFAULT FALSE,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Shares & Collaboration Table
CREATE TABLE IF NOT EXISTS shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID NOT NULL REFERENCES notes_meta(id) ON DELETE CASCADE,
    shared_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shared_with_email VARCHAR(255) NOT NULL,
    permission share_permission_enum DEFAULT 'view',
    access_token VARCHAR(128) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high performance querying
CREATE INDEX IF NOT EXISTS idx_notes_meta_user_id ON notes_meta(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_meta_subject_id ON notes_meta(subject_id);
CREATE INDEX IF NOT EXISTS idx_notes_meta_folder_id ON notes_meta(folder_id);
CREATE INDEX IF NOT EXISTS idx_notes_meta_status ON notes_meta(status);
CREATE INDEX IF NOT EXISTS idx_notes_meta_created_at ON notes_meta(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_meta_title_trgm ON notes_meta USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_subject_id ON folders(subject_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_subject_id ON quizzes(subject_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_note_id ON quizzes(note_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON quiz_attempts(user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_taken_at ON quiz_attempts(taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_scores_user ON progress_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_exam_date ON reminders(exam_date);
CREATE INDEX IF NOT EXISTS idx_shares_access_token ON shares(access_token);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS trg_users_update ON users;
CREATE TRIGGER trg_users_update BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trg_subjects_update ON subjects;
CREATE TRIGGER trg_subjects_update BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trg_folders_update ON folders;
CREATE TRIGGER trg_folders_update BEFORE UPDATE ON folders FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trg_notes_meta_update ON notes_meta;
CREATE TRIGGER trg_notes_meta_update BEFORE UPDATE ON notes_meta FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trg_quizzes_update ON quizzes;
CREATE TRIGGER trg_quizzes_update BEFORE UPDATE ON quizzes FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trg_progress_scores_update ON progress_scores;
CREATE TRIGGER trg_progress_scores_update BEFORE UPDATE ON progress_scores FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trg_reminders_update ON reminders;
CREATE TRIGGER trg_reminders_update BEFORE UPDATE ON reminders FOR EACH ROW EXECUTE FUNCTION update_timestamp();
