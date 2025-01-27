import React from 'react';
import { Team, Player } from '../types';

interface FootballMatchStatsProps {
  teams: Team[];
  onUpdateStats: (teamIndex: number, playerIndex: number, goals: number) => void;
}

export const FootballMatchStats: React.FC<FootballMatchStatsProps> = ({
  teams,
  onUpdateStats,
}) => {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-4">إحصائيات اللاعبين</h3>
      {teams.map((team, teamIndex) => (
        <div key={team.id} className="mb-6">
          <h4 className="text-md font-medium mb-2">{team.name}</h4>
          <div className="space-y-3">
            {team.players.map((player, playerIndex) => (
              <div key={player.id} className="flex items-center gap-4">
                <span className="min-w-[150px]">{player.name}</span>
                <div className="flex items-center gap-2">
                  <label className="text-sm">الأهداف:</label>
                  <input
                    type="number"
                    min="0"
                    value={team.playerStats[playerIndex]?.goals || 0}
                    onChange={(e) =>
                      onUpdateStats(teamIndex, playerIndex, parseInt(e.target.value) || 0)
                    }
                    className="w-16 p-1 border rounded text-center"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};