---
title: 제품개발을 주저하는 비개발자를 위해
date: '2024-09-04'
source: disquiet
category: Interviews
canonical: 'https://disquiet.io/articles/34s7Yl'
---

**제품개발을 주저하는 비개발자를 위해**

![sense of product og img.png](/images/uploads/disquiet-non-developer-1.png "sense of product og img.png")

Cursor가 또 하나의 킬링피처, Composer를 공개했습니다. 기존에는 필요하는 코드를 생성했지만, Composer는 파일을 생성하고 파일 간의 관계를 만들며 직접 코드를 실행할 수 있다는 점이 가장 큰 차이에요.

결과적으로 기술의 민주화가 더 가까워졌는데요, 그렇다보니 직접 제품을 만들고 싶었던 비개발자에게는 황금기가 아닐까 싶어요. 저 또한 비개발자의 입장에서 지난 주말에 Composer를 사용해봤는데요, 그 과정에서 발견한 팁과 가이드를 정리해봤어요 :)

이런 내용을 다룰 예정이에요.

*   8살짜리 아이도 앱을 런칭할 수 있게 되었어요. 이제 제품개발의 유일한 허들은 코딩에 대한 막연한 두려움 뿐이에요.
    
*   제품개발의 난이도는 글쓰기와 비슷해지고 있어요. 좋은 글을 쓰기 위해서는 양질의 경험과 지식이 필요한 것처럼, 좋은 제품을 만들기 위해서는 세상에 존재하는 기술을 이해하고, 다양한 경험을 가지는 것이 중요해요.
    
*   유용한 프롬프트 팁을 소개합니다. 백지 상태에서 어떻게 시작해야할지 모르겠다면 참고해보세요.
    

## 막연한 두려움

![Group 7.png](/images/uploads/disquiet-non-developer-2.png "Group 7.png")

Composer가 공개되기 이전에도 이미 Cursor는 완성도가 높은 제품이었어요. 위의 이미지는 8살짜리 아이가 Cursor의 AI 기능으로 챗봇을 개발하는 영상인데요. 영상 속 아이는 45분 동안 오로지 AI와의 소통만으로 AI 챗봇을 만들었어요.

이 아이가 AI를 활용해 제품을 만들었다는 것은, 이제 누구나 제품을 만들 수 있는 시대가 왔다는 것을 의미해요. 이런 상황에서 차별점을 만드는 것은 결국 진짜 문제를 발견하고, 빨리 실행하는 자세라고 생각해요. 이런 관점에서 오히려 개발에 대한 막연한 두려움, 심리적 허들이 제품개발을 지연시키는 가장 큰 원인인데요. 아예 아무것도 모른다면 두려움도 없겠지만, 어깨너머로 본 개발이 너무 어려워보였기 때문에 막연한 두려움이 생기는 것이죠.

그래서 이번 글에서는 비개발자 입장에서 제품 개발을 바로 시작할 수 있는 초기 가이드를 적어봤습니다.

> 참고 : 이번 글은 터미널만 보면 두려워지는 비개발자를 위해 작성되었어요 :)

## 사용할 것

*   Cursor
    
*   Next.js / Tailwind CSS
    
*   Shadcn UI
    

## 인트로

우선, 빠르게 아래 과정을 통해 기본적인 환경을 만들어볼까요? 이번 가이드에서는 Next.js를 사용할 예정이에요. Next.js는 마치 레고 세트처럼 필요한 부품들이 준비되어 있어 빠르고 쉽게 기능을 추가할 수 있습니다. 또 페이지로드가 빠르고, 검색 엔진에 최적화되어 있고요.

아래의 순서로 시작해볼까요?

## 1\. Cursor 다운로드

아래 링크를 들어가서 Cursor를 다운로드해주세요. Composer 기능을 이용하려면 유료 플랜을 결제해야합니다.

## 2\. Next.js 앱을 생성

Cursor에서 터미널을 실행한 다음 아래의 명령어를 작성해주세요.

```
npx create-next-app@latest --typescript
```

그럼 연달아 6개의 질문을 하는데요. 지금은 각 항목이 무엇인지 자세히 몰라도 괜찮으니 별도의 선택지 변경없이 미래 선택된 것들을 따라가면 됩니다. 그럼 필요한 파일들이 자동생성돼요.

```
? What is your project named? > 프로젝트명 입력
? Would you like to use ESLint? > No / Yes
? Would you like to use Tailwind CSS? > No / Yes
? Would you like to use `src/` directory? > No / Yes
? Would you like to use App Router? (recommended) > No / Yes
? Would you like to customize the default import alias (@/*)? > No / Yes
```

## 3\. 파일구조

![Frame 4.png](/images/uploads/disquiet-non-developer-3.png "Frame 4.png")

그럼 이런 파일들이 설치되어 있는데요, 자주 들여다볼 파일/폴더는 이렇습니다.

