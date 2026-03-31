# APIs Externes Consommées - SkillSphere Platform

## Résumé

Le projet SkillSphere n'utilise **AUCUNE API externe tierce**. Toutes les fonctionnalités sont implémentées en interne via des microservices développés spécifiquement pour la plateforme. Le système utilise uniquement des APIs internes (Formation Service et User Service) qui communiquent entre elles via un API Gateway, ainsi que des bibliothèques Java standard pour l'envoi d'emails (JavaMailSender avec SMTP) et la génération de PDFs (iText). Même l'envoi d'emails se fait via un serveur SMTP local ou Gmail configuré manuellement dans application.properties, sans passer par des services d'emailing tiers comme SendGrid ou Mailgun. Il n'y a pas d'intégration avec des services externes comme Stripe, PayPal, AWS, Google APIs, ou autres fournisseurs tiers - le système de paiement est entièrement simulé en interne pour la démonstration.

---

## Détails Techniques

### Services Internes Uniquement
- **Formation Service** (port 8086) - Gestion formations, sessions, inscriptions, paiements simulés
- **User Service** (port 8083) - Authentification, gestion utilisateurs
- **API Gateway** (port 8087) - Routage des requêtes

### Bibliothèques Java (Non APIs Externes)
- **JavaMailSender (Spring Boot)** - Envoi d'emails via SMTP (serveur local ou Gmail configuré dans application.properties)
- **iText** - Génération de factures PDF
- **Spring Security** - Authentification JWT
- **Hibernate/JPA** - Accès base de données MySQL

### Configuration Email (Locale)
```properties
spring.mail.host=smtp.gmail.com (ou serveur SMTP local)
spring.mail.port=587
spring.mail.username=votre-email@gmail.com
spring.mail.password=votre-mot-de-passe
```
Pas de service d'emailing externe (SendGrid, Mailgun, etc.)

### Aucune Intégration Tierce
❌ Pas de Stripe/PayPal (paiement simulé)
❌ Pas de AWS S3 (stockage local)
❌ Pas de SendGrid/Mailgun (JavaMail direct)
❌ Pas de Google/Facebook OAuth (JWT interne)
❌ Pas de services cloud externes

---

## Conclusion

Le projet est **100% autonome** et ne dépend d'aucun service externe payant ou API tierce. Toutes les fonctionnalités avancées (abonnements, paiements, emails, factures PDF, progression automatique, statistiques, modération de contenu) sont développées et hébergées en interne.
