const params = new URLSearchParams(window.location.search);

const LIST_NAME = params.get("list") || "spam";
const SELECTED_LEVEL = params.get("level");

const tierOrder = [
  "wood", "bronze", "silver", "gold", "amber", "platinum",
  "sapphire", "jade", "emerald", "ruby", "diamond",
  "titanium", "amethyst", "obsidian", "uranium", "bedrock"
];

async function loadLevelDropdown(){
  const response = await fetch(`data/${LIST_NAME}.json`);
  const levels = await response.json();

  const select = document.getElementById("level-select");
  select.innerHTML = "";

  tierOrder.forEach(tier => {
    const tierLevels = levels.filter(level => level.tier === tier);

    if(tierLevels.length === 0) return;

    const group = document.createElement("optgroup");
    group.label = tier.charAt(0).toUpperCase() + tier.slice(1) + " Tier";

    tierLevels.forEach(level => {
      const option = document.createElement("option");

      option.value = level.name;
      option.textContent = level.name;

      if(level.fps && level.fps !== "n/a"){
        option.dataset.lockedFps = level.fps;
      }

      if(level.name === SELECTED_LEVEL){
        option.selected = true;
      }

      group.appendChild(option);
    });

    select.appendChild(group);
  });

  updateFpsField();
  select.addEventListener("change", updateFpsField);
}

function updateFpsField(){
  const select = document.getElementById("level-select");
  const fpsInput = document.getElementById("fps");

  const selectedOption = select.options[select.selectedIndex];
  const lockedFps = selectedOption.dataset.lockedFps;

  if(lockedFps){
    fpsInput.value = lockedFps;
    fpsInput.readOnly = true;
  }else{
    fpsInput.value = "";
    fpsInput.readOnly = false;
  }
}

async function submitCompletion(){
  const { data: userData } = await supabaseClient.auth.getUser();

  if(!userData.user){
    alert("Log in first.");
    return;
  }

  const levelName = document.getElementById("level-select").value;
  const fps = document.getElementById("fps").value;
  const videoUrl = document.getElementById("video-url").value;
  const notes = document.getElementById("notes").value;

  if(!levelName || !fps || !videoUrl){
    alert("Level, FPS, and video link are required.");
    return;
  }

  const discordName =
    userData.user.user_metadata.full_name ||
    userData.user.user_metadata.name ||
    "Unknown";

  const { error } = await supabaseClient
    .from("submissions")
    .insert({
      user_id: userData.user.id,
      discord_name: discordName,
      list_name: LIST_NAME,
      level_name: levelName,
      fps: fps,
      video_url: videoUrl,
      notes: notes,
      status: "pending"
    });

  if(error){
    alert(error.message);
    return;
  }

  alert("Submitted for staff review.");

  document.getElementById("video-url").value = "";
  document.getElementById("notes").value = "";
}

loadLevelDropdown();