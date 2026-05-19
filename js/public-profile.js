const params = new URLSearchParams(window.location.search);
const profileId = params.get("id");

let publicCompletions = [];

async function loadPublicProfile(){
  if(!profileId){
    alert("No profile selected.");
    window.location.href = "leaderboard.html";
    return;
  }

  const { data: profile, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .single();

  if(error || !profile){
    alert("Profile not found.");
    window.location.href = "leaderboard.html";
    return;
  }

  document.getElementById("public-avatar").src =
    profile.avatar_url ||
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  document.getElementById("public-nickname").textContent =
    profile.nickname || "Unnamed Player";

  document.getElementById("public-discord").textContent =
    profile.discord_name || "Unknown";

  document.getElementById("public-pronouns").textContent =
    profile.pronouns || "Not set";

  document.getElementById("public-country").textContent =
    profile.country || "Not set";

  document.getElementById("public-bio").textContent =
    profile.bio || "Not set";

  await loadPublicCompletions();
}

async function loadPublicCompletions(){
  const { data, error } = await supabaseClient
    .from("submissions")
    .select("*")
    .eq("user_id", profileId)
    .eq("status", "accepted")
    .order("submitted_at", { ascending:false });

  if(error){
    console.error(error);
    return;
  }

  publicCompletions = data || [];

  const container = document.getElementById("public-completions");
  container.innerHTML = "";

  if(publicCompletions.length === 0){
    container.innerHTML = `<p class="empty-text">No approved completions yet.</p>`;
    return;
  }

  publicCompletions.forEach(item => {
    const card = document.createElement("button");
    card.className = "completion-button accepted";
    card.onclick = () => openCompletionModal(item.id);

    card.innerHTML = `
      <span>${item.level_name}</span>
      <small>${item.list_name} • ${item.fps} FPS</small>
    `;

    container.appendChild(card);
  });
}

function openCompletionModal(id){
  const item = publicCompletions.find(submission => submission.id === id);

  if(!item) return;

  document.getElementById("modal-body").innerHTML = `
    <h2>${item.level_name}</h2>
    ${getVideoEmbed(item.video_url)}
    <p><strong>List:</strong> ${item.list_name}</p>
    <p><strong>FPS:</strong> ${item.fps}</p>
    <p><strong>Status:</strong> Accepted</p>
    <p><strong>Notes:</strong> ${item.notes || "None"}</p>
  `;

  document.getElementById("completion-modal").classList.remove("hidden");
}

function closeCompletionModal(){
  document.getElementById("completion-modal").classList.add("hidden");
}

function getVideoEmbed(url){
  let embedUrl = "";

  if(url.includes("youtube.com/watch?v=")){
    const id = url.split("v=")[1].split("&")[0];
    embedUrl = `https://www.youtube.com/embed/${id}`;
  }

  if(url.includes("youtu.be/")){
    const id = url.split("youtu.be/")[1].split("?")[0];
    embedUrl = `https://www.youtube.com/embed/${id}`;
  }

  if(!embedUrl){
    return `<a class="video-link" href="${url}" target="_blank">Open Video</a>`;
  }

  return `
    <iframe
      class="record-video"
      src="${embedUrl}"
      allowfullscreen>
    </iframe>
  `;
}

loadPublicProfile();