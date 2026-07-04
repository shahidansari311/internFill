import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wrench, Plus, Trash2 } from 'lucide-react';
import { Input, Button, Select } from '@/shared/components';
import { skillSchema } from '../schemas';
import type { Skill } from '../types';
import { createSkill } from '../types';

const formSchema = z.object({ items: z.array(skillSchema) });
type FormData = z.infer<typeof formSchema>;

const PROFICIENCY_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

interface SkillsFormProps {
  data: Skill[];
  onSave: (data: Skill[]) => Promise<void>;
}

export function SkillsForm({ data, onSave }: SkillsFormProps) {
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
          <Wrench size={18} />
          Skills
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => append(createSkill())}
        >
          Add
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="form-empty">
          <p>No skills added yet. Click "Add" to get started.</p>
        </div>
      )}

      <div className="skills-grid">
        {fields.map((field, index) => (
          <div key={field.id} className="skill-entry">
            <Input
              label="Skill"
              placeholder="React"
              error={errors.items?.[index]?.name?.message}
              required
              {...register(`items.${index}.name`)}
            />
            <Select
              label="Proficiency"
              options={PROFICIENCY_OPTIONS}
              {...register(`items.${index}.proficiency`)}
            />
            <Input
              label="Category"
              placeholder="Frontend"
              {...register(`items.${index}.category`)}
            />
            <button
              type="button"
              className="form-entry-remove skill-remove"
              onClick={() => remove(index)}
            >
              <Trash2 size={14} />
            </button>
            <input type="hidden" {...register(`items.${index}.id`)} />
          </div>
        ))}
      </div>

      <div className="form-actions">
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={!isDirty}
        >
          Save Skills
        </Button>
      </div>
    </form>
  );
}
