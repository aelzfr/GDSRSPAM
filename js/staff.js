const APPROVED_STAFF_IDS = [
  "5b8b0d04-5a08-42c9-9e79-ac9c8475c139"
];

async function loadStaffPage(){
  const { data: userData } = await supabaseClient.auth.getUser();

  if(!userData.user){
    document.getElementById("staff-warning").innerHTML =
      `<div class="info-section"><h2>Login Required</h2><p>You need to log in first.</p></div>`;
    return;
  }

  if(!APPROVED_STAFF_IDS.includes(userData.user.id)){
    document.getElementById("staff-warning").innerHTML =
      `<div class="info-section"><h2>Access Denied</h2><p>You are not approved staff.</p></div>`;
    return;
  }

  const { data, error } = await supabaseClient
    .from("submissions")
    .select("*")
    .eq("status", "pending")
    .order("submitted_at", { ascending: true });

  if(error){
    alert(error.message);
    return;
  }

  renderSubmissions(data);
}

function renderSubmissions(submissions){
  const container = document.getElementById("submissions-container");
  container.innerHTML = "";

  if(submissions.length === 0){
    container.innerHTML =
      `<div class="info-section"><h2>No Pending Submissions</h2><p>Everything is reviewed.</p></div>`;
    return;
  }

  submissions.forEach(submission => {
    const card = document.createElement("div");
    card.className = "submission-card";

    card.innerHTML = `
      <h2>${submission.level_name}</h2>

      ${getVideoEmbed(submission.video_url)}

      <p><strong>User:</strong> ${submission.discord_name}</p>
      <p><strong>List:</strong> ${submission.list_name}</p>
      <p><strong>FPS:</strong> ${submission.fps}</p>
      <p><strong>Notes:</strong> ${submission.notes || "None"}</p>

      <div class="submission-actions">
        <button onclick="acceptSubmission('${submission.id}')">
          Accept
        </button>

        <button onclick="rejectSubmission('${submission.id}')">
          Reject
        </button>
      </div>
    `;

    container.appendChild(card);
  });
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

async function acceptSubmission(id){
  const { error } = await supabaseClient
    .from("submissions")
    .update({
      status: "accepted",
      reviewed_at: new Date()
    })
    .eq("id", id);

  if(error){
    alert(error.message);
    return;
  }

  loadStaffPage();
}

async function rejectSubmission(id){
  const { error } = await supabaseClient
    .from("submissions")
    .update({
      status: "rejected",
      reviewed_at: new Date()
    })
    .eq("id", id);

  if(error){
    alert(error.message);
    return;
  }

  loadStaffPage();
}

loadStaffPage();