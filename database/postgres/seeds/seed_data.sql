-- Seed Data for Smart Voice Note Application

-- Demo User: password is 'Password123!' (bcrypt hash)
INSERT INTO users (id, email, password_hash, name, theme_pref, settings_json)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'student@smartnotes.ai',
    '$2b$10$w8T0GqWk23M1h7f2O4.m7.cM64m4XyRj/QsmPq3Z3E6rS3j6.U6Ue', -- Password123!
    'Alex Rivera',
    'dark',
    '{"autoSummarize": true, "autoGenerateQuiz": true, "audioQuality": "high", "offlineSync": true}'
) ON CONFLICT (email) DO NOTHING;

-- Subjects
INSERT INTO subjects (id, user_id, name, color, icon, description)
VALUES 
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Computer Science 101', '#6366F1', 'code', 'Algorithms, Data Structures & System Design'),
    ('b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Molecular Biology', '#10B981', 'activity', 'Cellular respiration, genetics, and biochemistry'),
    ('b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Modern World History', '#F59E0B', 'book-open', '20th-century geopolitics and industrial revolutions')
ON CONFLICT DO NOTHING;

-- Folders
INSERT INTO folders (id, subject_id, name)
VALUES 
    ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'Week 1: Graph Algorithms'),
    ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'Week 2: Dynamic Programming'),
    ('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Unit 1: Cellular Biology')
ON CONFLICT DO NOTHING;

-- Sample Note Meta
INSERT INTO notes_meta (id, user_id, subject_id, folder_id, title, audio_s3_key, duration_seconds, status, is_favorite)
VALUES 
    ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'Dijkstra and A* Search Algorithms', 'audio/a0eebc99/d1eebc99.m4a', 420, 'ready', true),
    ('d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a42', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Mitochondrial ATP Synthesis & Krebs Cycle', 'audio/a0eebc99/d2eebc99.m4a', 630, 'ready', false)
ON CONFLICT DO NOTHING;

-- Progress Scores
INSERT INTO progress_scores (user_id, subject_id, readiness_score, quiz_accuracy_avg, material_coverage_pct, review_recency_score, weak_areas_json, study_streak_days, total_study_minutes)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 84.50, 88.00, 90.00, 80.00, '["Heuristic Admissibility", "Priority Queue Complexity"]', 5, 240),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 72.00, 70.00, 80.00, 65.00, '["Electron Transport Chain Complex IV", "Chemiosmosis"]', 3, 180)
ON CONFLICT DO NOTHING;

-- Reminders
INSERT INTO reminders (user_id, subject_id, title, exam_date, reminder_rule)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'CS101 Midterm Examination', NOW() + INTERVAL '10 days', '["1d_before", "3d_before", "1w_before"]')
ON CONFLICT DO NOTHING;
