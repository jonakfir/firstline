export function isAdmin(email: string | undefined): boolean {
  const admins = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  return !!email && admins.includes(email.toLowerCase());
}
