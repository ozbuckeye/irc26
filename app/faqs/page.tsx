'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { RAIN_START_DATE } from '@/config/irc26';

interface Stats {
  totalPledged: number;
  totalSubmissions: number;
  rainmakers: number;
  byState: Record<string, number>;
  byType: Record<string, number>;
}

function CountdownDisplay({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return <span>0d 0h 0m 0s</span>;
  }

  return (
    <span className="font-arial-rounded whitespace-nowrap">
      {timeLeft.days}d <span className="whitespace-nowrap">{timeLeft.hours}h</span>{' '}
      <span className="whitespace-nowrap">{timeLeft.minutes}m</span>{' '}
      <span className="whitespace-nowrap">{timeLeft.seconds}s</span>
    </span>
  );
}

export default function FAQs() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching stats:', err);
        setLoading(false);
      });
  }, []);

  return (
    <main
      className="relative bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: 'url(/Background%20Storm.PNG)',
      }}
    >
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/20 z-0"></div>

      {/* Content */}
      <div className="relative z-10 pt-10 sm:pt-14 md:pt-16 pb-0">
        {/* FAQ Card */}
        <section className="px-4 sm:px-6 mb-14 sm:mb-16">
          <div className="mx-auto max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl px-6 sm:px-8 py-8 border border-white/50">
            <div className="mx-auto w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center mb-8 sm:mb-10">
              <Image
                src="/IRC26_Logo_1.png"
                alt="IRC26 Logo"
                width={160}
                height={160}
                className="object-contain"
              />
            </div>
            <h1 className="font-lovely text-3xl sm:text-4xl text-center mb-12">
              FAQ<span className="text-2xl sm:text-3xl">s</span>
            </h1>

            


            <div className="mx-auto max-w-[68ch] text-[16px] leading-6 space-y-5 text-center font-arial-rounded font-bold">
              <div>
                <h2 className="font-lovely text-xl sm:text-2xl leading-tight tracking-wide mt-6 mb-2 text-center">
                  WHAT IS IRC26?
                </h2>
                <p className="leading-relaxed mt-1 text-center">It’s Raining Caches (IRC) is a project initiative by Sydney based geocacher, beautifulsky13. Based on the simple idea of making it ‘rain caches’ and with the support and creativity of 52 x CO’s and 1 x dedicated reviewer, saw 208 hides simultaneously on the 19th January 2025 at 9am over NSW and ACT. IRC26 is set to be bigger and better for the community to enjoy.</p>
              </div>
              {/* First Q/A */}
              <div>
                
                {/* Publishing Schedule / How to Get Involved Section */}
                <div className="bg-green-100/80 px-6 sm:px-8 py-8 mt-6 -mx-6 sm:-mx-8 rounded-lg">
                  <div className="mx-auto max-w-[70ch]">
                    <h2 className="font-lovely text-xl sm:text-2xl leading-tight tracking-wide text-center mb-2">
                      HOW DO I GET INVOLVED?
                    </h2>

                    <p className="text-center text-[16px] leading-6 mb-4">
                      We need as many CO&apos;s around Australia to hide<br />
                      fp worthy caches!
                    </p>

                    {/* 1. Pledge */}
                    <div className="mt-4">
                      <p className="text-[16px] leading-6 text-center">
                        <span className="font-lovely text-base sm:text-lg">1. PLEDGE:</span> Let us know you are planning to hide via the PLEDGE HIDES button on the home page or button on the top right of this website.
                      </p>
                    </div>

                    {/* 2. Prepare */}
                    <div className="mt-5">
                      <p className="text-[16px] leading-6 text-center">
                        <span className="font-lovely text-base sm:text-lg">2. PREPARE:</span> Follow the standard geocaching hide guidelines. Create, hide and submit your caches to your reviewer. Hides can be of any theme.
                      </p>
                    </div>

                    {/* IRC26 Banner */}
                    <div className="mt-5">
                      <p className="text-[16px] leading-6 text-center">
                        <span className="font-lovely text-base sm:text-lg">IRC26 BANNER:</span> You can include this at the bottom of your cache page. Download it here.
                      </p>
                    </div>

                    {/* IMPORTANT */}
                    <div className="mt-6">
                      <p className="text-[16px] leading-6 text-center">
                        <span className="font-lovely text-base sm:text-lg">IMPORTANT:</span> You MUST include a publishing time as a note for each cache submission so your reviewer knows when to publish for IRC26.
                      </p>
                    </div>

                    {/* Region times */}
                    <div className="mt-6 space-y-1 text-center">
                      <p className="font-arial-rounded font-bold text-[16px] leading-6">
                        NSW / ACT / VIC / TAS: PUBLISH - 31 JAN 2026 at 9AM
                      </p>
                      <p className="font-arial-rounded font-bold text-[16px] leading-6">
                        QLD: PUBLISH - 31 JAN at 8AM
                      </p>
                      <p className="font-arial-rounded font-bold text-[16px] leading-6">
                        WA: PUBLISH - 31 JAN 2026 at 6AM
                      </p>
                      <p className="font-arial-rounded font-bold text-[16px] leading-6">
                        SA: PUBLISH - 31 JAN 2026 at 8:30AM
                      </p>
                    </div>

                    {/* Submissions close */}
                    <div className="mt-6 text-center">
                      <p className="font-lovely text-lg sm:text-xl">
                        SUBMISSIONS CLOSE: 31 JAN 2026 AT 6PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Second Q/A */}
              <div>
                <h2 className="font-lovely text-xl sm:text-2xl leading-tight tracking-wide mt-6 mb-2 text-center">
                  WHAT&apos;S AN &apos;FP (Favourite Point) WORTHY&apos; HIDE?
                </h2>
                <p className="leading-relaxed mt-1 text-center">A geocache that is creative, clever and had effort put into
