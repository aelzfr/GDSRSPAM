let userSubmissions = [];

async function loadProfilePage(){
  const { data: userData } = await supabaseClient.auth.getUser();

  if(!userData.user){
    alert("Log in first.");
    window.location.href = "index.html";
    return;
  }

  const user = userData.user;

  document.getElementById("profile-avatar").src =
  user.user_metadata.avatar_url ||
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const discordName =
    user.user_metadata.full_name ||
    user.user_metadata.name ||
    "Unknown";

  document.getElementById("discord-name").textContent = discordName;

  const { data: profile } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  document.getElementById("profile-name").textContent =
    profile?.nickname || discordName;

  document.getElementById("nickname").textContent =
    profile?.nickname || "Not set";

  document.getElementById("pronouns").textContent =
    profile?.pronouns || "Not set";

  document.getElementById("country").textContent =
    profile?.country || "Not set";

  document.getElementById("bio").textContent =
    profile?.bio || "Not set";

  await loadCompletions(user.id);
}

async function loadCompletions(userId){
  const { data, error } = await supabaseClient
    .from("submissions")
    .select("*")
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false });

  if(error){
    console.error(error);
    return;
  }

  userSubmissions = data;

  renderCompletionGroup("approved-completions", "accepted");
  renderCompletionGroup("pending-completions", "pending");
  renderCompletionGroup("denied-completions", "rejected");
}

function renderCompletionGroup(containerId, status){
  const container = document.getElementById(containerId);

  const filtered = userSubmissions.filter(item =>
    item.status === status
  );

  container.innerHTML = "";

  if(filtered.length === 0){
    container.innerHTML = `<p class="empty-text">None yet.</p>`;
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement("button");
    card.className = `completion-button ${status}`;
    card.onclick = () => openCompletionModal(item.id);

    card.innerHTML = `
      <span>${item.level_name}</span>
      <small>${item.list_name} • ${item.fps} FPS</small>
    `;

    container.appendChild(card);
  });
}

function openCompletionModal(id){
  const item = userSubmissions.find(submission => submission.id === id);

  if(!item) return;

  const modal = document.getElementById("completion-modal");
  const body = document.getElementById("modal-body");

  body.innerHTML = `
    <h2>${item.level_name}</h2>

    ${getVideoEmbed(item.video_url)}

    <p><strong>List:</strong> ${item.list_name}</p>
    <p><strong>FPS:</strong> ${item.fps}</p>
    <p><strong>Status:</strong> ${item.status}</p>
    <p><strong>Notes:</strong> ${item.notes || "None"}</p>
  `;

  modal.classList.remove("hidden");
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

loadProfilePage();