export function enhanceFileDownloadIslands(root: HTMLElement) {
  const cards = root.querySelectorAll<HTMLElement>('[data-md-island="file-download"]');

  cards.forEach((card) => {
    if (card.dataset.enhanced === 'true') {
      return;
    }

    const filename = card.dataset.filename || '未知文件';
    const fileType = card.dataset.type || 'unknown';
    const url = card.dataset.url || '#';
    const size = card.dataset.size || '未知大小';
    const description = card.querySelector('.file-download-fallback p')?.textContent || '暂无描述';

    card.className = 'article-file-download';
    card.innerHTML = '';

    const icon = document.createElement('div');
    icon.className = `article-file-download-icon ${getFileIconClass(fileType)}`;
    icon.textContent = getFileIconText(fileType);

    const body = document.createElement('div');
    body.className = 'article-file-download-body';

    const title = document.createElement('h3');
    title.textContent = filename;

    const desc = document.createElement('p');
    desc.textContent = description;

    const meta = document.createElement('div');
    meta.className = 'article-file-download-meta';
    const sizeBadge = document.createElement('span');
    sizeBadge.textContent = size;
    const typeBadge = document.createElement('span');
    typeBadge.textContent = fileType.toUpperCase();
    meta.append(sizeBadge, typeBadge);

    body.append(title, desc, meta);

    const action = document.createElement('a');
    action.className = 'article-file-download-action';
    action.href = url;
    action.target = '_blank';
    action.rel = 'noopener noreferrer';
    action.setAttribute('aria-label', `下载 ${filename}`);
    action.textContent = '下载';

    card.append(icon, body, action);
    card.dataset.enhanced = 'true';
  });
}

function getFileIconClass(type: string): string {
  switch (type.toLowerCase()) {
    case 'pdf':
      return 'is-pdf';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
    case 'image':
      return 'is-image';
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return 'is-archive';
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'json':
    case 'html':
    case 'css':
    case 'rs':
    case 'rust':
    case 'code':
      return 'is-code';
    default:
      return 'is-generic';
  }
}

function getFileIconText(type: string): string {
  const normalized = type.toLowerCase();
  if (normalized === 'pdf') return 'PDF';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'image'].includes(normalized)) return 'IMG';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(normalized)) return 'ZIP';
  if (['js', 'ts', 'jsx', 'tsx', 'json', 'html', 'css', 'rs', 'rust', 'code'].includes(normalized)) return '</>';
  return 'FILE';
}
