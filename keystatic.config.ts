import { config, fields, collection } from '@keystatic/core';

// GitHub 모드: 어드민은 프로덕션에서도 열리고, 접근은 GitHub 로그인
// (repo 쓰기 권한)으로 게이팅된다. 저장 = git 커밋 → Vercel 자동 배포.
export const showAdminUI = true;

export default config({
  storage: {
    kind: 'github',
    repo: 'minkyojung/my-bttrfly',
  },
  collections: {
    posts: collection({
      label: 'Posts',
      slugField: 'title',
      path: 'content/posts/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        date: fields.date({ label: 'Date', validation: { isRequired: true } }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'Essays', value: 'Essays' },
            { label: 'Interviews', value: 'Interviews' },
            { label: 'Newsletter', value: 'Newsletter' },
            { label: 'Retrospectives', value: 'Retrospectives' },
          ],
          defaultValue: 'Essays',
        }),
        summary: fields.text({
          label: 'Summary',
          description: '프론트페이지 히어로/카드에 노출되는 덱(요약문)',
          multiline: true,
        }),
        cover: fields.text({
          label: 'Cover',
          description: '커버 이미지 경로 (예: /images/covers/xxx.png)',
        }),
        external: fields.text({
          label: 'External URL',
          description: '외부 발행 글이면 원문 URL (Disquiet/Substack 등)',
        }),
        featured: fields.checkbox({
          label: 'Featured',
          description: '프론트페이지 히어로로 노출',
          defaultValue: false,
        }),
        draft: fields.checkbox({
          label: 'Draft',
          description: '체크하면 사이트 전체에서 숨김',
          defaultValue: false,
        }),
        source: fields.select({
          label: 'Source',
          description: '발행 출처 배지 (None이면 배지 미표시)',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Disquiet', value: 'disquiet' },
            { label: 'Substack', value: 'substack' },
          ],
          defaultValue: 'none',
        }),
        content: fields.markdoc({ label: 'Content', extension: 'md' }),
      },
    }),
  },
});
