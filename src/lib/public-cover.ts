export type PublicCoverUrls = {
  cover: string | null;
  placeholder: string | null;
};

const storageBaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");

export const publicCoverUrls = (accessCode: string): PublicCoverUrls => {
  if (!storageBaseUrl || !accessCode) return { cover: null, placeholder: null };

  const folder = encodeURIComponent(accessCode.trim().toUpperCase());
  const base = `${storageBaseUrl}/storage/v1/object/public/event-covers/invitations/${folder}`;
  return { cover: `${base}/cover.webp`, placeholder: `${base}/placeholder.webp` };
};

export const preloadPublicCover = (accessCode: string) => {
  const { cover, placeholder } = publicCoverUrls(accessCode);
  [placeholder, cover].filter(Boolean).forEach((url) => {
    const image = new Image();
    image.src = url as string;
  });
};
