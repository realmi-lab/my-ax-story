/*
 * MY AX STORY — 공통 모듈
 * 화면 문구(LABELS), 안전한 DOM 생성 도우미, 카드/인터뷰 렌더 함수를 모아 둔 파일입니다.
 * 데이터는 항상 textContent 로 넣습니다(innerHTML 에 사용자 값을 넣지 않음).
 */
(function () {
  "use strict";

  var LABELS = {
    tools: ["ChatGPT", "Claude", "Gemini", "Copilot"],
    frequency: {
      order: ["rarely", "sometimes", "asNeeded", "daily"],
      text: { rarely: "거의 사용하지 않음", sometimes: "가끔 사용", asNeeded: "필요할 때마다 사용", daily: "매일 사용" },
      short: { rarely: "거의 안 씀", sometimes: "가끔", asNeeded: "필요할 때마다", daily: "매일" }
    },
    usage: {
      order: ["search", "docs", "data", "content", "coding", "automation", "none"],
      text: {
        search: "일상적인 질문 및 검색",
        docs: "자료 조사 및 문서 작성",
        data: "데이터 분석",
        content: "이미지 및 콘텐츠 제작",
        coding: "코딩 및 프로그램 제작",
        automation: "업무 자동화",
        none: "사용 경험 없음"
      }
    },
    workStyle: {
      order: ["manual", "assisted", "together", "automated"],
      text: {
        manual: "대부분 직접 작업",
        assisted: "필요할 때 AI의 도움을 받음",
        together: "AI와 함께 업무를 진행",
        automated: "일부 업무를 AI로 자동화"
      },
      short: { manual: "직접 작업", assisted: "AI 도움", together: "AI와 함께", automated: "자동화" }
    },
    // 기존 → 현재 요약 상자의 소제목
    measures: {
      frequency: { title: "얼마나 자주 쓰나요" },
      usage: { title: "어디에 쓰나요" },
      workStyle: { title: "어떻게 일하나요" }
    },
    // 인터뷰 질문(설문 04~07). 스토리마다 asks 로 질문 말투를 바꿀 수 있고, 없으면 아래 기본 질문을 씁니다.
    questions: [
      { key: "story", ask: "AI랑 일하면서 가장 기억에 남는 순간이 있다면요?" },
      { key: "change", ask: "AI를 쓰고 나서 일하는 모습이 어떻게 달라졌어요?" },
      { key: "next", ask: "앞으로 AI로 해 보고 싶은 일도 있나요?" },
      { key: "message", ask: "마지막으로, 동료들에게 한마디 부탁드려요." }
    ]
  };

  /*
   * 스토리별 색 — 빗썸 거래소 CSS 팔레트(keycolor_orange·cyan·blue·yellow, AI 카드 바이올렛) 기반.
   * data/stories.js 의 theme 값(orange, cyan, blue, yellow, violet, pink)으로 고릅니다.
   *  accent: 이미지 대표색  mark: 흰 바탕 '현재' 표식·인용 부호·질문 막대(대비 3:1↑, 회색 '기존'과 색약 구분 검증)
   *  ink: 흰 바탕 작은 글자(대비 4.5:1↑)  soft: 옅은 바탕  on: 표식 위 아이콘 색
   */
  var THEMES = {
    orange: { accent: "#FF6C00", mark: "#E85D00", ink: "#C24100", soft: "#FFF0E6", on: "#1C2028" },
    cyan:   { accent: "#3CB4C3", mark: "#137482", ink: "#137482", soft: "#ECF8F9", on: "#FFFFFF" },
    blue:   { accent: "#0F49E2", mark: "#0F49E2", ink: "#0F49E2", soft: "#E7EDFC", on: "#FFFFFF" },
    yellow: { accent: "#F6DE06", mark: "#A67C00", ink: "#7A5C00", soft: "#FEFCE6", on: "#1C2028" },
    violet: { accent: "#855FF1", mark: "#855FF1", ink: "#6440D6", soft: "#F3EFFE", on: "#FFFFFF" },
    pink:   { accent: "#F7A1B5", mark: "#C2255C", ink: "#C2255C", soft: "#FFEEF2", on: "#FFFFFF" }
  };
  var THEME_ORDER = ["orange", "cyan", "blue", "yellow", "violet", "pink"];

  // theme 이 없으면 썸네일 번호(story-01 → orange …)로 고르고, 그것도 없으면 오렌지
  function themeOf(story) {
    if (story && THEMES[story.theme]) return THEMES[story.theme];
    var m = story && /story-0?(\d+)/.exec(story.thumbnail || "");
    if (m) return THEMES[THEME_ORDER[(Number(m[1]) - 1) % THEME_ORDER.length]];
    return THEMES.orange;
  }
  function themeVars(story) {
    var t = themeOf(story);
    return { "--accent": t.accent, "--accent-mark": t.mark, "--accent-ink": t.ink, "--accent-soft": t.soft, "--accent-on": t.on };
  }
  function applyTheme(el, story) {
    var vars = themeVars(story);
    Object.keys(vars).forEach(function (k) { el.style.setProperty(k, vars[k]); });
  }

  /* ---------- DOM 도우미 ---------- */

  // h("div", {class:"a", onclick:fn, "aria-label":"..."}, "텍스트", 자식노드, [배열])
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === "class") el.className = v;
        else if (k === "text") el.textContent = v;
        else if (k === "style" && typeof v === "object") {
          Object.keys(v).forEach(function (sk) {
            if (sk.slice(0, 2) === "--") el.style.setProperty(sk, v[sk]); else el.style[sk] = v[sk];
          });
        }
        else if (k.slice(0, 2) === "on" && typeof v === "function") el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? "" : String(v));
      });
    }
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, child) {
    if (child === null || child === undefined || child === false) return;
    if (Array.isArray(child)) { child.forEach(function (c) { append(el, c); }); return; }
    el.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
  }

  // 고정된(코드에 적힌) SVG 아이콘만 이 함수로 만듭니다. 사용자 데이터는 절대 넣지 않습니다.
  var ICONS = {
    check: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arrowRight: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    quote: '<svg viewBox="0 0 48 36" aria-hidden="true" focusable="false"><path d="M0 36V22C0 9.6 6.4 2.3 19.2 0l2 5.4C14.4 7.4 11 11.4 10.8 17.6H20V36H0zm28 0V22C28 9.6 34.4 2.3 47.2 0l.8 5.4c-6.8 2-10.2 6-10.4 12.2H48V36H28z" fill="currentColor"/></svg>'
  };
  function icon(name, cls) {
    var span = document.createElement("span");
    span.className = "icon" + (cls ? " " + cls : "");
    span.innerHTML = ICONS[name];
    return span;
  }

  // 이미지가 없거나 깨지면 감싼 상자의 그라데이션 자리표시가 보이도록 이미지만 숨깁니다.
  function img(src, alt, cls) {
    var el = h("img", { src: src || "", alt: alt || "", loading: "lazy", decoding: "async", draggable: "false", class: cls || null });
    el.addEventListener("error", function () { el.classList.add("is-broken"); el.parentNode && el.parentNode.classList.add("is-fallback"); });
    if (!src) { el.classList.add("is-broken"); }
    return el;
  }

  function storyUrl(story) { return "story.html?id=" + encodeURIComponent(story.id); }
  function initial(name) { return (name || "?").trim().charAt(0) || "?"; }
  function byline(p) { return [p && p.org, p && p.name].filter(Boolean).join(" "); }

  /* ---------- 카드 ---------- */

  function buildCard(story, opts) {
    opts = opts || {};
    var p = story.profile || {};
    var a = h("a", {
      class: "card" + (opts.className ? " " + opts.className : ""),
      href: storyUrl(story),
      draggable: "false",
      style: { "--accent-ink": themeOf(story).ink },
      "aria-hidden": opts.clone ? "true" : null,
      tabindex: opts.clone ? "-1" : null
    },
      h("div", { class: "card-thumb" + (story.thumbnail ? "" : " is-fallback") }, img(story.thumbnail, "")),
      h("div", { class: "card-cat", text: story.category || "MY AX STORY" }),
      h("div", { class: "card-title", text: story.headline || "" }),
      story.summary ? h("div", { class: "card-desc", text: story.summary }) : null,
      h("div", { class: "card-author", text: byline(p) })
    );
    return a;
  }

  /* ---------- 기존 → 현재 시각화 ---------- */

  // 01, 03 공용: 네 단계 눈금 위에 기존(빈 원)·현재(채운 원) 표시
  function buildScale(kind, value) {
    var L = LABELS[kind];
    var order = L.order;
    var b = order.indexOf(value && value.before);
    var a = order.indexOf(value && value.after);
    var label = (kind === "frequency" ? "사용 빈도" : "일하는 방식") + ": 기존 " + (b >= 0 ? L.text[order[b]] : "응답 없음") +
      ", 현재 " + (a >= 0 ? L.text[order[a]] : "응답 없음");
    var pos = function (i) { return (i / (order.length - 1)) * 100; };

    var track = h("div", { class: "scale-track" });
    if (b >= 0 && a >= 0 && a !== b) {
      var lo = Math.min(a, b), hi = Math.max(a, b);
      track.appendChild(h("span", { class: "scale-span" + (a < b ? " is-down" : ""), style: { left: pos(lo) + "%", width: (pos(hi) - pos(lo)) + "%" } }));
    }
    order.forEach(function (_, i) { track.appendChild(h("span", { class: "scale-tick", style: { left: pos(i) + "%" } })); });
    if (b >= 0 && b !== a) {
      track.appendChild(h("span", { class: "scale-mark is-before", style: { left: pos(b) + "%" } }, h("span", { class: "scale-flag", text: "기존" })));
    }
    if (a >= 0) {
      track.appendChild(h("span", { class: "scale-mark is-after", style: { left: pos(a) + "%" } }, h("span", { class: "scale-flag", text: a === b ? "기존 · 현재" : "현재" })));
    }

    var labels = h("ol", { class: "scale-labels" }, order.map(function (key, i) {
      var cls = "scale-label" + (i === a ? " is-after" : "") + (i === b && i !== a ? " is-before" : "");
      return h("li", { class: cls, style: { left: pos(i) + "%" }, text: L.short[key] });
    }));
    return h("div", { class: "scale", role: "img", "aria-label": label }, track, labels);
  }

  // 03: 계단 모양 사다리
  function buildLadder(value) {
    var L = LABELS.workStyle;
    var b = L.order.indexOf(value && value.before);
    var a = L.order.indexOf(value && value.after);
    var label = "일하는 방식: 기존 " + (b >= 0 ? L.text[L.order[b]] : "응답 없음") + ", 현재 " + (a >= 0 ? L.text[L.order[a]] : "응답 없음");
    var steps = L.order.map(function (key, i) {
      var isA = i === a, isB = i === b;
      var flag = isA && isB ? "기존 · 현재" : isA ? "현재" : isB ? "기존" : "";
      return h("li", { class: "ladder-step" + (isA ? " is-after" : "") + (isB && !isA ? " is-before" : "") },
        h("span", { class: "ladder-flag", text: flag }),
        h("span", { class: "ladder-bar", style: { height: (34 + i * 22) + "px" } }),
        h("span", { class: "ladder-name", text: L.text[key] })
      );
    });
    return h("ol", { class: "ladder", role: "img", "aria-label": label }, steps);
  }

  // 02: 항목 | 기존 | 현재 표
  function buildUsageTable(value) {
    var L = LABELS.usage;
    var before = (value && value.before) || [];
    var after = (value && value.after) || [];
    var cell = function (on, kind) {
      return h("td", { class: "u-cell" },
        on ? h("span", { class: "u-dot is-" + kind, title: kind === "before" ? "기존 사용" : "현재 사용" }, icon("check"), h("span", { class: "sr-only", text: "선택" }))
           : h("span", { class: "u-dot is-empty" }, h("span", { class: "sr-only", text: "선택 안 함" })));
    };
    var rows = L.order.map(function (key) {
      var b = before.indexOf(key) >= 0, a = after.indexOf(key) >= 0;
      return h("tr", { class: a && !b ? "is-new" : "" },
        h("th", { scope: "row" }, L.text[key], a && !b && key !== "none" ? h("span", { class: "u-new", text: "NEW" }) : null),
        cell(b, "before"), cell(a, "after"));
    });
    var countB = before.filter(function (k) { return k !== "none"; }).length;
    var countA = after.filter(function (k) { return k !== "none"; }).length;
    return h("div", { class: "usage" },
      h("p", { class: "usage-sum" }, "활용 분야 ", h("b", { class: "is-before-text", text: countB + "개" }), " → ", h("b", { class: "is-after-text", text: countA + "개" })),
      h("table", { class: "usage-table" },
        h("caption", { class: "sr-only", text: "AI 활용 분야 기존과 현재 비교" }),
        h("thead", null, h("tr", null, h("th", { scope: "col", text: "항목" }), h("th", { scope: "col", text: "기존" }), h("th", { scope: "col", text: "현재" }))),
        h("tbody", null, rows)));
  }

  function legend() {
    return h("div", { class: "ba-legend", "aria-hidden": "true" },
      h("span", { class: "lg lg-before" }, h("i"), "기존"),
      h("span", { class: "lg lg-after" }, h("i"), "현재"));
  }

  function measureBlock(kind, body) {
    return h("div", { class: "ba-item" },
      h("h3", { class: "ba-title", text: LABELS.measures[kind].title }),
      body);
  }

  /* ---------- 인터뷰 상세 ---------- */

  function paragraphs(text) {
    return String(text || "").split(/\n\s*\n/).map(function (t) { return t.trim(); }).filter(Boolean)
      .map(function (t) { return h("p", { text: t }); });
  }

  function buildStory(story, opts) {
    opts = opts || {};
    var p = story.profile || {};
    var asks = story.asks || {};
    var titles = story.titles || {};
    var frag = document.createDocumentFragment();

    // 머리
    frag.appendChild(h("header", { class: "post-head rv" },
      h("p", { class: "post-cat" }, "MY AX STORY", story.category ? h("span", { class: "post-cat-sub", text: story.category }) : null),
      h("h1", { class: "post-title", text: story.headline || "" }),
      h("p", { class: "post-meta" },
        h("strong", { text: byline(p) }),
        story.date ? h("span", { class: "post-date", text: " · " + story.date }) : null)));

    frag.appendChild(h("figure", { class: "post-figure rv" + (story.thumbnail ? "" : " is-fallback") }, img(story.thumbnail, story.headline || "")));

    // 리드 문단
    if (story.intro) frag.appendChild(h("div", { class: "post-lead rv" }, paragraphs(story.intro)));

    // 인터뷰이 소개
    var tools = (story.favoriteAI || []).slice();
    if (story.favoriteAIOther && story.favoriteAIOther.trim()) tools.push(story.favoriteAIOther.trim());
    frag.appendChild(h("aside", { class: "who rv", "aria-label": "인터뷰이 소개" },
      h("span", { class: "who-avatar", "aria-hidden": "true", text: initial(p.name) }),
      h("div", { class: "who-body" },
        h("p", { class: "who-name" }, p.name || "", p.org ? h("span", { class: "who-org", text: p.org }) : null),
        p.role ? h("p", { class: "who-role", text: p.role }) : null,
        tools.length ? h("p", { class: "who-ai" },
          h("span", { class: "who-ai-label", text: "즐겨 쓰는 AI" }),
          h("span", { class: "chips" }, tools.map(function (t) { return h("span", { class: "chip", text: t }); }))) : null)));

    // 인터뷰 본문
    var talk = h("section", { class: "talk", "aria-label": "인터뷰" });
    LABELS.questions.forEach(function (q, idx) {
      if (!story[q.key]) return;
      talk.appendChild(h("div", { class: "talk-part rv" },
        titles[q.key] ? h("h2", { class: "talk-title", text: titles[q.key] }) : null,
        h("p", { class: "talk-q", text: asks[q.key] || q.ask }),
        h("div", { class: "talk-a" }, paragraphs(story[q.key]))));
      if (idx === 0 && story.quote) {
        talk.appendChild(h("blockquote", { class: "pull rv" },
          icon("quote", "pull-mark"),
          h("p", { text: story.quote }),
          h("footer", { text: "— " + (p.name || "") })));
      }
    });
    frag.appendChild(talk);

    // 기존 → 현재 요약 (설문 01~03)
    frag.appendChild(h("section", { class: "ba rv", "aria-labelledby": "ba-title" },
      h("div", { class: "ba-top" },
        h("h2", { class: "ba-heading", id: "ba-title", text: (p.name ? p.name + " 님의 " : "") + "AI 사용, 이렇게 달라졌어요" }),
        legend()),
      measureBlock("frequency", buildScale("frequency", story.frequency)),
      measureBlock("usage", buildUsageTable(story.usage)),
      measureBlock("workStyle", buildLadder(story.workStyle))));

    // 다른 동료 이야기
    if (opts.related && opts.related.length) {
      frag.appendChild(h("section", { class: "related rv", "aria-labelledby": "related-title" },
        h("h2", { class: "related-title", id: "related-title", text: "다른 동료의 이야기" }),
        h("div", { class: "related-grid" }, opts.related.map(function (s) { return buildCard(s, { className: "card-grid" }); })),
        h("a", { class: "btn btn-line", href: "index.html" }, "전체 스토리 보기", icon("arrowRight"))));
    }
    return frag;
  }

  /* ---------- 스크롤 등장 효과 ---------- */

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function reveal(root) {
    var els = (root || document).querySelectorAll(".rv:not(.on)");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("on"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: "0px 0px -32px 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  window.AX = {
    LABELS: LABELS,
    h: h,
    icon: icon,
    img: img,
    storyUrl: storyUrl,
    buildCard: buildCard,
    buildStory: buildStory,
    reveal: reveal,
    applyTheme: applyTheme,
    reduceMotion: reduceMotion
  };
})();
