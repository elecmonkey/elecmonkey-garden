'use client';

import TechIcon from '@/app/about/components/TechIcon';
import { useState } from 'react';

export default function TechWall() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
      <section className="mb-12 rounded-xl border border-border bg-card shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 ">
          <div>
            <p className="text-xl font-medium">很多我很想玩明白但完全玩不明白的东西。</p>
            <p className="text-lg font-none">但没关系，时间还多。</p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-muted-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors duration-200"
          >
            {isExpanded ? '收起' : '展开'}
          </button>
        </div>
        
        <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100 max-h-[5000px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
          {/* 操作系统 */}
          <div className="pt-6 mb-8">
            <h3 className="text-lg font-medium mb-4">OS Platforms</h3>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-6">
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/linux-original.svg"
                alt="Linux"
                label="Linux"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/debian-original.svg"
                alt="Debian"
                label="Debian"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/ubuntu-original.svg"
                alt="Ubuntu"
                label="Ubuntu"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/opensuse-original.svg"
                alt="openSUSE"
                label="openSUSE"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/rockylinux-original.svg"
                alt="Rocky Linux"
                label="Rocky Linux"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/freebsd.svg"
                alt="FreeBSD"
                label="FreeBSD"
                isGray={true}
              />
            </div>
          </div>

          {/* 编程语言 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Languages</h3>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-6">
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/python-original.svg"
                alt="Python"
                label="Python"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/html5-original.svg"
                alt="HTML"
                label="HTML"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/css3-original.svg"
                alt="CSS"
                label="CSS"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/javascript-original.svg"
                alt="JavaScript"
                label="JavaScript"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/typescript-original.svg"
                alt="TypeScript"
                label="TypeScript"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/go-original.svg"
                alt="Golang"
                label="Golang"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/java-original.svg"
                alt="Java"
                label="Java"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/kotlin-original.svg"
                alt="Kotlin"
                label="Kotlin"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/rust-original.svg"
                alt="Rust"
                label="Rust"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/php-original.svg"
                alt="PHP"
                label="PHP"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/c-original.svg"
                alt="C"
                label="C"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/cplusplus-original.svg"
                alt="C++"
                label="C++"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/swift-original.svg"
                alt="Swift"
                label="Swift"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/dart-original.svg"
                alt="Dart"
                label="Dart"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/zig-original.svg"
                alt="Zig"
                label="Zig"
                isGray={true}
              />
            </div>
          </div>

          {/* 前端框架 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Frontend Frameworks</h3>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-6">
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/vuejs-original.svg"
                alt="Vue.js"
                label="Vue.js"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/react-original.svg"
                alt="React"
                label="React"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/solidjs-original.svg"
                alt="SolidJS"
                label="SolidJS"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/svelte-original.svg"
                alt="Svelte"
                label="Svelte"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/qwik.svg"
                alt="Qwik"
                label="Qwik"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/nextjs-original.svg"
                alt="Next.js"
                label="Next.js"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/nuxtjs-original.svg"
                alt="Nuxt"
                label="Nuxt"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/angularjs-original.svg"
                alt="Angular"
                label="Angular"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/astro-original.svg"
                alt="Astro"
                label="Astro"
              />
            </div>
          </div>

          {/* JavaScript Ecosystem Toolchain */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">JavaScript Ecosystem Toolchain</h3>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-6">
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/nodejs-original.svg"
                alt="Node.js"
                label="Node.js"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/denojs-original.svg"
                alt="Deno"
                label="Deno"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/bun-original.svg"
                alt="Bun"
                label="Bun"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/npm-original-wordmark.svg"
                alt="npm"
                label="npm"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/pnpm-original.svg"
                alt="pnpm"
                label="pnpm"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/vitejs-original.svg"
                alt="Vite"
                label="Vite"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/webpack-original.svg"
                alt="Webpack"
                label="Webpack"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/esbuild.svg"
                alt="ESBuild"
                label="ESBuild"
              />
              <TechIcon
                src="https://vitest.dev/logo.svg"
                alt="Vitest"
                label="Vitest"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/rollup-original.svg"
                alt="Rollup"
                label="Rollup"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/rolldown-round.svg"
                alt="Rolldown"
                label="Rolldown"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/tsdown.svg"
                alt="tsdown"
                label="tsdown"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/babel-original.svg"
                alt="Babel"
                label="Babel"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/puppeteer-original.svg"
                alt="Puppeteer"
                label="Puppeteer"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/playwright-original.svg"
                alt="Playwright"
                label="Playwright"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/sass-original.svg"
                alt="Sass"
                label="Sass"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/postcss-original.svg"
                alt="PostCSS"
                label="PostCSS"
              />
            </div>
          </div>

          {/* 后端框架 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Backend</h3>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-6">
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/express-original.svg"
                alt="Express"
                label="Express"
              />
              <TechIcon
                alt="koa"
                label="koa"
                customText="koa"
                isGray={false}
                className="text-4xl font-serif"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/nestjs-original.svg"
                alt="Nest.js"
                label="Nest.js"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/fastify-original.svg"
                alt="Fastify"
                label="Fastify"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/flask-original.svg"
                alt="Flask"
                label="Flask"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/django-plain.svg"
                alt="Django"
                label="Django"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/fastapi-original.svg"
                alt="FastAPI"
                label="FastAPI"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/go-original.svg"
                alt="Gin"
                label="Gin"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/spring-original.svg"
                alt="Spring Boot"
                label="Spring Boot"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/socketio-original.svg"
                alt="Socket.IO"
                label="Socket.IO"
              />
            </div>
          </div>

          {/* 桌面/跨平台开发 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Cross-Platform</h3>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-6">
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/qt-original.svg"
                alt="Qt"
                label="Qt"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/electron-original.svg"
                alt="Electron"
                label="Electron"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/tauri-original.svg"
                alt="Tauri"
                label="Tauri"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/flutter-original.svg"
                alt="Flutter"
                label="Flutter"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/reactnative-original.svg"
                alt="React Native"
                label="React Native"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/lynx-dark-logo.svg"
                alt="Lynx"
                label="Lynx"
                isGray={true}
              />
            </div>
          </div>

          {/* 数据库 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Databases</h3>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-6">
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/postgresql-original.svg"
                alt="PostgreSQL"
                label="PostgreSQL"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/mongodb-original.svg"
                alt="MongoDB"
                label="MongoDB"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/sqlite-original.svg"
                alt="SQLite"
                label="SQLite"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/influxdb-original.svg"
                alt="InfluxDB"
                label="InfluxDB"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/neo4j-original.svg"
                alt="Neo4j"
                label="Neo4j"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/mysql-original.svg"
                alt="MySQL"
                label="MySQL"
              />
            </div>
          </div>

          {/* DevOps 工具 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">DevOps</h3>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-6">
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/git-original.svg"
                alt="Git"
                label="Git"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/docker-original.svg"
                alt="Docker"
                label="Docker"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/kubernetes-plain.svg"
                alt="Kubernetes"
                label="Kubernetes"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/nginx-original.svg"
                alt="Nginx"
                label="Nginx"
                isGray={false}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/caddy.svg"
                alt="Caddy"
                label="Caddy"
                className="object-left"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/jenkins-original.svg"
                alt="Jenkins"
                label="Jenkins"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/rabbitmq-original.svg"
                alt="RabbitMQ"
                label="RabbitMQ"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/apachekafka-original.svg"
                alt="Kafka"
                label="Kafka"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/redis-original.svg"
                alt="Redis"
                label="Redis"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/github-original.svg"
                alt="GitHub"
                label="GitHub"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/gitlab-original.svg"
                alt="GitLab"
                label="GitLab"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/pm2-original.svg"
                alt="PM2"
                label="PM2"
              />
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Development Tools</h3>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-6">
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/cmake-original.svg"
                alt="CMake"
                label="CMake"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/postman-original.svg"
                alt="Postman"
                label="Postman"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/vscode-original.svg"
                alt="VS Code"
                label="VS Code"
              />
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Data Science & Machine Learning</h3>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-6">
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/numpy-original.svg"
                alt="Numpy"
                label="Numpy"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/pandas-original.svg"
                alt="Pandas"
                label="Pandas"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/matplotlib-original.svg"
                alt="Matplotlib"
                label="Matplotlib"
                isGray={true}
              />
              
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/keras-original.svg"
                alt="Keras"
                label="Keras"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/tensorflow-original.svg"
                alt="TensorFlow"
                label="TensorFlow"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/pytorch-original.svg"
                alt="PyTorch"
                label="PyTorch"
                isGray={true}
              />
            </div>
          </div>
        </div>
      </section>
  );
} 