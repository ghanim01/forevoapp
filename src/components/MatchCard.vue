<template>
  <button
    class="match-card"
    :class="{ 'is-live': isLive, 'is-finished': isFinished }"
    role="article"
    :aria-label="ariaLabel"
    @click="$emit('select', match)"
  >
    <!-- Live Badge -->
    <div v-if="isLive" class="live-badge">
      <span class="live-pulse" aria-hidden="true"></span>
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
          :alt="match.homeTeam.name + ' crest'"
          class="team-crest"
          loading="lazy"
        />
      </div>

      <!-- Score -->
      <div class="score-section">
        <div class="score-display">
          <span class="score-num home-score">{{ match.score?.fullTime?.home ?? '-' }}</span>
          <span class="score-divider" aria-hidden="true">:</span>
          <span class="score-num away-score">{{ match.score?.fullTime?.away ?? '-' }}</span>
        </div>
        <div class="match-meta">
          <span
            class="status-badge"
            :class="`status-${statusBadge.toLowerCase()}`"
          >
            <span v-if="isLive" class="status-dot" aria-hidden="true"></span>
            {{ statusBadge }}
          </span>
          <span class="match-date">{{ formattedDate }}</span>
        </div>
      </div>

      <!-- Away Team -->
      <div class="team-section away-team">
        <img
          v-if="match.awayTeam?.crest"
          :src="match.awayTeam.crest"
          :alt="match.awayTeam.name + ' crest'"
          class="team-crest"
          loading="lazy"
        />
        <div class="team-name">{{ match.awayTeam?.shortName || match.awayTeam?.name }}</div>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Match } from "../types";

interface Props {
  match: Match;
}

const props = defineProps<Props>();
defineEmits<{ select: [match: Match] }>();

const formattedDate = computed(() => {
  const date = new Date(props.match.utcDate);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  // If it's today or yesterday, show relative
  if (diffDays === 0) {
    return "Today, " + date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (diffDays === 1) {
    return "Yesterday, " + date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

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

const isFinished = computed(() => {
  return props.match.status === "FINISHED";
});

const statusBadge = computed(() => {
  const status = props.match.status;
  if (status === "IN_PLAY" || status === "LIVE") return "LIVE";
  if (status === "FINISHED") return "FT";
  if (status === "PAUSED") return "PAUSED";
  if (status === "TIMED") return "SCHEDULED";
  return status;
});

const ariaLabel = computed(() => {
  const home = props.match.homeTeam?.shortName || props.match.homeTeam?.name || "Home";
  const away = props.match.awayTeam?.shortName || props.match.awayTeam?.name || "Away";
  const homeScore = props.match.score?.fullTime?.home ?? "–";
  const awayScore = props.match.score?.fullTime?.away ?? "–";
  const status = statusBadge.value;
  return `${home} ${homeScore} vs ${away} ${awayScore}, ${status}`;
});
</script>

<style scoped>
.match-card {
  position: relative;
  backdrop-filter: blur(20px) saturate(180%);
  background: linear-gradient(
    135deg,
    rgba(5, 30, 55, 0.7) 0%,
    rgba(15, 23, 42, 0.6) 100%
  );
  border: 1.5px solid rgba(8, 145, 178, 0.18);
  border-radius: 16px;
  padding: 0.4rem 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  cursor: pointer;
}

.match-card:hover {
  border-color: rgba(8, 145, 178, 0.35);
  background: linear-gradient(
    135deg,
    rgba(5, 30, 55, 0.8) 0%,
    rgba(15, 23, 42, 0.7) 100%
  );
  box-shadow: 0 8px 32px rgba(8, 145, 178, 0.12);
  transform: translateY(-1px);
}

.match-card:active {
  transform: translateY(0) scale(0.98);
}

.match-card.is-live {
  border-color: rgba(239, 68, 68, 0.35);
  background: linear-gradient(
    135deg,
    rgba(55, 5, 5, 0.6) 0%,
    rgba(15, 23, 42, 0.6) 100%
  );
}

.match-card.is-live:hover {
  border-color: rgba(239, 68, 68, 0.5);
  box-shadow: 0 8px 32px rgba(239, 68, 68, 0.1);
}

.match-card.is-finished {
  border-color: rgba(34, 197, 94, 0.12);
}

/* Live Badge */
.live-badge {
  position: absolute;
  top: 0.6rem;
  right: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.8px;
  color: #ef4444;
  text-transform: uppercase;
}

.live-pulse {
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.5);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.85);
  }
}

/* Match Grid */
.match-grid {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Team */
.team-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
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
  font-size: 0.78rem;
  font-weight: 600;
  color: #f1f5f9;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 90px;
}

/* Score */
.score-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0 0.2rem;
}

.score-display {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.score-num {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ffffff;
  min-width: 1.8rem;
  text-align: center;
}

.is-finished .score-num {
  color: rgba(255, 255, 255, 0.85);
}

.is-live .score-num {
  color: #fca5a5;
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
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6rem;
  font-weight: 600;
  padding: 0.15rem 0.35rem;
  border-radius: 6px;
  letter-spacing: 0.3px;
  white-space: nowrap;
  text-transform: uppercase;
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 1.5s infinite;
}

.status-live {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-ft {
  background: rgba(34, 197, 94, 0.12);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.25);
}

.status-scheduled {
  background: rgba(59, 130, 246, 0.12);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.25);
}

.status-paused {
  background: rgba(251, 191, 36, 0.12);
  color: #fde68a;
  border: 1px solid rgba(251, 191, 36, 0.25);
}

.match-date {
  font-size: 0.6rem;
  color: rgba(241, 245, 249, 0.5);
  text-align: center;
  white-space: nowrap;
}

/* Responsive */
@media (max-width: 768px) {
  .match-card {
    padding: 0.45rem 1rem;
  }
  .team-crest {
    width: 36px;
    height: 36px;
  }
  .team-name {
    font-size: 0.82rem;
  }
  .score-num {
    font-size: 1.4rem;
  }
}

@media (max-width: 480px) {
  .match-card {
    padding: 0.4rem 0.7rem;
  }
  .team-name {
    font-size: 0.72rem;
    max-width: 70px;
  }
  .team-crest {
    width: 28px;
    height: 28px;
  }
  .score-num {
    font-size: 1.15rem;
    min-width: 1.5rem;
  }
  .score-divider {
    font-size: 1rem;
  }
  .status-badge {
    font-size: 0.55rem;
  }
  .match-date {
    font-size: 0.55rem;
  }
  .live-badge {
    font-size: 0.6rem;
    top: 0.5rem;
    right: 0.7rem;
  }
}
</style>
