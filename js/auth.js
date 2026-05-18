const supabaseUrl = "https://yciremvutpgmzihtgszm.supabase.co";
const supabaseAnonKey = "sb_publishable_ZaWi9vl7Mzi6YoQ6mf0MrA_EXPxuMLl";

const supabaseClient = supabase.createClient(
  supabaseUrl,
  supabaseAnonKey
);

async function loginWithDiscord(){
  await supabaseClient.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: window.location.origin
    }
  });
}

async function logout(){
  await supabaseClient.auth.signOut();
  location.reload();
}

async function updateAccountButton(){
  const { data } = await supabaseClient.auth.getUser();

  const button = document.querySelector(".login-button");

  if(!button) return;

  if(data.user){
    const name =
      data.user.user_metadata.full_name ||
      data.user.user_metadata.name ||
      "Logged In";

    button.textContent = `Logout: ${name}`;
    button.onclick = logout;
  }else{
    button.textContent = "Login with Discord";
    button.onclick = loginWithDiscord;
  }
}

updateAccountButton();
