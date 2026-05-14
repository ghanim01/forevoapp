<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="match" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-container" role="dialog" aria-modal="true" :aria-label="`Match details: ${match.homeTeam?.name} vs ${match.awayTeam?.name}`">
          <!-- Close button -->
          <button class="modal-close" @click="$emit('close')" aria-label="Close">
            <v-icon icon="mdi-close" size="small"></v-icon>
          </button>

          <!-- Competition badge -->
          <div class="competition-badge" v-if="competition">
            <img v-if="competition.emblem" :src="competition.emblem" :alt="competition.name" class="comp-emblem" />
            <span class="comp-name">{{ competition.name }}</span>
          </div>

          <!-- Scoreboard -->
          <div class="scoreboard">
            <!-- Home Team -->
            <div class="team-block home">
              <img v-if="match.homeTeam?.crest" :src="match.homeTeam.crest" :alt="match.homeTeam.name" class="team-crest-large" />
              <div class="team-details">
                <span class="team-full-name">{{ match.homeTeam?.name }}</span>
                <span class="team-short-name">{{ match.homeTeam?.shortName }}</span>
              </div>
            </div>

            <!-- Score -->
            <div class="score-block">
              <div class="score-main">
                <span class="score-home">{{ match.score?.fullTime?.home ?? '-' }}</span>
                <span class="score-colon" aria-hidden="true">:</span>
                <span class="score-away">{{ match.score?.fullTime?.away ?? '-' }}</span>
              </div>
              <div class="score-meta">
                <span class="status-pill" :class="`status-${statusClass}`">
                  <span v-if="isLive" class="live-pip" aria-hidden="true"></span>
                  {{ statusBadge }}
                </span>
                <span class="match-round" v-if="match.matchday">Matchday {{ match.matchday }}</span>
              </div>
              <div class="score-date">{{ formattedDate }}</div>
            </div>

            <!-- Away Team -->
            <div class="team-block away">
              <div class="team-details">
                <span class="team-full-name">{{ match.awayTeam?.name }}</span>
                <span class="team-short-name">{{ match.awayTeam?.shortName }}</span>
              </div>
              <img v-if="match.awayTeam?.crest" :src="match.awayTeam.crest" :alt="match.awayTeam.name" class="team-crest-large" />
            </div>
          </div>

          <!-- Detail Stats Grid -->
          <div class="stats-grid">
            <div class="stat-card" v-if="match.score?.halfTime?.home !== null && match.score?.halfTime?.away !== null">
              <div class="stat-icon">
                <v-icon icon="mdi-clock-time-four" size="small"></v-icon>
              </div>
              <div class="stat-body">
                <span class="stat-label">Half Time</span>
                <span class="stat-value">{{ match.score.halfTime.home }} : {{ match.score.halfTime.away }}</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <v-icon icon="mdi-calendar" size="small"></v-icon>
              </div>
              <div class="stat-body">
                <span class="stat-label">Date</span>
                <span class="stat-value">{{ fullDate }}</span>
              </div>
            </div>

            <div class="stat-card" v-if="match.stage">
              <div class="stat-icon">
                <v-icon icon="mdi-trophy-outline" size="small"></v-icon>
              </div>
              <div class="stat-body">
                <span class="stat-label">Stage</span>
                <span class="stat-value">{{ match.stage }}</span>
              </div>
            </div>

            <div class="stat-card" v-if="match.score?.winner">
              <div class="stat-icon">
                <v-icon icon="mdi-crown" size="small"></v-icon>
              </div>
              <div class="stat-body">
                <span class="stat-label">Winner</span>
                <span class="stat-value winner-text">{{ match.score.winner === 'HOME_TEAM' ? match.homeTeam?.name : match.score.winner === 'AWAY_TEAM' ? match.awayTeam?.name : 'Draw' }}</span>
              </div>
            </div>

            <div class="stat-card" v-if="match.score?.duration">
              <div class="stat-icon">
                <v-icon icon="mdi-clock-outline" size="small"></v-icon>
              </div>
              <div class="stat-body">
                <span class="stat-label">Duration</span>
                <span class="stat-value">{{ match.score.duration === 'REGULAR' ? 'Regular' : match.score.duration }}</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <v-icon icon="mdi-update" size="small"></v-icon>
              </div>
              <div class="stat-body">
                <span class="stat-label">Last Updated</span>
                <span class="stat-value">{{ formattedLastUpdated }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Match, Competition } from "../types";

