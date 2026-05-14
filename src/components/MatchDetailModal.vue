<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="match" class="modal-overlay" @click.self="$emit('close')">
        <div
          class="modal-card"
          role="dialog"
          aria-modal="true"
          :aria-label="`Match: ${homeName} vs ${awayName}`"
        >
          <!-- Close -->
          <button class="btn-close" @click="$emit('close')" aria-label="Close">
            <v-icon icon="mdi-close" size="small" />
          </button>

          <!-- Top Hero: Competition + Status integrated -->
          <div class="hero-area">
            <div class="comp-row" v-if="competition">
              <img
                v-if="competition.emblem"
                :src="competition.emblem"
                :alt="competition.name"
                class="comp-crest"
              />
              <span class="comp-name">{{ competition.name }}</span>
            </div>
            <div class="status-row">
              <span class="status-chip" :class="`chip-${statusClass}`">
                <span v-if="isLiveStatus" class="chip-dot" aria-hidden="true" />
                {{ statusLabel }}
              </span>
              <span v-if="match.matchday" class="md-badge">MD{{ match.matchday }}</span>
            </div>
          </div>

          <!-- Scoreboard -->
          <div class="scoreboard">
            <!-- Home -->
            <div class="team-panel home-panel">
              <img
                v-if="match.homeTeam?.crest"
                :src="match.homeTeam.crest"
                :alt="match.homeTeam.name"
                class="team-crest"
              />
              <span class="team-label">{{ match.homeTeam?.shortName || match.homeTeam?.name }}</span>
              <span class="team-role">Home</span>
            </div>

            <!-- Score -->
            <div class="score-panel">
              <div class="score-digits">
                <span class="digit" :class="{ 'digit-win': isHomeWinner }">{{ homeScore }}</span>
                <span class="colon" aria-hidden="true">:</span>
                <span class="digit" :class="{ 'digit-win': isAwayWinner }">{{ awayScore }}</span>
              </div>
              <span class="score-date">{{ dateTime }}</span>
            </div>

            <!-- Away -->
            <div class="team-panel away-panel">
              <img
                v-if="match.awayTeam?.crest"
                :src="match.awayTeam.crest"
                :alt="match.awayTeam.name"
                class="team-crest"
              />
              <span class="team-label">{{ match.awayTeam?.shortName || match.awayTeam?.name }}</span>
              <span class="team-role">Away</span>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="stats-grid" v-if="hasAnyStat">
            <!-- Half Time -->
            <div class="stat-tile" v-if="hasHalfTime">
              <div class="tile-icon box-amber"><v-icon icon="mdi-clock-time-four" size="15" /></div>
              <div class="tile-body">
                <span class="tile-label">Half Time</span>
                <span class="tile-value">{{ match.score.halfTime.home }} : {{ match.score.halfTime.away }}</span>
              </div>
            </div>

            <!-- Full Date -->
            <div class="stat-tile">
              <div class="tile-icon box-cyan"><v-icon icon="mdi-calendar" size="15" /></div>
              <div class="tile-body">
                <span class="tile-label">Date</span>
                <span class="tile-value mono">{{ fullDateShort }}</span>
              </div>
            </div>

            <!-- Stage -->
            <div class="stat-tile" v-if="match.stage && match.stage !== 'REGULAR_SEASON'">
              <div class="tile-icon box-purple"><v-icon icon="mdi-trophy-outline" size="15" /></div>
              <div class="tile-body">
                <span class="tile-label">Stage</span>
                <span class="tile-value">{{ formatStage(match.stage) }}</span>
              </div>
            </div>

            <!-- Winner -->
            <div class="stat-tile" v-if="match.status === 'FINISHED' && winnerName">
              <div class="tile-icon box-emerald"><v-icon icon="mdi-crown" size="15" /></div>
              <div class="tile-body">
                <span class="tile-label">Winner</span>
                <span class="tile-value winner-text">{{ winnerName }}</span>
              </div>
            </div>

            <!-- Duration -->
            <div class="stat-tile" v-if="match.score?.duration && match.score.duration !== 'REGULAR'">
              <div class="tile-icon box-slate"><v-icon icon="mdi-clock-outline" size="15" /></div>
              <div class="tile-body">
                <span class="tile-label">Duration</span>
                <span class="tile-value">{{ formatDuration(match.score.duration) }}</span>
              </div>
            </div>

            <!-- Extra Time -->
            <div class="stat-tile" v-if="hasExtraTime">
              <div class="tile-icon box-orange"><v-icon icon="mdi-clock-plus-outline" size="15" /></div>
              <div class="tile-body">
                <span class="tile-label">Extra Time</span>
                <span class="tile-value">{{ match.score.extraTime!.home }} : {{ match.score.extraTime!.away }}</span>
              </div>
            </div>

            <!-- Penalties -->
            <div class="stat-tile" v-if="hasPenalties">
              <div class="tile-icon box-rose"><v-icon icon="mdi-target" size="15" /></div>
              <div class="tile-body">
                <span class="tile-label">Penalties</span>
                <span class="tile-value">{{ match.score.penalties!.home }} : {{ match.score.penalties!.away }}</span>
              </div>
            </div>

            <!-- Updated -->
            <div class="stat-tile">
              <div class="tile-icon box-cyan"><v-icon icon="mdi-update" size="15" /></div>
              <div class="tile-body">
                <span class="tile-label">Updated</span>
                <span class="tile-value">{{ updatedTime }}</span>
              </div>
            </div>
          </div>

          <!-- Match ID footer -->
          <div class="modal-footer">
            <span class="match-id">Match #{{ match.id }}</span>
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

