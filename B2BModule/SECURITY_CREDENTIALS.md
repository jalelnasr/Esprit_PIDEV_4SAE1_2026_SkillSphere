# ============================================
# IMPORTANT - SÉCURITÉ EMAIL
# ============================================

⚠️ **ATTENTION SÉCURITÉ** ⚠️

Le fichier `application.properties` contient actuellement :
- Email Gmail : aziz2guizeni@gmail.com
- Mot de passe d'application : dabwejwnyqaryees

## 🔒 RECOMMANDATIONS DE SÉCURITÉ

### 1. Ne PAS committer les identifiants dans Git
```bash
# Ajouter à .gitignore :
application.properties
application-production.properties
```

### 2. Utiliser les Variables d'Environnement
```bash
# Linux/Mac:
export SPRING_MAIL_USERNAME=aziz2guizeni@gmail.com
export SPRING_MAIL_PASSWORD=dabwejwnyqaryees

# Windows PowerShell:
$env:SPRING_MAIL_USERNAME="aziz2guizeni@gmail.com"
$env:SPRING_MAIL_PASSWORD="dabwejwnyqaryees"

# Ensuite dans application.properties:
spring.mail.username=${SPRING_MAIL_USERNAME}
spring.mail.password=${SPRING_MAIL_PASSWORD}
```

### 3. Utiliser un Service de Gestion des Secrets
- AWS Secrets Manager
- Azure Key Vault
- HashiCorp Vault
- Spring Cloud Config Server

### 4. Utiliser des Profils Spring
```properties
# application-prod.properties
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
```

```bash
# Lancer avec le profil prod :
java -jar app.jar --spring.profiles.active=prod
```

### 5. Mot de Passe Gmail
⚠️ Générer un mot de passe d'application (App Password) :
1. Accéder à : https://myaccount.google.com/security
2. Activer 2FA
3. Générer un mot de passe d'application
4. Utiliser ce mot de passe dans application.properties

### 6. Chiffrer les Propriétés Sensibles
Utiliser Spring Cloud Config Encryption :
```bash
mvn dependency:resolve
java -jar spring-cloud-config-server.jar --encrypt.key=mysecretkey
```

---

## 📋 CHECKLIST AVANT PRODUCTION

- [ ] Supprimer le mot de passe d'application.properties
- [ ] Configurer les variables d'environnement
- [ ] Utiliser un service de gestion des secrets
- [ ] Tester avec les credentials réels en production
- [ ] Auditer les accès Gmail
- [ ] Configurer les logs pour ne pas afficher les credentials
- [ ] Utiliser HTTPS pour tous les endpoints
- [ ] Implémenter rate limiting pour l'envoi d'emails
- [ ] Ajouter des logs et du monitoring

---

## 🧪 DÉVELOPPEMENT LOCAL

Pour les tests locaux avec un vrai compte Gmail :

1. **Générer un mot de passe d'application** :
   - https://myaccount.google.com/apppasswords
   - Sélectionner : Mail → Windows/Linux

2. **Mettre dans application-dev.properties** :
   ```properties
   spring.profiles.active=dev
   spring.mail.username=your-email@gmail.com
   spring.mail.password=your-app-password
   ```

3. **Lancer l'application** :
   ```bash
   mvn spring-boot:run
   ```

---

## 📧 ENVOYER DES EMAILS DE TEST

Utiliser https://mailtrap.io ou https://ethereal.email pour les tests :

```properties
spring.mail.host=smtp.ethereal.email
spring.mail.port=587
spring.mail.username=your-email@ethereal.email
spring.mail.password=your-password
```

Les emails seront capturés et visibles dans l'interface web, sans vraiment les envoyer.

---

**Créé le** : 23 Février 2026  
**Priorité** : 🔴 HAUTE - Vérifier avant production !