its hide. What makes you give an FP? Create your hides to
the same standard!</p>
              </div>

              {/* Third Q/A */}
              <div>
                <h2 className="font-lovely text-xl sm:text-2xl leading-tight tracking-wide mt-6 mb-2 text-center">
                HOW MANY CACHES CAN I HIDE?
                </h2>
                <p className="leading-relaxed mt-1 text-center">Each CO can hide up to 10 caches.</p>
              </div>

              {/* Fourth Q/A */}
              <div>
                <h2 className="font-lovely text-xl sm:text-2xl leading-tight tracking-wide mt-6 mb-2 text-center">
                CAN I SHARE THIS WITH OTHER CO’S?
                </h2>
                <p className="leading-relaxed mt-1 text-center">Absolutely! We need your help to share the love and get
                IRC26 to as many hiders as possible.</p>
              </div>

              {/* Fifth Q/A */}
              <div>
                <h2 className="font-lovely text-xl sm:text-2xl leading-tight tracking-wide mt-6 mb-2 text-center">
                  WHO CAN I CONTACT ABOUT IRC26?
                </h2>
                <p className="leading-relaxed mt-1 text-center">Drop a message to beautifulsky13
via the GC message centre or
beautifulsky13gc@gmail.com.
She’s happy to help answer any questions.</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Stats Strip */}
      <section id="our-stats" className="relative z-20 bg-white pt-8 sm:pt-10 pb-8 sm:pb-10" style={{ backgroundColor: '#ffffff', position: 'relative' }}>
        <div className="max-w-6xl mx-auto px-4">
          {loading ? (
            <div className="font-lovely text-center text-black">Loading stats...</div>
          ) : stats ? (
            <div className="mt-16">
              <h2 className="text-center text-4xl md:text-5xl font-lovely mb-10 text-black">
                OUR STATS
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-center">
                {/* Caches Pledged */}
                <div className="flex flex-col">
                  <div className="font-arial-rounded text-3xl sm:text-4xl font-semibold text-black mb-2 min-h-[4rem] sm:min-h-[5rem] flex items-end justify-center">
                    {stats.totalPledged}
                  </div>
                  <div className="font-lovely text-sm sm:text-base font-semibold tracking-wide text-black uppercase">
                    CACHES PLEDGED
                  </div>
                </div>

                {/* Total Submissions */}
                <div className="flex flex-col">
                  <div className="font-arial-rounded text-3xl sm:text-4xl font-semibold text-black mb-2 min-h-[4rem] sm:min-h-[5rem] flex items-end justify-center">
                    {stats.totalSubmissions}
                  </div>
                  <div className="font-lovely text-sm sm:text-base font-semibold tracking-wide text-black uppercase">
                    CACHES SUBMITTED
                  </div>
                </div>

                {/* Rainmakers */}
                <div className="flex flex-col">
                  <div className="font-arial-rounded text-3xl sm:text-4xl font-semibold text-black mb-2 min-h-[4rem] sm:min-h-[5rem] flex items-end justify-center">
                    {stats.rainmakers}
                  </div>
                  <div className="font-lovely text-sm sm:text-base font-semibold tracking-wide text-black uppercase">
                    RAINMAKERS
                  </div>
                </div>

                {/* Countdown to Rain Start */}
                <div className="flex flex-col">
                  <div className="font-arial-rounded text-3xl sm:text-5xl font-semibold text-black mb-2 min-h-[4rem] sm:min-h-[5rem] flex items-end justify-center">
                    <CountdownDisplay targetDate={RAIN_START_DATE} />
                  </div>
                  <div className="font-lovely text-sm sm:text-base font-semibold tracking-wide text-black uppercase">
                    UNTIL IT RAINS CACHES
                  </div>
                </div>
              </div>

              {/* Breakdown by State and Type */}
              {(Object.keys(stats.byState).length > 0 || Object.keys(stats.byType).length > 0) && (
                <div className="mt-12">
                  <h3 className="text-center text-2xl md:text-3xl font-lovely mb-6 text-black">
                    Incoming Rain:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                    {/* By State */}
                    {Object.keys(stats.byState).length > 0 && (
                      <div className="bg-white/80 rounded-2xl px-6 py-5 shadow-sm">
                        <h3 className="text-xl font-lovely text-center md:text-left mb-3 text-black">
                          BY STATE
                        </h3>
                        <ul className="space-y-1 text-sm md:text-base font-normal">
                          {Object.entries(stats.byState)
                            .sort(([, a], [, b]) => b - a)
                            .map(([state, count]) => (
                              <li key={state} className="flex items-baseline justify-between text-black">
                                <span>{state}:</span>
                                <span className="font-semibold">{count}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                    {/* By Type */}
                    {Object.keys(stats.byType).length > 0 && (
                      <div className="bg-white/80 rounded-2xl px-6 py-5 shadow-sm">
                        <h3 className="text-xl font-lovely text-center md:text-left mb-3 text-black">
                          BY TYPE
                        </h3>
                        <ul className="space-y-1 text-sm md:text-base font-normal">
                          {Object.entries(stats.byType)
                            .sort(([, a], [, b]) => b - a)
                            .map(([type, count]) => (
                              <li key={type} className="flex items-baseline justify-between text-black">
                                <span>{type}:</span>
                                <span className="font-semibold">{count}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

