'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import SportButton from '@/components/ui/SportButton';
import type { User } from '@supabase/supabase-js';
import { useLanguage } from '@/lib/i18n';

// Card wrapper with dark theme styling
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div 
      className={`rounded-2xl p-8 text-center max-w-md w-full ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      }}
    >
      {children}
    </div>
  );
}

interface Tournament {
  id: string;
  name: string;
  slug: string;
  status: string;
  format: string;
  team_size: number;
}

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

export default function RegisterPage() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function loadData() {
      try {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        // Get tournament by slug
        const { data: tournamentData, error: tournamentError } = await supabase
          .from('tournaments')
          .select('id, name, slug, status, format, team_size')
          .eq('slug', slug)
          .single();

        if (tournamentError || !tournamentData) {
          setError(t('register.tournamentNotFound'));
          setLoading(false);
          return;
        }

        setTournament(tournamentData);

        // If user is logged in, get their profile and check registration
        if (currentUser) {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('id, first_name, last_name, avatar_url')
            .eq('id', currentUser.id)
            .single();

          setProfile(profileData);

          // Check if already registered
          const { data: existingParticipant } = await supabase
            .from('participants')
            .select('id')
            .eq('tournament_id', tournamentData.id)
            .eq('user_id', currentUser.id)
            .single();

          if (existingParticipant) {
            setAlreadyRegistered(true);
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(t('register.loadError'));
      } finally {
        setLoading(false);
      }
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleRegister = async () => {
    if (!user || !profile || !tournament) return;

    setRegistering(true);
    setError(null);

    try {
      const supabase = createClient();

      const { error: insertError } = await supabase
        .from('participants')
        .insert({
          tournament_id: tournament.id,
          user_id: user.id,
          name: `${profile.first_name} ${profile.last_name}`.trim(),
          avatar_url: profile.avatar_url,
        });

      if (insertError) {
        if (insertError.code === '23505') {
          setError(t('register.alreadyRegistered'));
        } else {
          throw insertError;
        }
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/t/${slug}`);
        }, 2000);
      }
    } catch (err) {
      console.error('Error registering:', err);
      setError(t('register.registrationError'));
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-gradient)' }}>
        <div className="text-xl" style={{ color: 'var(--text-primary)' }}>{t('register.loading')}</div>
      </div>
    );
  }

  if (error && !tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-gradient)' }}>
        <Card>
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{error}</h1>
          <Link href="/tournaments">
            <SportButton variant="primary">{t('register.backToTournaments')}</SportButton>
          </Link>
        </Card>
      </div>
    );
  }

  // Tournament is closed or finished
  if (tournament && (tournament.status === 'finished' || tournament.status === 'closed')) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-gradient)' }}>
        <Card>
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {tournament.status === 'finished' ? t('register.tournamentEnded') : t('register.registrationClosed')}
          </h1>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            {t('register.notAvailable')}
          </p>
          <Link href={`/t/${slug}`}>
            <SportButton variant="secondary">{t('register.backToTournament')}</SportButton>
          </Link>
        </Card>
      </div>
    );
  }

  // Not logged in - show login prompt
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-gradient)' }}>
        <Card>
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {t('register.loginFirst')}
          </h1>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            {t('register.loginRequired')}
          </p>
          <div className="flex flex-col gap-3">
            <Link href={`/auth/login?redirect=/t/${slug}/register`}>
              <SportButton variant="primary" className="w-full">{t('register.login')}</SportButton>
            </Link>
            <Link href="/auth/register">
              <SportButton variant="secondary" className="w-full">{t('register.createAccount')}</SportButton>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Already registered
  if (alreadyRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-gradient)' }}>
        <Card>
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {t('register.alreadyRegistered')}
          </h1>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            {t('register.alreadyRegisteredDesc')}
          </p>
          <Link href={`/t/${slug}`}>
            <SportButton variant="primary">{t('register.backToTournament')}</SportButton>
          </Link>
        </Card>
      </div>
    );
  }

  // Success message
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-gradient)' }}>
        <Card>
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {t('register.success')}
          </h1>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
            {t('register.successDesc').replace('{name}', tournament?.name || '')}
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            {t('register.redirecting')}
          </p>
        </Card>
      </div>
    );
  }

  // Logged in - show register button
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-gradient)' }}>
      <Card>
        <div className="text-6xl mb-4">⚽</div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          {t('register.registerIn')} {tournament?.name}
        </h1>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          {tournament?.format === 'league' ? t('register.leagueTournament') : t('register.knockoutTournament')}
          {tournament?.team_size && tournament.team_size > 1 ? ` (${tournament.team_size}v${tournament.team_size})` : ' (1v1)'}
        </p>

        {/* Show user info */}
        <div 
          className="rounded-xl p-4 mb-6 flex items-center justify-center gap-3"
          style={{ background: 'var(--card-bg-secondary)' }}
        >
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={profile.avatar_url} 
              alt="" 
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{ background: 'var(--accent-primary)' }}
            >
              👤
            </div>
          )}
          <span className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            {profile ? `${profile.first_name} ${profile.last_name}`.trim() : t('register.player')}
          </span>
        </div>

        {error && (
          <div 
            className="rounded-xl p-4 mb-6"
            style={{ 
              background: 'rgba(239, 68, 68, 0.2)', 
              border: '1px solid rgba(239, 68, 68, 0.5)',
              color: '#fca5a5'
            }}
          >
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <SportButton 
            variant="primary" 
            size="lg"
            onClick={handleRegister}
            disabled={registering}
            className="w-full"
          >
            {registering ? t('register.registering') : t('register.registerMe')}
          </SportButton>
          <Link href={`/t/${slug}`}>
            <SportButton variant="ghost" className="w-full">{t('register.cancel')}</SportButton>
          </Link>
        </div>
      </Card>
    </div>
  );
}
