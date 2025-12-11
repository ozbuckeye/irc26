'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RAIN_START_DATE, SUBMISSION_DEADLINE } from '@/config/irc26';
import { formatDate } from '@/lib/date-utils';
import Card from '@/components/Card';

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

interface Stats {
  totalPledged: number;
  totalSubmissions: number;
  rainmakers: number;
  byState: Record<string, number>;
  byType: Record<string, number>;
}

export default function Home() {
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
      className="relative min-h-screen bg-cover bg-center bg-fixed"
        style={{
        backgroundImage: 'url(/Background%20Storm.PNG)',
      }}
    >
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Content */}
      <div className="relative z-10 pt-10 sm:pt-14 md:pt-16 pb-0 space-y-14 sm:space-y-16">
        {/* 1) Intro Card */}
        <section className="px-4 sm:px-6">
          <Card>
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-4 sm:mb-5">
              <Image
                src="/IRC Circle.PNG"
                alt="IRC26 Logo"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
            <h2 className="text-center font-lovely text-2xl sm:text-3xl mt-6 mb-8">It&apos;s Raining Caches 2026</h2>
            <h3 className="text-center font-lovely text-2xl sm:text-3xl leading-tight mb-2">
              {formatDate(RAIN_START_DATE, 'DDth MMMM YYYY')}
            </h3>
            <p className="text-center font-lovely text-2xl sm:text-3xl leading-tight mb-8">
              {formatDate(RAIN_START_DATE, 'hA [AEST]')}
            </p>
            <h2 className="text-center font-lovely text-2xl sm:text-3xl mb-6">
              RAIN DOWN LOVE
            </h2>

            {/* Body copy */}
            <div className="mx-auto max-w-[50ch] sm:max-w-[55ch] text-center text-[13px] sm:text-[14px] leading-6 whitespace-normal break-words space-y-3 font-arial-rounded font-bold">
              <p>Love of hiding, love of finding.</p>
              <p>Love of log reading, love of log writing.</p>
              <p>
                Love of mystery, adventure, learning, challenges, interesting D/T combos, evil,
                notifications, [FTF]s, DNF avenging, swag swaps, creative containers, nudges, PAFs,
                TOTTs, accurate co-ordinates, amazing places never been to before, community, legacy,
                legendary stories and FP hearts.
              </p>
              <p className="font-lovely font-semibold uppercase tracking-wide text-[13px] sm:text-[14px]">WE LOVE THIS GAME.</p>
              <p>
                This is an open invitation for cache owners to<br />
                contribute their finest hides to IRC26
                and make it<br />
                Rain Down Love.
              </p>
            </div>
          </Card>
        </section>

        {/* 2-4) Combined Mega Card: Challenge / Rainmaker CTA / Submissions Close */}
        <section className="px-4 sm:px-6">
          <div className="mx-auto max-w-2xl rounded-2xl shadow-2xl overflow-hidden bg-white/95 backdrop-blur-md border border-white/50">
            {/* Top: THE CHALLENGE */}
            <div className="px-5 sm:px-8 py-6">
              <div className="mx-auto w-12 h-12 flex items-center justify-center mb-3">
                <Image
                  src="/IRC Circle.PNG"
                  alt="IRC26 Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <h2 className="font-lovely tracking-[0.5px] text-2xl sm:text-3xl text-center mb-6">
                THE CHALLENGE
              </h2>
              <p className="mt-4 font-lovely font-bold text-center text-[13px] sm:text-[14px]">
                Collectively create, hide and publish<br />
                500 x FP worthy caches across Australia.
              </p>
              <p className="mt-2 font-lovely font-bold text-center tracking-wide">
                ALL IRC26 CACHES WILL BE PUBLISHED<br />
                {formatDate(RAIN_START_DATE, 'DAYNAME')}{' '}
                {formatDate(RAIN_START_DATE, 'DDth MMMM YYYY')} {formatDate(RAIN_START_DATE, 'HH[AM/PM] [TZ]')}.
              </p>
            </div>

            {/* Middle: green band with CTAs */}
            <div className="bg-green-100/70 px-5 sm:px-8 py-6">
              <h3 className="font-lovely tracking-[0.5px] text-2xl sm:text-3xl text-center mb-8 uppercase">
                GET INVOLVED
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 place-items-center">
                <div className="flex flex-col items-center">
                  <Link href="/pledge" className="block hover:opacity-90 transition-opacity w-[220px] h-[95px]">
                    <Image
                      src="/PLEDGE.PNG"
                      alt="Pledge Caches"
                      width={220}
                      height={95}
                      className="object-contain w-full h-full"
                    />
                  </Link>
                </div>
                <div className="flex flex-col items-center">
                  <Link href="/confirm" className="block hover:opacity-90 transition-opacity w-[220px] h-[95px]">
                    <Image
                      src="/GCCODE.PNG"
                      alt="Confirm GC Codes"
                      width={220}
                      height={95}
                      className="object-contain w-full h-full"
                    />
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom: submissions close */}
            <div className="px-5 sm:px-8 py-6 text-center">
              <h3 className="font-lovely tracking-[0.5px] text-xl sm:text-2xl mt-6">
                SUBMISSIONS CLOSE
              </h3>
              <p className="mt-2 mb-6 font-lovely text-lg sm:text-xl">
                {formatDate(SUBMISSION_DEADLINE, 'hA DDth MMM YYYY')}
              </p>
            </div>
          </div>
        </section>

        {/* 5) Stats Strip */}
        <section id="our-stats" className="bg-white mt-14 sm:mt-16 pt-8 sm:pt-10 pb-8 sm:pb-10">
          <div className="max-w-6xl mx-auto px-4">
            {loading ? (
              <div className="font-lovely text-center text-black">Loading stats...</div>
            ) : stats ? (
              <div className="mt-16">
                <h2 className="text-center text-4xl md:text-5xl font-lovely mb-10 text-black">
                  OUR STATS
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-center">
                  {/* Total Pledged */}
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
      </div>
    </main>
  );
}
