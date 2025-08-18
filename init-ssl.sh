#!/bin/bash

# SSL 인증서 발급 스크립트
domains=(twcommunity-server.store dev.twcommunity-server.store)
rsa_key_size=4096
data_path="./certbot"
email="wnsdn300300@gmail.com"  # 실제 이메일로 변경하세요
staging=0  # 테스트시 1로 설정

echo "🔐 Starting SSL certificate setup for domains: ${domains[@]}"

# 기존 데이터 확인
if [ -d "$data_path" ]; then
  read -p "Existing data found for $domains. Continue and replace existing certificate? (y/N) " decision
  if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
    exit
  fi
fi

# SSL 파라미터 다운로드
if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
  echo "### Downloading recommended TLS parameters ..."
  mkdir -p "$data_path/conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
  echo "✅ TLS parameters downloaded"
fi

# 더미 인증서 생성
echo "### Creating dummy certificate for ${domains[0]} ..."
path="/etc/letsencrypt/live/${domains[0]}"
mkdir -p "$data_path/conf/live/${domains[0]}"
docker-compose run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1\
    -keyout '$path/privkey.pem' \
    -out '$path/fullchain.pem' \
    -subj '/CN=localhost'" certbot
echo "✅ Dummy certificate created"

# nginx 시작 (HTTP 모드)
echo "### Starting nginx in HTTP mode..."
cp nginx-initial.conf nginx.conf  # HTTP 전용 설정 사용
docker-compose up --force-recreate -d nginx
echo "✅ Nginx started in HTTP mode"

# 더미 인증서 삭제
echo "### Deleting dummy certificate for ${domains[0]} ..."
docker-compose run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/${domains[0]} && \
  rm -Rf /etc/letsencrypt/archive/${domains[0]} && \
  rm -Rf /etc/letsencrypt/renewal/${domains[0]}.conf" certbot
echo "✅ Dummy certificate deleted"

# Let's Encrypt 인증서 요청
echo "### Requesting Let's Encrypt certificate for ${domains[0]} ..."
domain_args=""
for domain in "${domains[@]}"; do
  domain_args="$domain_args -d $domain"
done

# 이메일 설정
case "$email" in
  "") email_arg="--register-unsafely-without-email" ;;
  *) email_arg="--email $email" ;;
esac

# 스테이징 설정
if [ $staging != "0" ]; then staging_arg="--staging"; fi

docker-compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $staging_arg \
    $email_arg \
    $domain_args \
    --rsa-key-size $rsa_key_size \
    --agree-tos \
    --force-renewal" certbot

# 인증서 발급 확인
if [ $? -eq 0 ]; then
    echo "✅ SSL certificate issued successfully!"
    
    # HTTPS nginx 설정으로 변경
    echo "### Switching to HTTPS configuration..."
    cp nginx-final.conf nginx.conf
    docker-compose restart nginx
    echo "✅ Nginx restarted with HTTPS configuration"
    
    echo "🎉 SSL setup completed successfully!"
    echo "Your sites should now be available at:"
    echo "  - https://twcommunity-server.store"
    echo "  - https://dev.twcommunity-server.store"
else
    echo "❌ SSL certificate issuance failed!"
    echo "Please check the logs above for details."
    exit 1
fi