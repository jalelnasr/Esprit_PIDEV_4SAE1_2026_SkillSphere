# ========================================
# Configuration d'Environnement - Email System
# ========================================

## 🟢 DÉVELOPPEMENT (Local)

### application-dev.properties
```properties
# Email Configuration - GMAIL (Test)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=aziz2guizeni@gmail.com
spring.mail.password=dabwejwnyqaryees
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true

# Logging
logging.level.org.springframework.mail=DEBUG
```

### Démarrage en dev:
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

---

## 🟡 STAGING (Test pré-production)

### application-staging.properties
```properties
# Email Configuration - GMAIL
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true

# Logging
logging.level.org.springframework.mail=INFO
```

### Variables d'environnement:
```powershell
$env:MAIL_USERNAME = "aziz2guizeni@gmail.com"
$env:MAIL_PASSWORD = "XXXXXXXXXXXXXXXX"
```

### Démarrage en staging:
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=staging"
```

---

## 🔴 PRODUCTION (Live)

### application-prod.properties
```properties
# Email Configuration - SendGrid ou Service Pro
spring.mail.host=smtp.sendgrid.net
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true

# Ou avec Office 365
# spring.mail.host=smtp.office365.com
# spring.mail.port=587

# Configuration pour haute charge
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
spring.mail.properties.mail.smtp.writetimeout=5000

# Logging
logging.level.org.springframework.mail=WARN
```

### Variables d'environnement (Secrets Manager):
```powershell
$env:MAIL_USERNAME = "sendgrid-api-key"
$env:MAIL_PASSWORD = "SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### Démarrage en production:
```bash
java -jar B2BModule-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

---

## 📋 Fichiers de Configuration à Créer

### 1. `src/main/resources/application-dev.properties`

```properties
spring.application.name=B2BMODULE

# DATABASE - Local Development
spring.datasource.url=jdbc:mysql://localhost:3306/b2bmodule?useSSL=false&serverTimezone=UTC&createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=create-drop

spring.jpa.show-sql=true
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect

# PORT
server.port=8083

# EMAIL - GMAIL (Development)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=aziz2guizeni@gmail.com
spring.mail.password=dabwejwnyqaryees
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true

# Logging - Email Debug
logging.level.org.springframework.mail=DEBUG
logging.level.org.springframework.boot.autoconfigure.mail=DEBUG

# EUREKA
eureka.client.service-url.defaultZone=http://localhost:8761/eureka
eureka.instance.prefer-ip-address=true

# SWAGGER
springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
```

### 2. `src/main/resources/application-staging.properties`

```properties
spring.application.name=B2BMODULE

# DATABASE - Staging
spring.datasource.url=jdbc:mysql://staging-db:3306/b2bmodule?useSSL=false&serverTimezone=UTC
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=validate

# EMAIL - GMAIL (Staging)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true

# Logging
logging.level.org.springframework.mail=INFO
logging.level.root=INFO

# EUREKA
eureka.client.service-url.defaultZone=http://eureka-server:8761/eureka
eureka.instance.prefer-ip-address=true

# PORT
server.port=8083
```

### 3. `src/main/resources/application-prod.properties`

```properties
spring.application.name=B2BMODULE

# DATABASE - Production
spring.datasource.url=jdbc:mysql://prod-db-host:3306/b2bmodule?useSSL=true&serverTimezone=UTC
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

# EMAIL - SendGrid or Office 365
# SendGrid:
spring.mail.host=smtp.sendgrid.net
spring.mail.port=587
spring.mail.username=apikey
spring.mail.password=${SENDGRID_API_KEY}

# Ou Office 365:
# spring.mail.host=smtp.office365.com
# spring.mail.port=587
# spring.mail.username=${MAIL_USERNAME}
# spring.mail.password=${MAIL_PASSWORD}

spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
spring.mail.properties.mail.smtp.writetimeout=5000

# Logging - Minimal in Production
logging.level.org.springframework.mail=WARN
logging.level.root=WARN

# EUREKA
eureka.client.service-url.defaultZone=${EUREKA_SERVER_URL}
eureka.instance.prefer-ip-address=true

# PORT
server.port=8083

# Performance
server.tomcat.threads.max=200
server.tomcat.threads.min-spare=10
```

---

## 🔐 Secrets Management

### Avec Docker Compose:

```yaml
version: '3.8'

services:
  b2b-module:
    image: b2bmodule:latest
    ports:
      - "8083:8083"
    environment:
      SPRING_PROFILES_ACTIVE: prod
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      MAIL_USERNAME: ${MAIL_USERNAME}
      MAIL_PASSWORD: ${MAIL_PASSWORD}
      EUREKA_SERVER_URL: ${EUREKA_SERVER_URL}
    secrets:
      - db_password
      - mail_password

secrets:
  db_password:
    external: true
  mail_password:
    external: true
```

### Avec Kubernetes:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: b2b-config
data:
  spring.profiles.active: prod
  mail.host: smtp.sendgrid.net
  mail.port: "587"

---
apiVersion: v1
kind: Secret
metadata:
  name: b2b-secrets
type: Opaque
stringData:
  db-username: root
  db-password: <encrypted>
  mail-username: apikey
  mail-password: SG.xxxxxxxxxxxxx
```

---

## 📝 Checklist Configuration

### ✅ Développement
- [ ] Créer `application-dev.properties`
- [ ] Gmail App Password généré
- [ ] Tester avec `mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"`
- [ ] Email reçu dans le compte de test

### ✅ Staging
- [ ] Créer `application-staging.properties`
- [ ] Variables d'environnement configurées
- [ ] Base de données staging préparée
- [ ] Tester les endpoints

### ✅ Production
- [ ] Créer `application-prod.properties`
- [ ] SendGrid ou autre service SMTP configuré
- [ ] Secrets Manager configuré (AWS/Azure)
- [ ] Load testing effectué
- [ ] Monitoring en place

---

## 🚀 Docker Deployment

### Dockerfile

```dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/B2BModule-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8083

ENV SPRING_PROFILES_ACTIVE=prod

CMD ["java", "-jar", "app.jar"]
```

### Lancer:

```bash
docker build -t b2bmodule:latest .

docker run -e SPRING_PROFILES_ACTIVE=prod \
           -e DB_USERNAME=root \
           -e DB_PASSWORD=mypassword \
           -e MAIL_USERNAME=apikey \
           -e MAIL_PASSWORD=SG.xxxxx \
           -p 8083:8083 \
           b2bmodule:latest
```

---

## 📊 Comparaison des Services Email

| Service | Coût | Limite | Recommandé |
|---------|------|--------|-----------|
| Gmail SMTP | Gratuit | 100/sec | ✅ Dev/Staging |
| SendGrid | $20-100/mois | 100k/mois | ✅ Production |
| AWS SES | Pay-per-use | 50 reqts/sec | ✅ AWS Stack |
| Office 365 | Entreprise | Sans limite | ✅ Microsoft |
| Mailgun | $35-180/mois | 1000/mois | Alternatif |

---

**Configuration prête pour déploiement en tous environnements ! 🚀**

