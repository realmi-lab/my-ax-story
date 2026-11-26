# MY AX STORY

나의 작은 AI 경험이 새로운 일하는 방식을 만듭니다.
동료들의 AI 활용 설문 답변을 인터뷰 기사처럼 보여 주는 정적 웹페이지입니다. 설치나 빌드 없이 `index.html`을 더블클릭하면 열립니다.

## 화면

| 파일 | 내용 |
|---|---|
| `index.html` | 빈 흰 배경 가운데에서 스토리 카드가 오른쪽 → 왼쪽으로 계속 흐르는 롤링만 있는 화면 (마우스를 올리면 멈춤, 끌어서 넘기기) |
| `story.html?id=s01` | 카드를 누르면 열리는 대화형 인터뷰. 소개 글 → 인터뷰이 → 소제목·질문·답변(04~07) → 기존/현재 요약(01~03) → 다른 동료 이야기 |

## 폴더

```
data/stories.js     설문 답변 데이터 (여기만 고치면 화면이 바뀜)
js/common.js        화면 문구(질문 문장·선택지), 카드·인터뷰 렌더 함수
js/main.js          롤링 화면
js/story.js         인터뷰 화면
css/style.css       스타일 (빗썸 브랜드 톤: 오렌지 #FF6C00 · 블랙 #282828, 스토리마다 theme 색)
fonts/              빗썸고딕 Basic · Bithumb Trading Sans (SIL OFL 1.1, fonts/OFL.txt)
assets/img/         AI로 생성한 이미지 (카드 썸네일 story-01~06 사용, hero·badge-core는 현재 미사용)
```

## 답변 넣기

`data/stories.js`의 객체 하나가 한 사람의 인터뷰입니다. 기존 객체 하나를 복사해 배열 끝에 붙이고 값을 바꾸세요.

| 항목 | 설문 문항 | 넣는 값 |
|---|---|---|
| `profile.org / name / role` | 자기소개 | 글 |
| `favoriteAI`, `favoriteAIOther` | 즐겨 사용하는 AI | `["ChatGPT","Claude"]`, 기타는 글 |
| `frequency.before / after` | 01 | `rarely` 거의 안 씀 · `sometimes` 가끔 · `asNeeded` 필요할 때마다 · `daily` 매일 |
| `usage.before / after` | 02 (복수) | `search` `docs` `data` `content` `coding` `automation` `none` |
| `workStyle.before / after` | 03 | `manual` 직접 · `assisted` 도움 · `together` 함께 · `automated` 자동화 |
| `story` `change` `next` `message` | 04 ~ 07 | 답변 글 (빈 줄로 문단 구분: `\n\n`) |
| `headline` `summary` `quote` `category` `thumbnail` | 카드·기사 꾸미기 | 제목, 한 줄 설명, 크게 보일 인용구, 분야 이름, 이미지 경로 |
| `theme` | 카드·인터뷰 색 | `orange` · `cyan` 청록 · `blue` 파랑 · `yellow` 노랑 · `violet` 보라 · `pink` 핑크 (빗썸 팔레트 기반) |
| `intro` `titles` `asks` | 인터뷰 다듬기 | 첫머리 소개 글, 답변별 소제목, 대화체 질문 (비우면 기본 질문) |

예시 6명(소속에 `(예시)` 표시)은 실제 답변으로 바꿔 주세요.

## 이미지 바꾸기

`assets/img/` 안의 파일을 같은 이름으로 바꾸면 됩니다. 카드 썸네일은 16:10 비율로 잘려 보입니다. 이미지가 없으면 그라데이션 자리표시가 대신 보입니다.

## 참고

- 글꼴은 빗썸고딕 Basic(제목)과 Bithumb Trading Sans(본문)를 `fonts/`에 함께 담았습니다. 둘 다 SIL Open Font License 1.1이며 라이선스는 `fonts/OFL.txt`에 있습니다. 두 글꼴에 없는 글자는 Pretendard(CDN)로 보입니다.
- 움직임 줄이기 설정(prefers-reduced-motion)을 켠 사용자에게는 카드 띠가 멈춘 상태로 보이고, 끌어서 넘길 수 있습니다.
- 설문 입력 화면(이전 버전)은 `_backup/`에 보관되어 있습니다.
