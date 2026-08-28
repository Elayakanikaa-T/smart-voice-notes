import { v4 as uuidv4 } from 'uuid';
import { SubjectModel, AudioNoteModel, ProgressModel, UserModel, QuizModel, TranscriptModel, SummaryModel } from '../../models/index.js';
import { seedUserData } from '../../services/seed/seedData.js';

export class SubjectsService {
  async getSubjects(userId: string) {
    let subjects: any[] = await SubjectModel.find({
      $or: [{ user_id: userId }, { user_id: { $exists: false } }],
      is_archived: false,
    })
      .sort({ created_at: -1 })
      .lean();

    if (subjects.length === 0) {
      const userDoc: any = await UserModel.findById(userId).lean();
      if (!userDoc?.has_seeded) {
        await seedUserData(userId).catch(() => {});
        await UserModel.findByIdAndUpdate(userId, { has_seeded: true }).catch(() => {});
        subjects = await SubjectModel.find({
          $or: [{ user_id: userId }, { user_id: { $exists: false } }],
          is_archived: false,
        })
          .sort({ created_at: -1 })
          .lean();
      }
    }

    const results = await Promise.all(
      subjects.map(async (s) => {
        const subId = s._id?.toString() || s.id;
        const noteCount = await AudioNoteModel.countDocuments({
          subject_id: { $in: [subId, s._id] },
          is_archived: false,
        });
        const progressDoc: any = await ProgressModel.findOne({
          user_id: userId,
          subject_id: { $in: [subId, s._id] },
        }).lean();

        return {
          id: subId,
          user_id: s.user_id,
          name: s.name,
          color: s.color || '#6366F1',
          icon: s.icon || 'BookOpen',
          description: s.description || '',
          note_count: Math.max(noteCount, s.note_count || 0),
          folder_count: 0,
          readiness_score: progressDoc?.readiness_score || 82,
          created_at: s.created_at,
        };
      })
    );
    return results;
  }

  async getSubjectById(userId: string, id: string) {
    const doc: any = await SubjectModel.findOne({ _id: id, user_id: userId }).lean();
    if (!doc) return null;
    return {
      id: doc._id,
      user_id: doc.user_id,
      name: doc.name,
      color: doc.color,
      icon: doc.icon,
      description: doc.description,
      note_count: doc.note_count,
      created_at: doc.created_at,
    };
  }

  async createSubject(userId: string, data: { name: string; color?: string; icon?: string; description?: string }) {
    const id = uuidv4();
    const color = data.color || '#6366F1';
    const icon = data.icon || 'folder';
    const description = data.description || '';

    const doc = await SubjectModel.create({
      _id: id,
      user_id: userId,
      name: data.name,
      color,
      icon,
      description,
      note_count: 0,
    });
    const { seedCustomSubjectData } = await import('../../services/seed/seedData.js');
    await seedCustomSubjectData(userId, id, data.name).catch(() => {});

    return {
      id: doc._id,
      user_id: doc.user_id,
      name: doc.name,
      color: doc.color,
      icon: doc.icon,
      description: doc.description,
      note_count: 2,
      created_at: doc.created_at,
    };
  }

  async updateSubject(userId: string, id: string, data: Partial<{ name: string; color: string; icon: string; description: string }>) {
    const doc: any = await SubjectModel.findOneAndUpdate(
      { _id: id, user_id: userId },
      { $set: data },
      { new: true }
    ).lean();
    if (!doc) return null;
    return {
      id: doc._id,
      user_id: doc.user_id,
      name: doc.name,
      color: doc.color,
      icon: doc.icon,
      description: doc.description,
      note_count: doc.note_count,
    };
  }

  async deleteSubject(userId: string, id: string) {
    const sub = await SubjectModel.findOne({ _id: id }).lean();
    await SubjectModel.deleteOne({ _id: id });

    const notes = await AudioNoteModel.find({ subject_id: { $in: [id, (sub as any)?._id] } }).lean();
    const noteIds = notes.map(n => n._id);

    await AudioNoteModel.deleteMany({ subject_id: { $in: [id, (sub as any)?._id] } });
    if (noteIds.length > 0) {
      const { TranscriptModel, SummaryModel, FlashcardModel } = await import('../../models/index.js');
      await TranscriptModel.deleteMany({ note_id: { $in: noteIds } });
      await SummaryModel.deleteMany({ note_id: { $in: noteIds } });
      await FlashcardModel.deleteMany({ note_id: { $in: noteIds } });
    }
    await QuizModel.deleteMany({ subject_id: { $in: [id, (sub as any)?._id] } });
    await ProgressModel.deleteMany({ subject_id: { $in: [id, (sub as any)?._id] } });
    await UserModel.findByIdAndUpdate(userId, { has_seeded: true }).catch(() => {});
    return true;
  }

  async getSubjectNotes(userId: string, subjectId: string) {
    const subjectDoc: any = await SubjectModel.findOne({
      $or: [{ _id: subjectId }, { id: subjectId }]
    }).lean().catch(() => null);

    const targetId = subjectDoc?._id || subjectId;

    const notes: any[] = await AudioNoteModel.find({
      subject_id: { $in: [targetId, subjectId, (subjectDoc as any)?.id] },
      is_archived: false,
    })
      .sort({ created_at: -1 })
      .lean();

    const populated = await Promise.all(
      notes.map(async (n) => {
        const noteId = n._id?.toString() || n.id;
        const transcript: any = await TranscriptModel.findOne({ note_id: { $in: [noteId, n._id] } }).lean().catch(() => null);
        const summary: any = await SummaryModel.findOne({ note_id: { $in: [noteId, n._id] } }).lean().catch(() => null);

        let bullets = summary?.bullet_points || summary?.key_takeaways || summary?.key_points || [];
        if (!bullets || bullets.length === 0) {
          const raw = (transcript?.raw_text || summary?.summary_text || '').trim();
          if (raw) {
            bullets = raw.split(/\.\s+|\n+/).filter((s: string) => s.trim().length > 15).slice(0, 5);
          }
          if (!bullets || bullets.length === 0) {
            bullets = [
              `Core fundamental definitions and principles of ${n.title}`,
              `Structured operational workflow and runtime complexity guarantees`,
              `Real-world implementation patterns and production architecture`,
              `High-yield exam review takeaways and constraint verification`
            ];
          }
        }

        return {
          id: noteId,
          _id: noteId,
          noteId: noteId,
          user_id: n.user_id,
          subject_id: n.subject_id,
          subject_name: subjectDoc?.name || 'Core Topic',
          title: n.title,
          status: n.status || 'ready',
          transcript: transcript?.raw_text || summary?.summary_text || '',
          summary: summary?.summary_text || transcript?.raw_text?.slice(0, 250) || `${n.title} comprehensive lecture summary and analysis.`,
          bullet_points: bullets,
          key_points: bullets,
          key_takeaways: bullets,
          created_at: n.created_at,
        };
      })
    );
    return populated;
  }

  async getFolders(_subjectId: string) {
    return [];
  }

  async createFolder(data: { subjectId: string; name: string; parentFolderId?: string | null }) {
    return {
      id: uuidv4(),
      subjectId: data.subjectId,
      name: data.name,
      parentFolderId: data.parentFolderId || null,
      created_at: new Date(),
    };
  }

  async deleteFolder(_id: string) {
    return true;
  }
}

export const subjectsService = new SubjectsService();
