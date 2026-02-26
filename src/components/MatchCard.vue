<template>
  <div class="match-card" :class="{ 'is-live': isLive }">
    <!-- Status Badge -->
    <div v-if="isLive" class="live-badge">
      <span class="live-pulse"></span>
      LIVE
    </div>

    <!-- Main Match Info -->
    <div class="match-grid">
      <!-- Home Team -->
      <div class="team-section home-team">
        <div class="team-name">{{ match.homeTeam?.shortName || match.homeTeam?.name }}</div>
        <img 
          v-if="match.homeTeam?.crest" 
          :src="match.homeTeam.crest" 
          :alt="match.homeTeam.name" 
          class="team-crest"
          loading="lazy"
        />
      </div>

      <!-- Score -->
      <div class="score-section">
        <div class="score-display">
          <span class="score-num">{{ match.score?.fullTime?.home ?? '-' }}</span>
          <span class="score-divider">:</span>
          <span class="score-num">{{ match.score?.fullTime?.away ?? '-' }}</span>
        </div>
        <div class="match-meta">
          <span class="status-badge" :class="`status-${statusBadge.toLowerCase()}`">
            {{ statusBadge }}
          </span>
          <span class="match-date">({{ formattedDate }})</span>
        </div>
      </div>

      <!-- Away Team -->
      <div class="team-section away-team">
        <img 
          v-if="match.awayTeam?.crest" 
          :src="match.awayTeam.crest" 
          :alt="match.awayTeam.name" 
          class="team-crest"
          loading="lazy"
        />
        <div class="team-name">{{ match.awayTeam?.shortName || match.awayTeam?.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Match } from "../types";

interface Props {
  match: Match;
}

const props = defineProps<Props>();

const formattedDate = computed(() => {
  const date = new Date(props.match.utcDate);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

const isLive = computed(() => {
  return props.match.status === "IN_PLAY" || props.match.status === "LIVE";
});

const statusBadge = computed(() => {
  const status = props.match.status;
  if (status === "IN_PLAY" || status === "LIVE") return "LIVE";
  if (status === "FINISHED") return "FT";
  if (status === "PAUSED") return "PAUSED";
  return status;
});
</script>

<style scoped>
.match-card {
  position: relative;
  backdrop-filter: blur(20px) saturate(180%);
  background: linear-gradient(135deg, rgba(5, 30, 55, 0.7) 0%, rgba(15, 23, 42, 0.6) 100%);
  border: 1.5px solid rgba(8, 145, 178, 0.18);
  border-radius: 16px;
  padding: 0.35rem 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.match-card:hover {
  border-color: rgba(8, 145, 178, 0.35);
  background: linear-gradient(135deg, rgba(5, 30, 55, 0.8) 0%, rgba(15, 23, 42, 0.7) 100%);
  box-shadow: 0 8px 32px rgba(8, 145, 178, 0.12);
}

.match-card.is-live {
  border-color: rgba(239, 68, 68, 0.3);
}

/* Live Badge */
.live-badge {
  position: absolute;
  top: 0.75rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.8px;
  color: #ef4444;
}

.live-pulse {
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Match Grid Layout */
.match-grid {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin-bottom: 0;
}

/* Team Section */
.team-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  min-width: 0;
  flex: 0 1 auto;
}

.team-section.home-team {
  padding: 0 0.3rem;
}

.team-section.away-team {
  padding: 0 0.3rem;
}

.team-crest {
  width: 32px;
  height: 32px;
  object-fit: contain;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.team-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #f1f5f9;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

/* Score Section */
.score-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0 0.2rem;
}

.score-display {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.score-num {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
  min-width: 1.8rem;
  text-align: center;
}

.score-divider {
  font-size: 1.1rem;
  color: rgba(8, 145, 178, 0.5);
  margin: 0 -0.15rem;
}

.match-meta {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  width: 100%;
}

.status-badge {
  font-size: 0.55rem;
  font-weight: 600;
  padding: 0.15rem 0.3rem;
  border-radius: 6px;
  letter-spacing: 0.2px;
  white-space: nowrap;
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

.status-live {
  background: rgba(239, 68, 68, 0.12);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.match-date {
  font-size: 0.55rem;
  color: rgba(241, 245, 249, 0.5);
  text-align: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .match-card {
    padding: 0.4rem 1.1rem;
  }

  .team-crest {
    width: 36px;
    height: 36px;
  }

  .team-name {
    font-size: 0.8rem;
  }

  .score-num {
    font-size: 1.4rem;
  }

  .match-grid {
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .match-card {
    padding: 0.35rem 0.75rem;
  }

  .team-name {
    font-size: 0.7rem;
  }

  .team-crest {
    width: 28px;
    height: 28px;
  }

  .score-num {
    font-size: 1.1rem;
  }

  .score-divider {
    font-size: 1rem;
  }

  .match-grid {
    gap: 0.3rem;
  }

  .status-badge {
    font-size: 0.5rem;
    padding: 0.15rem 0.3rem;
  }

  .match-date {
    font-size: 0.5rem;
  }

  .live-badge {
    font-size: 0.6rem;
  }
}
</style>
