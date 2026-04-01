# 🔍 OÙ TROUVER CHAQUE TECHNOLOGIE DANS LE PROJET

## 📦 FRONTEND - Angular (Platforme/)

### 1. **Angular 18 (Standalone)**
**Fichier**: `Platforme/package.json`
```json
"@angular/core": "^18.2.0"
```
**Preuve dans le code**:
- `Platforme/src/app/app.component.ts` - Composant standalone
- `Platforme/src/app/features/competitions/pages/competition-list/competition-list.component.ts`
```typescript
@Component({
  selector: 'app-competition-list',
  standalone: true,  // ← Preuve Angular 18 Standalone
  imports: [CommonModule, RouterModule],
  templateUrl: './competition-list.component.html'
})
```

---

### 2. **TypeScript 5.x**
**Fichier**: `Platforme/package.json`
```json
"typescript": "~5.5.2"
```
**Preuve dans le code**:
- `Platforme/tsconfig.json` - Configuration TypeScript
- Tous les fichiers `.ts` dans `Platforme/src/app/`

**Exemple d'utilisation**:
```typescript
// Platforme/src/app/core/models/competition.model.ts
export interface Competition {
  competitionId: number;
  title: string;
  description: string;
  type: CompetitionType;
  status: CompetitionStatus;
  // ... TypeScript interfaces
}
```

---

### 3. **RxJS**
**Fichier**: `Platforme/package.json`
```json
"rxjs": "~7.8.0"
```
**Preuve dans le code**:
- `Platforme/src/app/core/services/competition.service.ts`
```typescript
import { Observable } from 'rxjs';

getCompetitions(): Observable<Competition[]> {
  return this.http.get<Competition[]>(`${this.apiUrl}/competitions`);
}
```

**Autres exemples**:
- `Platforme/src/app/core/services/auth.service.ts` - BehaviorSubject
- `Platforme/src/app/core/services/notification.service.ts` - Subject
- Tous les services utilisent Observable pour les requêtes HTTP

---

### 4. **Chart.js**
**Fichier**: `Platforme/package.json`
```json
"chart.js": "^4.5.1"
```
**Preuve dans le code**:
- `Platforme/src/app/features/competitions/pages/formateur-dashboard/formateur-dashboard.component.ts`
```typescript
import { Chart, ChartConfiguration } from 'chart.js/auto';

createTypeChart() {
  const ctx = document.getElementById('typeChart') as HTMLCanvasElement;
  this.typeChart = new Chart(ctx, {
    type: 'pie',
    data: { /* ... */ }
  });
}
```

**Graphiques créés**:
1. Pie Chart - Répartition par type
2. Doughnut Chart - Répartition par statut
3. Line Chart - Évolution mensuelle

**Fichier HTML**: `Platforme/src/app/features/competitions/pages/formateur-dashboard/formateur-dashboard.component.html`
```html
<canvas id="typeChart"></canvas>
<canvas id="statusChart"></canvas>
<canvas id="monthlyChart"></canvas>
```

---

### 5. **WebSocket (SockJS + Stomp)**
**Fichier**: `Platforme/package.json`
```json
"@stomp/stompjs": "^7.3.0",
"sockjs-client": "^1.6.1"
```
**Preuve dans le code**:
- `Platforme/src/app/core/services/chat.service.ts`
```typescript
import { Client } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';

connect(competitionId: number): void {
  const socket = new SockJS('http://localhost:8087/ws');
  this.stompClient = new Client({
    webSocketFactory: () => socket,
    onConnect: () => {
      this.stompClient?.subscribe(
        `/topic/competition/${competitionId}`,
        (message) => { /* ... */ }
      );
    }
  });
  this.stompClient.activate();
}
```

**Utilisation**:
- Chat en temps réel dans les compétitions
- Fichier: `Platforme/src/app/features/competitions/pages/competition-detail/competition-detail.component.ts`

---

### 6. **Bootstrap/CSS3**
**Fichiers CSS**:
- `Platforme/src/styles.css` - Styles globaux
- Tous les fichiers `.component.css` dans `Platforme/src/app/`

