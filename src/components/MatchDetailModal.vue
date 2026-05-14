<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="match" class="modal-overlay" @click.self="$emit('close')">
        <div
          class="modal-container"
          role="dialog"
          aria-modal="true"
          :aria-label="`Match: ${homeName} vs ${awayName}`"
        >
          <!-- Close -->
          <button class="modal-close" @click="$emit('close')" aria-label="Close">
            <v-icon icon="mdi-close" size="small"></v-icon>
          </button>

          <!-- Competition -->
          <div class="comp-bar" v-if="competition">
            <img
              v-if="competition.emblem"
              :src="competition.emblem"
              :alt="competition.name"
              class="comp-emblem"
            />
            <span class="comp-label">{{ competition.name }}</span>
          </div>

          <!-- Scoreboard -->
          <div class="scoreboard">
            <!-- Home -->
            <div class="team-side home">
              <img
                v-if="match.homeTeam?.crest"
                :src="match.homeTeam.crest"
                :alt="match.homeTeam.name"
                class="crest"
              />
              <div class="team-info">
                <div class="team-full">{{ match.homeTeam?.shortName || match.homeTeam?.name }}</div>
                <div class="team-sub">Home</div>
              </div>
            </div>

            <!-- Score -->
            <div class="score-middle">
              <div class="score-digits">
                <span class="digit">{{ homeScore }}</span>
                <span class="colon" aria-hidden="true">:</span>
                <span class="digit">{{ awayScore }}</span>
              </div>
              <div class="score-status-row">
                <span class="match-status" :class="`ms-${statusClass}`">
                  <span v-if="isLiveStatus" class="live-pip" aria-hidden="true"></span>
                  {{ statusLabel }}
                </span>
                <span v-if="match.matchday" class="matchday">MD{{ match.matchday }}</span>
              </div>
              <div class="score-date">{{ dateTime }}</div>
            </div>

            <!-- Away -->
            <div class="team-side away">
              <div class="team-info">
                <div class="team-full">{{ match.awayTeam?.shortName || match.awayTeam?.name }}</div>
                <div class="team-sub">Away</div>
              </div>
              <img
                v-if="match.awayTeam?.crest"
                :src="match.awayTeam.crest"
                :alt="match.awayTeam.name"
                class="crest"
              />
            </div>
          </div>

          <!-- Stats -->
          <div class="stats-grid">
            <!-- Half Time -->
            <div class="stat-cell" v-if="hasHalfTime">
              <div class="stat-icon-wrap"><v-icon icon="mdi-clock-time-four" size="16" /></div>
              <div class="stat-text">
                <span class="st-label">Half Time</span>
                <span class="st-value">{{ match.score.halfTime.homeTeam }} : {{ match.score.halfTime.awayTeam }}</span>
              </div>
            </div>

            <!-- Full Date -->
            <div class="stat-cell">
              <div class="stat-icon-wrap"><v-icon icon="mdi-calendar" size="16" /></div>
              <div class="stat-text">
                <span class="st-label">Date</span>
                <span class="st-value">{{ fullDate }}</span>
              </div>
            </div>

            <!-- Stage -->
            <div class="stat-cell" v-if="match.stage && match.stage !== 'REGULAR_SEASON'">
              <div class="stat-icon-wrap"><v-icon icon="mdi-trophy-outline" size="16" /></div>
              <div class="stat-text">
                <span class="st-label">Stage</span>
                <span class="st-value">{{ formatStage(match.stage) }}</span>
              </div>
            </div>

            <!-- Winner -->
            <div class="stat-cell" v-if="match.score?.winner && match.status === 'FINISHED'">
              <div class="stat-icon-wrap"><v-icon icon="mdi-crown" size="16" /></div>
              <div class="stat-text">
                <span class="st-label">Winner</span>
                <span class="st-value winner-val">{{ winnerName }}</span>
              </div>
            </div>

            <!-- Duration -->
            <div class="stat-cell" v-if="match.score?.duration && match.score.duration !== 'REGULAR'">
              <div class="stat-icon-wrap"><v-icon icon="mdi-clock-outline" size="16" /></div>
              <div class="stat-text">
                <span class="st-label">Duration</span>
                <span class="st-value">{{ formatDuration(match.score.duration) }}</span>
              </div>
            </div>

            <!-- Extra Time -->
            <div class="stat-cell" v-if="hasExtraTime">
              <div class="stat-icon-wrap"><v-icon icon="mdi-clock-plus-outline" size="16" /></div>
              <div class="stat-text">
                <span class="st-label">Extra Time</span>
                <span class="st-value">{{ match.score.extraTime!.homeTeam }} : {{ match.score.extraTime!.awayTeam }}</span>
              </div>
            </div>

            <!-- Penalties -->
            <div class="stat-cell" v-if="hasPenalties">
              <div class="stat-icon-wrap"><v-icon icon="mdi-target" size="16" /></div>
              <div class="stat-text">
                <span class="st-label">Penalties</span>
                <span class="st-value">{{ match.score.penalties!.homeTeam }} : {{ match.score.penalties!.awayTeam }}</span>
              </div>
            </div>

            <!-- Updated -->
            <div class="stat-cell">
              <div class="stat-icon-wrap"><v-icon icon="mdi-update" size="16" /></div>
              <div class="stat-text">
                <span class="st-label">Updated</span>
                <span class="st-value">{{ updatedTime }}</span>
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

