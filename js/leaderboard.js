const tierPoints = {
  wood: 1,
  bronze: 2,
  silver: 3,
  gold: 5,
  amber: 8,
  platinum: 12,
  sapphire: 17,
  jade: 23,
  emerald: 30,
  ruby: 38,
  diamond: 47,
  titanium: 57,
  amethyst: 68,
  obsidian: 80,
  uranium: 93,
  bedrock: 110
};

const tierOrder = Object.keys(tierPoints);

let allProfiles = [];
let allAccepted = [];
let allLikes = [];
let allFollows = [];
let allTags = [];
let levelTierMap = {};
let levelTagMap = {};
let currentUserId = null;

async function initLeaderboard(){
  const { data: userData } = await supabaseClient.auth.getUser();
  currentUserId = userData.user?.id || null;

  await loadLevelMeta();
  await loadData();
  setupControls();
  renderLeaderboard();
}

async function loadLevelMeta(){
  const lists = ["spam", "consistency"];

  for(const listName of lists){
    const response = await fetch(`data/${listName}.json`);
    const levels = await response.json();

    levels.forEach(level => {
      levelTierMap[`${listName}|${level.name}`] = level.tier;
    });

    const { data: addedLevels } = await supabaseClient
      .from("added_levels")
      .select("*")
      .eq("list_name", listName);

    (addedLevels || []).forEach(level => {
      levelTierMap[`${listName}|${level.name}`] = level.tier;
    });
  }

  const { data: tagRows } = await supabaseClient
    .from("level_tags")
    .select(`
      list_name,
      level_name,
      tags (
        id,
        name,
        color
      )
    `);

  (tagRows || []).forEach(row => {
    const key = `${row.list_name}|${row.level_name}`;

    if(!levelTagMap[key]){
      levelTagMap[key] = [];
    }

    levelTagMap[key].push(row.tags);
  });

  const { data: tags } = await supabaseClient
    .from("tags")
    .select("*")
    .order("name");

  allTags = tags || [];

  const tagFilter = document.getElementById("tag-filter");

  allTags.forEach(tag => {
    const option = document.createElement("option");
    option.value = tag.id;
    option.textContent = tag.name;
    tagFilter.appendChild(option);
  });
}

async function loadData(){
  const [profilesRes, submissionsRes, likesRes, followsRes] =
    await Promise.all([
      supabaseClient.from("profiles").select("*"),
      supabaseClient.from("submissions").select("*").eq("status", "accepted"),
      supabaseClient.from("profile_likes").select("*"),
      supabaseClient.from("profile_follows").select("*")
    ]);

  allProfiles = profilesRes.data || [];
  allAccepted = submissionsRes.data || [];
  allLikes = likesRes.data || [];
  allFollows = followsRes.data || [];
}

function buildPlayerStats(){
  return allProfiles.map(profile => {
    const completions = allAccepted.filter(sub =>
      sub.user_id === profile.id
    );

    let points = 0;
    let tagCounts = {};

    completions.forEach(sub => {
      const key = `${sub.list_name}|${sub.level_name}`;
      const tier = levelTierMap[key];

      points += tierPoints[tier] || 0;

      const tags = levelTagMap[key] || [];

      tags.forEach(tag => {
        tagCounts[tag.id] = (tagCounts[tag.id] || 0) + 1;
      });
    });

    const likes = allLikes.filter(like =>
      like.liked_user_id === profile.id
    );

    const followers = allFollows.filter(follow =>
      follow.followed_user_id === profile.id
    );

    const followingBack = allFollows.some(follow =>
      follow.follower_id === profile.id &&
      follow.followed_user_id === currentUserId
    );

    const iFollowThem = allFollows.some(follow =>
      follow.follower_id === currentUserId &&
      follow.followed_user_id === profile.id
    );

    return {
      ...profile,
      completions,
      completionCount: completions.length,
      points,
      tagCounts,
      likeCount: likes.length,
      followerCount: followers.length,
      isFriend: iFollowThem && followingBack,
      iFollowThem,
      iLikedThem: allLikes.some(like =>
        like.liker_id === currentUserId &&
        like.liked_user_id === profile.id
      )
    };
  });
}

