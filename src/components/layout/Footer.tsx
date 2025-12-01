import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-muted/70 mt-auto">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 网站信息 */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-foreground">
              Elecmonkey的小花园
            </h3>
            <p 
              className="text-sm mb-3 text-muted-foreground cursor-pointer transition-colors quote-text" 
              title="来自COP《光与影的对白》"
              data-text-1="存在 为将心声响彻"
              data-text-2="交汇的光与影 答案落定覆上姓名"
              tabIndex={0}
            >
              <span>存在 为将心声响彻</span>
            </p>
            <div className="my-4"></div>
            <a 
              href="https://github.com/elecmonkey/elecmonkey-garden" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs flex items-center max-w-fit transition-colors text-muted-foreground hover:text-primary"
            >
              本站源码已在
              <div className="flex items-center mx-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.30 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </div>
              开源
            </a>
            <div className="my-4"></div>
            <a 
                href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs flex items-center max-w-fit transition-colors text-muted-foreground hover:text-primary"
            >
            <span>文章采用 CC BY-NC-SA 4.0 许可证</span>
            </a>
          </div>
          
          {/* 页面链接 */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-foreground">页面导航</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm transition-colors text-muted-foreground hover:text-primary">
                  首页
                </Link>
              </li>
              <li>
                <Link 
                  href="https://transphere.elecmonkey.com/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm flex items-center transition-colors text-muted-foreground hover:text-primary"
                >
                  Transphere
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm transition-colors text-muted-foreground hover:text-primary">
                  关于我
                </Link>
              </li>
            </ul>
          </div>
          
          {/* 社交链接 */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-foreground">联系方式</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://github.com/elecmonkey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm flex items-center transition-colors text-muted-foreground hover:text-primary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.30 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <span className="text-sm flex items-center text-muted-foreground" title="请复制此邮箱地址">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>elec<span style={{ display: 'none' }}>null</span>monkey</span>
                  <span style={{ display: 'none' }}>hidden</span>
                  &#x40;
                  <span style={{ display: 'none' }}>please-no-spam</span>
                  <span>hot<span style={{ display: 'none' }}>spam</span>mail.com</span>
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* 版权信息 */}
        <div className="mt-8 pt-6 text-center border-t border-border">
          <p className="text-sm text-muted-foreground">
            &copy; 2023-{currentYear} Elecmonkey的小花园
            <span className="mx-2 text-muted-foreground select-none">｜</span>
            <a 
              href="https://beian.miit.gov.cn/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center transition-colors hover:text-primary"
            >
              陕ICP备2023008974号-1
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}