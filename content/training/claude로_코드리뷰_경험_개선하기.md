---
title: claude로 코드리뷰 경험 개선하기
type: training
visibility: private
category: technical
priority: high
date: '2025-05-20'
tags:
  - AI
---
## Claude로 코드리뷰 경험 개선하기
##### 2024-07-01T04:23:00.000Z
##### 28799

<p><img src="https://media.disquiet.io/images/makerlog/6bc9336f634cece2466ae3dffb30d823a76bb8f9c482adba175713298cf60086" alt="sense of product og img.png" title="sense of product og img.png">AI 모델의 발전이 워낙 빠르다보니 분기마다 애용하는 AI 모델이 바뀌는 것 같아요. 이번에는 Claude가 그 주인공인데요. 이번에 발표된 Claude 3.5 Sonnet, Artiact, Project 등의 기능으로 인해 특히 개발자들이 GPT 구독을 취소하고 Claude로 넘어갔습니다.</p><p><img src="https://media.disquiet.io/images/makerlog/304d2ce1ffbf254456b3cb8557f48b00c54d76302862d22e5da0dff69c8049b9" alt="x.png" title="x.png"></p><p>어떤 포인트에서 Claude가 개발자에게 좋은 인상을 남길 수 있었던 것일까요? 그리고 어떻게 활용해볼 수 있을까요? 이번 글에서는 아래의 내용을 다룰 예정이에요.</p><p></p><p><strong>이번 글 요약</strong></p><ul class="list-disc"><li><p>일을 하는 과정에서 발생하는 문제는 기능적 문제와 감정적 문제가 있어요. 이때, 기능적 문제를 최대한 AI에게 위임하고 감정적 문제에 시간을 더 사용해볼 수 있어요.</p></li><li><p>pre-commit 훅을 활용한 코드리뷰 경험 개선해본 경험을 소개해요.</p></li><li><p>특히 Claude는 XML 태그로 프롬프트 정확도 높이는 방법을 추천해요</p></li></ul><p></p><hr class="my-4 border-none bg-gray-300 h-[1px]"><p></p><p>일을 하다보면 인지하지 못하지만 반복적으로 사용하는 시간이 있어요. 대표적으로 아래와 같아요.</p><p><img src="https://media.disquiet.io/images/makerlog/89f9b14df3bbab5f9127cbb2b8d4b6ce307842b0a98752b84d66bda3f611cf9e" alt="Screenshot 2024-07-29 at 1.01.51 PM.png" title="Screenshot 2024-07-29 at 1.01.51 PM.png"></p><p>이렇게 표로 정리하면 간단하지만, 대부분의 사람들이 결과물을 만들어내는 과정에서 많은 어려움과 스트레스를 받곤 합니다. 왜냐하면 대부분 감정적인 문제가 결합되어 상황을 더 복잡하게 만들기 때문이에요.</p><p>개발자의 업무로 예를 들어보면 아래와 같을 수 있어요.</p><p></p><ol class="list-decimal"><li><p><strong>코드리뷰</strong></p><ol class="list-decimal"><li><p>기능적 문제 — 리뷰를 기다리면서 개발일정이 지연됨. 이해하기 어려운 코드를 해석하는 시간이 소요</p></li><li><p>감정적 문제 — 내 의견을 효과적으로 전달하는 것이 어렵고, 반대로 피드백을 받을 때 방어기재가 작동</p></li></ol></li><li><p><strong>리팩토링</strong></p><ol class="list-decimal"><li><p>기능적 문제 — 리팩토링과 새로운 기능개발 중 어디에 얼만큼의 시간을 써야할지 모르겠음</p></li><li><p>감정적 문제 — 리팩토링의 필요성을 동료 또는 상급자에게 설득하기 어려움</p></li></ol></li></ol><p></p><p>이처럼 하나의 문제를 기능적 문제와 감정적 문제로 나눠볼 수 있는데요. 이 과정에서 AI를 활용하면 기능적 문제에 들이는 비용을 최대한 줄이고, 감정적 문제에 더 많은 시간을 사용해볼 수 있어요. 예를 들면, AI로 피드백 또는 의견을 설득력있게 정리하거나, 공격적인 피드백을 건설적이고 긍정적인 톤으로 바꿔볼 수도 있죠.</p><p></p><p>그래서 오늘은 개발자가 가장 많이 반복하는 일 중 하나인, 코드리뷰 경험을 개선한 과정을 적어봤어요.</p><p></p><p></p><p></p><h1>문제상황</h1><p>디스콰이엇은 오퍼레이터도 필요한 경우에 코딩을 하는데요. 아무래도 전업 개발자는 아니다보니 작성한 코드가 적합한지, 나의 수정사항으로 발생할 수 있는 리스크는 없을지 우려가 돼요. 그런데 마침 Claude 3.5 Sonnet이 공개되었고, 코드 생성뿐만 아니라 리팩토링, 의도파악에서 강점을 보인다는 것을 보고 코드리뷰 과정에서 활용했어요.</p><p></p><p></p><p></p><h1>솔루션 — pre-commit 훅을 활용한 코드리뷰 개선</h1><p>Claude를 활용해 개선한 코드리뷰 경험은 아래의 순서로 진행했어요.</p><ol class="list-decimal"><li><p>코드리뷰를 원할 때 명령어를 입력합니다.</p></li><li><p>그럼 코드베이스에서 변경된 파일을 감지하고, 이 파일의 내용을 Claude에게 전송합니다.</p></li><li><p>Claude는 코드를 분석하고, 변경사항에 의한 잠재적인 문제, 개선사항, 최적화 방안 등을 제안합니다.</p></li><li><p>Claude의 피드백을 확인하고, 필요한 경우 코드를 수정하고 커밋을 진행합니다.</p></li></ol><p></p><p></p><p></p><h1>방법</h1><h2>1. .git/hooks/에 pre-commit.manual 생성</h2><ul class="list-disc"><li><p>.git 폴더가 숨겨져있을 경우 숨겨짐 해제</p></li><li><p>언어는 자율적으로 변경.</p></li></ul><pre><code>#!/bin/bash

