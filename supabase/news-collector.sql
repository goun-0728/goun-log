create table if not exists news_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  keyword text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists collected_news (
  id uuid primary key default gen_random_uuid(),
  source_name text,
  keyword text not null,
  original_title text not null,
  original_url text not null unique,
  published_at timestamptz,
  summary text,
  ai_comment text,
  status text not null default 'collected',
  created_at timestamptz not null default now(),
  constraint collected_news_status_check
    check (status in ('collected', 'drafted', 'ignored'))
);

create index if not exists collected_news_status_idx
  on collected_news (status);

create index if not exists collected_news_created_at_idx
  on collected_news (created_at desc);

create index if not exists collected_news_keyword_idx
  on collected_news (keyword);

insert into news_sources (name, keyword)
select source.name, source.keyword
from (
  values
    ('네이버 쇼핑', '네이버 쇼핑'),
    ('스마트스토어', '스마트스토어'),
    ('네이버 광고', '네이버 광고'),
    ('쿠팡', '쿠팡'),
    ('쿠팡 판매자', '쿠팡 판매자'),
    ('G마켓', 'G마켓'),
    ('11번가', '11번가'),
    ('카카오쇼핑', '카카오쇼핑'),
    ('SSG닷컴', 'SSG닷컴'),
    ('컬리', '컬리'),
    ('오늘의집', '오늘의집'),
    ('이커머스', '이커머스'),
    ('온라인 쇼핑', '온라인 쇼핑'),
    ('오픈마켓', '오픈마켓'),
    ('쇼핑몰 판매자', '쇼핑몰 판매자'),
    ('AI 커머스', 'AI 커머스'),
    ('라이브커머스', '라이브커머스')
) as source(name, keyword)
where not exists (
  select 1
  from news_sources
  where news_sources.keyword = source.keyword
);