*   src → 필요한 소스를 저장하는 곳입니다.
    
    *   **global.css** → 프로젝트 전체에 적용되는 스타일을 정의하빈다.
        
    *   **layout.tsx** → 헤더나 푸터같이 페이지에 공통적으로 적용되는 레이아웃을 설정합니다.
        
    *   **page.tsx** → 개발 페이지의 내용을 작성하는 곳이빈다. 여러 페이지를 만들고 싶다면 page.tsx를 여러 개 생성하면 됩니다. layout.tsx에서 정의한 레이아웃에 따라 구조화됩니다.
        

## 4\. npm run dev

터미널 아래의 명령어를 실행합니다. 그럼 [localhost](http://localhost/)~로 시작하는 링크가 틀텐데요, 브라우저를 통해 해당 URL로 접속하면 여러분이 수정하는 코드의 결과물을 보실 수 있어요.

```
npm run dev
```

## 5\. Shadcn UI 설치

![Sep-04-2024 14-11-17.gif](/images/uploads/disquiet-non-developer-rescued-1.webp "Sep-04-2024 14-11-17.gif")예를 들어, 위의 UI를 자연어 프롬프트로 만드는 일은 굉장히 어렵고 복잡한데요. 그래서 미리 디자인된 컴포넌트들을 활용하면 제품개발 시간을 단축시킬 수 있어요. 뿐만 아니라 AI가 발산적인 결과물을 생성하지도 않죠.

이번에는 Shadcn UI라는 컬렉션을 사용할 예정인데요, 설치를 위해 터미널에 아래의 명령어를 입력해주세요. 이후에 이어지는 질문 역시 미리 지정되어 있는 선택지를 변경하지 않고 진행해주세요.

```
npx shadcn@latest init
```

```
✔ Which style would you like to use? › New York
✔ Which color would you like to use as the base color? › Zinc
✔ Would you like to use CSS variables for theming? … no / yes
```

여기까지 왔다면, 아래의 명령어를 입력해주세요. Shadcn UI가 가진 컴포넌트를 다운로드 받을 순서에요.

```
npx shadcn@latest add 
```

![Sep-03-2024 13-22-44.gif](/images/uploads/disquiet-non-developer-rescued-2.webp "Sep-03-2024 13-22-44.gif")

명령어를 실행하면 어떤 컴포넌트를 설치할지 뜨는데요, 'a'를 클릭하면 컴포넌트 전체를 한 번에 선택할 수 있습니다. 선택이 끝났다면 엔터를 눌러주세요.

![Screenshot 2024-09-03 at 1.24.58 PM.png](/images/uploads/disquiet-non-developer-6.png "Screenshot 2024-09-03 at 1.24.58 PM.png")

그럼 component/ui라는 폴더가 생성되었고, 모든 컴포넌트가 설치된 것을 확인할 수 있습니다.

## 6\. Composer 활성화

![Screenshot 2024-09-04 at 2.17.11 PM.png](/images/uploads/disquiet-non-developer-7.png "Screenshot 2024-09-04 at 2.17.11 PM.png")

마지막으로 세팅에 들어가 Composer를 활성화(enabled)하면 필요한 준비는 끝입니다!

## 코드 말고 결과물에만 집중하기

제품개발에 필요한 방향성, 컴포넌트가 준비되었어요. 이제부터는 코드보다 AI와 AI가 생성하는 결과물에 더 집중해야 하는데요. 이때 AI와 효과적으로 소통하는 방법 3가지를 정리해봤어요.

## 1\. AI에게 구조화 맡기기

기본적으로 소프트웨어는 복잡도가 높아요. 그래서 필요한 기능과 컴포넌트를 일일이 명령하는 것이 귀찮고 기능이 복잡할수록 구조적이고 명료하게 전달하는 일도 어렵습니다.

이럴 때는 AI 에게 구조적인 사고를 위임할 수 있는데요, Curosr는 코드베이스 전체를 읽을 수 있기 때문에 이런 프롬프트를 작성해볼 수 있습니다.

```
[프롬프트]

에어비엔비 같이 숙소를 검색하고 탐색하는 디렉토리 사이트를 만들기 위해서는 @ui(컴포넌트들이 설치된 폴더 멘션하며)에서 어떤 컴포넌트를 활용해야할까?
```

```
[답변]

에어비엔비와 같은 숙소 검색 및 탐색 디렉토리 사이트를 만들기 위해 shadcn/ui에서 활용할 수 있는 주요 컴포넌트들은 다음과 같습니다:

1. Card: 각 숙소 정보를 표시하는 데 사용할 수 있습니다.
2. Input: 검색어 입력에 사용됩니다.
3. Select: 지역, 숙소 유형 등을 선택하는 데 사용할 수 있습니다.
4. DatePicker (Calendar): 체크인/체크아웃 날짜 선택에 활용할 수 있습니다.
5. Slider: 가격 범위 설정에 사용할 수 있습니다.
6. Checkbox: 편의시설 등의 필터 옵션 선택에 사용됩니다.
7. Button: 검색 버튼이나 기타 액션 버튼으로 사용됩니다.
8. Tabs: 다양한 숙소 유형이나 카테고리를 나누는 데 사용할 수 있습니다.
9. Pagination: 검색 결과 페이지 네비게이션에 사용됩니다.
10. Dialog: 상세 정보 표시나 예약 확인 등에 사용할 수 있습니다.
11. Avatar: 호스트 프로필 이미지 표시에 사용할 수 있습니다.
12. Badge: 특별 할인이나 슈퍼호스트 표시 등에 활용할 수 있습니다.
13. Tooltip: 추가 정보를 제공하는 데 사용할 수 있습니다.
14. ScrollArea: 긴 목록을 스크롤 가능하게 만드는 데 사용할 수 있습니다.
15. Separator: 섹션을 구분하는 데 사용할 수 있습니다.

이러한 컴포넌트들을 조합하여 사용하면 에어비엔비와 유사한 인터페이스를 구현할 수 있습니다. 실제 구현 시에는 이 컴포넌트들을 적절히 배치하고 스타일링하여 사용자 경험을 최적화해야 합니다.
```

```
[프롬프트]

그럼 저 컴포넌트를 활용해서 에어비엔비 사이트를 만들어줘
```

결과물 :

![Screenshot 2024-09-03 at 2.18.26 PM.png](/images/uploads/disquiet-non-developer-8.png "Screenshot 2024-09-03 at 2.18.26 PM.png")

미리 디자인된 UI를 사용한 덕에 30초도 안되서 이런 결과물을 뽑아낼 수 있었어요. 자세히보면 깨진 UI들이 있지만 이걸 고치는 작업은 비교적 쉽습니다.

## 2\. 캡쳐하고 붙여넣기

그런데 만약 정말 사용하고 싶은 디자인의 UI가 있지만, 설치한 컴포넌트 내에서는 구현이 어려운 경우가 있어요. 그럼 만들고 싶은 디자인을 캡쳐한 다음, AI에게 맡길 수 있습니다. 에어비엔비에서 숙소 카드를 더 에어비엔비스럽게 바꿔볼까요?

\[에어비엔비 UI\]

![Screenshot 2024-09-03 at 3.10.17 PM.png](/images/uploads/disquiet-non-developer-9.png "Screenshot 2024-09-03 at 3.10.17 PM.png")

\[바뀐 UI\]

![Screenshot 2024-09-03 at 3.06.18 PM.png](/images/uploads/disquiet-non-developer-10.png "Screenshot 2024-09-03 at 3.06.18 PM.png")

## 3\. AI의 주의력 활용하기

마지막으로 특정 함수명, 파일명, 상황, 상태 등을 직접적으로 지정해 AI가 어떤 부분을 봐야하는지 지정해주면 같은 양의 토큰에서도 더 양질의 답변을 얻을 수 있습니다.

예)

