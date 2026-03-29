/* shops.js - Shop rendering and buy/sell logic */
var Shops = (function () {
  var shopStock = {
    "weapon-shop": ["rusty-dagger", "iron-sword", "wooden-staff", "short-bow", "steel-sword"],
    "armor-shop": ["leather-cap", "iron-helm", "cloth-tunic", "leather-armor", "iron-chestplate", "cloth-pants", "leather-leggings", "lucky-charm"],
    "potion-shop": ["health-potion", "mana-potion"]
  };

  function renderShop(shopId) {
    var listEl = document.getElementById(shopId + "-list");
    if (!listEl) return;
    listEl.innerHTML = "";

    var stock = shopStock[shopId];
    if (!stock) return;

    for (var i = 0; i < stock.length; i++) {
      var item = Items.get(stock[i]);
      if (!item) continue;

      var div = document.createElement("div");
      div.className = "shop-item";

      if (item.img) {
        var thumb = document.createElement("img");
        thumb.className = "item-thumb";
        thumb.src = item.img;
        thumb.alt = item.name;
        div.appendChild(thumb);
      }

      var info = document.createElement("div");
      info.className = "shop-item-info";

      var name = document.createElement("strong");
      name.textContent = item.name;
      info.appendChild(name);

      var desc = document.createElement("p");
      desc.textContent = item.description;
      desc.style.fontSize = "0.85em";
      desc.style.margin = "2px 0";
      info.appendChild(desc);

      if (item.power) {
        var stat = document.createElement("span");
        stat.className = "item-stat";
        stat.textContent = "ATK +" + item.power;
        info.appendChild(stat);
      }
      if (item.defense) {
        var stat2 = document.createElement("span");
        stat2.className = "item-stat";
        stat2.textContent = "DEF +" + item.defense;
        info.appendChild(stat2);
      }
      if (item.dexterity) {
        var stat3 = document.createElement("span");
        stat3.className = "item-stat";
        stat3.textContent = "DEX +" + item.dexterity;
        info.appendChild(stat3);
      }
      if (item.healAmount) {
        var stat4 = document.createElement("span");
        stat4.className = "item-stat";
        stat4.textContent = "Heals " + item.healAmount + " HP";
        info.appendChild(stat4);
      }
      if (item.manaAmount) {
        var stat5 = document.createElement("span");
        stat5.className = "item-stat";
        stat5.textContent = "Restores " + item.manaAmount + " MP";
        info.appendChild(stat5);
      }

      div.appendChild(info);

      var buyBtn = document.createElement("button");
      buyBtn.className = "btn-primary";
      buyBtn.textContent = "Buy (" + item.price + "g)";
      buyBtn.setAttribute("data-buy", item.id);
      buyBtn.setAttribute("data-shop", shopId);
      div.appendChild(buyBtn);

      listEl.appendChild(div);
    }
  }

  function buyItem(itemId) {
    var item = Items.get(itemId);
    if (!item) return;

    if (Player.inventoryFull()) {
      MessageLog.add("Inventory full!", "damage");
      return;
    }
    if (!Player.spendGold(item.price)) {
      MessageLog.add("Not enough gold!", "damage");
      return;
    }
    Player.addItem(itemId);
    MessageLog.add("Bought " + item.name + " for " + item.price + " gold.", "gold");
    UI.updateHeader();
  }

  function handleClick(e) {
    var target = e.target;
    var buyId = target.getAttribute("data-buy");
    if (buyId) {
      buyItem(buyId);
    }
  }

  return {
    renderShop: renderShop,
    handleClick: handleClick
  };
})();
