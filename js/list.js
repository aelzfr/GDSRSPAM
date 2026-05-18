const params = new URLSearchParams(window.location.search);

const currentList =
  params.get("list") || "spam";

fetch(`data/${currentList}.json`)
  .then(res => res.json())
  .then(levels => {

    const tierOrder = [
      "wood",
      "bronze",
      "silver",
      "gold",
      "amber",
      "platinum",
      "sapphire",
      "jade",
      "emerald",
      "ruby",
      "diamond",
      "titanium",
      "amethyst",
      "obsidian",
      "uranium",
      "bedrock"
    ];

    const container =
      document.getElementById("tiers-container");

    tierOrder.forEach(tier => {

      const filteredLevels =
        levels.filter(
          level => level.tier === tier
        );

      if(filteredLevels.length === 0) return;

      const section =
        document.createElement("div");

      section.className = "tier-section";

      const title =
        document.createElement("h2");

      title.className =
        `tier-title ${tier}`;

      title.textContent =
        tier.charAt(0).toUpperCase() +
        tier.slice(1) +
        " Tier";

      const grid =
        document.createElement("div");

      grid.className = "level-grid";

      filteredLevels.forEach(level => {

        const card =
          document.createElement("div");

        card.className = "card";

        card.innerHTML = `
          <div class="level-name">
            ${level.name}
          </div>

          <div class="creator">
            by ${level.creator}
          </div>

          <div class="gamemode ${level.gamemode}">
            ${level.gamemode.toUpperCase()}
          </div>

          <div class="spam-bar">
            <div
              class="fill"
              style="width:${level.difficulty}%">
            </div>
          </div>

          <div class="desc">
            ${level.description}
          </div>
        `;

        grid.appendChild(card);

      });

      section.appendChild(title);
      section.appendChild(grid);

      container.appendChild(section);

    });

  });
