export type SearchIndexPost = {
  id: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  author?: string;
  content?: string;
};

export type SearchResult = {
  post: SearchIndexPost;
  score: number;
  matches: {
    title: boolean;
    tags: string[];
    description: boolean;
    content: {
      matched: boolean;
      excerpt: string;
    };
  };
};

export function searchIndexPosts(keyword: string, allPosts: SearchIndexPost[]): SearchResult[] {
  if (!keyword.trim()) {
    return [];
  }

  const normalizedKeyword = keyword.toLowerCase();

  const scoredPosts = allPosts.map((post) => {
    let score = 0;
    const matches = {
      title: false,
      tags: [] as string[],
      description: false,
      content: {
        matched: false,
        excerpt: '',
      },
    };

    if (post.title.toLowerCase().includes(normalizedKeyword)) {
      score += 10;
      matches.title = true;
      if (post.title.toLowerCase().startsWith(normalizedKeyword)) {
        score += 5;
      }
    }

    post.tags.forEach((tag) => {
      if (tag.toLowerCase().includes(normalizedKeyword)) {
        score += 8;
        matches.tags.push(tag);
        if (tag.toLowerCase() === normalizedKeyword) {
          score += 5;
        }
      }
    });

    if (post.description && post.description.toLowerCase().includes(normalizedKeyword)) {
      score += 5;
      matches.description = true;
    }

    if (post.content && post.content.toLowerCase().includes(normalizedKeyword)) {
      score += 3;
      matches.content.matched = true;

      const matchCount = post.content.toLowerCase().split(normalizedKeyword).length - 1;
      score += Math.min(matchCount, 5) * 0.5;

      try {
        const lowerContent = post.content.toLowerCase();
        const keywordIndex = lowerContent.indexOf(normalizedKeyword);
        if (keywordIndex !== -1) {
          const startIndex = Math.max(0, keywordIndex - 50);
          const endIndex = Math.min(lowerContent.length, keywordIndex + normalizedKeyword.length + 50);
          let excerpt = post.content.substring(startIndex, endIndex);

          if (startIndex > 0) {
            excerpt = `...${excerpt}`;
          }

          if (endIndex < post.content.length) {
            excerpt = `${excerpt}...`;
          }

          matches.content.excerpt = excerpt;
        }
      } catch (error) {
        console.error('提取摘要时出错:', error);
        matches.content.excerpt = post.description;
      }
    }

    const hasMatches = matches.title || matches.description || matches.content.matched || matches.tags.length > 0;

    if (hasMatches) {
      const dateScore = new Date(post.date).getTime() / (1000 * 60 * 60 * 24) / 100;
      score += dateScore;
    }

    return { post, score, matches } satisfies SearchResult;
  });

  return scoredPosts
    .filter((item) => (
      item.matches.title
      || item.matches.description
      || item.matches.content.matched
      || item.matches.tags.length > 0
    ))
    .sort((a, b) => b.score - a.score);
}

export function paginateSearchResults(
  allResults: SearchResult[],
  page: number = 1,
  pageSize: number = 10,
) {
  const totalPosts = allResults.length;

  if (totalPosts <= pageSize) {
    return {
      posts: allResults,
      totalPosts,
      totalPages: 1,
      currentPage: 1,
      pageSize,
    };
  }

  const totalPages = Math.max(1, Math.ceil(totalPosts / pageSize));
  const validPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    posts: allResults.slice(startIndex, endIndex),
    totalPosts,
    totalPages,
    currentPage: validPage,
    pageSize,
  };
}

export function searchIndexPostsWithPagination(
  keyword: string,
  allPosts: SearchIndexPost[],
  page: number = 1,
  pageSize: number = 10,
) {
  return paginateSearchResults(searchIndexPosts(keyword, allPosts), page, pageSize);
}
