const supabaseUrl = "https://yciremvutpgmzihtgszm.supabase.co";
const supabaseAnonKey = "sb_publishable_ZaWi9vl7Mzi6YoQ6mf0MrA_EXPxuMLl";

const supabase = window.supabase.createClient(
  supabaseUrl,
  supabaseAnonKey
);

async function loginWithDiscord(){
  await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: window.location.origin
    }
  });
}

async function logout(){
  await supabase.auth.signOut();
  location.reload();
}

async function showUser(){
  const { data } = await supabase.auth.getUser();

  console.log(data.user);
}

showUser();
