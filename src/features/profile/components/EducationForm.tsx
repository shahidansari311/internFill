import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import { Input, Button } from '@/shared/components';
import { educationSchema } from '../schemas';
import type { Education } from '../types';
import { createEducation } from '../types';

const formSchema = z.object({ items: z.array(educationSchema) });
type FormData = z.infer<typeof formSchema>;

interface EducationFormProps {
  data: Education[];
  onSave: (data: Education[]) => Promise<void>;
}

export function EducationForm({ data, onSave }: EducationFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { items: data.length > 0 ? data : [createEducation()] },
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
          <GraduationCap size={18} />
          Education
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => append(createEducation())}
        >
          Add
        </Button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="form-entry">
          <div className="form-entry-header">
            <span className="form-entry-number">#{index + 1}</span>
            {fields.length > 1 && (
              <button
                type="button"
                className="form-entry-remove"
                onClick={() => remove(index)}
                aria-label="Remove education"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <div className="form-grid">
            <Input
              label="University"
              placeholder="MIT"
              error={errors.items?.[index]?.university?.message}
              required
              {...register(`items.${index}.university`)}
            />
            <Input
              label="Degree"
              placeholder="B.S. Computer Science"
              error={errors.items?.[index]?.degree?.message}
              required
              {...register(`items.${index}.degree`)}
            />
            <Input
              label="Field of Study"
              placeholder="Computer Science"
              {...register(`items.${index}.fieldOfStudy`)}
            />
            <Input
              label="CGPA / GPA"
              placeholder="3.8 / 4.0"
              {...register(`items.${index}.cgpa`)}
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
          Save Education
        </Button>
      </div>
    </form>
  );
}