**Preuve dans le code**:
```css
/* Platforme/src/styles.css */
.btn {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
}

.card {
  background: white;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
```

**Classes Bootstrap utilisées**:
- `.btn`, `.btn-primary`, `.btn-secondary`
- `.card`, `.card-header`, `.card-body`
- `.alert`, `.badge`
- Grid system (flexbox/grid CSS)

---

### 7. **i18n (ngx-translate)**
**Fichier**: `Platforme/package.json`
```json
"@ngx-translate/core": "^17.0.0",
"@ngx-translate/http-loader": "^17.0.0"
```

**Configuration**:
- `Platforme/src/app/app.config.ts`
```typescript
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

providers: [
  importProvidersFrom(
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  )
]
```

**Fichiers de traduction**:
- `Platforme/src/assets/i18n/en.json` - Anglais
- `Platforme/src/assets/i18n/fr.json` - Français

**Utilisation dans le code**:
- `Platforme/src/app/shared/components/language-selector/language-selector.component.ts`
```typescript
import { TranslateService } from '@ngx-translate/core';

switchLanguage(lang: string) {
  this.translate.use(lang);
  localStorage.setItem('language', lang);
}
```

**Utilisation dans les templates**:
```html
<!-- Platforme/src/app/features/competitions/pages/competition-list/competition-list.component.html -->
<h1>{{ 'competitions.title' | translate }}</h1>
<button>{{ 'competitions.create' | translate }}</button>
```

---

## 🔧 BACKEND - Spring Boot (Professional Events/)

### 1. **Java 17**
**Fichier**: `Professional Events/pom.xml`
```xml
<properties>
    <java.version>17</java.version>
</properties>
```
**Preuve**: Tous les fichiers `.java` dans `Professional Events/src/main/java/`

---

### 2. **Spring Boot 3.2.0**
**Fichier**: `Professional Events/pom.xml`
```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>
</parent>
```

---

### 3. **Spring Data JPA**
**Fichier**: `Professional Events/pom.xml`
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```
**Preuve dans le code**:
- `Professional Events/src/main/java/org/example/professional_events/repository/CompetitionRepository.java`
```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompetitionRepository extends JpaRepository<Competition, Long> {
    List<Competition> findByFormateurId(Long formateurId);
    
    @Query("SELECT c FROM Competition c WHERE c.status = :status")
    List<Competition> findByStatus(@Param("status") String status);
}
```

---

### 4. **Spring Security + JWT**
**Fichier**: `Professional Events/pom.xml`
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
```
**Preuve dans le code**:
- Configuration de sécurité dans les controllers
- Utilisation de `@PreAuthorize` pour les rôles

---

### 5. **Spring Cloud Eureka Client**
**Fichier**: `Professional Events/pom.xml`
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```
**Preuve dans le code**:
- `Professional Events/src/main/resources/application.properties`
```properties
spring.application.name=professional-events-service
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
eureka.instance.prefer-ip-address=true
```

---

### 6. **Spring WebSocket**
**Fichier**: `Professional Events/pom.xml`
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```
**Preuve dans le code**:
- `Professional Events/src/main/java/org/example/professional_events/config/WebSocketConfig.java`
```java
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:4200")
                .withSockJS();
    }
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }
}
```

**Utilisation**:
- `Professional Events/src/main/java/org/example/professional_events/controller/ChatController.java`
```java
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;

@MessageMapping("/chat.send")
@SendTo("/topic/competition/{competitionId}")
public ChatMessage sendMessage(@Payload ChatMessage message) {
    return chatService.saveMessage(message);
}
```

---

### 7. **Twilio SMS API**
**Fichier**: `Professional Events/pom.xml`
```xml
<dependency>
    <groupId>com.twilio.sdk</groupId>
    <artifactId>twilio</artifactId>
    <version>9.14.1</version>
</dependency>
```
**Preuve dans le code**:
- `Professional Events/src/main/java/org/example/professional_events/service/SmsService.java`
```java
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

@Service
public class SmsService {
    
    @Value("${twilio.account.sid}")
    private String accountSid;
    
    @Value("${twilio.auth.token}")
    private String authToken;
    
    @Value("${twilio.phone.number}")
    private String fromPhoneNumber;
    
    @PostConstruct
    public void init() {
        Twilio.init(accountSid, authToken);
    }
    
    public void sendSms(String to, String messageBody) {
        Message message = Message.creator(
            new PhoneNumber(to),
            new PhoneNumber(fromPhoneNumber),
            messageBody
        ).create();
    }
}
```