interface Props {
  match: Match | null;
  competition?: Competition | null;
}

defineProps<Props>();
defineEmits<{ close: [] }>();

const isLive = (match: Match) => {
  return match.status === "IN_PLAY" || match.status === "LIVE";
};

const statusBadge = (match: Match) => {
  const s = match.status;
  if (s === "IN_PLAY" || s === "LIVE") return "LIVE";
  if (s === "FINISHED") return "Full Time";
  if (s === "PAUSED") return "Paused";
  if (s === "TIMED") return "Scheduled";
  return s;
};

const statusClass = (match: Match) => {
  const s = match.status;
  if (s === "IN_PLAY" || s === "LIVE") return "live";
  if (s === "FINISHED") return "finished";
  if (s === "PAUSED") return "paused";
  if (s === "TIMED") return "scheduled";
  return s.toLowerCase();
};

const formattedDate = (match: Match) => {
  const d = new Date(match.utcDate);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fullDate = (match: Match) => {
  const d = new Date(match.utcDate);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formattedLastUpdated = (match: Match) => {
  const d = new Date(match.lastUpdated);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<style scoped>
/* Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

/* Container */
.modal-container {
  position: relative;
  background: linear-gradient(145deg, rgba(10, 16, 40, 0.98), rgba(7, 9, 26, 0.98));
  border: 1px solid rgba(8, 145, 178, 0.2);
  border-radius: 24px;
  padding: 2rem;
  max-width: 560px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(8, 145, 178, 0.05);
  scrollbar-width: thin;
  scrollbar-color: rgba(8, 145, 178, 0.2) transparent;
}

/* Close */
.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 1;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: rgba(255, 255, 255, 0.2);
}

/* Competition */
.competition-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.comp-emblem {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.comp-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

/* Scoreboard */
.scoreboard {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.team-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.team-block.away {
  text-align: right;
}

.team-crest-large {
  width: 64px;
  height: 64px;
  object-fit: contain;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
}

.team-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
}

.team-block.away .team-details {
  align-items: flex-end;
}

.team-full-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: white;
  text-align: center;
  line-height: 1.2;
}

.team-block.away .team-full-name {
  text-align: right;
}

.team-short-name {
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Score block */
.score-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.score-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.score-home,
.score-away {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  line-height: 1;
  min-width: 2.2rem;
  text-align: center;
}

.score-colon {
  font-size: 2rem;
  color: rgba(8, 145, 178, 0.4);
}

.score-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.live-pip {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 1.5s infinite;
}

.status-live {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-finished {
  background: rgba(34, 197, 94, 0.12);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.25);
}

.status-scheduled {
  background: rgba(59, 130, 246, 0.12);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.25);
}

.match-round {
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 500;
}

.score-date {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(8, 145, 178, 0.08);
  border-radius: 12px;
  padding: 0.7rem;
  transition: background 0.2s;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.07);
}

.stat-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(8, 145, 178, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(34, 211, 238, 0.7);
}

.stat-body {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.stat-label {
  font-size: 0.58rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
}

.stat-value {
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.winner-text {
  color: #86efac;
}

/* Transitions */
.modal-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from {
  opacity: 0;
}

.modal-enter-from .modal-container {
  transform: scale(0.92) translateY(20px);
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-leave-to .modal-container {
  transform: scale(0.95);
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-container {
    padding: 1.5rem;
    border-radius: 20px;
  }

  .team-crest-large {
    width: 48px;
    height: 48px;
  }

  .score-home,
  .score-away {
    font-size: 2rem;
    min-width: 1.8rem;
  }

  .score-colon {
    font-size: 1.6rem;
  }

  .scoreboard {
    gap: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .team-full-name {
    font-size: 0.78rem;
  }
}
</style>
