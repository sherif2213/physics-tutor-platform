export const TEACHER_EMAIL = 'sherifshaheen068@gmail.com';

export function isTeacherUser(user) {
  return !!user && user.email?.toLowerCase() === TEACHER_EMAIL.toLowerCase();
}
