'use client';

import { useState, FormEvent } from 'react';

interface EditParticipantButtonProps {
  participantId: string;
  tournamentId: string;
  initialName: string;
  onUpdate: (formData: FormData) => Promise<void>;
}

export function EditParticipantButton({
  participantId,
  tournamentId,
  initialName,
  onUpdate,
}: EditParticipantButtonProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('اسم المشارك لا يمكن أن يكون فارغًا');
      return;
    }

    if (trimmedName === initialName) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('participantId', participantId);
      formData.append('tournamentId', tournamentId);
      formData.append('name', trimmedName);

      await onUpdate(formData);
      setIsEditing(false);
      setName(trimmedName);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'خطأ في تحديث اسم المشارك';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(initialName);
    setError(null);
  };

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-primary">{name}</span>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="ml-2 px-3 py-1 text-xs font-semibold button-secondary"
          title="تعديل اسم المشارك"
        >
          ✎ تعديل
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded border border-border bg-surface px-2 py-1 text-sm text-primary placeholder:text-muted focus:border-primary focus:outline-none"
          placeholder="اسم المشارك"
          autoFocus
          disabled={isSaving}
        />
        <button
          type="submit"
          className="px-3 py-1 text-xs font-semibold button-primary disabled:opacity-50"
          disabled={isSaving}
        >
          {isSaving ? 'جاري...' : 'حفظ'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="px-3 py-1 text-xs font-semibold button-secondary"
          disabled={isSaving}
        >
          إلغاء
        </button>
      </div>
      {error && (
        <div className="rounded border border-danger/20 bg-danger/10 p-2 text-xs text-danger">
          {error}
        </div>
      )}
    </form>
  );
}
