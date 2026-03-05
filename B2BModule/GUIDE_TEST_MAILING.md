# 📧 GUIDE COMPLET - TESTER LE SYSTÈME DE MAILING

**Date:** 2026-03-05  
**Langue:** Français  
**Statut:** ✅ PRÊT À TESTER

---

## 📋 TABLE DES MATIÈRES

1. [Préparation](#-préparation)
2. [Démarrage du Backend](#-démarrage-du-backend)
3. [Test du Email Service](#-test-du-email-service)
4. [Test avec Postman](#-test-avec-postman)
5. [Test via Angular](#-test-via-angular)
6. [Vérification des Emails](#-vérification-des-emails)
7. [Dépannage](#-dépannage)

---

## ✅ PRÉPARATION

### Étape 1 : Arrêter les processus existants

**IMPORTANT : Vous avez vu l'erreur "Port 8083 already in use"**

Ouvrez **PowerShell** en tant qu'administrateur et exécutez :

```powershell
# Arrêter TOUS les processus Java
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force

# Vérifier que le port est libéré
netstat -ano | findstr :8083
```

**Résultat attendu :** Aucune sortie (aucun processus sur le port 8083)

### Étape 2 : Attendre 5 secondes

Le port a besoin de temps pour se libérer :

```powershell
Start-Sleep -Seconds 5
```

---

## 🚀 DÉMARRAGE DU BACKEND

### Option 1 : Via IntelliJ IDEA (RECOMMANDÉ) ✅

1. **Ouvrir le projet**
   - Ouvrez `C:\Users\mouha\Downloads\wetransfer_pi_4eme-template-rar_2026-02-23_2049\B2BModule`
   - IntelliJ IDEA → "File" → "Open"

2. **Cliquer sur le bouton RUN**
   - En haut à droite, cherchez le bouton ▶️ vert
   - Ou appuyez sur **Shift + F10**

3. **Attendre le démarrage**
   - Vous verrez des logs en bas
   - Cherchez cette ligne :
   ```
   ✅ Started B2bModuleApplication in X.XXX seconds (JVM running for X.XXX)
   ```

4. **Vérifier que le backend est actif**
   ```
   2026-03-05T00:XX:XX.XXX+01:00  INFO ... o.e.b2bmodule.B2bModuleApplication : Starting B2bModuleApplication
   2026-03-05T00:XX:XX.XXX+01:00  INFO ... o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port 8083
   ```

### Option 2 : Via la ligne de commande

```powershell
cd "C:\Users\mouha\Downloads\wetransfer_pi_4eme-template-rar_2026-02-23_2049\B2BModule"
mvn clean spring-boot:run
```

---

## 📧 TEST DU EMAIL SERVICE

### Test 1 : Vérifier que l'API répond

Ouvrez PowerShell et exécutez :

```powershell
# Vérifier que le backend répond
curl http://localhost:8083/api/b2b/applications

# Résultat attendu : JSON avec les applications
```

### Test 2 : Envoyer un email de test

Créez un fichier `test_email.ps1` :

```powershell
# Test d'envoi d'email

$uri = "http://localhost:8083/api/b2b/applications/notify"

$body = @{
    candidateEmail = "votre.email@gmail.com"
    candidateName = "Jean Dupont"
    jobTitle = "Développeur Full Stack"
    companyName = "MarketingPro"
    status = "ACCEPTED"
    message = "Bienvenue dans notre équipe ! Nous sommes heureux de vous accueillir."
} | ConvertTo-Json

Write-Host "📧 Envoi d'un email de notification..."
Write-Host "URL: $uri"
Write-Host "Body: $body"
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri $uri -Method POST -ContentType "application/json" -Body $body
    Write-Host "✅ SUCCESS! Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "❌ ERREUR:"
    Write-Host "Status: $($_.Exception.Response.StatusCode)"
    Write-Host "Message: $($_.Exception.Message)"
}
```

**Exécution :**

```powershell
powershell -ExecutionPolicy Bypass -File test_email.ps1
```

---

## 📮 TEST AVEC POSTMAN

### Étape 1 : Importer la collection

1. Ouvrir **Postman**
2. File → Import
3. Sélectionner : `B2B_Email_Notification_Postman.json`

### Étape 2 : Teste l'endpoint POST

**Endpoint :** `POST http://localhost:8083/api/b2b/applications/notify`

**Headers :**
```
Content-Type: application/json
```

**Body (JSON) :**
```json
{
  "candidateEmail": "aziz2guizeni@gmail.com",
  "candidateName": "Ahmed Guizeni",
  "jobTitle": "Senior Developer",
  "companyName": "TechCorp",
  "status": "ACCEPTED",
  "message": "Nous sommes ravis de vous avoir dans notre équipe!"
}
```

**Résultat attendu :**
```json
{
  "message": "Email sent successfully to aziz2guizeni@gmail.com"
}
```

### Étape 3 : Teste l'endpoint PUT

**Endpoint :** `PUT http://localhost:8083/api/b2b/applications/1/status-notify?status=ACCEPTED`

**Body (JSON) :**
```json
{
  "candidateEmail": "aziz2guizeni@gmail.com",
  "candidateName": "Ahmed Guizeni",
  "jobTitle": "Senior Developer",
  "companyName": "TechCorp",
  "status": "ACCEPTED",
  "message": "Bienvenue!"
}
```

---

## 🎯 TEST VIA ANGULAR

### Étape 1 : Créer un service Angular

Fichier : `src/app/services/email-notification.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailNotificationService {
  private apiUrl = 'http://localhost:8083/api/b2b/applications';

  constructor(private http: HttpClient) { }

  sendNotification(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/notify`, data);
  }

  updateStatusAndNotify(id: number, status: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status-notify?status=${status}`, data);
  }
}
```

### Étape 2 : Utiliser dans un composant

```typescript
import { Component } from '@angular/core';
import { EmailNotificationService } from './services/email-notification.service';

@Component({
  selector: 'app-test-email',
  template: `
    <div>
      <h2>Test Email Notification</h2>
      <button (click)="sendTestEmail()">Envoyer Email</button>
      <p *ngIf="loading">Envoi en cours...</p>
      <p *ngIf="success" class="success">✅ Email envoyé avec succès!</p>
      <p *ngIf="error" class="error">❌ Erreur: {{ error }}</p>
    </div>
  `
})
export class TestEmailComponent {
  loading = false;
  success = false;
  error = '';

  constructor(private emailService: EmailNotificationService) {}

  sendTestEmail() {
    this.loading = true;
    const data = {
      candidateEmail: 'test@example.com',
      candidateName: 'John Doe',
      jobTitle: 'Developer',
      companyName: 'MyCompany',
      status: 'ACCEPTED',
      message: 'Welcome to the team!'
    };

    this.emailService.sendNotification(data).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = true;
        console.log('Email sent:', response);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message;
        console.error('Error:', err);
      }
    });
  }
}
```

---

## 👀 VÉRIFICATION DES EMAILS

### Option 1 : Vérifier dans Gmail

1. Ouvrir Gmail : **https://mail.google.com**
2. Se connecter avec : **aziz2guizeni@gmail.com**
3. Mot de passe : **dabwejwnyqaryees**
4. Chercher les emails dans :
   - ✉️ Boîte de réception
   - 📤 Emails envoyés
   - 🗂️ Tous les emails

### Option 2 : Activer les logs d'email

Ajouter à `application.properties` :

```properties
# Debug logs for mail
spring.mail.debug=true
logging.level.org.springframework.mail=DEBUG
logging.level.jakarta.mail=DEBUG
```

Puis relancer le backend et regarder les logs dans IntelliJ.

---

## 🐛 DÉPANNAGE

### Problème 1 : Port 8083 déjà utilisé

```powershell
# Arrêter tous les processus Java
Get-Process java | Stop-Process -Force -ErrorAction SilentlyContinue

# Attendre 5 secondes
Start-Sleep -Seconds 5

# Vérifier
netstat -ano | findstr :8083
```

### Problème 2 : Email non reçu

**Vérifier :**
1. ✅ Le backend est en cours d'exécution (logs verts)
2. ✅ L'API répond : `curl http://localhost:8083/api/b2b/applications`
3. ✅ Les credentials Gmail sont correctes
4. ✅ La connexion SMTP (port 587) n'est pas bloquée
5. ✅ L'adresse email du destinataire est valide

**Activer les logs debug :**

Ajoutez à `application.properties` :
```properties
spring.mail.debug=true
logging.level.org.springframework.mail=DEBUG
```

### Problème 3 : Erreur "Authentication failed"

**Causes possibles :**
- ❌ Mauvais mot de passe
- ❌ L'authentification à 2 facteurs est activée
- ❌ L'accès des applications moins sécurisées est désactivé

**Solution :**
1. Aller sur : https://myaccount.google.com/apppasswords
2. Générer un mot de passe d'application
3. Remplacer le mot de passe dans `application.properties`

### Problème 4 : Erreur CORS

Si vous testez depuis Angular, assurez-vous que CORS est activé :

```java
// Dans CorsConfig.java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins("*")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(false)
                    .maxAge(3600);
            }
        };
    }
}
```

---

## ✨ RÉSUMÉ DES ÉTAPES

| # | Étape | Commande/Action |
|---|-------|-----------------|
| 1 | Arrêter Java | `Get-Process java \| Stop-Process -Force` |
| 2 | Attendre 5s | `Start-Sleep -Seconds 5` |
| 3 | Ouvrir IntelliJ | Ouvrir le projet |
| 4 | Cliquer RUN | Shift + F10 |
| 5 | Attendre "Started" | Vérifier les logs |
| 6 | Tester API | `curl http://localhost:8083/api/b2b/applications` |
| 7 | Envoyer email | PowerShell script ou Postman |
| 8 | Vérifier Gmail | Se connecter à Gmail |

---

## 🎉 BRAVO!

Si vous voyez :
1. ✅ Backend démarré (`Started B2bModuleApplication`)
2. ✅ API répond (`curl` retourne du JSON)
3. ✅ Email envoyé (response code 200)
4. ✅ Email reçu (visible dans Gmail)

**C'est tout bon! Le système de mailing fonctionne parfaitement! 🚀**

---

**Besoin d'aide?** Vérifiez les fichiers :
- `application.properties` - Configuration email
- `EmailService.java` - Logique d'envoi
- `ApplicationController.java` - Endpoints API

Bonne chance! 📧✨