// -- Computed state --

const homeName = computed(() => props.match?.homeTeam?.name ?? "");
const awayName = computed(() => props.match?.awayTeam?.name ?? "");
const homeScore = computed(() => props.match?.score?.fullTime?.home ?? "-");
const awayScore = computed(() => props.match?.score?.fullTime?.away ?? "-");

const isLiveStatus = computed(() => {
  const s = props.match?.status;
  return s === "IN_PLAY" || s === "LIVE";
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
  return "scheduled";
});

const isHomeWinner = computed(() => props.match?.score?.winner === "HOME_TEAM");
const isAwayWinner = computed(() => props.match?.score?.winner === "AWAY_TEAM");

const winnerName = computed(() => {
  const w = props.match?.score?.winner;
  if (!w || !props.match) return "";
  if (w === "HOME_TEAM") return props.match.homeTeam?.shortName || props.match.homeTeam?.name || "Home";
  if (w === "AWAY_TEAM") return props.match.awayTeam?.shortName || props.match.awayTeam?.name || "Away";
  return "Draw";
});

const dateTime = computed(() => {
  if (!props.match) return "";
  const d = new Date(props.match.utcDate);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
});

const fullDateShort = computed(() => {
  if (!props.match) return "";
  const d = new Date(props.match.utcDate);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
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
  return ht && (ht.home !== null || ht.away !== null);
});

const hasExtraTime = computed(() => {
  const et = props.match?.score?.extraTime;
  return et && (et.home !== null || et.away !== null);
});

const hasPenalties = computed(() => {
  const p = props.match?.score?.penalties;
  return p && (p.home !== null || p.away !== null);
});

const hasAnyStat = computed(() => {
  return hasHalfTime.value || hasExtraTime.value || hasPenalties.value || props.match != null;
});

const formatStage = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const formatDuration = (d: string) => {
  if (d === "EXTRA_TIME") return "Extra Time";
  if (d === "PENALTY_SHOOTOUT") return "Penalties";
  return d;
};
</script>

<style scoped>
/* ============================
   1. OVERLAY
   ============================ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
}

/* ============================
   2. CARD CONTAINER
   ============================ */
.modal-card {
  position: relative;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 20px;
  background: linear-gradient(170deg, #0f1a3a 0%, #070a1e 100%);
  border: 1px solid rgba(8, 145, 178, 0.12);
  box-shadow:
    0 32px 64px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.03) inset,
    0 1px 0 rgba(255, 255, 255, 0.04) inset;
  scrollbar-width: thin;
  scrollbar-color: rgba(8, 145, 178, 0.15) transparent;
}

/* Subtle top glow accent */
.modal-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 20%;
  right: 20%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.25), transparent);
  pointer-events: none;
}

/* ============================
   3. CLOSE BUTTON
   ============================ */
.btn-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 2;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(7, 9, 26, 0.85);
  backdrop-filter: blur(4px);
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
.btn-close:hover {
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.8);
}
.btn-close:active {
  transform: scale(0.9);
  background: rgba(255, 255, 255, 0.08);
}

/* ============================
   4. HERO AREA
   ============================ */
.hero-area {
  padding: 1.5rem 3rem 0 1.5rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.comp-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 0.2rem 0.6rem 0.2rem 0.4rem;
}
.comp-crest {
  width: 16px;
  height: 16px;
  object-fit: contain;
  flex-shrink: 0;
}
.comp-name {
  font-size: 0.6rem;
  font-weight: 700;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  line-height: 1;
}
.chip-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  animation: chipPulse 1.5s infinite;
}
.chip-live {
  background: rgba(239, 68, 68, 0.18);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.25);
}
.chip-finished {
  background: rgba(16, 185, 129, 0.12);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.2);
}
.chip-paused {
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.2);
}
.chip-scheduled {
  background: rgba(59, 130, 246, 0.12);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.md-badge {
  font-size: 0.55rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.3);
  padding: 0.15rem 0.35rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 4px;
}

