/* shops.js - Chapter 1 shop definitions and buy/sell */
var Shops = (function () {

  var shops = {
    "weapon-shop": {
      id: "weapon-shop",
      name: "Bram's Weapon Shop",
      npc: "bram",
      background: "assets/backgrounds/main-town-weapons-shop.png",
      stock: [
        "basic-sword", "basic-dagger", "basic-bow", "basic-staff",
        "reinforced-sword", "sharpened-dagger", "hunters-bow", "apprentice-staff",
        "silver-ring", "iron-ingot"
      ]
    },
    "armor-shop": {
      id: "armor-shop",
      name: "Harlan's Armory",
      npc: "harlan",
      background: "assets/backgrounds/main-town-armor-shop.png",
      stock: [
        "leather-helm", "leather-chest", "leather-leggings", "leather-gloves", "leather-bracers",
        "iron-helm", "iron-chestplate", "iron-leggings", "iron-gloves", "iron-bracers",
        "fine-leather"
      ]
    },
    "potion-shop": {
      id: "potion-shop",
      name: "Mira's Potion Shop",
      npc: "mira",
      background: "assets/backgrounds/main-town-potions-shop.png",
      stock: [
        "lesser-health-potion", "health-potion", "greater-health-potion", "mana-potion",
        "wildflowers", "herbal-tea", "sweet-roll", "moonstone", "old-book"
      ]
    },
    "merchant-shop": {
      id: "merchant-shop",
      name: "Traveling Merchant",
      npc: "elira",
      background: "",
      stock: [
        "enchanted-shard", "moonstone", "silver-ring", "antidote", "smelling-salts",
        "greater-health-potion", "mana-potion", "old-book"
      ]
    }
  };

  function getShop(id) { return shops[id] || null; }

  function renderShop(shopId) {
    var shop = shops[shopId];
    if (!shop) return;

    var shopScreen = document.getElementById("screen-shop");
    if (shopScreen && shop.background) {
      shopScreen.style.backgroundImage = "url('" + shop.background + "')";
    }

    var npc = Chapter1.getNPC(shop.npc);
    var container = document.getElementById("shop-inventory");
    var npcPortrait = document.getElementById("shop-npc-portrait");
    var npcName = document.getElementById("shop-npc-name");
    var shopTitle = document.getElementById("shop-title");

    if (shopTitle) shopTitle.textContent = shop.name;
    if (npcPortrait) {
      npcPortrait.src = npc ? npc.portrait : "";
      npcPortrait.onerror = function () { this.style.display = "none"; };
      npcPortrait.style.display = "";
    }
    if (npcName) npcName.textContent = npc ? npc.name : "";

    var p = Player.get();
    var html = '<div class="shop-gold">Your Gold: ' + p.gold + '</div>';
    html += '<div class="shop-items">';

    for (var i = 0; i < shop.stock.length; i++) {
      var item = Items.get(shop.stock[i]);
      if (!item) continue;
      var canBuy = (item.price && p.gold >= item.price);
      html += '<div class="shop-item">';
      html += '<div class="shop-item-info">';
      if (item.icon) html += '<img class="item-icon" src="' + item.icon + '" alt="' + item.name + '" onerror="this.style.display=\'none\'">';
      html += '<div class="shop-item-name">' + item.name + '</div>';
      html += '<div class="shop-item-desc">' + item.description + '</div>';
      html += '<div class="shop-item-stats">';
      if (item.attack) html += 'ATK +' + item.attack + ' ';
      if (item.defense) html += 'DEF +' + item.defense + ' ';
      if (item.dexterity) html += 'DEX +' + item.dexterity + ' ';
      if (item.intelligence) html += 'INT +' + item.intelligence + ' ';
      if (item.healAmount) html += 'Heal ' + item.healAmount + ' ';
      if (item.manaAmount) html += 'Mana ' + item.manaAmount + ' ';
      html += '</div>';

      // Show equipped comparison for weapons/armor
      if (item.slot) {
        var equipped = p.equipped[item.slot];
        var eqItem = equipped ? Items.get(equipped) : null;
        html += '<div class="shop-item-compare">';
        if (eqItem) {
          html += 'Equipped: ' + eqItem.name + ' (';
          var parts = [];
          if (eqItem.attack) parts.push('ATK +' + eqItem.attack);
          if (eqItem.defense) parts.push('DEF +' + eqItem.defense);
          if (eqItem.dexterity) parts.push('DEX +' + eqItem.dexterity);
          if (eqItem.intelligence) parts.push('INT +' + eqItem.intelligence);
          html += parts.join(', ') + ')';
        } else {
          html += 'Equipped: None';
        }
        html += '</div>';
      }
      html += '</div>';

      html += '<div class="shop-item-price">' + (item.price || 0) + ' gold</div>';
      html += '<button class="btn shop-buy-btn" data-action="buy" data-item="' + item.id + '" data-shop="' + shopId + '"' + (canBuy ? '' : ' disabled') + '>Buy</button>';
      html += '</div>';
    }

    html += '</div>';
    if (container) container.innerHTML = html;
  }

  function buy(shopId, itemId) {
    var shop = shops[shopId];
    if (!shop) return { success: false, message: "Shop not found." };
    if (shop.stock.indexOf(itemId) === -1) return { success: false, message: "Item not in stock." };

    var item = Items.get(itemId);
    if (!item || !item.price) return { success: false, message: "Invalid item." };

    var p = Player.get();
    if (p.gold < item.price) return { success: false, message: "Not enough gold." };
    if (p.inventory.length >= Player.MAX_INVENTORY) return { success: false, message: "Inventory full." };

    p.gold -= item.price;
    Player.addItem(itemId);
    Audio.play("shopBuy");
    return { success: true, message: "Bought " + item.name + "!" };
  }

  function sell(itemId) {
    var item = Items.get(itemId);
    if (!item) return { success: false, message: "Invalid item." };
    if (item.type === "quest") return { success: false, message: "You can't sell quest items." };
    if (!Player.removeItem(itemId)) return { success: false, message: "Item not found." };

    var p = Player.get();
    var sellPrice = item.sellPrice || 1;
    p.gold += sellPrice;
    return { success: true, message: "Sold " + item.name + " for " + sellPrice + " gold." };
  }

  function renderCrafting() {
    var container = document.getElementById("crafting-content");
    if (!container) return;

    var p = Player.get();
    var recipes = Items.getCraftingRecipes();
    var html = '<h2>Bram\'s Forge</h2>';
    html += '<div class="shop-gold">Your Gold: ' + p.gold + '</div>';
    html += '<div class="crafting-recipes">';

    for (var i = 0; i < recipes.length; i++) {
      var recipe = recipes[i];
      var result = Items.get(recipe.result);
      var canMake = Items.canCraft(recipe.id, p.inventory, p.gold);
      html += '<div class="crafting-recipe' + (canMake ? '' : ' crafting-unavailable') + '">';
      html += '<div class="crafting-result">' + (result ? result.name : recipe.result) + '</div>';
      html += '<div class="crafting-desc">' + recipe.description + '</div>';
      html += '<div class="crafting-needs">';
      for (var n = 0; n < recipe.needs.length; n++) {
        var mat = Items.get(recipe.needs[n].item);
        var matName = mat ? mat.name : recipe.needs[n].item;
        var owned = 0;
        for (var inv = 0; inv < p.inventory.length; inv++) {
          if (p.inventory[inv] === recipe.needs[n].item) owned++;
        }
        var enough = owned >= recipe.needs[n].qty;
        html += '<span class="' + (enough ? 'crafting-have' : 'crafting-missing') + '">';
        html += matName + ' x' + recipe.needs[n].qty + ' (' + owned + ')';
        html += '</span> ';
      }
      if (recipe.gold) {
        var hasGold = p.gold >= recipe.gold;
        html += '<span class="' + (hasGold ? 'crafting-have' : 'crafting-missing') + '">' + recipe.gold + ' gold</span>';
      }
      html += '</div>';

      if (result && result.slot) {
        html += '<div class="crafting-stats">';
        if (result.attack) html += 'ATK +' + result.attack + ' ';
        if (result.defense) html += 'DEF +' + result.defense + ' ';
        if (result.dexterity) html += 'DEX +' + result.dexterity + ' ';
        if (result.intelligence) html += 'INT +' + result.intelligence + ' ';
        html += '</div>';
      }

      html += '<button class="btn" data-action="craft-item" data-recipe="' + recipe.id + '"' + (canMake ? '' : ' disabled') + '>Craft</button>';
      html += '</div>';
    }

    html += '</div>';
    html += '<button class="btn" data-action="close-crafting">Back</button>';
    container.innerHTML = html;
  }

  function craft(recipeId) {
    var p = Player.get();
    var recipes = Items.getCraftingRecipes();
    var recipe = null;
    for (var i = 0; i < recipes.length; i++) {
      if (recipes[i].id === recipeId) { recipe = recipes[i]; break; }
    }
    if (!recipe) return { success: false, message: "Unknown recipe." };
    if (!Items.canCraft(recipeId, p.inventory, p.gold)) return { success: false, message: "Missing materials or gold." };
    if (p.inventory.length >= Player.MAX_INVENTORY) return { success: false, message: "Inventory full." };

    // Consume materials
    for (var n = 0; n < recipe.needs.length; n++) {
      for (var q = 0; q < recipe.needs[n].qty; q++) {
        Player.removeItem(recipe.needs[n].item);
      }
    }
    p.gold -= (recipe.gold || 0);

    Player.addItem(recipe.result);
    Audio.play("craft");
    Player.unlockAchievement("master-crafter");

    var result = Items.get(recipe.result);
    return { success: true, message: "Crafted " + (result ? result.name : recipe.result) + "!" };
  }

  return {
    getShop: getShop,
    renderShop: renderShop,
    renderCrafting: renderCrafting,
    craft: craft,
    buy: buy,
    sell: sell
  };
})();