**Configuration**:
- `Professional Events/src/main/resources/application.properties`
```properties
twilio.account.sid=YOUR_ACCOUNT_SID
twilio.auth.token=YOUR_AUTH_TOKEN
twilio.phone.number=YOUR_TWILIO_PHONE_NUMBER
```

---

### 8. **MySQL 8.0**
**Fichier**: `Professional Events/pom.xml`
```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```
**Configuration**:
- `Professional Events/src/main/resources/application.properties`
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/professional_events_db
spring.datasource.username=root
spring.datasource.password=
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

---

### 9. **Lombok**
**Fichier**: `Professional Events/pom.xml`
```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
```
**Preuve dans le code**:
- `Professional Events/src/main/java/org/example/professional_events/entity/Competition.java`
```java
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Competition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long competitionId;
    // ... autres champs
}
```

---

### 10. **Maven**
**Fichier**: `Professional Events/pom.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <!-- ... -->
</project>
```
**Commandes Maven**:
```bash
mvn clean install
mvn spring-boot:run
```

---

## 📂 RÉSUMÉ DES FICHIERS CLÉS

### Frontend (Platforme/)
```
Platforme/
├── package.json                    ← Toutes les dépendances frontend
├── tsconfig.json                   ← Configuration TypeScript
├── angular.json                    ← Configuration Angular
├── src/
│   ├── assets/i18n/               ← Fichiers de traduction (FR/EN)
│   ├── styles.css                 ← Styles globaux CSS3
│   └── app/
│       ├── core/services/
│       │   ├── chat.service.ts    ← WebSocket (SockJS + Stomp)
│       │   └── *.service.ts       ← RxJS Observables
│       ├── features/competitions/pages/
│       │   └── formateur-dashboard/
│       │       └── *.component.ts ← Chart.js
│       └── shared/components/
│           └── language-selector/ ← ngx-translate
```

### Backend (Professional Events/)
```
Professional Events/
├── pom.xml                         ← Toutes les dépendances backend
├── src/main/
│   ├── java/org/example/professional_events/
│   │   ├── config/
│   │   │   └── WebSocketConfig.java    ← Spring WebSocket
│   │   ├── service/
│   │   │   └── SmsService.java         ← Twilio API
│   │   ├── repository/
│   │   │   └── *.Repository.java       ← Spring Data JPA
│   │   └── entity/
│   │       └── *.java                  ← JPA Entities + Lombok
│   └── resources/
│       └── application.properties      ← Configuration (MySQL, Eureka, Twilio)
```

---

## ✅ CHECKLIST DE VALIDATION

Pour prouver à ton professeur que tu utilises ces technologies:

### Frontend:
- ✅ `package.json` - Montre toutes les versions
- ✅ Composants `.ts` avec `standalone: true` - Angular 18
- ✅ Interfaces TypeScript dans `models/`
- ✅ Services avec `Observable<T>` - RxJS
- ✅ `formateur-dashboard.component.ts` - Chart.js
- ✅ `chat.service.ts` - WebSocket (SockJS + Stomp)
- ✅ Fichiers `.css` - CSS3 moderne
- ✅ `assets/i18n/` + `language-selector` - ngx-translate

### Backend:
- ✅ `pom.xml` - Montre toutes les dépendances
- ✅ `@Entity` avec `@Data` - JPA + Lombok
- ✅ `Repository extends JpaRepository` - Spring Data JPA
- ✅ `WebSocketConfig.java` - Spring WebSocket
- ✅ `SmsService.java` avec `Twilio.init()` - Twilio API
- ✅ `application.properties` - MySQL + Eureka
- ✅ `@EnableEurekaClient` - Spring Cloud

---

**Date**: Mars 2026
**Version**: 1.0.0
