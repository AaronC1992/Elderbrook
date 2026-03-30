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

    /* ── Quest Items ── */
    "supply-note":          { id: "supply-note",          name: "Supply Note",          type: "quest", icon: "", sellPrice: 0, description: "A crumpled note listing stolen supplies." },
    "stolen-supply-crate":  { id: "stolen-supply-crate",  name: "Stolen Supply Crate",  type: "quest", icon: "", sellPrice: 0, description: "A missing supply crate marked with Elderbrook seals." },
    "guard-badge":          { id: "guard-badge",          name: "Guard Badge",          type: "quest", icon: "", sellPrice: 0, description: "A tarnished badge from a lost patrol." },
    "strange-sigil":        { id: "strange-sigil",        name: "Strange Sigil",        type: "quest", icon: "", sellPrice: 0, description: "An unfamiliar symbol etched into dark stone." },
    "chiefs-relic":         { id: "chiefs-relic",         name: "Chief's Relic",         type: "quest", icon: "", sellPrice: 0, description: "An ancient relic carried by the goblin chief." },
    "goblin-orders":        { id: "goblin-orders",        name: "Goblin Orders",         type: "quest", icon: "", sellPrice: 0, description: "Written orders found on the goblin chief. Not in goblin tongue." }
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

  return { get: get, getAll: getAll, getBySlot: getBySlot, getByType: getByType };
})();
