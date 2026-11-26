/*
 * MY AX STORY — 롤링 화면
 * 빈 배경 가운데에서 스토리 카드가 오른쪽 → 왼쪽으로 끊김 없이 흐릅니다.
 *  - 마우스를 올리거나 키보드 포커스가 들어가면 멈춤
 *  - 마우스 드래그 · 손가락 스와이프로 넘기기
 *  - prefers-reduced-motion 이면 자동으로 흐르지 않음(가로로 끌어서 보기)
 *  - 카드를 누르면 story.html?id=… 인터뷰로 이동 (iframe 안에서는 새 탭)
 */
(function () {
  "use strict";

  var AX = window.AX;
  var stories = Array.isArray(window.AX_STORIES) ? window.AX_STORIES : [];

  var SPEED = 40;               // px / 초
  var root = document.querySelector("[data-marquee]");
  var viewport = root.querySelector(".marquee-viewport");
  var track = root.querySelector(".marquee-track");

  // 다른 페이지에 iframe 으로 붙였을 때: 카드는 새 탭으로 열고, ?bg=transparent 면 바탕을 투명하게
  var embedded = window.self !== window.top;
  if (new URLSearchParams(window.location.search).get("bg") === "transparent") {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
  }

  var state = { offset: 0, setWidth: 0, hover: false, focus: false, drag: null, tween: null, noWrap: false, last: 0 };

  function mod(n, m) { return m ? ((n % m) + m) % m : 0; }

  // 화면 폭을 다 채울 만큼 카드 묶음을 복제한다(복제본은 보조기기·탭 이동에서 제외)
  function layout() {
    track.textContent = "";
    stories.forEach(function (s) { track.appendChild(AX.buildCard(s)); });
    stories.forEach(function (s) { track.appendChild(AX.buildCard(s, { clone: true })); });
    var real = stories.length;
    state.setWidth = track.children[real].offsetLeft - track.children[0].offsetLeft;
    var sets = 2;
    while (sets * state.setWidth < viewport.clientWidth + state.setWidth && sets < 12) {
      stories.forEach(function (s) { track.appendChild(AX.buildCard(s, { clone: true })); });
      sets++;
    }
    if (embedded) {
      Array.prototype.forEach.call(track.querySelectorAll("a.card"), function (a) { a.target = "_blank"; a.rel = "noopener"; });
    }
    apply();
  }

  function apply() {
    var x = state.noWrap ? state.offset : mod(state.offset, state.setWidth);
    if (!state.noWrap) state.offset = x;
    track.style.transform = "translate3d(" + (-x).toFixed(2) + "px,0,0)";
  }

  function paused() { return state.hover || state.focus || !!state.drag || AX.reduceMotion; }

  function frame(now) {
    var dt = state.last ? Math.min(0.05, (now - state.last) / 1000) : 0;
    state.last = now;
    if (state.tween) {
      var t = Math.min(1, (now - state.tween.start) / state.tween.ms);
      var e = 1 - Math.pow(1 - t, 3);
      state.offset = state.tween.from + (state.tween.to - state.tween.from) * e;
      if (t >= 1) state.tween = null;
      apply();
    } else if (!paused()) {
      state.offset += SPEED * dt;
      apply();
    }
    requestAnimationFrame(frame);
  }

  function bind() {
    root.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") state.hover = true; });
    root.addEventListener("pointerleave", function () { state.hover = false; });

    // 키보드: 포커스된 카드가 화면 안에 보이도록 이동
    track.addEventListener("focusin", function (e) {
      var card = e.target.closest(".card");
      if (!card) return;
      state.focus = true;
      state.noWrap = true;
      var pad = 24, left = card.offsetLeft, right = left + card.offsetWidth;
      var cur = mod(state.offset, state.setWidth);
      state.offset = cur;
      if (left < cur + pad || right > cur + viewport.clientWidth - pad) {
        var to = left - pad;
        if (AX.reduceMotion) { state.offset = to; apply(); }
        else state.tween = { from: cur, to: to, start: performance.now(), ms: 380 };
      }
    });
    track.addEventListener("focusout", function (e) {
      if (!track.contains(e.relatedTarget)) { state.focus = false; state.noWrap = false; state.tween = null; apply(); }
    });

    // 드래그 / 스와이프 (세로 스크롤은 브라우저에 맡김: CSS touch-action: pan-y)
    var moved = false;
    viewport.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      state.drag = { x: e.clientX, offset: state.offset, id: e.pointerId };
      state.tween = null;
      moved = false;
    });
    viewport.addEventListener("pointermove", function (e) {
      if (!state.drag || e.pointerId !== state.drag.id) return;
      var dx = e.clientX - state.drag.x;
      if (!moved && Math.abs(dx) > 5) {
        moved = true;
        viewport.classList.add("is-dragging");
        try { viewport.setPointerCapture(e.pointerId); } catch (err) { /* 무시 */ }
      }
      if (moved) { state.offset = state.drag.offset - dx; apply(); }
    });
    function endDrag(e) {
      if (!state.drag || (e && e.pointerId !== state.drag.id)) return;
      state.drag = null;
      viewport.classList.remove("is-dragging");
    }
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    // 끌어서 넘긴 직후에는 카드 클릭으로 이동하지 않게
    viewport.addEventListener("click", function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);

    var timer = 0;
    window.addEventListener("resize", function () { clearTimeout(timer); timer = setTimeout(layout, 150); });
  }

  if (!stories.length) { root.hidden = true; return; }
  layout();
  bind();
  window.addEventListener("load", layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  requestAnimationFrame(frame);
})();
