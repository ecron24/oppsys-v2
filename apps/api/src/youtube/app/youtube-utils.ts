export function calculateUploadCost(params: {
  videoType: string;
  fileSize: number;
  generateThumbnail: boolean;
  privacy: string;
}): number {
  const baseCosts: Record<string, number> = {
    video: 100,
    short: 50,
    live: 150,
  };

  const baseCost = baseCosts[params.videoType] || 100;
  const thumbnailCost = params.generateThumbnail ? 15 : 0;
  const privacyMultiplier = params.privacy === "public" ? 1 : 0.9;
  const sizeMultiplier = params.fileSize > 500 * 1024 * 1024 ? 1.2 : 1;

  return Math.ceil(
    (baseCost + thumbnailCost) * privacyMultiplier * sizeMultiplier
  );
}

export function validateYouTubeData(params: {
  title: string;
  description: string;
  tags: string[];
}): ValidateYouTubeResponse {
  const errors = [];

  if (!params.title || params.title.trim().length < 3) {
    errors.push("Le titre doit contenir au moins 3 caractères");
  }
  if (params.title.length > 100) {
    errors.push("Le titre ne peut pas dépasser 100 caractères");
  }

  if (params.description && params.description.length > 5000) {
    errors.push("La description ne peut pas dépasser 5000 caractères");
  }

  if (params.tags && params.tags.length > 15) {
    errors.push("Maximum 15 tags autorisés");
  }

  const invalidTags = params.tags.filter((tag) => tag.length > 30);
  if (invalidTags.length > 0) {
    errors.push("Les tags ne peuvent pas dépasser 30 caractères chacun");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
type ValidateYouTubeResponse = {
  valid: boolean;
  errors: string[];
};
