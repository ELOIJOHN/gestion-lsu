# LSU École du Cap - Dockerfile
# Image Docker pour le déploiement de l'application

# Utiliser Node.js 18 Alpine pour une image légère
FROM node:18-alpine

# Métadonnées
LABEL maintainer="LSU École du Cap <contact@lsu-ecole-cap.fr>"
LABEL version="1.0.0"
LABEL description="Application de gestion LSU pour l'école primaire"

# Variables d'environnement
ENV NODE_ENV=production
ENV LSU_ENVIRONMENT=prod
ENV PORT=3000

# Créer l'utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S lsu && \
    adduser -S lsu -u 1001

# Installer les dépendances système
RUN apk add --no-cache \
    curl \
    bash \
    git \
    && rm -rf /var/cache/apk/*

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production && \
    npm cache clean --force

# Copier le code source
COPY . .

# Créer les répertoires nécessaires
RUN mkdir -p \
    /app/data \
    /app/static/uploads/photos \
    /app/logs \
    /app/backups

# Copier les fichiers de configuration
COPY deploy/nginx.conf /etc/nginx/nginx.conf
COPY deploy/prometheus.yml /etc/prometheus/prometheus.yml

# Définir les permissions
RUN chown -R lsu:lsu /app && \
    chmod -R 755 /app

# Passer à l'utilisateur non-root
USER lsu

# Exposer le port
EXPOSE 3000

# Script de démarrage
COPY deploy/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Point d'entrée
ENTRYPOINT ["/app/start.sh"]

# Commande par défaut
CMD ["npm", "start"] 