@keyframes chipPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

/* ============================
   5. SCOREBOARD
   ============================ */
.scoreboard {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
}

.team-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  flex: 1;
  min-width: 0;
}
.away-panel {
  text-align: right;
}

.team-crest {
  width: 52px;
  height: 52px;
  object-fit: contain;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.35));
}

.team-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #f1f5f9;
  text-align: center;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  white-space: nowrap;
}
.away-panel .team-label {
  text-align: right;
}

.team-role {
  font-size: 0.55rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.25);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

/* ============================
   6. SCORE PANEL
   ============================ */
.score-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
  min-width: 80px;
}

.score-digits {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.digit {
  font-size: 2.25rem;
  font-weight: 800;
  color: #f8fafc;
  line-height: 1;
  min-width: 1.6rem;
  text-align: center;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.digit-win {
  color: #34d399;
  text-shadow: 0 0 16px rgba(52, 211, 153, 0.2);
}

.colon {
  font-size: 1.5rem;
  font-weight: 300;
  color: rgba(34, 211, 238, 0.3);
  line-height: 1;
}

.score-date {
  font-size: 0.6rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
}

/* ============================
   7. STATS GRID
   ============================ */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  padding: 0 1.5rem 1.25rem;
}

.stat-tile {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 0.6rem;
  transition: background 0.2s;
}
.stat-tile:hover {
  background: rgba(255, 255, 255, 0.06);
}

.tile-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Colored icon boxes */
.box-cyan {
  background: rgba(34, 211, 238, 0.1);
  color: rgba(34, 211, 238, 0.7);
}
.box-amber {
  background: rgba(245, 158, 11, 0.1);
  color: rgba(245, 158, 11, 0.7);
}
.box-purple {
  background: rgba(168, 85, 247, 0.1);
  color: rgba(168, 85, 247, 0.7);
}
.box-emerald {
  background: rgba(52, 211, 153, 0.1);
  color: rgba(52, 211, 153, 0.7);
}
.box-slate {
  background: rgba(148, 163, 184, 0.1);
  color: rgba(148, 163, 184, 0.7);
}
.box-orange {
  background: rgba(249, 115, 22, 0.1);
  color: rgba(249, 115, 22, 0.7);
}
.box-rose {
  background: rgba(244, 63, 94, 0.1);
  color: rgba(244, 63, 94, 0.7);
}

.tile-body {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
  min-width: 0;
}

.tile-label {
  font-size: 0.55rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.35);
}

.tile-value {
  font-size: 0.72rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mono {
  font-variant-numeric: tabular-nums;
}

.winner-text {
  color: #34d399;
  font-weight: 700;
}

/* ============================
   8. FOOTER
   ============================ */
.modal-footer {
  padding: 0.6rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  display: flex;
  justify-content: flex-end;
}
.match-id {
  font-size: 0.5rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.15);
  letter-spacing: 0.3px;
}

/* ============================
   9. TRANSITIONS
   ============================ */
.modal-enter-active { transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from,
.modal-leave-to { opacity: 0; }
.modal-enter-from .modal-card {
  transform: scale(0.92) translateY(20px);
  opacity: 0;
}
.modal-leave-to .modal-card {
  transform: scale(0.96);
  opacity: 0;
}

/* ============================
   10. RESPONSIVE
   ============================ */
@media (max-width: 640px) {
  .modal-overlay { padding: 0.75rem; align-items: flex-end; }
  .modal-card {
    max-width: 100%;
    border-radius: 16px 16px 0 0;
    max-height: 85vh;
  }
  .hero-area { padding: 1.25rem 2.75rem 0 1.25rem; }
  .scoreboard { padding: 1rem 1.25rem; gap: 0.75rem; }
  .team-crest { width: 40px; height: 40px; }
  .team-label { font-size: 0.7rem; }
  .digit { font-size: 1.75rem; min-width: 1.3rem; }
  .colon { font-size: 1.25rem; }
  .score-panel { min-width: 60px; }
  .stats-grid {
    grid-template-columns: 1fr;
    padding: 0 1.25rem 1rem;
  }
  .modal-footer { padding: 0.5rem 1.25rem; }
}
</style>
