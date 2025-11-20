import type { Card } from '../../types';

interface DailyDeckStatsProps {
  cards: Card[];
}

function DailyDeckStats({ cards }: DailyDeckStatsProps) {
  if (cards.length === 0) return null;

  const completedCount = cards.filter((c) => c.completed).length;

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 flex-shrink-0">
      <div className="text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Total cards:</span>
          <span className="font-medium">{cards.length}</span>
        </div>
        <div className="flex justify-between">
          <span>Completed:</span>
          <span className="font-medium">{completedCount}</span>
        </div>
      </div>
    </div>
  );
}

export default DailyDeckStats;
