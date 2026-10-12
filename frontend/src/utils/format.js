export function formatReward(reward) {
  if (!reward) return { value: '', unit: '' };
  if (reward.currency === 'INR') return { value: `₹${reward.amount}`, unit: reward.subtitle || 'Gift Card' };
  return { value: `+${reward.amount}`, unit: reward.subtitle || `${reward.amount} VEs` };
}

export function shortReward(reward) {
  if (!reward) return '-';
  return reward.currency === 'INR' ? `₹${reward.amount} Gift Card` : `+${reward.amount} VEs`;
}

export function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}