# 프로젝트의 루트 디렉토리로 이동
cd "$(git rev-parse --show-toplevel)"

# .env.local 파일에서 환경 변수 로드
source ./.env.local

# 수정된 JavaScript 파일들을 찾음
files=$(git diff --cached --name-only --diff-filter=ACM | grep ".js$")

for file in $files
do
    # 파일의 전체 내용을 가져옴
    full_content=$(cat "$file")
    
    # 변경된 내용만 가져옴
    changed_content=$(git diff --cached "$file" | grep '^[+-]' | grep -v '^[-+][-+][-+]' | sed 's/^[+-]//')
    
    if [ -n "$changed_content" ]; then
        # Claude API에 보낼 JSON 페이로드 생성
        json_payload=$(jq -n \
            --arg full_content "$full_content" \
            --arg changed_content "$changed_content" \
            --arg prompt "다음 JavaScript 파일의 전체 내용과 변경 사항을 검토해주세요. 변경 사항으로 인해 생길 수 있는 문제점과 개선 방안을 제안해주세요:" \
            '{ "model": "claude-3-5-sonnet-20240620", "max_tokens": 1024, "messages": [ {"role": "user", "content": ($prompt + "\n\n전체 파일 내용:\n" + $full_content + "\n\n변경된 내용:\n" + $changed_content)} ] }')

        # Claude API 호출
        if ! response=$(curl -s -w "\n%{http_code}" https://api.anthropic.com/v1/messages \
            -H "Content-Type: application/json" \
            -H "x-api-key: $CLAUDE_API_KEY" \
            -H "anthropic-version: 2023-06-01" \
            -d "$json_payload")
        then
            echo "에러: API 요청 실패"
            exit 1
        fi

        # HTTP 상태 코드와 응답 본문 분리
        http_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | sed '$d')

        if [ "$http_code" -ne 200 ]; then
            echo "에러: API가 상태 코드 $http_code를 반환했습니다"
            echo "$body"
            exit 1
        fi

        # JSON 응답에서 리뷰 내용 추출
        review_content=$(echo "$body" | jq -r '.content[0].text')
        echo "Claude의 $file 파일에 대한 리뷰:"
        echo "$review_content"

        # 사용자에게 커밋 진행 여부 확인
        read -p "커밋을 진행하시겠습니까? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        echo "에러: $file 파일의 내용이 비어있습니다"
        exit 1
    fi
done

exit 0</code></pre><ul class="list-disc"><li><p>이후 스크립트에 실행권한을 부여합니다.</p></li></ul><pre><code>chmod +x .git/hooks/pre-commit.manual</code></pre><p></p><h2>2. 수동실행 스크립트 생성</h2><pre><code>#!/bin/bash

