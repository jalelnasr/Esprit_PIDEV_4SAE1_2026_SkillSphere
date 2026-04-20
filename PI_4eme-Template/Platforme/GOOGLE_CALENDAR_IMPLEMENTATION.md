# Implémentation Google Calendar - Guide Complet

## 🎯 Méthode Simple (Recommandée) - Frontend Uniquement

Cette méthode ne nécessite **AUCUNE configuration backend**, **AUCUNE API key**, et fonctionne immédiatement!

### Étape 1: Créer le Service Angular

Créez un service pour gérer les liens Google Calendar:

```typescript
// src/app/core/services/calendar.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  /**
   * Génère un lien Google Calendar pour ajouter un événement
   */
  generateGoogleCalendarLink(event: {
    title: string;
    description: string;
    location: string;
    startDate: Date;
    endDate: Date;
  }): string {
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      details: event.description,
      location: event.location,
      dates: `${formatDate(event.startDate)}/${formatDate(event.endDate)}`
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  /**
   * Ouvre Google Calendar dans un nouvel onglet
   */
  addToGoogleCalendar(event: {
    title: string;
    description: string;
    location: string;
    startDate: Date;
    endDate: Date;
  }): void {
    const url = this.generateGoogleCalendarLink(event);
    window.open(url, '_blank');
  }
}
```

### Étape 2: Ajouter le Bouton dans course-details.component.ts

Lisez d'abord le fichier pour voir la structure:

```typescript
// Ajoutez ces imports
import { CalendarService } from '@core/services/calendar.service';

// Dans le constructor, ajoutez:
constructor(
  // ... autres services
  private calendarService: CalendarService
) {}

// Ajoutez cette méthode
addSessionToCalendar(session: Session): void {
  const event = {
    title: `${this.course.title} - Session`,
    description: `Formation: ${this.course.title}\nNiveau: ${this.course.level}\nDurée: ${this.course.durationMinutes} minutes`,
    location: session.location || 'En ligne',
    startDate: new Date(session.startAt),
    endDate: new Date(session.endAt)
  };
  
  this.calendarService.addToGoogleCalendar(event);
}
```

### Étape 3: Ajouter le Bouton dans le HTML

Dans `course-details.component.html`, ajoutez le bouton à côté du bouton "S'inscrire":

```html
<!-- Dans la section des sessions -->
<div class="session-actions">
  <button 
    class="btn-enroll" 
    (click)="enrollInSession(session.id)"
    [disabled]="isEnrolledInSession(session.id)">
    {{ isEnrolledInSession(session.id) ? 'Inscrit ✓' : 'S\'inscrire' }}
  </button>
  
  <!-- NOUVEAU BOUTON -->
  <button 
    class="btn-calendar" 
    (click)="addSessionToCalendar(session); $event.stopPropagation()"
    title="Ajouter à Google Calendar">
    📅 Ajouter au calendrier
  </button>
</div>
```

### Étape 4: Ajouter les Styles CSS

Dans `course-details.component.css`:

```css
.session-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn-calendar {
  padding: 0.75rem 1.5rem;
  background: white;
  color: #4285f4;
  border: 2px solid #4285f4;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-calendar:hover {
  background: #4285f4;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
}

.btn-calendar:active {
  transform: translateY(0);
}
```

---

## 🚀 Utilisation dans D'autres Composants

### Dans instructor-sessions.component.ts

```typescript
import { CalendarService } from '@core/services/calendar.service';

constructor(private calendarService: CalendarService) {}

shareSessionCalendar(session: Session): void {
  const event = {
    title: `Session: ${session.courseTitle}`,
    description: `Session de formation\nCapacité: ${session.capacity} places\nInscrits: ${session.enrolledCount}`,
    location: session.location || 'En ligne',
    startDate: new Date(session.startAt),
    endDate: new Date(session.endAt)
  };
  
  this.calendarService.addToGoogleCalendar(event);
}
```

### Dans my-courses.component.ts

```typescript
import { CalendarService } from '@core/services/calendar.service';

constructor(private calendarService: CalendarService) {}

addCourseToCalendar(course: any): void {
  // Pour une formation sans date fixe, créer un événement "À planifier"
  const now = new Date();
  const event = {
    title: `📚 Formation: ${course.title}`,
    description: `Durée estimée: ${course.durationMinutes} minutes\nNiveau: ${course.level}\n\nÀ planifier selon votre disponibilité`,
    location: 'En ligne - SkillSphere',
    startDate: now,
    endDate: new Date(now.getTime() + course.durationMinutes * 60000)
  };
  
  this.calendarService.addToGoogleCalendar(event);
}
```

---

## 📱 Résultat Attendu

