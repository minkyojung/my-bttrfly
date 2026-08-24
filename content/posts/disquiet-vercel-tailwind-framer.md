---
draft: true
title: 'Vercel, Tailwind, Framer 창업가도 사용하는 생산성 SaaS'
date: '2024-08-19'
source: disquiet
category: Interviews
canonical: 'https://disquiet.io/articles/OQs9OZ'
---
![sense of product og img.png](/images/uploads/disquiet-vercel-tailwind-framer-1.png "sense of product og img.png")Vercel, Framer, Tailwind CSS의 창업가들도 사용하는 생산성 SaaS가 있습니다.

키보드 커맨드를 편리하게 사용할 수 있도록 만들어진 Raycast입니다. 이미 3~4년 전부터 개발자들 사이에서 편의성을 인정받아 사랑받고 있습니다. 다만 키보드 커맨드가 익숙하지 않다면 어떻게 활용해야 할지 모를 수 있습니다.

그래서 오늘은 생산성을 높이고 싶은 메이커를 위해 Raycast에서 사용하면 좋은 기능과 익스텐션에 대해 적어봤습니다. 이런 내용을 다룰 예정입니다.

- Snippet으로 반복해서 입력하는 텍스트 효율화하기
- 모든 웹/앱에 빠르게 접근하기
- 마우스 없이 창 크기/위치 조절하기
- 복사한 정보를 저장하고, 어디서든 활용하기
- 추천 익스텐션 10개
- AI 기능 소개

---

![Screenshot 2024-08-16 at 12.23.18 PM 1.png](/images/uploads/disquiet-vercel-tailwind-framer-2.png "Screenshot 2024-08-16 at 12.23.18 PM 1.png")Raycast는 MacOS 환경에서 키보드 커맨드를 통해 다양한 작업을 빠르게 수행할 수 있도록 설계된 SaaS입니다. `Command+K` 검색창을 로컬 환경에서 자유롭게 활용할 수 있는 것입니다. 유사하게 이전에는 Alfred, Spotlight이 있었지만, 이들은 단순히 파일 또는 특정 앱에 접근하는 것만 가능했었습니다.

Raycast는 조금 다릅니다. 초기부터 개발자들에게 집중해 커뮤니티를 만들었고, 이 과정에서 자연스럽게 개발자들이 Raycast 생태계에 기여할 수 있는 구조를 만들었습니다. 덕분에 수많은 개발자들이 생산성을 높여주는 익스텐션을 개발하기 시작했고, 결국 생산성을 높여주는 다양한 익스텐션들이 모여 Raycast의 가치를 높였습니다.

그럼 Raycast를 활용하는 기본적인 방법을 알아볼까요?

## 1. Snippet으로 반복해서 사용하는 텍스트 효율화하기

가장 먼저 소개할 기능은 Snippet(스니펫)입니다. 스니펫은 조건부로 특정 텍스트를 생성하는 기능입니다. Raycast의 스니펫은 한 번 설정해두면 이메일 클라이언트, 노트 앱 등 어떤 응용 프로그램에서도 사용할 수 있다는 장점이 있습니다.

제가 주로 사용하는 스니펫은 아래와 같습니다.

- `!email` → 이메일 주소
- `!day` → Wednesday
- `!td` Aug 14, 2024
- `!dot` → ·
- `!hi` → 안녕하세요, 디스콰이엇 정민교입니다.
- `.cs` → [디스콰이엇] 문의주신 사항에 대해 답변드립니다.
- `.rt` → 감사합니다. 정민교 드림
- `!lorem` → Ut velit ea ea. Eu cupidatat ad labore do. Est sint laboris ullamco commodo magna sunt elit. Sit ut ipsum est laboris enim velit eu tempor fugiat anim consectetur sit. odo magna.

