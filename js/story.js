/*
 * MY AX STORY — 인터뷰 상세 화면 (story.html?id=s01)
 */
(function () {
  "use strict";

  var AX = window.AX;
  var h = AX.h;
  var stories = Array.isArray(window.AX_STORIES) ? window.AX_STORIES : [];
  var post = document.getElementById("post");

  var id = new URLSearchParams(window.location.search).get("id");
  var idx = -1;
  for (var i = 0; i < stories.length; i++) { if (stories[i].id === id) { idx = i; break; } }

  if (idx < 0) {
    document.title = "스토리를 찾을 수 없어요 — MY AX STORY";
    post.appendChild(h("div", { class: "not-found" },
      h("p", { class: "eyebrow", text: "MY AX STORY" }),
      h("h1", { class: "post-title", text: "스토리를 찾을 수 없어요" }),
      h("p", { class: "post-meta", text: "주소가 바뀌었거나 아직 등록되지 않은 이야기예요." }),
      h("a", { class: "btn btn-primary", href: "index.html", text: "전체 스토리 보기" })));
    return;
  }

  var story = stories[idx];
  // 관련 스토리: 다음 순서부터 3개(현재 사람 제외)
  var related = [];
  for (var k = 1; k < stories.length && related.length < 3; k++) related.push(stories[(idx + k) % stories.length]);

  document.title = (story.headline || "인터뷰") + " — MY AX STORY";
  AX.applyTheme(post, story);
  post.appendChild(AX.buildStory(story, { related: related }));
  AX.reveal(post);
})();
