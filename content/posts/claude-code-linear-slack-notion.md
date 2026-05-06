---
title: "Claude Code팀은 Linear, Slack, Notion을 안 씀, 해적과 건축가, 실험과 느낀 점"
date: "2026-04-26"
labelImage: "/badges/substack.png"
---

(이번 주에 재밌는 에피소드가 갑자기 많이 나와서 급하게 적느라 음악은 없습니다 ㅎㅎ)

흥미로운 점만 짧게 정리하면,

- 일할 때 Claude Code, Cowork, Slack만 사용. Slack, Notion, Linear 등은 안 씀
- 엔지니어가 기능을 올리면 다음 날 마케팅 팀이 바로 발표하는 Launch Room 시스템 운영
- PM은 로드맵보다, 어떻게 하면 가장 빠르게 제품을 출시할 수 있을지 고민하는 방향으로 전환
- PM 없이 엔지니어 혼자 트위터 피드백 보고 일주일 안에 제품 출시. PM 있어도 개발자 출신. 가장 중요한 건 Product Taste
- 아슬아슬하게 동작하는 제품을 먼저 만들어서 shipping. 모델이 준비될 때까지 기다리면 항상 한 사이클 늦음
- 혼돈을 즐기는 사람을 선호

## 생각해보는 지점

특히 곱씹어보는 지점은 Code, Communicate, Operation으로 단순화된 제품 스택.

- **Code**: Claude code, Codex, Linear, Cursor 등
- **Ops**: Cowork, Codex, PostHog, GA 등 (Sales도 이쪽)
- **Communicate**: Slack, Discord
- **Browser**: Comet, Dia, Atlas 등 (1차 AI Browser 전쟁은 끝났고 승자는 없는 것 같다)

또한 특정 기능보다 "일하는 방식의 설계"가 훨씬 중요한 제품들. 이 범주 바깥의 SaaS는 기능 위주의 제품이고 전부 오픈소스가 있음 (Screen Studio, 1password, Raycast 등).

Reliability가 너무너무 중요.

## 해적과 건축가

이제 두 개의 포지션이 있으면 된다.

### 해적 (Pirate)

- 최대한 빠르게 움직이면서 에이전트와 제품을 빠르게 만드는 사람
- 아키텍처나 코드 품질보다 사람들의 JTBD에 집중
- 제품의 비전을 리드하면서 여러 기능을 시도하고 버리면서 진짜 먹히는 걸 발견하는 역할

### 아키텍트 (Architect)

- 해적이 만든 엉망인 코드와 아이디어를 이해 가능하고 확장 가능하며 유지보수 가능한 시스템으로 재구성하는 사람
- 아무 이유 없이 갑자기 서비스가 죽지 않도록 구조를 잡고 중요한 부분을 처음부터 다시 설계하는 일

실제로 Dan도 제품 만들면서 아키텍트 역할의 사람과 일주일 정도 핵심 세션을 바닥부터 다시 설계/구현하면서 제품을 재설계함.

특히 Dan이 이 구조로 일하면서 배운 점:

- 에이전트로 뭐든 만들 수 있으니 괜히 기능 계속 붙이지 말고, 작지만 진짜 잘 되는 하나의 기능에 집중
- 먹히는 기능을 찾았으면 바이브 코드 덩어리를 리팩토링하면서 붙잡지 말고, 코드베이스 갈아엎고 다시 시작하기. 엉망인 코드를 보면 에이전트는 그 맥락에 끌려가서 진짜 깔끔한 재설계를 잘 못함
- 마지막으로, 생산성 앱 전반에서 사람이 아니라 에이전트가 1차 사용자인 형태로 완전히 재설계되어야 함. 그렇기 때문에 소프트웨어 엔지니어, 특히 아키텍트의 역할이 너무 중요

## 실험과 느낀 점

요즘 "하네싱"을 전제로 다양한 버티컬 SaaS를 여러 개 만들어보고 있음.

**(오픈소스) 유저의 행동을 그대로 보고 그걸 Python, MD, Apple script 등으로 변환하는 제품**

> @imwilliamjung — I built an app that reverse-engineers your workflow.
>
> 1. hit ctrl+opt+r
> 2. do your work
> 3. get result that describe your workflow in MD, python, JSON, playwright, apple script etc.
>
> Forked from @FarzaTV's clicky—thank you for the GOAT base repo.

**(곧) Claude code와 Codex 기반의 AI Browser**

> @imwilliamjung — Octave is faster than Codex!
>
> (This tweet was created by Octave)

그리고 다음의 것을 느낌:

- 하네싱은 유저의 AI Subscription을 소화하며 동작하기 때문에, Outcome 중심의 Pricing, 또는 가상의 직원이라는 프레이밍으로 Pricing 프레임을 잡는 방법이 있음
- 멀티 하네싱 레이어는 생각보다 큰 자산임 (Anthropic은 Gemini랑 Codex 쓸 수 없음)
- Prompt Engineering > Context Engineering > Harnessing > 그 다음은 Intent Orchestration이라고 생각. AI의 의도와 나의 의도가 완전히 일치하고 방향성 설계마저 일부 위임할 수 있는 형태
- 내가 아는 것에 의존하지 말고, 내가 아무것도 모른다고 가정하고 접근해야 진실에 가까웠던 적이 훨씬 많았음. 당연히 AI는 나보다 많은 것을 알고 있기에 내 지식으로 판단하지 말고, 그 검정도 AI한테 맡기는 편이 나옴. 무지에 의존해야하는 아이러니

## 전역까지 80일

이제 정말 거의 남지 않았다. 전역한 뒤에 누구와 무엇을 해야할지에 대해 아직 어떠한 결정도 내리지 않았다.

딱 한 가지 확실한 건, AI Native하게 일해야한다는 점. 그 경험이 앞으로의 일하는 경험을 결정할 것 같음. 적어도 AI Native하지 않게 일하는 팀에서 일하는 게 앞으로 얼마나 도움될지 잘 모르겠음.

하나의 채널에서 영향력을 가지는 것은 너무 중요함. 하나를 골라야한다면 X여야 한다고 생각.
