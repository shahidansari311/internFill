/**
 * Application tracker types.
 */

export type ApplicationStatus = 'applied' | 'interview' | 'rejected' | 'offer';

export interface Application {
  id?: number;
  company: string;
  role: string;
  website: string;
  status: ApplicationStatus;
  notes: string;
  profileId: number;
  appliedAt: Date;
  updatedAt: Date;
}
