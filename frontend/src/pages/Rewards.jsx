import { useQuery } from '@tanstack/react-query';
import { getBadges, getCredits, getChallenges } from '../api/rewards';
import LoadingSpinner from '../components/LoadingSpinner';
import { Lock, Award, Target, Coins } from 'lucide-react';

export default function Rewards() {
  const { data: badges = [], isLoading: badgesLoading } = useQuery({ queryKey: ['badges'], queryFn: () => getBadges().then(r => r.data) });
  const { data: creditsData } = useQuery({ queryKey: ['credits'], queryFn: () => getCredits().then(r => r.data) });
  const { data: challenges = [], isLoading: challengesLoading } = useQuery({ queryKey: ['challenges'], queryFn: () => getChallenges().then(r => r.data) });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Rewards</h1>
      <p className="text-gray-500 text-sm mb-8">Earn badges and credits for reducing your footprint</p>

      {/* Credits */}
      <div className="bg-gradient-to-r from-primary-600 to-green-500 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center gap-3">
          <Coins size={32} />
          <div>
            <p className="text-primary-100 text-sm">Carbon Credits Balance</p>
            <p className="text-4xl font-bold">{creditsData?.credits ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><Award size={20} /> Badges</h2>
        {badgesLoading ? <LoadingSpinner /> : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {badges.map(badge => (
              <div key={badge.id}
                className={`bg-white rounded-xl border p-4 text-center transition-all ${
                  badge.earned ? 'border-primary-200 shadow-sm' : 'border-gray-100 opacity-60'
                }`}>
                <div className="relative inline-block mb-2">
                  <span className="text-4xl">{badge.icon || '🏅'}</span>
                  {!badge.earned && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded">
                      <Lock size={16} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold text-gray-800">{badge.name}</p>
                <p className="text-xs text-gray-400 mt-1">{badge.description}</p>
                {badge.earned && <p className="text-xs text-primary-600 mt-1 font-medium">✓ Earned</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Challenges */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><Target size={20} /> Active Challenges</h2>
        {challengesLoading ? <LoadingSpinner /> : challenges.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No active challenges right now</div>
        ) : (
          <div className="space-y-4">
            {challenges.map(ch => {
              const pct = Math.min(100, ch.target_co2e_kg > 0 ? Math.round((ch.user_progress / ch.target_co2e_kg) * 100) : 0);
              const under = ch.user_progress <= ch.target_co2e_kg;
              return (
                <div key={ch.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{ch.title}</h3>
                      <p className="text-sm text-gray-500">{ch.description}</p>
                    </div>
                    <span className="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">{ch.reward_credits} credits</span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all ${
                        ch.completed ? 'bg-primary-500' : under ? 'bg-blue-500' : 'bg-red-400'
                      }`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{ch.user_progress} / {ch.target_co2e_kg} kg</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Ends {ch.end_date}</span>
                    {ch.completed && <span className="text-primary-600 font-medium">✓ Completed!</span>}
                    {!ch.completed && under && ch.user_progress > 0 && <span className="text-green-600">On track 🌱</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
