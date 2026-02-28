'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import SportButton from '@/components/ui/SportButton';
import type { User } from '@supabase/supabase-js';

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
  display_name: string;
  avatar_url: string | null;
}

export default function RegisterPage() {
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
          setError('البطولة غير موجودة');
          setLoading(false);
          return;
        }

        setTournament(tournamentData);

        // If user is logged in, get their profile and check registration
        if (currentUser) {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('id, display_name, avatar_url')
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
        setError('حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    }

    loadData();
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
          name: profile.display_name,
          avatar_url: profile.avatar_url,
        });

      if (insertError) {
        if (insertError.code === '23505') {
          setError('أنت مسجل مسبقاً في هذه البطولة');
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
      setError('حدث خطأ في التسجيل، حاول مرة أخرى');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-gradient)' }}>
        <div className="text-xl" style={{ color: 'var(--text-primary)' }}>جاري التحميل...</div>
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
            <SportButton variant="primary">العودة للبطولات</SportButton>
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
            {tournament.status === 'finished' ? 'البطولة انتهت' : 'التسجيل مغلق'}
          </h1>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            عذراً، التسجيل في هذه البطولة غير متاح حالياً
          </p>
          <Link href={`/t/${slug}`}>
            <SportButton variant="secondary">العودة للبطولة</SportButton>
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
            سجّل دخولك أولاً
          </h1>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            لازم تسجل دخول عشان تسجل في البطولة
          </p>
          <div className="flex flex-col gap-3">
            <Link href={`/auth/login?redirect=/t/${slug}/register`}>
              <SportButton variant="primary" className="w-full">تسجيل الدخول</SportButton>
            </Link>
            <Link href="/auth/register">
              <SportButton variant="secondary" className="w-full">إنشاء حساب جديد</SportButton>
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
            أنت مسجل مسبقاً
          </h1>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            لقد سجلت في هذه البطولة من قبل
          </p>
          <Link href={`/t/${slug}`}>
            <SportButton variant="primary">العودة للبطولة</SportButton>
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
            تم التسجيل بنجاح!
          </h1>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
            مبروك! تم تسجيلك في {tournament?.name}
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            جاري تحويلك لصفحة البطولة...
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
          التسجيل في {tournament?.name}
        </h1>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          {tournament?.format === 'league' ? 'بطولة دوري' : 'بطولة خروج المغلوب'}
          {tournament?.team_size && tournament.team_size > 1 ? ` (${tournament.team_size}v${tournament.team_size})` : ' (1v1)'}
        </p>

        {/* Show user info */}
        <div 
          className="rounded-xl p-4 mb-6 flex items-center justify-center gap-3"
          style={{ background: 'var(--card-bg-secondary)' }}
        >
          {profile?.avatar_url ? (
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
            {profile?.display_name || 'لاعب'}
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
            {registering ? 'جاري التسجيل...' : 'سجّلني في البطولة 🎮'}
          </SportButton>
          <Link href={`/t/${slug}`}>
            <SportButton variant="ghost" className="w-full">إلغاء</SportButton>
          </Link>
        </div>
      </Card>
    </div>
  );
}
