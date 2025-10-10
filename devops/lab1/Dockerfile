FROM node:16-alpine AS frontend-builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY assets/ ./assets/
COPY webpack.config.js ./
RUN npm run build

FROM php:8.2-apache AS base

# Zainstalowanie podstawowych zależności
RUN apt-get update && apt-get install -y \
  git \
  curl \
  zip \
  unzip \
  libzip-dev \
  libpq-dev \
  && docker-php-ext-install \
  zip \
  pdo \
  pdo_pgsql \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Konfiguracja Apache
COPY 000-default.conf /etc/apache2/sites-available/
RUN a2enmod rewrite

WORKDIR /var/www/html

# Development stage
FROM base AS development

# Dodanie narzędzi deweloperskich
RUN pecl install xdebug \
  && docker-php-ext-enable xdebug

# Konfiguracja Xdebug
RUN echo "xdebug.mode=debug" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \
  && echo "xdebug.start_with_request=yes" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \
  && echo "xdebug.client_host=host.docker.internal" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini

ENV APP_ENV=dev
ENV XDEBUG_MODE=debug

EXPOSE 80

# Production stage
FROM base AS production

# Kopiowanie zależności
COPY composer.json composer.lock symfony.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Kopiowanie kodu źródłowego
COPY . .
COPY --from=frontend-builder /app/public/build/ ./public/build/

# Finalnie composer dla production
RUN composer dump-autoload --optimize --classmap-authoritative

# Ustawienia dla produkcji
RUN chown -R www-data:www-data /var/www/html \
  && chmod -R 755 /var/www/html

ENV APP_ENV=prod

USER www-data

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1
