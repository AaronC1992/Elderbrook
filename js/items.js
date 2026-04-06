/* items.js - Chapter 1 item definitions */
var Items = (function () {

  var items = {
    /* ── Starter Weapons (given at character creation) ── */
    "basic-sword":   { id: "basic-sword",   name: "Basic Sword",   type: "weapon", slot: "weapon", icon: "", attack: 3, price: 30, sellPrice: 10, description: "A standard-issue iron sword." },
    "basic-dagger":  { id: "basic-dagger",  name: "Basic Dagger",  type: "weapon", slot: "weapon", icon: "", attack: 2, dexterity: 1, price: 25, sellPrice: 8, description: "A light dagger, quick in the hand." },
    "basic-bow":     { id: "basic-bow",     name: "Basic Bow",     type: "weapon", slot: "weapon", icon: "", attack: 3, price: 30, sellPrice: 10, description: "A simple wooden shortbow." },
    "basic-staff":   { id: "basic-staff",   name: "Basic Staff",   type: "weapon", slot: "weapon", icon: "", attack: 2, intelligence: 1, price: 25, sellPrice: 8, description: "A gnarled wooden staff humming with faint energy." },

    /* ── Upgrade Weapons (Bram's shop) ── */
    "reinforced-sword":   { id: "reinforced-sword",   name: "Reinforced Sword",   type: "weapon", slot: "weapon", icon: "", attack: 6, price: 80, sellPrice: 28, description: "A blade tempered with iron bands. Hits hard." },
    "sharpened-dagger":   { id: "sharpened-dagger",   name: "Sharpened Dagger",   type: "weapon", slot: "weapon", icon: "", attack: 5, dexterity: 2, price: 75, sellPrice: 25, description: "Honed to a wicked edge, fast and deadly." },
    "hunters-bow":        { id: "hunters-bow",        name: "Hunter's Bow",        type: "weapon", slot: "weapon", icon: "", attack: 6, price: 80, sellPrice: 28, description: "A sturdy bow made for the wilderness." },
    "apprentice-staff":   { id: "apprentice-staff",   name: "Apprentice Staff",   type: "weapon", slot: "weapon", icon: "", attack: 4, intelligence: 3, price: 75, sellPrice: 25, description: "Carved with minor focus runes. Amplifies magic." },

    /* ── Leather Armor Tier ── */
    "leather-helm":     { id: "leather-helm",     name: "Leather Helm",     type: "armor", slot: "helmet",  icon: "", defense: 1, price: 20, sellPrice: 7, description: "A simple leather cap." },
    "leather-chest":    { id: "leather-chest",    name: "Leather Chest",    type: "armor", slot: "chest",   icon: "", defense: 2, price: 35, sellPrice: 12, description: "Boiled leather cuirass." },
    "leather-leggings": { id: "leather-leggings", name: "Leather Leggings", type: "armor", slot: "legs",    icon: "", defense: 1, price: 25, sellPrice: 8, description: "Worn but serviceable leather trousers." },
    "leather-gloves":   { id: "leather-gloves",   name: "Leather Gloves",   type: "armor", slot: "gloves",  icon: "", defense: 1, price: 15, sellPrice: 5, description: "Light leather hand wraps." },
    "leather-bracers":  { id: "leather-bracers",  name: "Leather Bracers",  type: "armor", slot: "bracers", icon: "", defense: 1, price: 15, sellPrice: 5, description: "Simple wrist guards." },

    /* ── Iron Armor Tier ── */
    "iron-helm":       { id: "iron-helm",       name: "Iron Helm",       type: "armor", slot: "helmet",  icon: "", defense: 3, price: 60, sellPrice: 20, description: "A solid iron half-helm." },
    "iron-chestplate": { id: "iron-chestplate", name: "Iron Chestplate", type: "armor", slot: "chest",   icon: "", defense: 4, price: 90, sellPrice: 30, description: "Heavy iron breastplate. Reliable protection." },
    "iron-leggings":   { id: "iron-leggings",   name: "Iron Leggings",   type: "armor", slot: "legs",    icon: "", defense: 2, price: 50, sellPrice: 17, description: "Iron-banded leg guards." },
    "iron-gloves":     { id: "iron-gloves",     name: "Iron Gloves",     type: "armor", slot: "gloves",  icon: "", defense: 2, price: 35, sellPrice: 12, description: "Reinforced iron gauntlets." },
    "iron-bracers":    { id: "iron-bracers",    name: "Iron Bracers",    type: "armor", slot: "bracers", icon: "", defense: 2, price: 40, sellPrice: 13, description: "Thick iron arm guards." },

    /* ── Potions ── */
    "lesser-health-potion": { id: "lesser-health-potion", name: "Lesser Health Potion", type: "potion", subtype: "health", icon: "", healAmount: 15, price: 8,  sellPrice: 3, description: "Restores 15 HP." },
    "health-potion":        { id: "health-potion",        name: "Health Potion",        type: "potion", subtype: "health", icon: "", healAmount: 30, price: 18, sellPrice: 6, description: "Restores 30 HP." },
    "greater-health-potion":{ id: "greater-health-potion", name: "Greater Health Potion",type: "potion", subtype: "health", icon: "", healAmount: 60, price: 40, sellPrice: 14, description: "Restores 60 HP." },
    "mana-potion":          { id: "mana-potion",          name: "Mana Potion",          type: "potion", subtype: "mana",   icon: "", manaAmount: 20, price: 15, sellPrice: 5, description: "Restores 20 MP." },

    /* ── Loot / Materials ── */
    "goblin-fang":   { id: "goblin-fang",   name: "Goblin Fang",   type: "loot", icon: "", sellPrice: 3, description: "A yellowed goblin fang." },
    "goblin-scrap":  { id: "goblin-scrap",  name: "Goblin Scrap",  type: "loot", icon: "", sellPrice: 5, description: "Scrap metal scavenged from goblins." },
    "wolf-pelt":     { id: "wolf-pelt",     name: "Wolf Pelt",     type: "loot", icon: "", sellPrice: 8, description: "A thick wolf hide. Mira can use these." },
    "cave-herb":     { id: "cave-herb",     name: "Cave Herb",     type: "loot", icon: "", sellPrice: 4, description: "A resilient herb found near water." },
    "torn-cloth":    { id: "torn-cloth",    name: "Torn Cloth",    type: "loot", icon: "", sellPrice: 2, description: "A strip of dirty fabric." },
    "rusted-scrap":  { id: "rusted-scrap",  name: "Rusted Scrap",  type: "loot", icon: "", sellPrice: 3, description: "Badly rusted metal." },

    /* ── Gift Items ── */
    "wildflowers":    { id: "wildflowers",    name: "Wildflowers",    type: "gift", icon: "", price: 12, sellPrice: 4, description: "A bundle of colorful wildflowers from the meadow." },
    "herbal-tea":     { id: "herbal-tea",     name: "Herbal Tea",     type: "gift", icon: "", price: 10, sellPrice: 3, description: "A fragrant blend of dried herbs. Soothing and aromatic." },
    "sweet-roll":     { id: "sweet-roll",     name: "Sweet Roll",     type: "gift", icon: "", price: 8,  sellPrice: 2, description: "A freshly baked pastry dusted with honey glaze." },
    "moonstone":      { id: "moonstone",      name: "Moonstone",      type: "gift", icon: "", price: 30, sellPrice: 10, description: "A pale stone that shimmers faintly in low light." },
    "silver-ring":    { id: "silver-ring",     name: "Silver Ring",    type: "gift", icon: "", price: 45, sellPrice: 15, description: "A simple but elegant band of polished silver." },
    "iron-ingot":     { id: "iron-ingot",      name: "Iron Ingot",     type: "gift", icon: "", price: 20, sellPrice: 7, description: "A bar of quality smelted iron. A smith's delight." },
    "fine-leather":   { id: "fine-leather",    name: "Fine Leather",   type: "gift", icon: "", price: 18, sellPrice: 6, description: "Supple, well-cured leather. Premium quality." },
    "old-book":       { id: "old-book",        name: "Old Book",       type: "gift", icon: "", price: 25, sellPrice: 8, description: "A weathered tome filled with faded writing and strange diagrams." },

    /* ── Quest Items ── */
    "supply-note":          { id: "supply-note",          name: "Supply Note",          type: "quest", icon: "", sellPrice: 0, description: "A crumpled note listing stolen supplies." },
    "stolen-supply-crate":  { id: "stolen-supply-crate",  name: "Stolen Supply Crate",  type: "quest", icon: "", sellPrice: 0, description: "A missing supply crate marked with Elderbrook seals." },
    "guard-badge":          { id: "guard-badge",          name: "Guard Badge",          type: "quest", icon: "", sellPrice: 0, description: "A tarnished badge from a lost patrol." },
    "strange-sigil":        { id: "strange-sigil",        name: "Strange Sigil",        type: "quest", icon: "", sellPrice: 0, description: "An unfamiliar symbol etched into dark stone." },
    "chiefs-relic":         { id: "chiefs-relic",         name: "Chief's Relic",         type: "quest", icon: "", sellPrice: 0, description: "An ancient relic carried by the goblin chief." },
    "goblin-orders":        { id: "goblin-orders",        name: "Goblin Orders",         type: "quest", icon: "", sellPrice: 0, description: "Written orders found on the goblin chief. Not in goblin tongue." },

    /* ── Rare Weapons (boss/quest rewards) ── */
    "grisk-cleaver":    { id: "grisk-cleaver",    name: "Grisk's Cleaver",     type: "weapon", slot: "weapon", icon: "", attack: 9, dexterity: 1, price: 0, sellPrice: 45, tier: "rare", description: "The goblin chief's brutal cleaver. Still stained with battle." },
    "shadow-fang":      { id: "shadow-fang",      name: "Shadow Fang",         type: "weapon", slot: "weapon", icon: "", attack: 7, dexterity: 3, price: 0, sellPrice: 40, tier: "rare", description: "A pitch-black dagger that seems to drink in the light." },
    "verdant-staff":    { id: "verdant-staff",     name: "Verdant Staff",       type: "weapon", slot: "weapon", icon: "", attack: 6, intelligence: 4, price: 0, sellPrice: 40, tier: "rare", description: "A living staff wound with green vines. Pulses with nature's fury." },

    /* ── Goblin Slayer Set (set bonus) ── */
    "goblin-slayer-helm":   { id: "goblin-slayer-helm",   name: "Goblin-Slayer Helm",   type: "armor", slot: "helmet",  icon: "", defense: 2, attack: 1, price: 0, sellPrice: 20, tier: "rare", setId: "goblin-slayer", setBonus: [{ pieces: 2, bonus: { attack: 1 } }, { pieces: 4, bonus: { attack: 2, defense: 2, maxHp: 10 } }], description: "Trophied helmet marking a goblin slayer." },
    "goblin-slayer-chest":  { id: "goblin-slayer-chest",  name: "Goblin-Slayer Chest",  type: "armor", slot: "chest",   icon: "", defense: 4, price: 0, sellPrice: 30, tier: "rare", setId: "goblin-slayer", description: "Chest armor fashioned from goblin war-plate." },
    "goblin-slayer-gloves": { id: "goblin-slayer-gloves", name: "Goblin-Slayer Gloves", type: "armor", slot: "gloves",  icon: "", defense: 2, dexterity: 1, price: 0, sellPrice: 15, tier: "rare", setId: "goblin-slayer", description: "Gauntlets lined with goblin-hide leather." },
    "goblin-slayer-bracers":{ id: "goblin-slayer-bracers",name: "Goblin-Slayer Bracers",type: "armor", slot: "bracers", icon: "", defense: 3, price: 0, sellPrice: 18, tier: "rare", setId: "goblin-slayer", description: "Wrist guards studded with goblin fangs." },

    /* ── Crafting Materials ── */
    "goblin-chieftain-crest": { id: "goblin-chieftain-crest", name: "Chieftain's Crest", type: "crafting", icon: "", sellPrice: 15, description: "A crudely forged badge of authority. Used in crafting." },
    "shadow-essence":         { id: "shadow-essence",         name: "Shadow Essence",    type: "crafting", icon: "", sellPrice: 12, description: "A wisp of dark energy. Reeks of goblin magic." },
    "iron-ore":               { id: "iron-ore",               name: "Iron Ore",          type: "crafting", icon: "", sellPrice: 6,  description: "Raw iron. Can be smelted and forged." },
    "beast-sinew":            { id: "beast-sinew",            name: "Beast Sinew",       type: "crafting", icon: "", sellPrice: 5,  description: "Tough animal tendon. Used to reinforce gear." },
    "enchanted-shard":        { id: "enchanted-shard",        name: "Enchanted Shard",   type: "crafting", icon: "", sellPrice: 20, description: "A fragment of crystallized mana. Hums faintly." },

    /* ── Enhanced / Crafted Items ── */
    "tempered-sword":      { id: "tempered-sword",      name: "Tempered Sword",      type: "weapon", slot: "weapon",  icon: "", attack: 8, price: 0, sellPrice: 40, tier: "enhanced", description: "A reinforced sword re-forged with iron ore and sinew." },
    "venomtip-dagger":     { id: "venomtip-dagger",     name: "Venomtip Dagger",     type: "weapon", slot: "weapon",  icon: "", attack: 6, dexterity: 2, price: 0, sellPrice: 35, tier: "enhanced", description: "A dagger coated with a slow-acting venom." },
    "runed-staff":         { id: "runed-staff",          name: "Runed Staff",         type: "weapon", slot: "weapon",  icon: "", attack: 5, intelligence: 4, price: 0, sellPrice: 35, tier: "enhanced", description: "A staff etched with focusing runes. Sharpens spellwork." },
    "hardened-chestplate": { id: "hardened-chestplate",  name: "Hardened Chestplate", type: "armor",  slot: "chest",   icon: "", defense: 5, price: 0, sellPrice: 35, tier: "enhanced", description: "Iron plate reinforced with beast sinew. Extra tough." },
    "enchanted-bracers":   { id: "enchanted-bracers",    name: "Enchanted Bracers",   type: "armor",  slot: "bracers", icon: "", defense: 3, intelligence: 1, price: 0, sellPrice: 25, tier: "enhanced", description: "Bracers imbued with a shard's power." },

    /* ── Additional Consumables ── */
    "antidote":       { id: "antidote",       name: "Antidote",       type: "potion", subtype: "cleanse", icon: "", price: 12, sellPrice: 4, description: "Cures poison and bleed effects." },
    "smelling-salts": { id: "smelling-salts", name: "Smelling Salts", type: "potion", subtype: "cleanse", icon: "", price: 15, sellPrice: 5, description: "Clears fear and stun. Sharpens the mind." }
  };

  function get(id) { return items[id] || null; }

  function getAll() { return items; }

  function getBySlot(slot) {
    var result = [];
    for (var key in items) {
      if (items[key].slot === slot) result.push(items[key]);
    }
    return result;
  }

  function getByType(type) {
    var result = [];
    for (var key in items) {
      if (items[key].type === type) result.push(items[key]);
    }
    return result;
  }

  var craftingRecipes = [
    { id: "tempered-sword",      result: "tempered-sword",      needs: [{ item: "reinforced-sword", qty: 1 }, { item: "iron-ore", qty: 2 }, { item: "beast-sinew", qty: 1 }], gold: 30, description: "Forge a tempered blade from a reinforced sword." },
    { id: "venomtip-dagger",     result: "venomtip-dagger",     needs: [{ item: "sharpened-dagger", qty: 1 }, { item: "shadow-essence", qty: 1 }, { item: "cave-herb", qty: 2 }], gold: 25, description: "Coat a sharpened dagger with herbal venom." },
    { id: "runed-staff",         result: "runed-staff",          needs: [{ item: "apprentice-staff", qty: 1 }, { item: "enchanted-shard", qty: 1 }], gold: 35, description: "Etch focusing runes into an apprentice staff." },
    { id: "hardened-chestplate", result: "hardened-chestplate",  needs: [{ item: "iron-chestplate", qty: 1 }, { item: "iron-ore", qty: 2 }, { item: "beast-sinew", qty: 2 }], gold: 40, description: "Reinforce iron plate with sinew layering." },
    { id: "enchanted-bracers",   result: "enchanted-bracers",    needs: [{ item: "iron-bracers", qty: 1 }, { item: "enchanted-shard", qty: 1 }], gold: 30, description: "Imbue iron bracers with arcane energy." }
  ];

  function getCraftingRecipes() { return craftingRecipes; }

  function canCraft(recipeId, inventory, gold) {
    for (var r = 0; r < craftingRecipes.length; r++) {
      if (craftingRecipes[r].id !== recipeId) continue;
      var recipe = craftingRecipes[r];
      if (gold < recipe.gold) return false;
      for (var n = 0; n < recipe.needs.length; n++) {
        var need = recipe.needs[n];
        var count = 0;
        for (var i = 0; i < inventory.length; i++) {
          if (inventory[i] === need.item) count++;
        }
        if (count < need.qty) return false;
      }
      return true;
    }
    return false;
  }

  return { get: get, getAll: getAll, getBySlot: getBySlot, getByType: getByType, getCraftingRecipes: getCraftingRecipes, canCraft: canCraft };
})();