```
{컴포넌트}를 {액션}했을 때 {상태} 되었으면 좋겠어
```

## 4\. Instruction 파일 업로드하기

AI 출력물의 일관성과 효율을 위해 마크다운 형식으로 instruction을 미리 만들어두는 방법도 있어요. 저는 prompt 폴더를 하나 만들고, 아래의 디렉토리에서 적합한 프롬프트를 마크다운(.md) 형식으로 저장해두었습니다. 덕분에 복잡한 지시사항을 간결하게 만들 수 있었고요.

아래 링크는 위의 과정을 거쳐 3시간만에 만들어본 디스콰이엇 광고 소개 페이지입니다. 제가 코드를 직접 수정한 것은 아예 없고, 오로지 AI만 활용했어요!

*   ![Sep-04-2024 15-06-25.gif](/images/uploads/disquiet-non-developer-rescued-3.webp "Sep-04-2024 15-06-25.gif")
    

## 그 외의 Composer 활용사례

*   Composer로 2분만에 Supabase 연동하기
    

*   Composer로 3분만에 제품 기능 런칭하기
    

*   Composer와 유사한 기능을 무료로 제공하는 Aider 사례
    

*   일레븐랩스의 디자인 헤드가 작성한 비개발자가 Composer와 일레븐랩스 API로 제품 개발하는 법
    

## PMC S24 - 120명이 넘는 메이커와 제품 만들 기회

AI의 출력값은 사용자의 경험의 한계를 뛰어넘을 수 없어요. 이걸 다르게 생각해보면, 사용자의 경험에 따라 출력값의 형태가 달라질 수 있는 것인데요. 만약 내가 디자이너라면, 피그마로 필요한 UI를 빠르게 만들고 그 이미지로 프롬프트를 작성할 수도 있습니다. 만약 기획자라면, 문제정의와 요구사항을 간결하게 문서화해 그걸 프롬프트로 활용해볼 수도 있죠.

이번에 모집 중인 PMC S24에는 현재 120팀이 넘게 지원했습니다. 전부 개발자 분들만 있는 것도 아니고요.

제품개발을 직접 해보고 싶지만 망설이는 비개발자 분들이 있다면, AI로 여러분들이 만들어보고 싶었던 것들을 꼭 만들어보셨으면 좋겠습니다!
