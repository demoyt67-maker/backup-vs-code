import { useState, useRef } from 'react';
import { Upload, User as UserIcon, Calendar, Mail, Loader2 } from 'lucide-react';
import { BackHeader } from '@/components/BackHeader';
import { CLASS_THEMES } from '@/theme';
import { uploadUstadPhoto, createUstadProfile, setStoredUstadEmail } from '@/lib/supabaseClient';

type Theme = (typeof CLASS_THEMES)[keyof typeof CLASS_THEMES];

interface Props {
  theme: Theme;
  onBack: () => void | Promise<void>;
  onSuccess: () => void;
}

export function UstadRegistrationForm({ theme, onBack, onSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setPhotoFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (submitting) return;

    if (!email.trim() || !email.includes('@')) {
      setError('Valid email is required');
      return;
    }

    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }

    const parsedAge = Number(age);
    if (!Number.isInteger(parsedAge) || parsedAge < 18 || parsedAge > 100) {
      setError('Please enter a valid age (18-100)');
      return;
    }

    setSubmitting(true);
    try {
      let photoUrl: string | null = null;

      if (photoFile) {
        photoUrl = await uploadUstadPhoto(email.trim(), photoFile);
      }

      const { error } = await createUstadProfile({
        email: email.trim(),
        full_name: fullName.trim(),
        age: parsedAge,
        photo_url: photoUrl,
      });

      if (error) {
        setError(error.message || 'Failed to submit registration');
        setSubmitting(false);
        return;
      }

      setStoredUstadEmail(email.trim());
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  };

  return (
    <div className="screen-shell mx-auto max-w-lg px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <BackHeader title="Ustad Registration" onBack={onBack} theme={theme} />

      <div className="rounded-[1.4rem] border border-primary-100 bg-white p-6 shadow-sm">
        <p className="mb-6 text-sm text-primary-700">
          Complete your profile to request Ustad access. Super Admin will review your request within 24 hours.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-primary-800">
              <Mail size={14} />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-xl border border-primary-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              style={{ color: theme.text }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-primary-800">
              Photo
            </label>
            <div className="flex items-center gap-4">
              <div
                className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50"
                style={{ color: theme.muted }}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <Upload size={24} />
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="liquid-button rounded-xl px-4 py-2 text-xs font-bold"
                  style={{ background: theme.primary, color: '#fff' }}
                >
                  Choose Photo
                </button>
                <p className="mt-1 text-[10px] text-primary-600">JPG or PNG</p>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-primary-800">
              <UserIcon size={14} />
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full rounded-xl border border-primary-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              style={{ color: theme.text }}
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-primary-800">
              <Calendar size={14} />
              Age
            </label>
            <input
              type="number"
              min={18}
              max={100}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter your age"
              className="w-full rounded-xl border border-primary-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              style={{ color: theme.text }}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] disabled:opacity-70"
            style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryStrong} 100%)` }}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
