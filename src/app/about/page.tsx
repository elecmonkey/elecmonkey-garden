import PageContainer from '@/components/PageContainer';
import TechIcon from '@/components/TechIcon';
import { Metadata } from 'next';

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
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-6">
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"
                alt="Python"
                label="Python"
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
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg"
                alt="Node.js"
                label="Node.js"
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
            </div>
          </div>

          {/* 前端框架 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">前端框架</h3>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-6">
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
                src="https://cdn.jsdelivr.net/gh/unocss/unocss@main/docs/public/logo.svg"
                alt="UnoCSS"
                label="UnoCSS"
              />
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg"
                alt="Vite"
                label="Vite"
              />
            </div>
          </div>

          {/* 后端框架 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">后端框架</h3>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-6">
              <TechIcon
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg"
                alt="Express"
                label="Express"
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
            </div>
          </div>

          {/* 桌面/跨平台开发 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">跨端开发</h3>
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
            </div>
          </div>

          {/* 数据库 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">数据库</h3>
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
              />
              <TechIcon
                src="https://user-images.githubusercontent.com/1128849/210187356-dfb7f1c5-ac2e-43aa-bb23-fc014280ae1f.svg"
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
            </div>
          </div>
        </section>

        {/* 机器学习框架 */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">机器学习</h3>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-6">
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
    </PageContainer>
  );
} 