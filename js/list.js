const tierOrder = [
  "wood",
  "bronze",
  "silver",
  "gold",
  "amber",
  "platinum",
  "sapphire",
  "jade",
  "emerald",
  "ruby",
  "diamond",
  "titanium",
  "amethyst",
  "obsidian",
  "uranium",
  "bedrock"
];

let allLevels = [];
let visibleTiers = [];
let currentTierIndex = 0;

const container = document.getElementById("tiers-container");

fetch(`../data/${DATA_FILE}.json`)
  .then(res => res.json())
  .then(levels => {
    allLevels = levels;

    visibleTiers = tierOrder.filter(tier =>
      allLevels.some(level => level.tier === tier)
    );

    renderTier();
  });

function renderTier(){
  container.innerHTML = "";

  const tier = visibleTiers[currentTierIndex];

  const filteredLevels = allLevels.filter(level =>
    level.tier === tier
  );

  const wrapper = document.createElement("div");
  wrapper.className = "tier-view";

  wrapper.innerHTML = `
    <div class="tier-nav">
      <button id="prev-tier">←</button>

      <h2 class="tier-title ${tier}">
        ${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
      </h2>

      <button id="next-tier">→</button>
    </div>

    <div class="tier-count">
      ${currentTierIndex + 1} / ${visibleTiers.length}
    </div>

    <div class="level-grid"></div>
  `;

  const grid = wrapper.querySelector(".level-grid");

  filteredLevels.forEach(level => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="level-name">${level.name}</div>

      <div class="creator">
        by ${level.creator}
      </div>

      <div class="gamemode ${level.gamemode}">
        ${level.gamemode.toUpperCase()}
      </div>

      <div class="spam-bar">
        <div class="fill" style="width:${level.difficulty}%"></div>
      </div>

      <div class="desc">
        ${level.description}
      </div>
    `;

    grid.appendChild(card);
  });

  container.appendChild(wrapper);

  document.getElementById("prev-tier").onclick = () => {
    currentTierIndex--;

    if(currentTierIndex < 0){
      currentTierIndex = visibleTiers.length - 1;
    }

    renderTier();
  };

  document.getElementById("next-tier").onclick = () => {
    currentTierIndex++;

    if(currentTierIndex >= visibleTiers.length){
      currentTierIndex = 0;
    }

    renderTier();
  };
}