Quand l'utilisateur clique sur "Ajouter au calendrier":
1. Un nouvel onglet s'ouvre avec Google Calendar
2. Le formulaire est pré-rempli avec toutes les infos
3. L'utilisateur clique juste sur "Enregistrer"
4. L'événement est ajouté à son calendrier Google
5. Il reçoit des rappels automatiques (configurables dans Google Calendar)

---

## ✅ Avantages de Cette Méthode

1. **Aucune configuration** - Fonctionne immédiatement
2. **Pas d'API key** - Pas besoin de compte Google Cloud
3. **Gratuit** - 100% gratuit, pas de limites
4. **Simple** - Juste un lien URL
5. **Sécurisé** - Pas de données sensibles
6. **Compatible** - Fonctionne sur tous les navigateurs
7. **Mobile-friendly** - Ouvre l'app Google Calendar sur mobile

---

## 🎨 Variantes de Boutons

### Bouton avec Icône SVG

```html
<button class="btn-calendar" (click)="addSessionToCalendar(session)">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
  </svg>
  Ajouter au calendrier
</button>
```

### Bouton Compact

```html
<button class="btn-calendar-compact" (click)="addSessionToCalendar(session)" title="Ajouter à Google Calendar">
  📅
</button>
```

```css
.btn-calendar-compact {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 2px solid #4285f4;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-calendar-compact:hover {
  background: #4285f4;
  transform: scale(1.1);
}
```

---

## 🔧 Personnalisation Avancée

### Ajouter des Rappels

Google Calendar ajoute automatiquement des rappels par défaut, mais vous pouvez suggérer des rappels dans la description:

```typescript
generateGoogleCalendarLink(event: any): string {
  const description = `${event.description}\n\n⏰ Rappels suggérés:\n- 1 jour avant\n- 1 heure avant`;
  
  // ... reste du code
}
```

### Ajouter des Participants

```typescript
generateGoogleCalendarLink(event: any): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description,
    location: event.location,
    dates: `${formatDate(event.startDate)}/${formatDate(event.endDate)}`,
    add: 'instructor@skillsphere.tn,support@skillsphere.tn' // Emails des participants
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
```

### Ajouter une Couleur

```typescript
// Google Calendar ne supporte pas la couleur via URL
// Mais vous pouvez ajouter un emoji dans le titre pour identification visuelle
title: `🎓 ${event.title}` // Emoji éducation
title: `💻 ${event.title}` // Emoji tech
title: `📊 ${event.title}` // Emoji business
```

---

## 🧪 Test

1. Démarrez votre application Angular
2. Allez sur une page de détails de formation avec sessions
3. Cliquez sur "Ajouter au calendrier"
4. Vérifiez que Google Calendar s'ouvre avec les bonnes infos
5. Cliquez sur "Enregistrer" dans Google Calendar
6. Vérifiez que l'événement apparaît dans votre calendrier

---

## 📊 Statistiques (Optionnel)

Si vous voulez tracker combien d'utilisateurs ajoutent des événements:

```typescript
addSessionToCalendar(session: Session): void {
  const event = { /* ... */ };
  
  // Tracker l'action
  this.analyticsService.trackEvent('calendar_add', {
    session_id: session.id,
    course_id: this.course.id
  });
  
  this.calendarService.addToGoogleCalendar(event);
}
```

---

## ⚠️ Limitations

1. **Pas de synchronisation automatique** - L'utilisateur doit cliquer manuellement
2. **Pas de mise à jour** - Si la session change, l'événement calendrier n'est pas mis à jour
3. **Pas de suppression** - Si l'utilisateur se désinscrit, l'événement reste dans son calendrier

**Solution:** Ajouter un lien dans la description de l'événement vers la page de la session pour vérifier les changements.

---

## 🎯 Prochaines Étapes

1. ✅ Créer `CalendarService`
2. ✅ Ajouter bouton dans `course-details`
3. ✅ Ajouter styles CSS
4. ✅ Tester avec une vraie session
5. 🔄 Ajouter dans d'autres composants (instructor-sessions, my-courses)
6. 🔄 Ajouter analytics (optionnel)

---

## 💡 Bonus: Support iCal (Apple Calendar, Outlook)

Si vous voulez aussi supporter Apple Calendar et Outlook:

```typescript
generateICalFile(event: any): void {
  const ical = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${this.formatICalDate(event.startDate)}
DTEND:${this.formatICalDate(event.endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([ical], { type: 'text/calendar' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'event.ics';
  link.click();
}

private formatICalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}
```

---

## 📚 Documentation Officielle

- Google Calendar URL Scheme: https://github.com/InteractionDesignFoundation/add-event-to-calendar-docs/blob/main/services/google.md
- iCal Format: https://icalendar.org/

---

## ✅ Résumé

**Temps d'implémentation:** 30 minutes
**Coût:** 0€
**Complexité:** Très facile
**Valeur ajoutée:** Élevée

C'est la méthode la plus simple et efficace pour ajouter Google Calendar à votre projet!