const props = defineProps<{
  match: Match | null;
  competition?: Competition | null;
}>();

defineEmits<{ close: [] }>();

// -- Derived state (computed, not functions) --

const homeName = computed(() => props.match?.homeTeam?.name ?? "");
const awayName = computed(() => props.match?.awayTeam?.name ?? "");

const homeScore = computed(() => props.match?.score?.fullTime?.homeTeam ?? "-");
const awayScore = computed(() => props.match?.score?.fullTime?.awayTeam ?? "-");

const isLiveStatus = computed(() => {
  const s = props.match?.status;
  return s === "IN_PLAY" || s === "LIVE" || s === "PAUSED";
});

const statusLabel = computed(() => {
  const s = props.match?.status;
  if (s === "IN_PLAY" || s === "LIVE") return "LIVE";
  if (s === "FINISHED") return "Full Time";
  if (s === "PAUSED") return "Paused";
  if (s === "TIMED") return "Scheduled";
  return s ?? "";
});

const statusClass = computed(() => {
  const s = props.match?.status;
  if (s === "IN_PLAY" || s === "LIVE") return "live";
  if (s === "FINISHED") return "finished";
  if (s === "PAUSED") return "paused";
  if (s === "TIMED") return "scheduled";
  return (s ?? "").toLowerCase();
});

