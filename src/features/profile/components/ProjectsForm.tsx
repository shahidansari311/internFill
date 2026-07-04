import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FolderGit2, Plus, Trash2 } from 'lucide-react';
import { Input, Button } from '@/shared/components';
import { projectSchema } from '../schemas';
import type { Project } from '../types';
import { createProject } from '../types';

const formSchema = z.object({ items: z.array(projectSchema) });
type FormData = z.infer<typeof formSchema>;

interface ProjectsFormProps {
  data: Project[];
  onSave: (data: Project[]) => Promise<void>;
}

export function ProjectsForm({ data, onSave }: ProjectsFormProps) {
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
          <FolderGit2 size={18} />
          Projects
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => append(createProject())}
        >
          Add
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="form-empty">
          <p>No projects added yet. Click "Add" to get started.</p>
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
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div className="form-grid">
            <Input
              label="Project Name"
              placeholder="InternFill"
              error={errors.items?.[index]?.name?.message}
              required
              {...register(`items.${index}.name`)}
            />
            <Input
              label="Live URL"
              placeholder="https://example.com"
              {...register(`items.${index}.liveUrl`)}
            />
            <Input
              label="Repository URL"
              placeholder="https://github.com/user/repo"
              {...register(`items.${index}.repoUrl`)}
            />
            <div className="full-width">
              <div className="input-group input-full">
                <label className="input-label">Description</label>
                <textarea
                  className="input-field"
                  rows={2}
                  placeholder="Brief description of the project..."
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
          Save Projects
        </Button>
      </div>
    </form>
  );
}