# 수동으로 pre-commit 훅 실행
.git/hooks/pre-commit.manual</code></pre><ul class="list-disc"><li><p>마찬가지로 실행권한 부여</p></li></ul><pre><code>chmod +x run-pre-commit.sh</code></pre><p></p><h2>3. npm 스크립트 추가</h2><ul class="list-disc"><li><p>package.json 파일의 scripts 섹션에 아래의 내용 추가</p><pre><code>{
  "scripts": {
    "precommit": "./run-pre-commit.sh"
  }
}</code></pre><p></p></li></ul><h2>4. 환경변수 설정</h2><ul class="list-disc"><li><p>.env.local 파일을 생성하고 Claude API 키 설정</p><pre><code>CLAUDE_API_KEY="your_API_key"</code></pre></li></ul><p></p><h2>5. 사용하기</h2><pre><code>git add .
npm run precommit</code></pre><p></p><p></p><p></p><h1>결과</h1><p>테스트를 위해 내부적으로 개발해 사용하는 SaaS의 코드에서 변수 하나를 수정한 뒤, precommit을 진행해봤어요. 그리고 아래와 같은 결과과 나왔는데요. 터미널에서 결과물을 확인해야하는만큼 가독성이 중요하지만, 오퍼레이터인 제 입장에서 이해가 어려운 표현이 있어 그래서 무엇을 해야하는지 감이 오지 않았어요.</p><p></p><p>그래서 프롬프트 개선해봤습니다.</p><pre><code>Claude's review for pages/index.js:
변경된 내용을 검토해보면 다음과 같은 문제점과 개선 방안을 제안할 수 있습니다:

1. 문제점: 불필요한 state 추가
   - `utmhahaha`와 `setUtmhahaaha`가 추가되었지만 실제로 사용되지 않습니다.
   개선 방안: 사용하지 않는 state는 제거하는 것이 좋습니다.

2. 문제점: 오타
   - `setUtmhahaaha`에 오타가 있습니다 ('hahaha'가 아닌 'hahaaha').
   개선 방안: 오타를 수정하거나, 불필요한 경우 제거합니다.

3. 문제점: 중복된 닫는 중괄호
   - 파일 끝에 중복된 닫는 중괄호(`}}`)가 있습니다.
   개선 방안: 불필요한 중괄호를 제거합니다.

4. 개선 사항: UTM 파라미터 관리
   - UTM 파라미터들(source, medium, campaign, content)을 개별 state로 관리하고 있습니다. 이를 하나의 객체로 관리하면 코드를 더 간결하게 만들 수 있습니다.
   개선 방안:
   ```javascript
   const [utmParams, setUtmParams] = useState({
     source: "",
     medium: "",
     campaign: "",
     content: ""
   });
   ```

5. 개선 사항: URL 검증
   - URL 입력에 대한 유효성 검사가 없습니다.
   개선 방안: URL 형식을 검증하는 함수를 추가하고, 잘못된 URL 형식에 대한 에러 처리를 추가합니다.

6. 개선 사항: 에러 처리
   - 현재 콘솔에만 에러를 출력하고 있습니다.
   개선 방안: 사용자에게 에러 메시지를 표시하는 UI 요소를 추가합니다.

7. 개선 사항: 로딩 상태 표시
   - 로딩 중일 때 단순히 "Loading..."이라고만 표시하고 있습니다.
   개선 방안: 로딩 스피너나 프로그레스 바 등을 사용하여 사용자 경험을 개선합니다.

8. 개선 사항: 복사 기능 피드백
   - URL을 복사할 때 사용자에게 피드백을 주지 않고 있습니다.
   개선 방안: 복사 성공 시 토스트 메시지나 알림을 표시합니다.

이러한 개선사항들을 적용하면 코드의 품질과 사용자 경험을 향상시킬 수 있을 것입니다.</code></pre><p></p><p></p><p></p><h1>Claude 프롬프트 정확도를 높이는 방법</h1><p>Claude는 공식 문서에서도 XML 태그를 활용해 AI의 집중력을 높이라고 말합니다. 장점은, HTML처럼 사전에 정의된 태그만 사용할 필요가 없다보니 맥락에 맞게 태그를 구성할 수 있었어요. 그리고 XML 태그 단위로 관리하다보니 프롬프트를 빠르게 조정하고 싶을 때 직관적인 수정이 가능했고요.</p><p>그래서 다음과 같이 변경했습니다.</p><pre><code>[기존 프롬프트]
다음 JavaScript 파일의 전체 내용과 변경 사항을 검토해주세요.</code></pre><p></p><pre><code>[개선한 프롬프트]

