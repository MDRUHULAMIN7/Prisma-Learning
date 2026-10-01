'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentUser } from './auth';

const INITIAL_TAGS = [
  { id: 'tag-1', name: 'JavaScript', color: 'neo-yellow' },
  { id: 'tag-2', name: 'Database', color: 'neo-green' },
  { id: 'tag-3', name: 'Learning', color: 'neo-pink' },
  { id: 'tag-4', name: 'Frontend', color: 'neo-cyan' },
  { id: 'tag-5', name: 'Ideas', color: 'neo-orange' },
];

const INITIAL_NOTES = [
  {
    id: 'note-1',
    title: 'Welcome to your learning notebook',
    content: 'Create notes here to keep track of concepts, examples, and questions as you learn.',
    userId: 'user-1',
    createdAt: new Date('2026-06-01T10:00:00Z'),
    updatedAt: new Date('2026-06-01T10:00:00Z'),
    tags: [INITIAL_TAGS[2], INITIAL_TAGS[4]],
  },
  {
    id: 'note-2',
    title: 'Remember to practice',
    content: 'Small examples make new programming ideas easier to understand.',
    userId: 'user-1',
    createdAt: new Date('2026-06-10T14:30:00Z'),
    updatedAt: new Date('2026-06-10T14:30:00Z'),
    tags: [INITIAL_TAGS[0], INITIAL_TAGS[2]],
  },
];

// Keep the demo data available while Next.js reloads modules in development.
globalThis.learningNotes ??= INITIAL_NOTES;

export async function getTags() {
  return INITIAL_TAGS;
}

export async function getNotes(filters = {}) {
  const search = filters.search?.trim().toLocaleLowerCase();
  return [...globalThis.learningNotes]
    .filter((note) => !filters.tag || note.tags.some((tag) => tag.name === filters.tag))
    .filter((note) => !search || `${note.title} ${note.content}`.toLocaleLowerCase().includes(search))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getNoteById(id) {
  return globalThis.learningNotes.find((note) => note.id === id) ?? null;
}

export async function createNote(prevState, formData) {
  const title = String(formData.get('title') || '').trim();
  const content = String(formData.get('content') || '').trim();
  const tagIds = formData.getAll('tags');

  if (!title || !content) {
    return { success: false, error: 'Title and content are required.' };
  }

  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'You must be logged in.' };

  const now = new Date();
  globalThis.learningNotes.push({
    id: `note-${Date.now()}`,
    title,
    content,
    userId: user.id,
    createdAt: now,
    updatedAt: now,
    tags: INITIAL_TAGS.filter((tag) => tagIds.includes(tag.id)),
  });

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function updateNote(noteId, prevState, formData) {
  const title = String(formData.get('title') || '').trim();
  const content = String(formData.get('content') || '').trim();
  const tagIds = formData.getAll('tags');

  if (!title || !content) {
    return { success: false, error: 'Title and content are required.' };
  }

  const note = globalThis.learningNotes.find((item) => item.id === noteId);
  if (!note) return { success: false, error: 'Note not found.' };

  note.title = title;
  note.content = content;
  note.tags = INITIAL_TAGS.filter((tag) => tagIds.includes(tag.id));
  note.updatedAt = new Date();

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function deleteNote(noteId) {
  const index = globalThis.learningNotes.findIndex((note) => note.id === noteId);
  if (index === -1) return { success: false, error: 'Note not found.' };

  globalThis.learningNotes.splice(index, 1);
  revalidatePath('/dashboard');
  return { success: true };
}
