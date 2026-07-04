import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link2, Globe } from 'lucide-react';
import { Input, Button } from '@/shared/components';
import { socialLinksSchema, type SocialLinksFormData } from '../schemas';
import type { SocialLinks } from '../types';

interface SocialLinksFormProps {
  data: SocialLinks;
  onSave: (data: SocialLinks) => Promise<void>;
}

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export function SocialLinksForm({ data, onSave }: SocialLinksFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SocialLinksFormData>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues: data,
  });

  const onSubmit = async (formData: SocialLinksFormData) => {
    await onSave(formData as SocialLinks);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-section">
      <h3 className="form-section-title">
        <Link2 size={18} />
        Social Links
      </h3>

      <div className="form-grid">
        <Input
          label="LinkedIn"
          icon={<LinkedInIcon />}
          placeholder="https://linkedin.com/in/johndoe"
          error={errors.linkedin?.message}
          {...register('linkedin')}
        />
        <Input
          label="GitHub"
          icon={<GitHubIcon />}
          placeholder="https://github.com/johndoe"
          error={errors.github?.message}
          {...register('github')}
        />
        <Input
          label="Portfolio"
          icon={<Globe size={16} />}
          placeholder="https://johndoe.dev"
          error={errors.portfolio?.message}
          {...register('portfolio')}
        />
        <Input
          label="Twitter / X"
          placeholder="https://twitter.com/johndoe"
          error={errors.twitter?.message}
          {...register('twitter')}
        />
        <Input
          label="LeetCode"
          placeholder="https://leetcode.com/johndoe"
          error={errors.leetcode?.message}
          {...register('leetcode')}
        />
        <Input
          label="Other"
          placeholder="Any other link"
          error={errors.other?.message}
          {...register('other')}
        />
      </div>

      <div className="form-actions">
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={!isDirty}
        >
          Save Social Links
        </Button>
      </div>
    </form>
  );
}