위에서 언급된 스니펫들은 실무에서 무의식적으로 반복 타이핑하는 것들입니다. 이렇게 사소한 텍스트를 효율적으로 작성할 수도 있지만, 가끔은 여러 SaaS를 넘나들어야 하는 상황도 있습니다. 예를 들면, [Cal.com](http://cal.com/) 에서 캘린더 링크를 복사해 누군가에게 공유해야한다고 가정해볼까요?

일반적인 경우라면, 아래의 순서로 처리합니다.

> 브라우저 접속 → [Cal.com](http://cal.com/) 접속 → 링크 복사 → 메세지 앱 접속 → 공유

반대로 `!cal`을 입력해 캘린더 링크를 생성하는 스니펫을 활용할 수 있습니다. 이렇게 간편해집니다.

> 메세지 앱 접속 → `!cal` 입력 → 전송

이렇게 워크플로우를 끊임없이 최적화해가면 불필요한 컨텍스트 스위칭을 줄이고, 일에 온전히 집중할 수 있습니다. 개발자 분들은 자주 사용하는 코드를 스니펫으로 만들어 활용해볼 수도 있습니다.

## 2. 모든 웹/앱에 빠르게 접근하기

다음으로 Quicklink입니다. 기본적으로 빠르게 특정 링크로 이동하게 도와주지만, URL에 쿼리를 포함시킬 수 있어 더 다양한 기능을 가능하게 합니다. 이때 Link에는 아래 8가지 변수를 넣을 수 있습니다.

- 커서로 드래그한 텍스트
- 복사한 텍스트
- 쿼리(인자)
- UUID(중복되지 않는 식별자)
- 스니펫
- 날짜
- 시간
- 요일

예를 들어, 아래와 같이 즉시 구글링할 수 있는 기능을 만들어볼 수 있습니다.

![Screenshot 2024-08-16 at 4.13.07 PM 1.png](/images/uploads/disquiet-vercel-tailwind-framer-3.png "Screenshot 2024-08-16 at 4.13.07 PM 1.png")

저는 구글링을 줄여 `ggl` 커맨드를 설정했고, 쿼리를 변수로 넣었습니다.

![Screenshot 2024-08-18 at 9.34.24 PM 1.png](/images/uploads/disquiet-vercel-tailwind-framer-4.png "Screenshot 2024-08-18 at 9.34.24 PM 1.png")이외에도 Quicklink를 활용하는 방법은 무궁무진합니다.

- 자주 메일을 보내야하는 사람을 `mailto:{email addr}`로 설정해 간편한 명령어로 메일 보내기
- 내 로컬 특정 폴더로 빠르게 접근하기
- 웹훅을 활용해 PR을 디스코드, Jira 등에 자동으로 보내기

## 3. 마우스 없이 창 크기/위치 조절하기

창 크기를 조절하는 것만큼 마우스를 많이 쓰게 되는 일이 없습니다. Raycast에서는 단축키를 설정해 편하게 창의 위치와 크기를 조절할 수 있습니다. 저는 `^⌘` + `방향키` 조합을 활용하고 있습니다.

## 4. 복사했던 정보를 저장하고, 언제든지 활용하기

클립보드 히스토리는 유저가 복사한 텍스트, 이미지, 파일 등을 기록하는 기능인데요. 크게 두 가지 기능을 합니다.

## 4.1. 정보 유형에 따른 구분


## 4.2. 복사한 정보를 어디서든 활용하기

![Screenshot 2024-08-18 at 5.47.55 PM.png](/images/uploads/disquiet-vercel-tailwind-framer-7.png "Screenshot 2024-08-18 at 5.47.55 PM.png")클립보드에 복사된 정보를 활용해 다른 기능을 사용할 수도 있습니다. 예를 들어 최근에 개인 웹사이트를 만들면서 이미지의 alt text를 만드는 일이 귀찮았습니다. 그래서 특정 이미지를 복사한 다음 위의 익스텐션을 실행시켜 AI로 빠르게 alt text를 만들었습니다.

## 5. 추천 익스텐션 10개

기본기능 외에 제가 오랫동안 사용해본 무료 익스텐션 10가지입니다. 아래 익스텐션을 활용하시면 마우스 한 번 사용하지 않고, 모든 응용프로그램에 접근할 수 있습니다.

- **Ollama** — 로컬 LLM을 빠르고 편하게 이용하기
- **Floating Note** — 항상 모든 창 위에 떠 있는 메모장
- **Github** — PR, 이슈, 리포지토리 등을 생성하고 조회하기
- **Spotify** — 음악을 검색/재생/관리하기
- **Tailwind CSS** — Tailwind CSS의 색상값, 컴포넌트, 문서를 즉시 검색하기
- **ChatGPT/Claude/Perplexity** — Raycast에서 바로 AI Chatbot 서비스를 사용하기
- **Notion** — Raycast에서 바로 노션 문서를 조회/생성/작성하기
- **1password** — 즉시 1password에서 비밀번호를 조회/생성하기
- **Format JSON** — JSON 데이터를 가독성 있게 정리하기
- **Hacker News** — Raycast에서 Hacker News를 즉시 조회하기

## 6. AI 기능 (유료)

지금부터는 유료 기능인데요. 유료 유저의 입장에서 Raycast AI에 대한 솔직한 후기를 정리해봤습니다.

## AI Chat

![Screenshot 2024-08-16 at 5.43.08 PM 1.png](/images/uploads/disquiet-vercel-tailwind-framer-8.png "Screenshot 2024-08-16 at 5.43.08 PM 1.png")사실상 GPT Wrapper라고 봐도 무방합니다. 굳이 더 나은 점을 찾자면 3가지가 있습니다.

- 웹을 열지 않아도 AI 기능을 사용할 수 있음
- 프롬프트나 명령어를 단축키로 설정할 수 있음
- 비교적 저렴한 가격($10)에 GPT, Claude, Llama, Mixtral 등을 제한적으로 사용할 수 있음

**하지만 애매하게 저렴한 가격에 애매한 제품을 쓰고 있다는 느낌을 지우기 어렵습니다.**

## AI 프리셋

![Screenshot 2024-08-16 at 5.42.33 PM 1.png](/images/uploads/disquiet-vercel-tailwind-framer-9.png "Screenshot 2024-08-16 at 5.42.33 PM 1.png")AI 프리셋은 GPTs와 거의 동일한 기능입니다. 미리 프롬프팅 되어있는 모델을 사용하는 것입니다. 하지만 모델 설정에 제한이 있어 퀄리티가 좋지 못합니다. 예를 들면, 코딩을 할 때는 Cursor만 사용해도 Claude 3.5 Sonnet, GPT-4o, Llama 등의 모델을 제한없이 사용할 수 있는데 굳이 Raycast까지 돈을 내고 사용해야 하는지 잘 모르겠습니다.

## AI 커맨드

![Screenshot 2024-08-16 at 5.32.17 PM 1.png](/images/uploads/disquiet-vercel-tailwind-framer-10.png "Screenshot 2024-08-16 at 5.32.17 PM 1.png")마지막으로 AI 커맨드입니다. 유튜브를 요약하거나, 텍스트의 톤을 바꾸는 등과 같이 이제는 당연해진 몇 가지 기능이 있습니다. 요즘은 모든 프로덕트가 자체 AI 기능을 도입하고 있어 위의 커맨드를 거의 사용하지 않게 되는 것 같습니다.

예를 들면 이렇게 대체될 수 있습니다.

- **텍스트 개선** : Notion AI, 기타 노트 앱에 적용된 AI 기능
- **유튜브/웹 컨텐츠 요약정리** : Arc, Lilys 등
- **톤앤매너 개선** : Spark AI, Superhuman AI 등

## 결론 - 무료에서는 따라올 제품이 없음

AI 기능에 대해서는 아직 회의적이지만, 무료 버전은 꼭 사용하셨으면 합니다. 내 워크플로우에 따라 개인화할 수 있는 로직이 무궁무진하기 때문입니다. 이번 글에서 소개한 기능은 Raycast 기능의 절반도 다루지 못한 것 같기도 합니다.

필요에 따라 스크립트, 익스텐션을 자체 개발해서 사용할 수도 있으니 Raycast로 생산성을 높여보세요 :)
