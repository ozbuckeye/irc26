import { prisma } from '@/lib/prisma';

export type AdminImageItem = {
  id: string;                // pledgeId or submissionId
  url: string;               // the image URL from UploadThing
  source: "pledge" | "submission";
  gcUsername: string;
  label: string;             // pledge title or submission cacheName
  createdAt: Date;
};

/**
 * Fetches all images from pledges and submissions for the admin gallery.
 * Returns a flattened array sorted by createdAt descending (most recent first).
 */
export async function getAllAdminImages(): Promise<AdminImageItem[]> {
  const images: AdminImageItem[] = [];

  // Fetch pledges with non-empty images
  // Exclude pledges that have submissions (images moved to submission)
  const allPledges = await prisma.pledge.findMany({
    where: {
      submission: null, // Only include pledges without submissions
    },
    select: {
      id: true,
      gcUsername: true,
      title: true,
      images: true,
      createdAt: true,
    },
  });

  // Filter to only pledges with non-null, non-empty images
  const pledges = allPledges.filter((pledge) => {
    if (!pledge.images) return false;
    // Check if images is an array with at least one item, or an object with urls array
    if (Array.isArray(pledge.images) && pledge.images.length > 0) return true;
    if (typeof pledge.images === 'object' && pledge.images !== null && 'urls' in pledge.images) {
      const imageObj = pledge.images as Record<string, unknown>;
      if (Array.isArray(imageObj.urls) && imageObj.urls.length > 0) return true;
    }
    return false;
  });

  // Process pledge images
  for (const pledge of pledges) {
    if (!pledge.images) continue;

    let imageUrls: string[] = [];
    
    // Parse images - handle various formats
    if (Array.isArray(pledge.images)) {
      imageUrls = pledge.images.map((img: unknown) => {
        if (typeof img === 'string') return img;
        if (img && typeof img === 'object' && 'url' in img) return (img as { url: string }).url;
        return null;
      }).filter((url): url is string => url !== null);
    } else if (typeof pledge.images === 'object' && pledge.images !== null && 'urls' in pledge.images) {
      imageUrls = ((pledge.images as Record<string, unknown>).urls as string[]) || [];
    } else if (typeof pledge.images === 'string') {
      try {
        const parsed = JSON.parse(pledge.images);
        if (Array.isArray(parsed)) {
          imageUrls = parsed.map((img: unknown) => {
            if (typeof img === 'string') return img;
            if (img && typeof img === 'object' && 'url' in img) return img.url;
            return null;
          }).filter((url): url is string => url !== null);
        } else if (parsed.urls) {
          imageUrls = parsed.urls;
        }
      } catch {
        // If parsing fails, skip this pledge's images
        continue;
      }
    }

    // Add each image URL as a separate entry
    for (const url of imageUrls) {
      images.push({
        id: pledge.id,
        url,
        source: 'pledge',
        gcUsername: pledge.gcUsername,
        label: pledge.title || 'Untitled Pledge',
        createdAt: pledge.createdAt,
      });
    }
  }

  // Fetch submissions with non-empty images
  // Note: For Json fields, we fetch all and filter in code since Prisma Json filters can be tricky
  const allSubmissions = await prisma.submission.findMany({
    select: {
      id: true,
      gcUsername: true,
      cacheName: true,
      images: true,
      createdAt: true,
    },
  });

  // Filter to only submissions with non-null, non-empty images
  const submissions = allSubmissions.filter((sub) => {
    if (!sub.images) return false;
    // Check if images is an array with at least one item, or an object with urls array
    if (Array.isArray(sub.images) && sub.images.length > 0) return true;
    if (typeof sub.images === 'object' && sub.images !== null && 'urls' in sub.images) {
      const imageObj = sub.images as Record<string, unknown>;
      if (Array.isArray(imageObj.urls) && imageObj.urls.length > 0) return true;
    }
    return false;
  });

  // Process submission images
  for (const submission of submissions) {
    if (!submission.images) continue;

    let imageUrls: string[] = [];
    
    // Parse images - handle various formats (same logic as pledges)
    if (Array.isArray(submission.images)) {
      imageUrls = submission.images.map((img: unknown) => {
        if (typeof img === 'string') return img;
        if (img && typeof img === 'object' && 'url' in img) return (img as { url: string }).url;
        return null;
      }).filter((url): url is string => url !== null);
    } else if (typeof submission.images === 'object' && submission.images !== null && 'urls' in submission.images) {
      imageUrls = ((submission.images as Record<string, unknown>).urls as string[]) || [];
    } else if (typeof submission.images === 'string') {
      try {
        const parsed = JSON.parse(submission.images);
        if (Array.isArray(parsed)) {
          imageUrls = parsed.map((img: unknown) => {
            if (typeof img === 'string') return img;
            if (img && typeof img === 'object' && 'url' in img) return (img as { url: string }).url;
            return null;
          }).filter((url): url is string => url !== null);
        } else if (parsed.urls) {
          imageUrls = parsed.urls;
        }
      } catch {
        // If parsing fails, skip this submission's images
        continue;
      }
    }

    // Add each image URL as a separate entry
    for (const url of imageUrls) {
      images.push({
        id: submission.id,
        url,
        source: 'submission',
        gcUsername: submission.gcUsername,
        label: submission.cacheName,
        createdAt: submission.createdAt,
      });
    }
  }

  // Sort by createdAt descending (most recent first)
  images.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return images;
}


