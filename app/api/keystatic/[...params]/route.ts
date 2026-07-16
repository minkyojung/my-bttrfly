import { makeRouteHandler } from '@keystatic/next/route-handler';
import config, { showAdminUI } from '../../../../keystatic.config';

// 프로덕션에서는 404 (로컬 모드는 dev 전용)
export const { POST, GET } = showAdminUI
  ? makeRouteHandler({ config })
  : {
      GET: () => new Response(null, { status: 404 }),
      POST: () => new Response(null, { status: 404 }),
    };
