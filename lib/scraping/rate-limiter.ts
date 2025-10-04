import pLimit from 'p-limit';

// 동시 요청 제한 (기본값: 3)
const limit = pLimit(3);

/**
 * 랜덤 딜레이를 추가하여 사람처럼 행동
 * @param min 최소 밀리초 (기본값: 1000ms)
 * @param max 최대 밀리초 (기본값: 3000ms)
 */
export function randomDelay(min = 1000, max = 3000): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Rate limiting과 함께 여러 작업을 실행
 * @param tasks 실행할 작업 배열
 * @param concurrency 동시 실행 수 (기본값: 3)
 */
export async function executeWithRateLimit<T>(
  tasks: Array<() => Promise<T>>,
  concurrency = 3
): Promise<T[]> {
  const limitedTasks = pLimit(concurrency);

  const promises = tasks.map((task) =>
    limitedTasks(async () => {
      await randomDelay();
      return task();
    })
  );

  return Promise.all(promises);
}

/**
 * 도메인별 Rate limiter
 * 같은 도메인에 대한 요청을 제한
 */
class DomainRateLimiter {
  private lastRequestTime: Map<string, number> = new Map();
  private minDelay: number;

  constructor(minDelayMs = 1000) {
    this.minDelay = minDelayMs;
  }

  async waitForDomain(domain: string): Promise<void> {
    const lastTime = this.lastRequestTime.get(domain) || 0;
    const now = Date.now();
    const timeSinceLastRequest = now - lastTime;

    if (timeSinceLastRequest < this.minDelay) {
      const waitTime = this.minDelay - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime.set(domain, Date.now());
  }
}

export const domainLimiter = new DomainRateLimiter(1000);
