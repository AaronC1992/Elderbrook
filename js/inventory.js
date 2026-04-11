/* inventory.js - Inventory management and equipment UI (6 slots) */
var Inventory = (function () {

  var currentFilter = "all";
  var currentShopId = null;

  function setShopContext(shopId) { currentShopId = shopId; }
  function clearShopContext() { currentShopId = null; }

  function render() {
    var p = Player.get();
    var container = document.getElementById("inventory-items");
    var equipContainer = document.getElementById("equipment-slots");
    if (!container) return;

    // Equipment slots
    if (equipContainer) {
      var equipHtml = "";
      var slots = Player.EQUIP_SLOTS;
      var slotLabels = { weapon: "Weapon", helmet: "Helmet", chest: "Chest", legs: "Legs", gloves: "Gloves", bracers: "Bracers" };
      for (var s = 0; s < slots.length; s++) {
        var slotId = slots[s];
        var eqItem = p.equipped[slotId] ? Items.get(p.equipped[slotId]) : null;
        equipHtml += '<div class="equip-slot">';
        equipHtml += '<div class="equip-slot-label">' + slotLabels[slotId] + '</div>';
        if (eqItem) {
          if (eqItem.icon) equipHtml += '<img class="item-icon" src="' + eqItem.icon + '" alt="' + eqItem.name + '" onerror="this.style.display=\'none\'">';
          equipHtml += '<div class="equip-slot-item">' + eqItem.name;
          equipHtml += ' <button class="btn btn-small" data-action="unequip" data-slot="' + slotId + '">Unequip</button>';
          equipHtml += '</div>';
        } else {
          equipHtml += '<div class="equip-slot-empty">Empty</div>';
        }
        equipHtml += '</div>';
      }
      equipContainer.innerHTML = equipHtml;
    }

    // Inventory filter
    var filterHtml = '<div class="inventory-filters">';
    var filts = ["all", "weapon", "armor", "potion", "loot", "quest", "gift", "crafting"];
    for (var f = 0; f < filts.length; f++) {
      filterHtml += '<button class="btn btn-small' + (currentFilter === filts[f] ? ' active' : '') + '" data-action="inv-filter" data-filter="' + filts[f] + '">' + filts[f].charAt(0).toUpperCase() + filts[f].slice(1) + '</button>';
    }
    filterHtml += '</div>';

    // Inventory items
    var html = filterHtml;
    html += '<div class="inventory-count">' + p.inventory.length + '/' + Player.MAX_INVENTORY + '</div>';
    html += '<div class="inventory-grid">';

    for (var i = 0; i < p.inventory.length; i++) {
      var item = Items.get(p.inventory[i]);
      if (!item) continue;

      // Filter
      if (currentFilter !== "all" && item.type !== currentFilter) continue;

      html += '<div class="inventory-item">';
      if (item.icon) html += '<img class="item-icon" src="' + item.icon + '" alt="' + item.name + '" onerror="this.style.display=\'none\'">';
      html += '<div class="inv-item-name">' + item.name + '</div>';
      html += '<div class="inv-item-desc">' + item.description + '</div>';
      html += '<div class="inv-item-actions">';

      if (item.slot) {
        // Show stat comparison with currently equipped item
        var equipped = p.equipped[item.slot] ? Items.get(p.equipped[item.slot]) : null;
        var compParts = [];
        var compStats = ['attack', 'defense', 'dexterity', 'intelligence'];
        var compLabels = { attack: 'ATK', defense: 'DEF', dexterity: 'DEX', intelligence: 'INT' };
        for (var cs = 0; cs < compStats.length; cs++) {
          var sk = compStats[cs];
          var newVal = item[sk] || 0;
          var oldVal = equipped ? (equipped[sk] || 0) : 0;
          var diff = newVal - oldVal;
          if (diff !== 0) {
            compParts.push('<span class="stat-' + (diff > 0 ? 'up' : 'down') + '">' + compLabels[sk] + ' ' + (diff > 0 ? '+' : '') + diff + '</span>');
          }
        }
        if (compParts.length > 0) {
          html += '<div class="inv-item-compare">' + compParts.join(' ') + '</div>';
        }
        html += '<button class="btn btn-small" data-action="equip" data-item="' + item.id + '" data-index="' + i + '">Equip</button>';
      }
      if (item.type === "potion") {
        html += '<button class="btn btn-small" data-action="use-item" data-item="' + item.id + '" data-index="' + i + '">Use</button>';
      }
      if (item.type !== "quest") {
        html += '<button class="btn btn-small" data-action="sell-item" data-item="' + item.id + '">Sell (' + (item.sellPrice != null ? item.sellPrice : 1) + 'g)</button>';
      }

      html += '</div></div>';
    }

    if (p.inventory.length === 0) {
      html += '<div class="inventory-empty">Your inventory is empty.</div>';
    }

    html += '</div>';
    container.innerHTML = html;
  }

  function setFilter(filter) {
    currentFilter = filter;
    render();
  }

  function useItem(itemId) {
    var item = Items.get(itemId);
    if (!item || item.type !== "potion") return { success: false, message: "Can't use that." };

    var p = Player.get();
    if (item.subtype === "health") {
      if (p.hp >= p.maxHp) return { success: false, message: "Already at full health." };
      Player.removeItem(itemId);
      Player.heal(item.healAmount);
      Audio.play("potionDrink");
      return { success: true, message: "Restored " + item.healAmount + " HP." };
    }
    if (item.subtype === "mana") {
      if (p.mp >= p.maxMp) return { success: false, message: "Already at full mana." };
      Player.removeItem(itemId);
      Player.restoreMana(item.manaAmount);
      Audio.play("potionDrink");
      return { success: true, message: "Restored " + item.manaAmount + " MP." };
    }
    if (item.subtype === "cleanse") {
      return { success: false, message: "Cleanse potions can only be used in combat." };
    }
    return { success: false, message: "Can't use that." };
  }

  return {
    render: render,
    setFilter: setFilter,
    useItem: useItem,
    setShopContext: setShopContext,
    clearShopContext: clearShopContext
  };
})();
