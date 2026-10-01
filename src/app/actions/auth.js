'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const SESSION_COOKIE_NAME = 'learning_session';

const initialUsers = [
  {
    id: 'user-1',
    name: 'Demo Learner',
    email: 'learner@example.com',
    password: 'learning123',
  },
];

globalThis.learningUsers ??= initialUsers;

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = globalThis.learningUsers.find((item) => item.id === userId);

  if (!user) return null;

  return { id: user.id, name: user.name, email: user.email };
}

async function startSession(userId) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: userId,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function loginUser(prevState, formData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  const user = globalThis.learningUsers.find(
    (item) => item.email === email && item.password === password,
  );
  if (!user) return { success: false, error: 'Invalid email or password.' };

  await startSession(user.id);
  redirect('/dashboard');
}

export async function registerUser(prevState, formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');

  if (!name || !email || !password) {
    return { success: false, error: 'All fields are required.' };
  }

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password
      }
    })
    const cookieStore = await cookies();
    cookieStore.set({
      name: SESSION_COOKIE_NAME,
      value: user.id,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
  } catch (err) {
    console.log(err)
    return { success: false, error: "Registration failed." }
  }
  redirect('/dashboard');
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect('/');
}
