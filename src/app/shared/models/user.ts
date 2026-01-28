export type UserRole = 'participant' | 'organizer' | 'admin';

export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
  readonly avatarUrl?: string;
  readonly bio?: string;
}

export interface ProfileUpdate {
  name?: string;
  avatarUrl?: string;
  bio?: string;
}