function setupControls(){
  document.getElementById("leaderboard-search")
    .addEventListener("input", renderLeaderboard);

  document.getElementById("leaderboard-sort")
    .addEventListener("change", renderLeaderboard);

  document.getElementById("tag-filter")
    .addEventListener("change", renderLeaderboard);
}

function renderLeaderboard(){
  const search = document.getElementById("leaderboard-search").value.toLowerCase();
  const sort = document.getElementById("leaderboard-sort").value;
  const tagFilter = document.getElementById("tag-filter").value;

  let players = buildPlayerStats();

  players = players.filter(player => {
    const nickname = (player.nickname || "").toLowerCase();
    const discord = (player.discord_name || "").toLowerCase();

    return nickname.includes(search) || discord.includes(search);
  });

  if(tagFilter){
    players = players.filter(player =>
      player.tagCounts[tagFilter] > 0
    );

    players.sort((a, b) =>
      (b.tagCounts[tagFilter] || 0) - (a.tagCounts[tagFilter] || 0)
    );
  }else{
    players.sort((a, b) => {
      if(sort === "completions") return b.completionCount - a.completionCount;
      if(sort === "likes") return b.likeCount - a.likeCount;
      if(sort === "followers") return b.followerCount - a.followerCount;
      return b.points - a.points;
    });
  }

  const container = document.getElementById("leaderboard-list");
  container.innerHTML = "";

  players.forEach((player, index) => {
    const card = document.createElement("div");
    card.className = "leaderboard-card";

    const name = player.nickname || "Unnamed Player";
    const discord = player.discord_name || "Discord hidden";

    const tagText = tagFilter
      ? `<p><strong>Tag Completions:</strong> ${player.tagCounts[tagFilter] || 0}</p>`
      : "";

    const avatar =
      player.avatar_url ||
      "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    card.innerHTML = `
      <div class="leaderboard-rank">#${index + 1}</div>

      <img class="leaderboard-avatar" src="${avatar}">

      <div class="leaderboard-main">

      <div class="leaderboard-main">
        <a href="public-profile.html?id=${player.id}">
          <h2>${name}</h2>
        </a>

        <p class="discord-small">${discord}</p>

        <p><strong>Points:</strong> ${player.points}</p>
        <p><strong>Completions:</strong> ${player.completionCount}</p>
        ${tagText}

        <p><strong>Likes:</strong> ${player.likeCount}</p>
        <p><strong>Followers:</strong> ${player.followerCount}</p>

        ${player.isFriend ? `<p class="friend-badge">Friends</p>` : ""}
      </div>

      <div class="leaderboard-actions">
        <button onclick="toggleLike('${player.id}')">
          ${player.iLikedThem ? "Unlike" : "Like"}
        </button>

        <button onclick="toggleFollow('${player.id}')">
          ${player.iFollowThem ? "Unfollow" : "Follow"}
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

async function toggleLike(profileId){
  if(!currentUserId){
    alert("Log in first.");
    return;
  }

  const existing = allLikes.find(like =>
    like.liker_id === currentUserId &&
    like.liked_user_id === profileId
  );

  if(existing){
    await supabaseClient
      .from("profile_likes")
      .delete()
      .eq("id", existing.id);
  }else{
    await supabaseClient
      .from("profile_likes")
      .insert({
        liker_id: currentUserId,
        liked_user_id: profileId
      });
  }

  await loadData();
  renderLeaderboard();
}

async function toggleFollow(profileId){
  if(!currentUserId){
    alert("Log in first.");
    return;
  }

  const existing = allFollows.find(follow =>
    follow.follower_id === currentUserId &&
    follow.followed_user_id === profileId
  );

  if(existing){
    await supabaseClient
      .from("profile_follows")
      .delete()
      .eq("id", existing.id);
  }else{
    await supabaseClient
      .from("profile_follows")
      .insert({
        follower_id: currentUserId,
        followed_user_id: profileId
      });
  }

  await loadData();
  renderLeaderboard();
}

initLeaderboard();