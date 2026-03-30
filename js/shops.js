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
        "reinforced-sword", "sharpened-dagger", "hunters-bow", "apprentice-staff"
      ]
    },
    "armor-shop": {
      id: "armor-shop",
      name: "Harlan's Armory",
      npc: "harlan",
      background: "assets/backgrounds/main-town-armor-shop.png",
      stock: [
        "leather-helm", "leather-chest", "leather-leggings", "leather-gloves", "leather-bracers",
        "iron-helm", "iron-chestplate", "iron-leggings", "iron-gloves", "iron-bracers"
      ]
    },
    "potion-shop": {
      id: "potion-shop",
      name: "Mira's Potion Shop",
      npc: "mira",
      background: "assets/backgrounds/main-town-potions-shop.png",
      stock: [
        "lesser-health-potion", "health-potion", "greater-health-potion", "mana-potion"
      ]
    }
  };

  function getShop(id) { return shops[id] || null; }

  function renderShop(shopId) {
    var shop = shops[shopId];
    if (!shop) return;

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

  return {
    getShop: getShop,
    renderShop: renderShop,
    buy: buy,
    sell: sell
  };
})();
