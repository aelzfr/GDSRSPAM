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
let userCheckmarks = [];

const container = document.getElementById("tiers-container");

async function loadList(){
  const response = await fetch(`../data/${DATA_FILE}.json`);
  allLevels = await response.json();

  visibleTiers = tierOrder.filter(tier =>
    allLevels.some(level => level.tier === tier)
  );

  await loadUserCheckmarks();

  renderTier();
}

async function loadUserCheckmarks(){
  if(typeof supabaseClient === "undefined") return;

  const { data: userData } = await supabaseClient.auth.getUser();

  if(!userData.user) return;

  const { data, error } = await supabaseClient
    .from("personal_checkmarks")
    .select("level_name")
    .eq("user_id", userData.user.id)
    .eq("list_name", DATA_FILE);

  if(error){
    console.error(error);
    return;
  }

  userCheckmarks = data.map(item => item.level_name);
}

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
    const isChecked = userCheckmarks.includes(level.name);

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="level-name">
        ${level.name}
      </div>

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

      <button
        class="checkmark-button ${isChecked ? "checked" : ""}"
        data-level="${level.name}">
        ${isChecked ? "✓ Completed" : "✓ Mark Complete"}
      </button>

      <a
        class="submit-level-button"
        href="../submit.html?list=${DATA_FILE}&level=${encodeURIComponent(level.name)}">
        Submit Completion
      </a>
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

  setupCheckmarkButtons();
}

function setupCheckmarkButtons(){
  const buttons = document.querySelectorAll(".checkmark-button");

  buttons.forEach(button => {
    button.onclick = async () => {
      await toggleCheckmark(button.dataset.level);
    };
  });
}

async function toggleCheckmark(levelName){
  if(typeof supabaseClient === "undefined"){
    alert("Auth is not loaded.");
    return;
  }

  const { data: userData } = await supabaseClient.auth.getUser();

  if(!userData.user){
    alert("Log in first.");
    return;
  }

  const alreadyChecked = userCheckmarks.includes(levelName);

  if(alreadyChecked){
    const { error } = await supabaseClient
      .from("personal_checkmarks")
      .delete()
      .eq("user_id", userData.user.id)
      .eq("list_name", DATA_FILE)
      .eq("level_name", levelName);

    if(error){
      alert(error.message);
      return;
    }

    userCheckmarks = userCheckmarks.filter(name => name !== levelName);
  }else{
    const { error } = await supabaseClient
      .from("personal_checkmarks")
      .insert({
        user_id: userData.user.id,
        list_name: DATA_FILE,
        level_name: levelName
      });

    if(error){
      alert(error.message);
      return;
    }

    userCheckmarks.push(levelName);
  }

  renderTier();
}

loadList();
