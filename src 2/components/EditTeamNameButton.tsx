'use client';

import { useState, FormEvent } from 'react';
import { Pencil } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface EditTeamNameButtonProps {
  teamId: string;
  tournamentId: string;
  initialName: string;
  onUpdate: (formData: FormData) => Promise<void>;
  iconOnly?: boolean;
}

export function EditTeamNameButton({
  teamId,
  tournamentId,
  initialName,
  onUpdate,
  iconOnly = false,
}: EditTeamNameButtonProps) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(t('editTeam.teamNameRequired'));
      return;
    }

    if (trimmedName === initialName) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('teamId', teamId);
      formData.append('tournamentId', tournamentId);
      formData.append('name', trimmedName);

      await onUpdate(formData);
      setIsEditing(false);
      setName(trimmedName);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('editTeam.updateError');
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
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className={iconOnly ? "p-1 text-primary hover:opacity-90" : "text-xs text-primary hover:opacity-90 font-semibold"}
        title={t('editTeam.editTitle')}
      >
        {iconOnly ? <Pencil className="w-3.5 h-3.5" /> : t('editTeam.editName')}
      </button>
    );
  }

  return (
    <form onSubmit={handleSave} className="mt-2 space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          disabled={isSaving}
          autoFocus
        />
        <button
          type="submit"
          disabled={isSaving}
          className="button-primary px-3 py-2 text-xs font-bold disabled:opacity-50"
        >
          {isSaving ? '...' : t('matchEditor.save')}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSaving}
          className="button-secondary px-3 py-2 text-xs font-bold disabled:opacity-50"
        >
          {t('matchEditor.cancel')}
        </button>
      </div>
      {error && (
        <p className="text-xs text-danger">{error}</p>
      )}
    </form>
  );
}
