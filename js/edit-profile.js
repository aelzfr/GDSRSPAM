async function loadEditProfile(){
  const { data: userData } = await supabaseClient.auth.getUser();

  if(!userData.user){
    alert("Log in first.");
    window.location.href = "index.html";
    return;
  }

  const { data } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id)
    .single();

  if(data){
    document.getElementById("nickname-input").value = data.nickname || "";
    document.getElementById("pronouns-input").value = data.pronouns || "";
    document.getElementById("country-input").value = data.country || "";
    document.getElementById("bio-input").value = data.bio || "";
  }
}

async function saveProfileEdits(){
  const { data: userData } = await supabaseClient.auth.getUser();

  if(!userData.user){
    alert("Log in first.");
    return;
  }

const profile = {
  id: userData.user.id,

  nickname: document.getElementById("nickname-input").value,

  pronouns: document.getElementById("pronouns-input").value,

  country: document.getElementById("country-input").value,

  bio: document.getElementById("bio-input").value,

  discord_name:
    userData.user.user_metadata.full_name ||
    userData.user.user_metadata.name ||
    "Unknown",

  avatar_url:
    userData.user.user_metadata.avatar_url || null
};

  const { error } = await supabaseClient
    .from("profiles")
    .upsert(profile);

  if(error){
    alert(error.message);
    return;
  }

  alert("Profile saved.");
  window.location.href = "profile.html";
}

loadEditProfile();