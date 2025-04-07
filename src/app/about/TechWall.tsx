'use client';

import TechIcon from '@/components/TechIcon';
import { useState } from 'react';

export default function TechWall() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
      <section className="mb-12 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 ">
          <div>
            <p className="text-xl font-medium">很多我很想玩明白但完全玩不明白的东西。</p>
            <p className="text-lg font-none">但没关系，时间还多。</p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
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
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg"
                alt="Linux"
                label="Linux"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/debian/debian-original.svg"
                alt="Debian"
                label="Debian"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ubuntu/ubuntu-original.svg"
                alt="Ubuntu"
                label="Ubuntu"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opensuse/opensuse-original.svg"
                alt="openSUSE"
                label="openSUSE"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rockylinux/rockylinux-original.svg"
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
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"
                alt="Python"
                label="Python"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-plain.svg"
                alt="HTML5"
                label="HTML5"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg"
                alt="CSS3"
                label="CSS3"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg"
                alt="JavaScript"
                label="JavaScript"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg"
                alt="TypeScript"
                label="TypeScript"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg"
                alt="Golang"
                label="Golang"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg"
                alt="Java"
                label="Java"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg"
                alt="Kotlin"
                label="Kotlin"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg"
                alt="Rust"
                label="Rust"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg"
                alt="PHP"
                label="PHP"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg"
                alt="C"
                label="C"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg"
                alt="C++"
                label="C++"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg"
                alt="Swift"
                label="Swift"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dart/dart-original.svg"
                alt="Dart"
                label="Dart"
                isGray={true}
              />
            </div>
          </div>

          {/* 前端框架 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Frontend</h3>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-6">
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg"
                alt="Node.js"
                label="Node.js"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/denojs/denojs-original.svg"
                alt="Deno"
                label="Deno"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bun/bun-original.svg"
                alt="Bun"
                label="Bun"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg"
                alt="npm"
                label="npm"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pnpm/pnpm-original.svg"
                alt="pnpm"
                label="pnpm"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg"
                alt="Vite"
                label="Vite"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/webpack/webpack-original.svg"
                alt="Webpack"
                label="Webpack"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/esbuild.svg"
                alt="ESBuild"
                label="ESBuild"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg"
                alt="Vue.js"
                label="Vue.js"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
                alt="React"
                label="React"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-original.svg"
                alt="Svelte"
                label="Svelte"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg"
                alt="Next.js"
                label="Next.js"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nuxtjs/nuxtjs-original.svg"
                alt="Nuxt"
                label="Nuxt"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/astro/astro-original.svg"
                alt="Astro"
                label="Astro"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg"
                alt="Angular"
                label="Angular"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg"
                alt="Tailwind CSS"
                label="Tailwind CSS"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg"
                alt="Sass"
                label="Sass"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg"
                alt="Bootstrap"
                label="Bootstrap"
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/qwik.svg"
                alt="Qwik"
                label="Qwik"
                isGray={true}
              />
              <TechIcon
                src="https://vitest.dev/logo.svg"
                alt="Vitest"
                label="Vitest"
                isGray={true}
              />
            </div>
          </div>

          {/* 后端框架 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Backend</h3>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-6">
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg"
                alt="Express"
                label="Express"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg"
                alt="Nest.js"
                label="Nest.js"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastify/fastify-original.svg"
                alt="Fastify"
                label="Fastify"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg"
                alt="Flask"
                label="Flask"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg"
                alt="Django"
                label="Django"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg"
                alt="FastAPI"
                label="FastAPI"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg"
                alt="Gin"
                label="Gin"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg"
                alt="Spring Boot"
                label="Spring Boot"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/socketio/socketio-original.svg"
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
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/qt/qt-original.svg"
                alt="Qt"
                label="Qt"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/electron/electron-original.svg"
                alt="Electron"
                label="Electron"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tauri/tauri-original.svg"
                alt="Tauri"
                label="Tauri"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg"
                alt="Flutter"
                label="Flutter"
                isGray={true}
              />
            </div>
          </div>

          {/* 数据库 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Databases</h3>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-6">
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg"
                alt="MySQL"
                label="MySQL"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg"
                alt="MongoDB"
                label="MongoDB"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg"
                alt="SQLite"
                label="SQLite"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/influxdb/influxdb-original.svg"
                alt="InfluxDB"
                label="InfluxDB"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/neo4j/neo4j-original.svg"
                alt="Neo4j"
                label="Neo4j"
                isGray={true}
              />
            </div>
          </div>

          {/* DevOps 工具 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">DevOps</h3>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-6">
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg"
                alt="Git"
                label="Git"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg"
                alt="Docker"
                label="Docker"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg"
                alt="Kubernetes"
                label="Kubernetes"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg"
                alt="Nginx"
                label="Nginx"
                isGray={true}
              />
              <TechIcon
                src="https://images.elecmonkey.com/pages/about/caddy.svg"
                alt="Caddy"
                label="Caddy"
                className="object-left"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg"
                alt="Jenkins"
                label="Jenkins"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rabbitmq/rabbitmq-original.svg"
                alt="RabbitMQ"
                label="RabbitMQ"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apachekafka/apachekafka-original.svg"
                alt="Kafka"
                label="Kafka"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg"
                alt="Redis"
                label="Redis"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
                alt="GitHub"
                label="GitHub"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg"
                alt="GitLab"
                label="GitLab"
                isGray={true}
              />
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Tools</h3>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-6">
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cmake/cmake-original.svg"
                alt="CMake"
                label="CMake"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jupyter/jupyter-original.svg"
                alt="Jupyter"
                label="Jupyter"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg"
                alt="OpenCV"
                label="OpenCV"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg"
                alt="Postman"
                label="Postman"
                isGray={true}
              />
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Data Science & Machine Learning</h3>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-6">
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/numpy/numpy-original.svg"
                alt="Numpy"
                label="Numpy"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg"
                alt="Pandas"
                label="Pandas"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/matplotlib/matplotlib-original.svg"
                alt="Matplotlib"
                label="Matplotlib"
                isGray={true}
              />
              
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/keras/keras-original.svg"
                alt="Keras"
                label="Keras"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg"
                alt="TensorFlow"
                label="TensorFlow"
                isGray={true}
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg"
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