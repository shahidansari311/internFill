import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Award, Plus, Trash2 } from 'lucide-react';
import { Input, Button } from '@/shared/components';
import { certificationSchema } from '../schemas';
import type { Certification } from '../types';
import { createCertification } from '../types';

const formSchema = z.object({ items: z.array(certificationSchema) });
type FormData = z.infer<typeof formSchema>;

interface CertificationsFormProps {
  data: Certification[];
  onSave: (data: Certification[]) => Promise<void>;
}

export function CertificationsForm({ data, onSave }: CertificationsFormProps) {
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
          <Award size={18} />
          Certifications
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => append(createCertification())}
        >
          Add
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="form-empty">
          <p>No certifications added. Click "Add" to get started.</p>
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
              label="Certification Name"
              placeholder="AWS Solutions Architect"
              error={errors.items?.[index]?.name?.message}
              required
              {...register(`items.${index}.name`)}
            />
            <Input
              label="Issuer"
              placeholder="Amazon Web Services"
              error={errors.items?.[index]?.issuer?.message}
              required
              {...register(`items.${index}.issuer`)}
            />
            <Input
              label="Issue Date"
              type="month"
              {...register(`items.${index}.issueDate`)}
            />
            <Input
              label="Credential URL"
              placeholder="https://credential.example.com/..."
              {...register(`items.${index}.credentialUrl`)}
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
          Save Certifications
        </Button>
      </div>
    </form>
  );
}
