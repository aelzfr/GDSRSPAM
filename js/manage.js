const STAFF_IDS = [
  "5b8b0d04-5a08-42c9-9e79-ac9c8475c139"
];

async function checkStaff(){
  const { data } = await supabaseClient.auth.getUser();

  if(!data.user || !STAFF_IDS.includes(data.user.id)){
    alert("Access denied.");
    window.location.href = "index.html";
  }
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
  loadTags();
}

async function loadTags(){
  const { data } = await supabaseClient
    .from("tags")
    .select("*")
    .order("name");

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
}

checkStaff();
loadTags();