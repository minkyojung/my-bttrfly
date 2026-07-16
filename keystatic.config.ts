import { config, fields, collection } from '@keystatic/core';

// 프로덕션에서는 어드민 UI/API를 비활성화한다 (로컬 모드는 dev 전용).
// GitHub 모드로 전환하면 이 플래그를 제거하고 storage를 교체한다.
export const showAdminUI = process.env.NODE_ENV === 'development';

export default config({
  storage: { kind: 'local' },
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
        label: fields.text({ label: 'Badge label' }),
        labelColor: fields.text({ label: 'Badge color' }),
        labelTextColor: fields.text({ label: 'Badge text color' }),
        labelImage: fields.text({ label: 'Badge image' }),
        content: fields.markdoc({ label: 'Content', extension: 'md' }),
      },
    }),
  },
});
