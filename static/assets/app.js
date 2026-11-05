/* ============================================================
   P7IVESC blog · app.js
   首页卡片化 / 文章页目录·灯箱·进度条·信息卡
   纯前端实现，不依赖构建流程与模板改动。
   ============================================================ */
(function () {
  "use strict";

  var hasPost = document.getElementById("postBody");

  /* ============================================================
     首页：把 Gmeek 的条目列表改造成卡片墙
     ============================================================ */
  function initList() {
    var nav = document.querySelector("nav.SideNav");
    if (!nav) return;

    var links = [].slice.call(nav.querySelectorAll("a.SideNav-item"));
    if (!links.length) return;

    var items = links.map(function (a) {
      var titleEl = a.querySelector(".listTitle");
      var dateEl = a.querySelector(".LabelTime");
      var labels = [].slice.call(a.querySelectorAll(".LabelName a")).map(function (x) {
        return x.textContent.trim();
      });
      return {
        href: a.getAttribute("href"),
        title: titleEl ? titleEl.textContent.trim() : "",
        date: dateEl ? dateEl.textContent.trim() : "",
        labels: labels,
      };
    });

    /* ---- 头图区 ---- */
    var subEl = nav.previousElementSibling;
    var subtitle = "";
    if (subEl && subEl.tagName === "DIV" && !subEl.className) {
      subtitle = subEl.textContent.trim();
      subEl.parentNode.removeChild(subEl);
    }
    var avatarEl = document.querySelector("#header .avatar");
    var nameEl = document.querySelector("#header .blogTitle");
    var siteName = nameEl ? nameEl.textContent.trim() : document.title;

    var hero = document.createElement("section");
    hero.className = "hero";
    hero.innerHTML =
      (avatarEl ? '<img class="hero-avatar" src="' + avatarEl.src + '" alt="avatar">' : "") +
      "<div>" +
      '<h1 class="hero-name">' + esc(siteName) + "</h1>" +
      (subtitle ? '<p class="hero-desc">' + esc(subtitle) + "</p>" : "") +
      '<div class="hero-stats">' +
      "<span><b>" + items.length + "</b> 篇文章</span>" +
      "<span><b>" + countLabels(items) + "</b> 个标签</span>" +
      '<span><b class="stat-imgs">—</b> 图片</span>' +
      "<span><b>RSS</b> 订阅</span>" +
      "</div></div>";

    var head = document.createElement("div");
    head.className = "section-head";
    head.innerHTML = "<h2>最新文章</h2><em>LATEST POSTS</em>";

    var grid = document.createElement("div");
    grid.className = "card-grid";

    items.forEach(function (it) {
      var a = document.createElement("a");
      a.className = "card";
      a.href = it.href;
      a.innerHTML =
        '<div class="card-cover loading"></div>' +
        '<div class="card-body">' +
        '<h3 class="card-title">' + esc(it.title) + "</h3>" +
        '<p class="card-excerpt"></p>' +
        '<div class="card-meta">' +
        (it.date ? "<span>" + esc(it.date) + "</span>" : "") +
        (it.labels.length
          ? '<span class="dot"></span><span class="pill">' + esc(it.labels[0]) + "</span>"
          : "") +
        "</div></div>";
      grid.appendChild(a);
      it.node = a;
    });

    nav.parentNode.insertBefore(hero, nav);
    nav.parentNode.insertBefore(head, nav);
    nav.parentNode.insertBefore(grid, nav);
    nav.style.display = "none";

    hydrate(items, hero);
  }

  function countLabels(items) {
    var set = {};
    items.forEach(function (i) {
      i.labels.forEach(function (l) {
        set[l] = 1;
      });
    });
    return Object.keys(set).length;
  }

  /* ---- 逐篇补封面与摘要（带本地缓存） ---- */
  var CACHE_KEY = "gmeek_cards_v1";
  var CACHE_TTL = 30 * 24 * 3600 * 1000;
  var cache = (function () {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    } catch (e) {
      return {};
    }
  })();

  function saveCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {}
  }

  function hydrate(items, hero) {
    var totalImgs = 0;
    var pending = items.length;
    var touched = false;

    function done() {
      pending--;
      if (pending > 0) return;
      if (touched) saveCache();
      var el = hero.querySelector(".stat-imgs");
      if (el && totalImgs) el.textContent = totalImgs;
    }

    items.forEach(function (it) {
      var hit = cache[it.href];
      if (hit && Date.now() - (hit.t || 0) < CACHE_TTL) {
        apply(it, hit);
        totalImgs += hit.imgs || 0;
        return done();
      }
      fetch(it.href)
        .then(function (r) {
          return r.text();
        })
        .then(function (html) {
          var info = parsePost(html);
          if (info) {
            cache[it.href] = {
              cover: info.cover,
              excerpt: info.excerpt,
              imgs: info.imgs,
              t: Date.now(),
            };
            touched = true;
            apply(it, info);
            totalImgs += info.imgs || 0;
          }
          done();
        })
        .catch(done);
    });
  }

  function parsePost(html) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    var b = doc.getElementById("postBody");
    if (!b) return null;

    var imgs = b.querySelectorAll("img");
    var cover = "";
    for (var i = 0; i < imgs.length; i++) {
      var src = imgs[i].getAttribute("data-canonical-src") || imgs[i].getAttribute("src") || "";
      if (src && src.indexOf("camo.githubusercontent.com") === -1) {
        cover = src;
        break;
      }
    }
    return { cover: cover, excerpt: excerptOf(b), imgs: imgs.length };
  }

  /* 摘要：取前几段像正文的文字拼起来（命令行、payload 这类跳过） */
  function excerptOf(root) {
    var ps = root.querySelectorAll("p");
    var out = [];
    var len = 0;
    for (var i = 0; i < ps.length && out.length < 3 && len < 55; i++) {
      var t = (ps[i].textContent || "").replace(/\s+/g, " ").trim();
      if (t.length < 8 || /^https?:/.test(t)) continue;
      if (cjkRatio(t) < 0.55) continue;
      out.push(t);
      len += t.length;
    }
    return clip(out.join(" "), 92);
  }

  function cjkRatio(t) {
    var str = t.replace(/\s/g, "");
    if (!str) return 0;
    var m = str.match(/[\u4e00-\u9fff]/g);
    return (m ? m.length : 0) / str.length;
  }

  function clip(t, n) {
    if (t.length <= n) return t;
    var cut = t.slice(0, n);
    var marks = ["。", "；", "，", "、", " ", "."];
    for (var i = 0; i < marks.length; i++) {
      var k = cut.lastIndexOf(marks[i]);
      if (k >= n * 0.6) return cut.slice(0, k + 1).trim() + "…";
    }
    return cut.trim() + "…";
  }

  function apply(it, info) {
    var card = it.node;
    var box = card.querySelector(".card-cover");
    if (info.cover) {
      var img = new Image();
      img.alt = it.title;
      img.loading = "lazy";
      img.onload = function () {
        box.classList.remove("loading");
      };
      img.src = info.cover;
      box.appendChild(img);
    } else {
      box.className = "card-cover no-img";
      box.textContent = (it.title || "·").slice(0, 1);
    }
    var ex = card.querySelector(".card-excerpt");
    if (ex && info.excerpt) ex.textContent = info.excerpt;
  }

  /* ============================================================
     文章页
     ============================================================ */
  function initPost() {
    var body = hasPost;

    /* ---- 阅读进度 ---- */
    var bar = document.createElement("div");
    bar.id = "progress";
    document.body.appendChild(bar);

    function onScroll() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---- 图片编号 + 灯箱 ---- */
    var imgs = [].slice.call(body.querySelectorAll("img"));
    var lb = document.createElement("div");
    lb.id = "lightbox";
    lb.innerHTML =
      '<button id="lbClose" aria-label="关闭">×</button><img alt=""><div id="lbCount"></div>';
    document.body.appendChild(lb);

    var lbImg = lb.querySelector("img");
    var lbCount = document.getElementById("lbCount");
    var cur = 0;

    function show(i) {
      if (i < 0 || i >= imgs.length) return;
      cur = i;
      lbImg.src = imgs[i].getAttribute("data-canonical-src") || imgs[i].src;
      lbCount.textContent = i + 1 + " / " + imgs.length;
      lb.classList.add("on");
      document.body.style.overflow = "hidden";
    }
    function hide() {
      lb.classList.remove("on");
      document.body.style.overflow = "";
    }
    imgs.forEach(function (im, i) {
      im.addEventListener("click", function (e) {
        e.preventDefault();
        show(i);
      });
    });
    lb.addEventListener("click", function (e) {
      if (e.target !== lbImg) hide();
    });
    document.getElementById("lbClose").addEventListener("click", hide);
    lbImg.addEventListener("click", hide);
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("on")) return;
      if (e.key === "Escape") hide();
      if (e.key === "ArrowRight") show(cur + 1);
      if (e.key === "ArrowLeft") show(cur - 1);
    });

    /* ---- 右侧栏 ---- */
    var content = document.getElementById("content");
    if (!content) return;
    var side = document.createElement("aside");
    side.id = "side";
    content.appendChild(side);

    var heads = [].slice.call(body.querySelectorAll("h2, h3"));
    if (heads.length) {
      var tocCard = document.createElement("div");
      tocCard.className = "side-card";
      tocCard.innerHTML = '<h4>目录</h4><ul id="toc"></ul>';
      side.appendChild(tocCard);
      var list = tocCard.querySelector("#toc");
      heads.forEach(function (h, i) {
        if (!h.id) h.id = "h-" + i;
        var li = document.createElement("li");
        li.innerHTML =
          '<a href="#' + h.id + '"' +
          (h.tagName === "H3" ? ' style="padding-left:22px;font-size:12px"' : "") +
          ">" + esc(h.textContent.trim()) + "</a>";
        list.appendChild(li);
      });
      var links = [].slice.call(list.querySelectorAll("a"));
      var spy = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            links.forEach(function (a) {
              a.classList.remove("active");
            });
            var a = list.querySelector('a[href="#' + en.target.id + '"]');
            if (a) a.classList.add("active");
          });
        },
        { rootMargin: "-72px 0px -70% 0px" }
      );
      heads.forEach(function (h) {
        spy.observe(h);
      });
    }

    /* ---- 文章信息 ---- */
    var words = (body.textContent || "").replace(/\s/g, "").length;
    var mins = Math.max(1, Math.round(words / 380));

    var info = document.createElement("div");
    info.className = "side-card";
    info.innerHTML =
      "<h4>文章信息</h4>" +
      '<div class="side-row" data-k="date" hidden><span>发布</span><span></span></div>' +
      '<div class="side-row" data-k="label" hidden><span>分类</span><span></span></div>' +
      '<div class="side-row"><span>字数</span><span>' + words.toLocaleString() + "</span></div>" +
      '<div class="side-row"><span>图片</span><span>' + imgs.length + " 张</span></div>" +
      '<div class="side-row"><span>阅读</span><span>约 ' + mins + " 分钟</span></div>";
    side.appendChild(info);

    var top = document.createElement("div");
    top.className = "side-card";
    top.innerHTML =
      '<a href="#" id="toTop" style="display:block;text-align:center;text-decoration:none;color:var(--fg-soft)">↑ 回到顶部</a>';
    side.appendChild(top);
    document.getElementById("toTop").addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    /* ---- 日期与标签：来自 postList.json ---- */
    fetch("/postList.json")
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        var here = decodeURI(location.pathname).replace(/^\//, "");
        var hit = null;
        Object.keys(data).forEach(function (k) {
          var u = data[k] && data[k].postUrl;
          if (u && decodeURI(u) === here) hit = data[k];
        });
        if (!hit) return;

        var bits = [];
        if (hit.createdDate) {
          bits.push('<span class="pm-date">' + esc(hit.createdDate) + "</span>");
        }
        (hit.labels || []).slice(0, 1).forEach(function (l) {
          if (bits.length) bits.push('<span class="sep"></span>');
          bits.push('<span class="pill">' + esc(l) + "</span>");
        });
        if (bits.length) {
          var meta = document.createElement("div");
          meta.className = "post-meta";
          meta.innerHTML = bits.join("");
          var h1 = document.querySelector("h1.postTitle");
          if (h1) h1.parentNode.insertBefore(meta, h1.nextSibling);
        }

        var rd = info.querySelector('[data-k="date"]');
        if (rd && hit.createdDate) {
          rd.hidden = false;
          rd.lastElementChild.textContent = hit.createdDate;
        }
        var rl = info.querySelector('[data-k="label"]');
        if (rl && (hit.labels || []).length) {
          rl.hidden = false;
          rl.lastElementChild.innerHTML = '<span class="pill">' + esc(hit.labels[0]) + "</span>";
        }
      })
      .catch(function () {});
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* 放在最后：确保上面的常量（缓存等）都已初始化 */
  if (hasPost) initPost();
  else initList();
})();
