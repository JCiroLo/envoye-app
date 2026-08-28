export type VideoSubmission = {
  id: string;
  guestName: string | null;
  originalUrl: string | null;
  optimizedUrl: string | null;
  mimeType: string | null;
  durationSeconds: number | null;
  processingStatus: "pending" | "processing" | "ready" | "failed";
  createdAt: string;
};

export type VideoSource = "original" | "optimized";

export type MediaType = "video" | "audio" | "image";

export type MediaSubmission = Omit<VideoSubmission, "mediaType"> & {
  mediaType: MediaType;
};
