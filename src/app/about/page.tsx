import PageContainer from '@/components/PageContainer';
import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: "关于我 - Elecmonkey的小花园",
};

export default function AboutPage() {
  return (
    <PageContainer>
      <h1 className="text-3xl font-bold mb-8">关于我</h1>
      
      <div className="prose dark:prose-invert lg:prose-lg max-w-none">
        <section className="mb-12">
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            <span className="font-bold">Elecmonkey</span>，软件工程本科在读。
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
            一个平平无奇的技术主页，试图记录我爬过的坑走过的路。
          </p>
        </section>

        <section className="mb-12">
          <p className="text-xl font-medium">以下是我很想玩明白但完全玩不明白的东西。</p>
          <p className="text-lg font-none mb-6">但没关系，时间还多。</p>
          
          {/* 编程语言 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">编程语言</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"
                    alt="Python"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">Python</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg"
                    alt="JavaScript"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">JavaScript</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg"
                    alt="TypeScript"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">TypeScript</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg"
                    alt="Golang"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">Golang</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg"
                    alt="Java"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">Java</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg"
                    alt="Rust"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">Rust</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg"
                    alt="PHP"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">PHP</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg"
                    alt="C"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">C</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg"
                    alt="C++"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">C++</span>
              </div>
            </div>
          </div>

          {/* 前端框架 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">前端框架</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg"
                    alt="Vue"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">Vue</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
                    alt="React"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">React</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-original.svg"
                    alt="Svelte"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">Svelte</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg"
                    alt="Next.js"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">Next.js</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nuxtjs/nuxtjs-original.svg"
                    alt="Nuxt"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">Nuxt</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg"
                    alt="Tailwind CSS"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">Tailwind CSS</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/astro/astro-original.svg"
                    alt="Astro"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">Astro</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg"
                    alt="Angular"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">Angular</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg"
                    alt="Vite"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">Vite</span>
              </div>
            </div>
          </div>

          {/* 后端框架 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">后端框架</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg"
                    alt="Express"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">Express</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg"
                    alt="Flask"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">Flask</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg"
                    alt="Django"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">Django</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg"
                    alt="FastAPI"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">FastAPI</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg"
                    alt="Gin"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">Gin</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg"
                    alt="Spring Boot"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">Spring Boot</span>
              </div>
            </div>
          </div>

          {/* 桌面/跨平台开发 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">跨端开发</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/qt/qt-original.svg"
                    alt="Qt"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">Qt</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/electron/electron-original.svg"
                    alt="Electron"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">Electron</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tauri/tauri-original.svg"
                    alt="Tauri"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">Tauri</span>
              </div>
            </div>
          </div>

          {/* 数据库 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">数据库</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg"
                    alt="MySQL"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">MySQL</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg"
                    alt="MongoDB"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">MongoDB</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg"
                    alt="Redis"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">Redis</span>
              </div>
            </div>
          </div>

          {/* DevOps 工具 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">DevOps 工具</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg"
                    alt="Git"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">Git</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg"
                    alt="Docker"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">Docker</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg"
                    alt="Kubernetes"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">Kubernetes</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg"
                    alt="Nginx"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">Nginx</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src="https://user-images.githubusercontent.com/1128849/210187356-dfb7f1c5-ac2e-43aa-bb23-fc014280ae1f.svg"
                    alt="Caddy"
                    fill
                    className="object-contain object-left transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">Caddy</span>
              </div>
            </div>
          </div>
        </section>

        {/* 机器学习框架 */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">机器学习</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="flex flex-col items-center group">
              <div className="relative w-16 h-16 mb-2">
                <Image
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg"
                  alt="TensorFlow"
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">TensorFlow</span>
            </div>
            <div className="flex flex-col items-center group">
              <div className="relative w-16 h-16 mb-2">
                <Image
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg"
                  alt="PyTorch"
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 text-center w-full">PyTorch</span>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
} 