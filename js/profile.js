async function loadProfile(){
  const { data: userData } = await supabaseClient.auth.getUser();

  if(!userData.user){
    alert("Log in first.");
    window.location.href = "index.html";
    return;
  }

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id)
    .single();

  if(error && error.code !== "PGRST116"){
    console.error(error);
    return;
  }

  if(data){
    document.getElementById("nickname").value = data.nickname || "";
    document.getElementById("country").value = data.country || "";
    document.getElementById("pronouns").value = data.pronouns || "";
    document.getElementById("bio").value = data.bio || "";
  }
}

async function saveProfile(){
  const { data: userData } = await supabaseClient.auth.getUser();

  if(!userData.user){
    alert("Log in first.");
    return;
  }

  const profile = {
    id: userData.user.id,
    nickname: document.getElementById("nickname").value,
    country: document.getElementById("country").value,
    pronouns: document.getElementById("pronouns").value,
    bio: document.getElementById("bio").value,
    updated_at: new Date()
  };

  const { error } = await supabaseClient
    .from("profiles")
    .upsert(profile);

  if(error){
    alert(error.message);
    return;
  }

  alert("Profile saved.");
}

loadProfile();