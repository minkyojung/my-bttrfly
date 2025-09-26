export default function Home() {
  return (
    <main className="min-h-screen bg-[#fafafa] px-6 py-12 md:py-20">
      <article className="mx-auto max-w-prose">
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-5xl font-light tracking-tight">
            어디에도 없는 곳
          </h1>
          <a 
            href="/posts/new" 
            className="px-3 py-1 border border-black text-sm rounded hover:bg-black hover:text-white transition-colors"
          >
            + 새 글
          </a>
        </div>
        
        <p className="mb-2 text-lg leading-relaxed">
          서울에서 태어나 뉴욕에서 자랐다. 두 도시 사이 어딘가에 있는 것들을 찾아다닌다.
        </p>
        
        <blockquote className="mb-2 pl-4 border-l-2 border-black italic">
          "사진은 기억하고 싶은 순간들의 흔적이다."
        </blockquote>
        
        <p className="mb-2">
          빛과 그림자, 사람과 공간, 그 사이에서 발견한 이야기들을 모은다.
        </p>

        <h2 className="text-2xl mb-2 mt-6 font-normal">글쓰기</h2>
        <p className="mb-2">
          때로는 글을 쓴다. <em>보이지 않는 것들</em>에 대해서. 
          느낌과 생각의 경계에서 떠오르는 문장들.
        </p>

        <p className="mb-2 font-bold">
          여행은 낯선 곳에서 나를 만나는 과정이다.
        </p>
        
        <ul className="mb-2 list-none">
          <li>— 도쿄의 골목</li>
          <li>— 파리의 카페</li>
          <li>— 제주의 바다</li>
        </ul>

        <p className="mb-2 text-sm uppercase tracking-widest">
          음악을 들으며 걷는다
        </p>
        
        <p className="mb-2">
          도시의 리듬과 나의 발걸음이 만나는 지점. 플레이리스트는 계절마다 바뀐다.
        </p>

        <div className="mb-2 bg-white/50 p-6 -mx-6 rounded">
          <p className="text-xs uppercase tracking-wider mb-2">Daily Ritual</p>
          <p className="text-lg">
            커피는 하루의 시작이자 쉼표다. 
            아침의 첫 모금부터 오후의 마지막 한 잔까지.
          </p>
        </div>

        <p className="mb-2">
          책은 또 다른 여행이다. 문장과 문장 사이를 걸으며 
          작가의 세계를 탐험한다. <span className="underline">밑줄 그은 구절들</span>이 쌓여간다.
        </p>

        <p className="mb-2 text-sm text-black">
          일상의 작은 순간들을 수집한다. 
          창문에 비친 노을, 빗소리, 고양이의 하품. 
          특별할 것 없는 하루가 특별해지는 순간.
        </p>

        <p className="mb-6 text-center text-3xl font-light">
          ✱
        </p>

        <p className="mb-2">
          이 공간은 그런 것들을 담는 곳이다. 
          완성되지 않은 생각들과 계속되는 이야기들.
        </p>

        <div className="mt-16 pt-8 border-t border-black">
          <p className="text-sm mb-2">
            <a href="/posts" className="underline">모든 글 보기 →</a>
          </p>
          <p className="text-sm">
            <a href="mailto:hello@example.com" className="underline">hello@example.com</a>
          </p>
          <p className="text-xs mt-2 text-black">
            © 2024 · Seoul / NYC
          </p>
        </div>
      </article>
    </main>
  );
}