const dateTime = computed(() => {
  if (!props.match) return "";
  const d = new Date(props.match.utcDate);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

const fullDate = computed(() => {
  if (!props.match) return "";
  const d = new Date(props.match.utcDate);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

const updatedTime = computed(() => {
  if (!props.match) return "";
  const d = new Date(props.match.lastUpdated);
  const now = new Date();
  const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000);
  if (diffH < 1) return "Just now";
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
});

const hasHalfTime = computed(() => {
  const ht = props.match?.score?.halfTime;
  return ht && (ht.homeTeam !== null || ht.awayTeam !== null);
});

const hasExtraTime = computed(() => {
  const et = props.match?.score?.extraTime;
  return et && (et.homeTeam !== null || et.awayTeam !== null);
});

const hasPenalties = computed(() => {
  const p = props.match?.score?.penalties;
  return p && (p.homeTeam !== null || p.awayTeam !== null);
});

const winnerName = computed(() => {
  const w = props.match?.score?.winner;
  if (!w || !props.match) return "";
  if (w === "HOME_TEAM") return props.match.homeTeam?.shortName || props.match.homeTeam?.name || "Home";
  if (w === "AWAY_TEAM") return props.match.awayTeam?.shortName || props.match.awayTeam?.name || "Away";
  return "Draw";
});

// -- Format helpers (called in template with parentheses) --

const formatStage = (s: string) => {
  return s
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatDuration = (d: string) => {
  if (d === "REGULAR") return "Regular";
  if (d === "EXTRA_TIME") return "Extra Time";
  if (d === "PENALTY_SHOOTOUT") return "Penalties";
  return d;
};
</script>

<style scoped>
/* Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

/* Container */
.modal-container {
  position: relative;
  background: linear-gradient(160deg, rgba(10, 16, 40, 0.98), rgba(7, 9, 26, 0.98));
  border: 1px solid rgba(8, 145, 178, 0.18);
  border-radius: 24px;
  padding: 1.75rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.6);
  scrollbar-width: thin;
  scrollbar-color: rgba(8, 145, 178, 0.2) transparent;
}

/* Close */
.modal-close {
  position: absolute;
  top: 0.85rem;
  right: 0.85rem;
  z-index: 1;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

/* Competition bar */
.comp-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.comp-emblem {
  width: 22px;
  height: 22px;
  object-fit: contain;
}
.comp-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

/* Scoreboard */
.scoreboard {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.team-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}
.team-side.away {
  text-align: right;
}

.crest {
  width: 56px;
  height: 56px;
  object-fit: contain;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
}

.team-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
}
.team-side.away .team-info {
  align-items: flex-end;
}

.team-full {
  font-size: 0.82rem;
  font-weight: 700;
  color: white;
  text-align: center;
  line-height: 1.2;
}
.team-side.away .team-full {
  text-align: right;
}

.team-sub {
  font-size: 0.55rem;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

/* Score middle */
.score-middle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
  min-width: 90px;
}

.score-digits {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.digit {
  font-size: 2.25rem;
  font-weight: 800;
  color: white;
  line-height: 1;
  min-width: 1.8rem;
  text-align: center;
}
.colon {
  font-size: 1.75rem;
  color: rgba(8, 145, 178, 0.35);
  font-weight: 300;
}

.score-status-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.match-status {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0.2rem 0.45rem;
  border-radius: 6px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}
.live-pip {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 1.5s infinite;
}
.ms-live {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}
.ms-finished {
  background: rgba(34, 197, 94, 0.12);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.25);
}
.ms-paused {
  background: rgba(251, 191, 36, 0.12);
  color: #fde68a;
  border: 1px solid rgba(251, 191, 36, 0.25);
}
.ms-scheduled {
  background: rgba(59, 130, 246, 0.12);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.25);
}

.matchday {
  font-size: 0.55rem;
  color: rgba(255, 255, 255, 0.35);
  font-weight: 500;
  padding: 0.15rem 0.35rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 4px;
}

.score-date {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(8, 145, 178, 0.06);
  border-radius: 10px;
  padding: 0.6rem 0.7rem;
}

.stat-icon-wrap {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(8, 145, 178, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(34, 211, 238, 0.6);
}

.stat-text {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
  min-width: 0;
}

.st-label {
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: rgba(255, 255, 255, 0.35);
  font-weight: 600;
}

.st-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.winner-val {
  color: #86efac;
}

/* Transitions */
.modal-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-leave-active {
  transition: all 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-container {
  transform: scale(0.92) translateY(16px);
}
.modal-leave-to .modal-container {
  transform: scale(0.95);
}

/* Mobile */
@media (max-width: 640px) {
  .modal-container { padding: 1.25rem; border-radius: 18px; }
  .crest { width: 44px; height: 44px; }
  .digit { font-size: 1.8rem; min-width: 1.5rem; }
  .colon { font-size: 1.4rem; }
  .score-middle { min-width: 70px; }
  .scoreboard { gap: 0.75rem; }
  .team-full { font-size: 0.75rem; }
  .stats-grid { grid-template-columns: 1fr; }
}
</style>
