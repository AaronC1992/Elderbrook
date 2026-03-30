/* inventory.js - Inventory UI rendering and actions */
var Inventory = (function () {
  var currentFilter = "all";

  function open() {
    currentFilter = "all";
    render();
    UI.showScreen("inventory");
  }

  function render() {
    var data = Player.getData();
    var grid = document.getElementById("inventory-grid");
    grid.innerHTML = "";

    var items = data.inventory;
    for (var i = 0; i < items.length; i++) {
      var item = Items.get(items[i]);
      if (!item) continue;
      if (currentFilter !== "all" && item.type !== currentFilter) continue;

      var div = document.createElement("div");
      div.className = "inv-item";
      div.setAttribute("data-item-id", item.id);

      if (item.img) {
        var thumb = document.createElement("img");
        thumb.className = "item-thumb";
        thumb.src = item.img;
        thumb.alt = item.name;
        div.appendChild(thumb);
      }

      var infoWrap = document.createElement("div");
      infoWrap.className = "inv-item-info";

      var nameSpan = document.createElement("strong");
      nameSpan.textContent = item.name;
      infoWrap.appendChild(nameSpan);

      var desc = document.createElement("p");
      desc.textContent = item.description;
      desc.style.fontSize = "0.85em";
      desc.style.margin = "4px 0";
      infoWrap.appendChild(desc);

      var actions = document.createElement("div");
      actions.style.marginTop = "6px";

      if (item.slot) {
        var equipBtn = document.createElement("button");
        equipBtn.className = "btn-small btn-primary";
        equipBtn.textContent = "Equip";
        equipBtn.setAttribute("data-equip", item.id);
        actions.appendChild(equipBtn);
      }

      if (item.type === "potion") {
        var useBtn = document.createElement("button");
        useBtn.className = "btn-small btn-primary";
        useBtn.textContent = "Use";
        useBtn.setAttribute("data-use", item.id);
        actions.appendChild(useBtn);
      }

      var sellBtn = document.createElement("button");
      sellBtn.className = "btn-small btn-danger";
      sellBtn.textContent = "Sell (" + item.sellPrice + "g)";
      sellBtn.setAttribute("data-sell", item.id);
      actions.appendChild(sellBtn);

      infoWrap.appendChild(actions);
      div.appendChild(infoWrap);
      grid.appendChild(div);
    }

    if (grid.children.length === 0) {
      grid.innerHTML = "<p style='grid-column:1/-1;text-align:center;color:#888;'>No items.</p>";
    }

    // Update count
    var countEl = document.getElementById("inv-count");
    if (countEl) {
      countEl.textContent = data.inventory.length + " / " + Player.MAX_INVENTORY;
    }

    renderEquipped();
  }

  function renderEquipped() {
    var data = Player.getData();
    var container = document.getElementById("equipped-list");
    if (!container) return;
    container.innerHTML = "";

    var slots = ["weapon", "helmet", "chest", "legs", "accessory"];
    for (var i = 0; i < slots.length; i++) {
      var slot = slots[i];
      var itemId = data.equipped[slot];
      var item = itemId ? Items.get(itemId) : null;

      var div = document.createElement("div");
      div.className = "equipped-slot";

      var label = document.createElement("span");
      label.className = "slot-label";
      label.textContent = slot.charAt(0).toUpperCase() + slot.slice(1) + ": ";
      div.appendChild(label);

      if (item) {
        var name = document.createElement("span");
        name.textContent = item.name;
        div.appendChild(name);

        var unBtn = document.createElement("button");
        unBtn.className = "btn-small btn-danger";
        unBtn.textContent = "Unequip";
        unBtn.setAttribute("data-unequip", slot);
        unBtn.style.marginLeft = "8px";
        div.appendChild(unBtn);
      } else {
        var empty = document.createElement("span");
        empty.textContent = "(empty)";
        empty.style.color = "#666";
        div.appendChild(empty);
      }

      container.appendChild(div);
    }
  }

  function handleClick(e) {
    var target = e.target;

    var equipId = target.getAttribute("data-equip");
    if (equipId) {
      Player.equip(equipId);
      var eItem = Items.get(equipId);
      if (eItem) MessageLog.add("Equipped " + eItem.name + ".", "info");
      render();
      UI.updateHeader();
      return;
    }

    var unequipSlot = target.getAttribute("data-unequip");
    if (unequipSlot) {
      if (Player.inventoryFull()) {
        MessageLog.add("Inventory full! Cannot unequip.", "damage");
        return;
      }
      Player.unequip(unequipSlot);
      MessageLog.add("Unequipped.", "info");
      render();
      UI.updateHeader();
      return;
    }

    var useId = target.getAttribute("data-use");
    if (useId) {
      useItem(useId);
      return;
    }

    var sellId = target.getAttribute("data-sell");
    if (sellId) {
      sellItem(sellId);
      return;
    }

    var filter = target.getAttribute("data-filter");
    if (filter) {
      currentFilter = filter;
      var filterBtns = document.querySelectorAll(".filter-btn");
      for (var i = 0; i < filterBtns.length; i++) {
        filterBtns[i].classList.remove("active");
      }
      target.classList.add("active");
      render();
      return;
    }
  }

  function useItem(id) {
    var item = Items.get(id);
    if (!item || item.type !== "potion") return;
    Player.removeItem(id);

    if (item.healAmount) {
      Player.heal(item.healAmount);
      MessageLog.add("Used " + item.name + ". Restored " + item.healAmount + " HP.", "heal");
    }
    if (item.manaAmount) {
      Player.restoreMana(item.manaAmount);
      MessageLog.add("Used " + item.name + ". Restored " + item.manaAmount + " Mana.", "info");
    }

    render();
    UI.updateHeader();
  }

  function sellItem(id) {
    var item = Items.get(id);
    if (!item) return;
    Player.removeItem(id);
    Player.addGold(item.sellPrice);
    MessageLog.add("Sold " + item.name + " for " + item.sellPrice + " gold.", "gold");
    render();
    UI.updateHeader();
  }

  return {
    open: open,
    render: render,
    handleClick: handleClick,
    useItem: useItem
  };
})();
