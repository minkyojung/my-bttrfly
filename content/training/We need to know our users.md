---
title: We need to know our users
type: training
visibility: private
category: general
priority: medium
date: '2023-10-15'
tags: []
---
##### Date : 2023-10-11 11:24
##### Tag : #디스콰이엇 #PMC_W23 #Ops 
---
#### 1. 목표(Objective)
##### Objective : PMC 참가자를 더 잘 이해하고, 최고의 경험을 제공해 Maker Navigator/Network effect goal을 달성한다
##### Key Result : 
> **Input**
> 	- PMC 참가팀 50팀
> 	- Post Creation
> **Output**
> 	- JTBD 별로 Super User 최소 5팀
> 	- 전원 Full profile
> 	- 채용

#### 2. 배경(Background)
##### 디스콰이엇 유저 이해하기
- 1월 달에 17K였던 유저가 36K까지 증가했다. 증가의 원인에는 PMC S23의 영향력이 컸는데, 이 기간 동안에는 모든 지표가 증가했다. 하지만 코호트에 대한 분석이 이뤄지지 못했고, Operating Cost를 줄일 수 있는 Flywheel을 찾지 못했다.
- 그 결과 PMC에 참석한 사람 중 절반은 목표 달성에 실패했고, W23의 Operating Cost를 줄일만한 S23의 Legacy도 부족하다.
- 이런 추이를 봤을 때 이번 PMC W23에는 더 가파른 폭으로 Sign up 유저가 증가할 것으로 보인다. 행사 규모가 몇 배 이상 커진만큼 비례해서 모든 지표가 상승할 것으로 가정했을 때, 지금 코호트 분석을 진행하는 것은 연말에 급증한 유저들을 포함한 전체 유저를 잘 이해하는 것에 도움을 줄 수 있다.

#### 3. 잘 해결한 케이스
**EO 스쿨**
- 유니콘 하우스한 두잇 이윤석 CEO, 노코드 강의를 진행했던 하희철 대표 등, 다른 VC들을 꾸준히 이후의 행사에도 활용하며 Opearting Cost를 낮췄다. 두잇과 하희철 대표 모두 고객발굴 면에서 만족했기 때문에 EO의 다른 행사에도 참여했다 생각.
- 그리고 그에 걸맞게 하이라이팅을 엄청 잘했다. EO는 Professional한 느낌이 강한데, 그 프레임으로 창업가를 연사급으로 소개
- 정리하면, PMC W23 참가자의 JTBD를 잘 달성시키는 일은 장기적으로 Operating Cost를 만족시키는 일

**Digital Marketer** https://www.digitalmarketer.com/
- 마케터 커뮤니티를 운영하는 Suzi Nelson은 commitment curve를 통해 lurker를 파악하고, activate 시키기 위한 전략을 구상, 5일간의 포스팅을 통해 44%의 lurker를 활성화시켰다. 
- 정리하면, Commitment Curve를 통해 유저들의 현황을 파악하고, lurker 활성화시켰을 때 network effect는 증가한다. 결국 모두에게 좋은 상황.
- 두잇 이윤석 대표같은 사람이 있어도 Active User > Super User까지 오지 않는다면 좋은 자원을 놓치는 것과 같음. 때문에 그들의 니즈를 충족시켜주면서 Super User로 만들 수 있어야함

**Meetup**
- Atkin이 Meetup에 CCO로 있었을당시, 접속 유저는 많지만 이벤트를 호스팅하는 유저의 수가 저조했다. 당시 온보딩 시작 메시지가 '이벤트를 호스팅하세요'였는데 여기서 부담을 느끼고 이탈한다는 것을 발견.
- 마찬가지로 Commitment Curve로 유저를 분석, 온보딩을 더 작은 단위로 쪼개어 진행했다. 결과적으로 이벤트 호스팅 비율 증가시킬 수 있었음.

지금까지 디스콰이엇에 어떤 직군의 사람들이 있는지는 파악해왔지만, 어떤 도메인의 구체적으로 어떤 니즈를 가진 사람들이 있는지는 확인되고 있지 않았다. 한편으로, 올해 초 약 17K였던 유저 수가 약 9개월이 지난 지금 약 36K를 달성했다. PMC를 진행했을 때 모든 지표가 상승했던 것을 감안하면 연말이 되었을 때의 유저 수는 더 가파른 폭으로 증가할 가능성이 있다. 때문에 PMC에서 유저를 세분화해 이해하는 것을 잘 해두면, 가파른 폭으로 유저가 늘었을 때 더 효과/효율적으로 이들을 레버리지할 수 있다.
나아가 Full profile, Network Effect 역시 증가시킬 수 있을 것이다.


#### 4. 가설과 검증전략(hypothesis & Validation Strategy)
- PMC 기간동안 전체 유저를 두 개의 레이블로 분리해 분석해볼 생각이다.
	- **JTBD** : JTBD별로 유저를 나누면 각각 어떤 넛징이 효과적인지 알 수 있다. 이는 Ops cost를 줄일 수 있다.
		- (다만, JTBD를 어떻게 나눌지 고민 필요)
	- **Contribution** : 유저를 기여도를 기준으로 나눴을 때 각각에서 더 높은 기여를 할 수 있도록 넛징할 수 있다. 
		- Super User : Opinion Leader(Manual하게 선정)
		- Contributors : Streak이 좋고, 댓글과 업보트를 많이 활용
		- Regulars : 그냥 잘 읽고, engage하는 사람들
		- Potentials : 자주는 안 보이는데 종종 인사이트 줌. 기여자로 전환시키는게 핵심
		- Neutrals : 가끔 나타나서 댓글 남기고, 글 읽음
		- Observers : Lurker 그 자체. 글 읽으려고 들어옴
		- Inactives : 글 읽으려고 들어왔다가 이제는 자발적으로 방문하지 않음
	> 이렇게 유저를 분석했을 때 JTBD별로 어떤 액션을 취해야 Super Users가 될 수 있을지 알 수 있고, Customized한 넛징을 줄 수 있다는 점에서 Operating Cost를 줄일 수 있다.


- Steps
	- 현재 메이커 상태는 투자, 채용, 구직에 focusing
	- 때문에 제품개발과 고객발굴을 추가할 필요가 있음
	- 


#### 5. GTM
- 
>

#### 6. 원칙 (Guiding Principle)
1. 너무 세분화된 집단으로부터 데이터를 수집하면 특정 패턴을 과대해석할 수 있다. 또한 코호트 별 데이터의 양이 적어 통계적 유의성이 떨어질 수 있다.
2. 불필요한 세분화는 리소스만 낭비시킨다. 분석 프로세스의 효율성을 항상 유의해야한다.
3. 코호트를 잘못 세분화하면 통계적 편향이 생길 수 있다.
> 
#### 7. KPI(Key Performance Indicator)
- 
> 
