import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // 禁止爬虫访问搜索页面，因为它是动态生成的
      disallow: [
        '/search',
        '/api/',
      ],
    },
    sitemap: 'https://www.elecmonkey.com/sitemap.xml',
  }
} 