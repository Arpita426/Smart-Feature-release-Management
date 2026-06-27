import { AuthRepository } from './auth.repository';
import { RegisterInput } from './auth.validation';
import { hashPassword } from '../utils/password';
import { ConflictError } from '../errors/ConflictError';
import { LoginInput } from './auth.validation';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { comparePassword } from '../utils/password';
import { generateAccessToken } from '../utils/jwt';
export class AuthService {
  private authRepository = new AuthRepository();

  async register(registerData: RegisterInput) {
    const existingUser = await this.authRepository.findByEmail(
      registerData.email
    );

    if (existingUser) {
      //throw new Error('Email already exists');
      throw new ConflictError("Email already exists");
    }

    const hashedPassword = await hashPassword(registerData.password);

    const user = await this.authRepository.create({
      ...registerData,
      password: hashedPassword,
    });

    return {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      message: 'User registered successfully',
    };
  }
  async login(loginData: LoginInput) {
  const user = await this.authRepository.findByEmailWithPassword(
    loginData.email
  );

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await comparePassword(
    loginData.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const userId = user._id.toString();

const token = generateAccessToken({
  userId,
  email: user.email,
});

await this.authRepository.updateLastLogin(userId);

  return {
    token,
    user: {
      id: userId,
      fullName: user.fullName,
      email: user.email,
    },
  };
}
}

