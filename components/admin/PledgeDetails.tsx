type AdminPledge = {
  id: string;
  userId: string | null;
  gcUsername: string;
  title: string | null;
  cacheType: string;
  cacheSize: string;
  approxSuburb: string;
  approxState: string;
  conceptNotes: string | null;
  images: unknown; // Prisma Json type - can be array of objects, array of strings, or null
  status: string;
  createdAt: string;
  user: {
    id: string;
    email: string | null;
    gcUsername: string | null;
  } | null;
  submission: {
    id: string;
    gcCode: string;
    cacheName: string;
    suburb: string;
    state: string;
    difficulty: number;
    terrain: number;
    type: string;
    hiddenDate: string;
    notes: string | null;
    createdAt: string;
  } | null;
};

type PledgeDetailsProps = {
  pledge: AdminPledge;
};

function formatDate(value: string | Date) {
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const badgeBase = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold';

const statusColours: Record<string, string> = {
  CONCEPT: 'bg-yellow-100 text-yellow-800',
  HIDDEN: 'bg-green-100 text-green-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
};

function StatusBadge({ status }: { status: string }) {
  const colours = statusColours[status] || 'bg-slate-100 text-slate-800';
  return (
    <span className={`${badgeBase} ${colours}`}>
      {status}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className={`${badgeBase} bg-slate-100 text-slate-800`}>
      {type}
    </span>
  );
}

function SizeBadge({ size }: { size: string }) {
  return (
    <span className={`${badgeBase} bg-slate-100 text-slate-800`}>
      {size}
    </span>
  );
}

export function PledgeDetails({ pledge }: PledgeDetailsProps) {
  // Parse images - UploadThing format: array of { url, key, width?, height? }
  let imageUrls: string[] = [];
  if (pledge.images) {
    if (Array.isArray(pledge.images)) {
      // Handle array of objects with url property, or array of strings
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
        // If parsing fails, treat as single URL
        imageUrls = [pledge.images];
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Pledge Section */}
      <section>
        <h4 className="text-lg font-semibold mb-3">Pledge</h4>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <div>
            <dt className="font-medium text-slate-600 text-sm">GC Username</dt>
            <dd className="text-sm">{pledge.gcUsername}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-600 text-sm">Title</dt>
            <dd className="text-sm">{pledge.title || 'Untitled'}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-600 text-sm">Type</dt>
            <dd className="text-sm">
              <TypeBadge type={pledge.cacheType} />
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-600 text-sm">Size</dt>
            <dd className="text-sm">
              <SizeBadge size={pledge.cacheSize} />
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-600 text-sm">Location</dt>
            <dd className="text-sm">{pledge.approxSuburb}, {pledge.approxState}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-600 text-sm">Status</dt>
            <dd className="text-sm">
              <StatusBadge status={pledge.status} />
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-600 text-sm">Created At</dt>
            <dd className="text-sm">{formatDate(pledge.createdAt)}</dd>
          </div>
          {pledge.user?.email && (
            <div>
              <dt className="font-medium text-slate-600 text-sm">User Email (Internal)</dt>
              <dd className="text-sm">{pledge.user.email}</dd>
            </div>
          )}
        </dl>

        {pledge.conceptNotes && (
          <div className="mt-4">
            <dt className="font-medium text-slate-600 text-sm mb-1">Concept Notes</dt>
            <dd className="text-sm whitespace-pre-wrap bg-slate-50 p-3 rounded-md border border-slate-200">
              {pledge.conceptNotes}
            </dd>
          </div>
        )}
      </section>

      {/* Submission Section */}
      {pledge.submission && (
        <section>
          <h4 className="text-lg font-semibold mb-3">Submission</h4>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div>
              <dt className="font-medium text-slate-600 text-sm">GC Code</dt>
              <dd className="text-sm font-mono">{pledge.submission.gcCode}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-600 text-sm">Cache Name</dt>
              <dd className="text-sm">{pledge.submission.cacheName}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-600 text-sm">D / T</dt>
              <dd className="text-sm">{pledge.submission.difficulty} / {pledge.submission.terrain}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-600 text-sm">Type</dt>
              <dd className="text-sm">
                <TypeBadge type={pledge.submission.type} />
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-600 text-sm">Hidden Date</dt>
              <dd className="text-sm">{formatDate(pledge.submission.hiddenDate)}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-600 text-sm">Location</dt>
              <dd className="text-sm">{pledge.submission.suburb}, {pledge.submission.state}</dd>
            </div>
          </dl>

          {pledge.submission.notes && (
            <div className="mt-4">
              <dt className="font-medium text-slate-600 text-sm mb-1">Notes</dt>
              <dd className="text-sm whitespace-pre-wrap bg-slate-50 p-3 rounded-md border border-slate-200">
                {pledge.submission.notes}
              </dd>
            </div>
          )}
        </section>
      )}

      {/* Images Section */}
      <section>
        <h4 className="text-lg font-semibold mb-3">Images</h4>
        {imageUrls.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {imageUrls.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="h-24 w-full rounded-md object-cover border border-slate-200 overflow-hidden hover:opacity-80 transition-opacity"
              >
                <img
                  src={url}
                  alt={`Image ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No images attached.</p>
        )}
      </section>

      {/* Debug Section (Optional) */}
      <details className="mt-6">
        <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-700">
          Show raw JSON (debug)
        </summary>
        <pre className="mt-2 text-xs overflow-auto bg-slate-50 p-3 rounded-md border border-slate-200">
          {JSON.stringify(pledge, null, 2)}
        </pre>
      </details>
    </div>
  );
}


