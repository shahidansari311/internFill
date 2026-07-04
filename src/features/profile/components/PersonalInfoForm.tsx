import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, MapPin, User } from 'lucide-react';
import { Input, Button } from '@/shared/components';
import { personalInfoSchema, type PersonalInfoFormData } from '../schemas';
import type { PersonalInfo } from '../types';

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onSave: (data: PersonalInfo) => Promise<void>;
}

export function PersonalInfoForm({ data, onSave }: PersonalInfoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: data,
  });

  const onSubmit = async (formData: PersonalInfoFormData) => {
    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-section">
      <h3 className="form-section-title">
        <User size={18} />
        Personal Information
      </h3>

      <div className="form-grid">
        <Input
          label="First Name"
          icon={<User size={16} />}
          placeholder="John"
          error={errors.firstName?.message}
          required
          {...register('firstName')}
        />
        <Input
          label="Last Name"
          placeholder="Doe"
          error={errors.lastName?.message}
          required
          {...register('lastName')}
        />
        <Input
          label="Email"
          type="email"
          icon={<Mail size={16} />}
          placeholder="john@example.com"
          error={errors.email?.message}
          required
          {...register('email')}
        />
        <Input
          label="Phone"
          type="tel"
          icon={<Phone size={16} />}
          placeholder="+1 (555) 123-4567"
          error={errors.phone?.message}
          required
          {...register('phone')}
        />
        <Input
          label="Location"
          icon={<MapPin size={16} />}
          placeholder="San Francisco, CA"
          error={errors.location?.message}
          {...register('location')}
        />
        <div className="full-width">
          <div className="input-group input-full">
            <label htmlFor="summary" className="input-label">
              Professional Summary
            </label>
            <textarea
              id="summary"
              className="input-field"
              rows={3}
              placeholder="Brief summary of your background and goals..."
              {...register('summary')}
            />
            {errors.summary && (
              <p className="input-error-text">{errors.summary.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="form-actions">
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={!isDirty}
        >
          Save Personal Info
        </Button>
      </div>
    </form>
  );
}
