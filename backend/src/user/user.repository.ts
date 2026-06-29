import { User } from '../models/User.model';

export class UserRepository {
  async findByEmail(email: string) {
    return User.findOne({
      email: email.toLowerCase(),
    });
  }

  async search(query: string) {
    return User.find({
      $or: [
        {
          fullName: {
            $regex: query,
            $options: 'i',
          },
        },
        {
          email: {
            $regex: query,
            $options: 'i',
          },
        },
      ],
    }).select('_id fullName email avatarUrl');
  }
  async findById(id: string) {
  return User.findById(id);
}
async existsByEmail(email: string): Promise<boolean> {
  const user = await User.exists({
    email: email.toLowerCase(),
  });

  return !!user;
}
// async findByEmail(email: string) {
//   return User.findOne({
//     email: email.toLowerCase(),
//   });
// }
}