&lt;요청&gt;
다음 JavaScript 파일의 전체 내용과 변경 사항을 검토해주세요.

            
&lt;배경&gt;
- 이 코드는 팀 내부적으로 사용하는 SaaS이고, 한 사람이 관리하기 때문에 리팩토링 자주 하지 않아도 됨
- 코드리뷰는 코드리뷰어가 코드를 이해하고 있는지 확인하는 것이 목적이며, 리팩토링은 필요에 따라 진행함
- 프로그래밍에 능숙하지 않은 사람도 리뷰할 수 있기 때문에 최대한 쉽고, 구체적이고, 상세하게 리뷰해주세요

            
&lt;응답&gt;
아래의 구조로 답할 것. 단, 변경된 사항, 잠재적 위험, 개선방안, 변경된 사항.. 순서가 아니라 변경된 사항/잠재적 위험/개선방안을 묶어서 한 번에 답변할 것
- 변경된 사항 : &lt;설명&gt;
- 잠재적 위험 : &lt;설명&gt;
- 개선방안 : &lt;설명&gt;
</code></pre><p>프롬프트를 조정하고 나니, 눈에 띄는 개선이 있었어요. 개선된 결과는 아래에서 볼 수 있어요.</p><p></p><ul class="list-disc"><li><p>변경사항에 기반해 개발자가 의도했던 것을 추론하고 더 나은 수정방안을 제안</p></li><li><p>코드중복과 확장성을 높일 수 있는 방안 제안 (리팩토링 아이디어)</p></li><li><p>제품 내 UI의 목적과 사용법을 더 명확히 전달할 수 있는 UX/UI 제안</p></li><li><p>개발자들이 자주 놓칠 수 있는 에러처리를 짚어줌</p></li><li><p>비개발자도 이해할 수 있도록 쉽게 설명</p></li></ul><p></p><p>결과적으로 코드를 수정하고, 개발자 분들에게 <u>리뷰를 요청하면 피드백까지 30~40분 정도 걸렸던 과정을 15초로 줄일 수 있었어요.</u> 이 과정이 반복되며 복리로 시간이 절약되면 아껴진 시간에는 더 많은 생산을 하거나, 창의적인 사고, 사람 간의 문제를 해결하기 위해 시간을 써볼 수 있을 것 같습니다.</p><pre><code>[개선된 결과]

- 변경된 사항: 
코드에 두 가지 새로운 state 변수가 추가되었습니다:
1. `utmContent`와 `setUtmContent`: UTM 콘텐츠 파라미터를 위한 state입니다.
2. `utmhahaha`와 `setUtmhahaaha`: 목적이 불분명한 state 변수가 추가되었습니다.

- 잠재적 위험:
1. `utmhahaha` state 변수는 실제로 사용되지 않고 있어 불필요한 코드입니다. 이는 코드의 가독성을 떨어뜨리고 혼란을 줄 수 있습니다.
2. `utmContent`는 추가되었지만, 이를 처리하는 로직이 완전히 구현되지 않았을 수 있습니다. 예를 들어, UTM 파라미터를 추출하고 설정하는 함수들에서 `utmContent`를 고려하지 않을 경우 기능이 제대로 동작하지 않을 수 있습니다.

