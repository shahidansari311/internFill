/**
 * Resume feature types.
 */

export interface Resume {
  id?: number;
  name: string;
  fileName: string;
  mimeType: string;
  size: number;
  data: Blob;
  profileId: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
