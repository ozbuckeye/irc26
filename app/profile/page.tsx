import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import Card from '@/components/Card';
import { formatDate } from '@/lib/date-utils';
import ProfileStats from '@/components/ProfileStats';

export default async function ProfilePage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/profile');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      pledges: {
        orderBy: { createdAt: 'desc' },
      },
      submissions: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) {
    return (
      <main
        className="relative min-h-screen bg-cover bg-center bg-fixed"
        style={{ backgroundImage: 'url(/Background%20Storm.PNG)' }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex items-center justify-center pt-24 pb-16 px-4">
          <Card className="max-w-2xl mx-auto p-8 bg-white/95 rounded-3xl shadow-lg">
            <h1 className="text-3xl font-lovely text-center mb-4">Profile</h1>
            <p className="text-center text-sm">
              We couldn&apos;t find your profile record. Please try signing out and back in.
            </p>
          </Card>
        </div>
      </main>
    );
  }

  const joinedDate = user.createdAt ? formatDate(user.createdAt, 'DD MMM YYYY') : null;

  // Format helper for dates
  const formatDateSimple = (date: Date) => {
    return formatDate(date, 'DD MMM YYYY');
  };

  // Cache type labels
  const cacheTypeLabels: Record<string, string> = {
    TRADITIONAL: 'Traditional',
    MULTI: 'Multi-cache',
    MYSTERY: 'Mystery',
    LETTERBOX: 'Letterbox',
    WHERIGO: 'Wherigo',
    VIRTUAL: 'Virtual',
  };

  // Cache size labels
  const cacheSizeLabels: Record<string, string> = {
    NANO: 'Nano',
    MICRO: 'Micro',
    SMALL: 'Small',
    REGULAR: 'Regular',
    LARGE: 'Large',
    OTHER: 'Other',
  };

  // State labels
  const stateLabels: Record<string, string> = {
    ACT: 'ACT',
    NSW: 'NSW',
    NT: 'NT',
    QLD: 'QLD',
    SA: 'SA',
    TAS: 'TAS',
    VIC: 'VIC',
    WA: 'WA',
  };

  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: 'url(/Background%20Storm.PNG)' }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content card */}
      <div className="relative z-10 pt-24 pb-16 px-4">
        <section className="max-w-4xl mx-auto">
          <Card className="bg-white/95 rounded-3xl shadow-xl px-6 py-8 sm:px-10 sm:py-10 space-y-8">
            {/* Heading */}
            <div className="text-center space-y-2">
              <h1 className="font-lovely text-4xl sm:text-5xl">Your Profile</h1>
              <p className="text-sm sm:text-base font-arial-rounded">Welcome back, Rainmaker.</p>
            </div>

            {/* User info */}
            <div className="space-y-3 border-t border-black/10 pt-6">
              <h2 className="font-lovely text-2xl mb-2 text-center sm:text-left">Account</h2>
              <div className="grid gap-2 text-sm sm:text-base font-arial-rounded">
                <div>
                  <span className="font-semibold">Email:</span> {user.email}
                </div>
                <div>
                  <span className="font-semibold">Geocaching username:</span>{' '}
                  {user.gcUsername ?? 'Not set'}
                </div>
                {joinedDate && (
                  <div>
                    <span className="font-semibold">Joined IRC26:</span> {joinedDate}
                  </div>
                )}
                <p className="text-xs text-black/60 mt-1">
                  Email changes are not available from this page.
                </p>
              </div>
            </div>

            {/* Pledges */}
            <div className="space-y-4 border-t border-black/10 pt-6">
              <h2 className="font-lovely text-2xl text-center sm:text-left">Your Pledges</h2>
              {user.pledges.length === 0 ? (
                <p className="text-sm sm:text-base text-black/70 font-arial-rounded">
                  You haven&apos;t pledged any caches yet. Head to the PLEDGE page to make it Rain Down
                  Love.
                </p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {user.pledges.map((pledge) => (
                    <div
                      key={pledge.id}
                      className="border border-black/10 rounded-2xl px-4 py-3 bg-white/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                    >
                      <div className="text-sm font-arial-rounded">
                        <div className="font-semibold">
                          {pledge.title || 'Untitled cache idea'}
                        </div>
                        <div className="text-black/70">
                          {cacheTypeLabels[pledge.cacheType] || pledge.cacheType} •{' '}
                          {cacheSizeLabels[pledge.cacheSize] || pledge.cacheSize} •{' '}
                          {pledge.approxSuburb}, {stateLabels[pledge.approxState] || pledge.approxState}
                        </div>
                        <div className="text-xs text-black/60">
                          Status: {pledge.status} • Created {formatDateSimple(pledge.createdAt)}
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end text-xs sm:text-sm">
                        <a
                          href={`/pledge/${pledge.id}/edit`}
                          className="underline text-primary-600 hover:text-primary-700"
                        >
                          Edit pledge
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submissions */}
            <div className="space-y-4 border-t border-black/10 pt-6">
              <h2 className="font-lovely text-2xl text-center sm:text-left">Your Submissions</h2>
              {user.submissions.length === 0 ? (
                <p className="text-sm sm:text-base text-black/70 font-arial-rounded">
                  Once you&apos;ve turned your pledges into real GC codes, they&apos;ll appear here.
                </p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {user.submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="border border-black/10 rounded-2xl px-4 py-3 bg-white/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                    >
                      <div className="text-sm font-arial-rounded">
                        <div className="font-semibold">
                          {sub.cacheName || 'Unnamed cache'} ({sub.gcCode})
                        </div>
                        <div className="text-black/70">
                          {cacheTypeLabels[sub.type] || sub.type} • {sub.suburb},{' '}
                          {stateLabels[sub.state] || sub.state}
                        </div>
                        <div className="text-xs text-black/60">
                          D/T: {sub.difficulty}/{sub.terrain}
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end text-xs sm:text-sm">
                        <a
                          href={`/submission/${sub.id}/edit`}
                          className="underline text-primary-600 hover:text-primary-700"
                        >
                          Edit submission
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </section>
      </div>

      {/* Stats bar at bottom */}
      <div className="relative z-10 pb-10">
        <ProfileStats />
      </div>
    </main>
  );
}