- 개선방안:
a) 불필요한 상태 제거:
      만약 `utmhaha`가 필요하지 않다면, 관련 코드를 모두 제거하세요.

   b) 의도한 기능 추가:
      만약 새로운 UTM 파라미터를 추가하려는 의도였다면:
      - 상태 변수의 이름을 의미 있게 변경하세요 (예: `utmTerm`).
      - input 필드의 placeholder를 적절히 수정하세요 (예: "UTM Term").
      - `insertUTMParams` 함수에 새 파라미터 처리 로직을 추가하세요:
        ```javascript
        if (utmTerm) {
          params.set("utm_term", utmTerm);
        }
        ```

   c) 코드 구조 개선:
      - UTM 파라미터들을 객체로 관리하여 코드 중복을 줄이고 확장성을 높일 수 있습니다:
        ```javascript
        const [utmParams, setUtmParams] = useState({
          source: "",
          medium: "",
          campaign: "",
          content: "",
          term: ""
        });
        ```
      - 이를 통해 input 필드 생성과 `insertUTMParams` 함수를 더 간결하게 만들 수 있습니다.

   d) 사용자 경험 개선:
      - 새로운 UTM 파라미터 필드를 추가할 때, 사용자에게 그 목적과 사용법을 명확히 설명하는 레이블이나 툴팁을 제공하세요.

   e) 에러 처리:
      - `insertUTMParams` 함수에 잘못된 URL이 입력될 경우를 대비한 에러 처리를 추가하세요.</code></pre><p></p><p></p><p></p><h1>일이 안되는 이유를 이해하기</h1><p>이 과정의 본질은 ‘변경사항 중심으로 컨텐츠를 만드는 것’인데요. PR 메세지, 문서화, 빌딩 인 퍼블릭 등 코드변화로 인해 만들어야했던 다양한 컨텐츠를 AI의 도움을 받아 만들 수 있어요. 특히 AI가 구조적 사고와 의도파악을 잘하기 때문에 내가 이러한 분야에 자신이 없다면 충분히 활용해볼 수도 있고요.</p><p></p><p>실제로 많은 개발자 분들이 지난 설문에서 업무 시, 코파일럿을 활용하신다고 답변하시기도 했습니다.</p><p><img src="https://media.disquiet.io/images/makerlog/71bf07d7cb37e32f0069aadd4a29c9d702d838e79afb406d44194a09d4e70280" alt="Untitled.png" title="Untitled.png"></p><p></p><p>하지만 대부분의 ‘일이 안되는 이유’는 기능적 문제가 아니라, 감정적 문제에서 온다는 것을 동시에 이해해야 해요. 그렇기 때문에 AI를 활용한 생산량이 높아진다면 동시에 확보된 시간에는 팀을 동기부여하고, 복잡한 관계를 관리하고, 자주 소통하며 서로의 상태를 잘 이해하는 역량이 경쟁력이 되는 셈입니다. 그리고 이건 개발자뿐만 아니라 모든 직군에 해당할 수 있어요.</p><p></p><p></p><p></p><h1>AI로 생산성을 높인 팁을 댓글에 공유해주세요!</h1><ul class="list-disc"><li><p>어떤 업무에서 AI의 도움을 받고 있나요?</p></li><li><p>AI로 시간이 확보된다면, 확보된 시간에는 무엇에 더 집중해보고 싶나요?</p></li></ul><p></p><p></p><hr class="my-4 border-none bg-gray-300 h-[1px]"><p><strong>기타 Claude 활용 팁</strong></p><ul class="list-disc"><li><p>Claude101 — <a target="_blank" rel="noopener noreferrer nofollow" class="text-blue-500 hover:text-blue-300 no-underline text-blue-500 hover:text-blue-300 no-underline text-blue-500 hover:text-blue-300 no-underline text-blue-500 hover:text-blue-300 no-underline text-blue-500 hover:text-blue-300 no-underline" href="https://beginswithai.com/how-to-use-claude-for-coding/">https://beginswithai.com/how-to-use-claude-for-coding/</a></p></li><li><p>Sonnet 3.5 Coding System Prompt (v2 with explainer) —<a target="_blank" rel="noopener noreferrer nofollow" class="text-blue-500 hover:text-blue-300 no-underline text-blue-500 hover:text-blue-300 no-underline text-blue-500 hover:text-blue-300 no-underline text-blue-500 hover:text-blue-300 no-underline text-blue-500 hover:text-blue-300 no-underline" href="https://www.reddit.com/r/ClaudeAI/comments/1e39tvj/sonnet_35_coding_system_prompt_v2_with_explainer/">https://www.reddit.com/r/ClaudeAI/comments/1e39tvj/sonnet_35_coding_system_prompt_v2_with_explainer/</a></p></li><li><p>Something Claude 3.5 taught me — <a target="_blank" rel="noopener noreferrer nofollow" class="text-blue-500 hover:text-blue-300 no-underline text-blue-500 hover:text-blue-300 no-underline text-blue-500 hover:text-blue-300 no-underline text-blue-500 hover:text-blue-300 no-underline text-blue-500 hover:text-blue-300 no-underline" href="https://www.reddit.com/r/ClaudeAI/comments/1eavhvh/something_claude_35_taught_me/">https://www.reddit.com/r/ClaudeAI/comments/1eavhvh/something_claude_35_taught_me/</a></p></li></ul>
