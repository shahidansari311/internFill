import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Briefcase, Plus, Trash2 } from 'lucide-react';
import { Input, Button } from '@/shared/components';
import { experienceSchema } from '../schemas';
import type { Experience } from '../types';
import { createExperience } from '../types';

const formSchema = z.object({ items: z.array(experienceSchema) });
type FormData = z.infer<typeof formSchema>;

interface ExperienceFormProps {
  data: Experience[];
  onSave: (data: Experience[]) => Promise<void>;
}

export function ExperienceForm({ data, onSave }: ExperienceFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { items: data.length > 0 ? data : [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const onSubmit = async (formData: FormData) => {
    await onSave(formData.items);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-section">
      <div className="form-section-header">
        <h3 className="form-section-title">
          <Briefcase size={18} />
          Experience
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => append(createExperience())}
        >
          Add
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="form-empty">
          <p>No experience added yet. Click "Add" to get started.</p>
        </div>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="form-entry">
          <div className="form-entry-header">
            <span className="form-entry-number">#{index + 1}</span>
            <button
              type="button"
              className="form-entry-remove"
              onClick={() => remove(index)}
              aria-label="Remove experience"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div className="form-grid">
            <Input
              label="Company"
              placeholder="Google"
              error={errors.items?.[index]?.company?.message}
              required
              {...register(`items.${index}.company`)}
            />
            <Input
              label="Role"
              placeholder="Software Engineer Intern"
              error={errors.items?.[index]?.role?.message}
              required
              {...register(`items.${index}.role`)}
            />
            <Input
              label="Location"
              placeholder="Mountain View, CA"
              {...register(`items.${index}.location`)}
            />
            <Input
              label="Start Date"
              type="month"
              error={errors.items?.[index]?.startDate?.message}
              required
              {...register(`items.${index}.startDate`)}
            />
            <Input
              label="End Date"
              type="month"
              hint="Leave empty if current"
              {...register(`items.${index}.endDate`)}
            />
            <div className="full-width">
              <div className="input-group input-full">
                <label className="input-label">Description</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Describe your responsibilities and achievements..."
                  {...register(`items.${index}.description`)}
                />
              </div>
            </div>
          </div>
          <input type="hidden" {...register(`items.${index}.id`)} />
        </div>
      ))}

      <div className="form-actions">
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={!isDirty}
        >
          Save Experience
        </Button>
      </div>
    </form>
  );
}
