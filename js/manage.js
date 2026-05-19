const STAFF_IDS = [
  "5b8b0d04-5a08-42c9-9e79-ac9c8475c139"
];

const tierOrder = [
  "wood", "bronze", "silver", "gold", "amber", "platinum",
  "sapphire", "jade", "emerald", "ruby", "diamond",
  "titanium", "amethyst", "obsidian", "uranium", "bedrock"
];

async function checkStaff(){
  const { data } = await supabaseClient.auth.getUser();

  if(!data.user || !STAFF_IDS.includes(data.user.id)){
    alert("Access denied.");
    window.location.href = "index.html";
  }
}

async function getCombinedLevels(listName){
  const response = await fetch(`data/${listName}.json`);
  const jsonLevels = await response.json();

  const { data: addedLevels } = await supabaseClient
    .from("added_levels")
    .select("*")
    .eq("list_name", listName);

  const { data: removedLevels } = await supabaseClient
    .from("removed_levels")
    .select("level_name")
    .eq("list_name", listName);

  const removedNames = (removedLevels || []).map(item => item.level_name);

  const cleanedJsonLevels = jsonLevels.filter(level =>
    !removedNames.includes(level.name)
  );

  const formattedAddedLevels = (addedLevels || []).map(level => ({
    name: level.name,
    creator: level.creator,
    tier: level.tier,
    gamemode: level.gamemode,
    difficulty: level.difficulty,
    fps: level.fps,
    description: level.description
  }));

  return [
    ...cleanedJsonLevels,
    ...formattedAddedLevels
  ];
}

async function fillLevelSelect(selectId, listName){
  const levels = await getCombinedLevels(listName);
  const select = document.getElementById(selectId);

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
      group.appendChild(option);
    });

    select.appendChild(group);
  });
}

async function loadLevelDropdowns(){
  const listName = document.getElementById("tag-list").value;
  await fillLevelSelect("tag-level", listName);
}

async function loadRemoveTagLevelDropdown(){
  const listName = document.getElementById("remove-tag-list").value;
  await fillLevelSelect("remove-tag-level", listName);
  await loadTagsForSelectedLevel();
}

async function addLevel(){
  const { error } = await supabaseClient
    .from("added_levels")
    .insert({
      list_name: document.getElementById("add-list").value,
      name: document.getElementById("add-name").value,
      creator: document.getElementById("add-creator").value,
      tier: document.getElementById("add-tier").value,
      gamemode: document.getElementById("add-gamemode").value,
      difficulty: Number(document.getElementById("add-difficulty").value),
      fps: document.getElementById("add-fps").value,
      description: document.getElementById("add-description").value
    });

  if(error){
    alert(error.message);
    return;
  }

  alert("Level added.");
  await loadLevelDropdowns();
  await loadRemoveTagLevelDropdown();
}

async function removeLevel(){
  const { error } = await supabaseClient
    .from("removed_levels")
    .insert({
      list_name: document.getElementById("remove-list").value,
      level_name: document.getElementById("remove-name").value
    });

  if(error){
    alert(error.message);
    return;
  }

  alert("Level removed.");
  await loadLevelDropdowns();
  await loadRemoveTagLevelDropdown();
}

async function createTag(){
  const { error } = await supabaseClient
    .from("tags")
    .insert({
      name: document.getElementById("tag-name").value,
      color: document.getElementById("tag-color").value
    });

  if(error){
    alert(error.message);
    return;
  }

  alert("Tag created.");
  await loadTags();
}

async function loadTags(){
  const { data, error } = await supabaseClient
    .from("tags")
    .select("*")
    .order("name");

  if(error){
    alert(error.message);
    return;
  }

  const select = document.getElementById("tag-select");
  select.innerHTML = "";

  data.forEach(tag => {
    const option = document.createElement("option");
    option.value = tag.id;
    option.textContent = tag.name;
    select.appendChild(option);
  });
}

async function addTagToLevel(){
  const { error } = await supabaseClient
    .from("level_tags")
    .insert({
      list_name: document.getElementById("tag-list").value,
      level_name: document.getElementById("tag-level").value,
      tag_id: document.getElementById("tag-select").value
    });

  if(error){
    alert(error.message);
    return;
  }

  alert("Tag added to level.");
  await loadTagsForSelectedLevel();
}

async function loadTagsForSelectedLevel(){
  const listName = document.getElementById("remove-tag-list").value;
  const levelName = document.getElementById("remove-tag-level").value;

  const select = document.getElementById("remove-tag-select");
  select.innerHTML = "";

  if(!levelName) return;

  const { data, error } = await supabaseClient
    .from("level_tags")
    .select(`
      id,
      tags (
        name
      )
    `)
    .eq("list_name", listName)
    .eq("level_name", levelName);

  if(error){
    alert(error.message);
    return;
  }

  if(data.length === 0){
    const option = document.createElement("option");
    option.textContent = "No tags on this level";
    option.value = "";
    select.appendChild(option);
    return;
  }

  data.forEach(item => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.tags.name;
    select.appendChild(option);
  });
}

async function removeTagFromLevel(){
  const tagLinkId = document.getElementById("remove-tag-select").value;

  if(!tagLinkId){
    alert("No tag selected.");
    return;
  }

  const { error } = await supabaseClient
    .from("level_tags")
    .delete()
    .eq("id", tagLinkId);

  if(error){
    alert(error.message);
    return;
  }

  alert("Tag removed from level.");
  await loadTagsForSelectedLevel();
}

async function initManagePage(){
  await checkStaff();
  await loadTags();
  await loadLevelDropdowns();
  await loadRemoveTagLevelDropdown();
}

initManagePage();