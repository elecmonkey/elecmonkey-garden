#!/bin/bash
MAX_RETRIES=5
RETRY_INTERVAL=1
APP_URL="http://localhost:3000/api/health"

echo "开始健康检查测试..."

for i in $(seq 1 $MAX_RETRIES); do
  response=$(curl -s $APP_URL)
  status=$(echo $response | grep -o '"status":"ok"' || echo "")
  
  if [ ! -z "$status" ]; then
    echo "✅ 健康检查通过！"
    exit 0
  else
    echo "⏳ 尝试 $i/$MAX_RETRIES: 服务尚未就绪"
    sleep $RETRY_INTERVAL
  fi
done

echo "❌ 健康检查失败！超出最大重试次数。"
exit 1 