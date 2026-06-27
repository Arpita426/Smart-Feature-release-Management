// export const hashPassword = async (_password: string) => {
//   return _password;
// };

// export const comparePassword = async (_password: string, _hash: string) => {
//   return _password === _hash;
// };
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Hash plain text password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare plain password with hashed password
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}