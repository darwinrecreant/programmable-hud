
(function($, $$) {
  var lastParts = {};
  try {
    if (location.hash == "") {
      $$(".hide").forEach((elem) => {
        elem.classList.remove('hide');
      });
      setTimeout(() => {
        const arr = [];
        $$('.clickable').forEach((elem) => {
          const rect = elem.getBoundingClientRect();
          arr.push(`${elem.textContent.trim()}, ${(rect.left /  window.innerWidth).toFixed(3)}, ${(rect.width / window.innerWidth).toFixed(3)}, ${(rect.top / window.innerHeight).toFixed(3)}, ${(rect.height / window.innerHeight).toFixed(3)}`);
        });
        console.log(arr.join(",\n"));
      }, 100);
    } else {
      let settings  = parseHash(unescape(location.hash.substring(1)));
      update(settings);
    }
  } catch (e) {
  }
  window.addEventListener("hashchange", () => {
    settings = parseHash(unescape(location.hash.substring(1)));
    update(settings);
  }, false);
  
  function parseHash(s) {
    if (s == "") return {};
    const parts = escaped2list(s, "|");
    const res = {
      changed: []
    };
    res.event = parts[0];
    res.eventValue = parts[1];
    res.hudName = parts[2];
    res.userName = parts[3];
    res.pageName = parts[4];
    res.selectedItems = escaped2list(parts[5], ",").map((n) => parseInt(n));
    res.pages = escaped2list(parts[6], "`").slice(0, 18);
    res.buttons = escaped2list(parts[7], "`").slice(0, 5);
    res.items = escaped2list(parts[8], "`").slice(0, 12).map((s) => {
      const values = escaped2list(s, "/");
      let item = {};
      try {
        item.image = "https://i.imgur.com/" + values[0].replace(/[^a-zA-Z0-9]/g, "") + "l.jpg";
        item.title = values[1];
        return item;
      } catch(e) {
      }
      return null;
    });
    for(let i in parts) {
      if (parts[i] != lastParts[i]) res.changed[i] = true;
    }
    res.scroll = escaped2list(parts[9], "`").map((n) => parseInt(n));
    lastParts = parts;
    return res;
  }
  
  function update(settings) {
    let i = 0;
    if (settings.changed[2]) $("#title").textContent = settings.hudName;
    if (settings.hudName != "") $("#title").classList.remove("hide");
    else $("#title").classList.add("hide");

    if (settings.changed[3]) $("#name").textContent = settings.userName;
    if (settings.userName != "") $("#name").classList.remove("hide");
    else $("#name").classList.add("hide");

    if (settings.changed[4] || settings.changed[6]) {
      const menuItems = $$('#menu li');
      menuItems.forEach((elem) => elem.classList.add("hide"));
      i = 0;
      settings.pages.forEach((page) => {
        let elem = menuItems[i++];
        elem.textContent = page;
        elem.classList.remove("hide");
        if (page == settings.pageName) {
          elem.classList.add("selected");
        } else {
          elem.classList.remove("selected");
        }
      });
    }
    if (settings.changed[7]) {
      const buttons = $$('#buttons .btn');
      buttons.forEach((elem) => elem.classList.add("hide"));
      i = 0;
      settings.buttons.forEach((buttonText) => {
        let elem = buttons[i++];
        elem.classList.remove("hide");
        elem.textContent = buttonText;
      });
    }
    if (settings.changed[5] || settings.changed[8]) {
      const items = $$('.items .item');
      items.forEach((elem) => elem.classList.add("hide"));
      i = 0;
      settings.items.forEach((item) => {
        const isSelected = settings.selectedItems.indexOf(i) != -1;
        let elem = items[i++];
        let name = elem.querySelector('.item-name');
        if (item.title == "") {
          name.classList.add('hide');
        } else {
          name.classList.remove('hide');
        }
        name.textContent = item.title;
        elem.classList.remove("hide");
        elem.setAttribute("style", `background-image: url(${item.image});`);
        if (isSelected) {
          elem.classList.add("selected");
        } else {
          elem.classList.remove("selected");
        }
      });
    }

    if (settings.changed[9])  {
      if (settings.scroll && settings.scroll[1] > 1) {
        $('#scroll').classList.remove("hide");
        $("#marker").setAttribute("style", `margin-top: ${(28 / (settings.scroll[1] - 1)) * settings.scroll[0]}rem`)
      }
    }
    const modal = $("#modal");
    modal.classList.add("hide");

    switch (settings.event) {
      case "clickItem":
        i = parseInt(settings.eventValue);
        const items = $$('.items .item');
        items.forEach((elem) => elem.classList.remove("selected"));
        items[i].classList.add("selected");
        setTimeout(() => items[i].classList.remvoe("selected"), 1000);
        break;
      case "clickButton":
        i = parseInt(settings.eventValue);
        const buttons = $$('#buttons .btn');
        buttons.forEach((elem) => elem.classList.remove("selected"));
        buttons[i].classList.add("selected");
        setTimeout(() => buttons[i].classList.remvoe("selected"), 1000);
        break;
      case "openModal":
        let modalParts = escaped2list(settings.eventValue, "`");
        const message = modalParts[0].replace("\n", "<br>");
        const confirm = modalParts[1];
        const cancel = modalParts[2];
        modal.classList.remove("hide");
        const confirmBtn = modal.querySelector('.confirm');
        const cancelBtn = modal.querySelector('.cancel');
        modal.querySelector(".modal-content").textContent = message;
        if (confirm == "") {
          confirmBtn.classList.add("hide");
        } else {
          confirmBtn.textContent = confirm;
        }
        if (cancel == "") {
          cancelBtn.classList.add("hide");
        } else {
          cancelBtn.textContent = confirm;
        }
        break;
    }
  }

  
  
  function simpleEscape($str, $char) {
    return $str.replace("\\", "\\\\").replace($char, `\\${$char}`)
  }
  
  function simpleUnescape($str, $char) {
    return $str.replace(`\\${char}`, char).replace("\\\\", "\\")
  }
  
  function list2escaped($list, $char) {
    $str = simpleEscape($list.shift(), $char) || "";
    while(($next = $list.shift()))  {
        $str += $char + simpleEscape($next.toString(), $char);
    }
    return $str;
  }
  
  function escapeRegExp(string) {
    if (!string) return "";
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }
  
  function escaped2list($str, $char) {
    if (!$str || $str == "") {
      return [];
    }
    $keywords = [
      escapeRegExp("\\\\"),
      escapeRegExp("\\" + $char),
      escapeRegExp($char),
    ];
    
    $parts = $str.split(new RegExp("(" + $keywords.join("|") + ")", "g"));
    $parts.push("");
    for(let $i = $parts.length - 2; $i >= 0; $i--) {
      switch ($parts[$i]) {
        case "\\\\":
          $parts.splice($i, 2, '\\' + $parts[$i + 1]);
          break;
        case "\\$char":
          $parts.splice($i, 2, $char + $parts[$i + 1]);
          break;
        case $char:
          $parts.splice($i, 1, "");
          break;
        default:
          $parts.splice($i, 2, $parts[$i] + $parts[$i + 1]);
          break;
      }
    }
    return $parts;
  }
})((s) => document.querySelector(s), (s) => [].slice.call(document.querySelectorAll(s)));