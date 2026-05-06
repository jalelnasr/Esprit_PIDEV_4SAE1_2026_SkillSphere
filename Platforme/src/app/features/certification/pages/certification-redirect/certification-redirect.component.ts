import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-certification-redirect',
  standalone: true,
  template: `<div class="redirecting">Loading...</div>`
})
export class CertificationRedirectComponent implements OnInit {
  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.userRole$
      .pipe(filter(Boolean), take(1))
      .subscribe((role) => {
        if (role === 'APPRENANT') {
          this.router.navigate(['/certification/certificates']);
        } else if (role === 'FORMATEUR') {
          this.router.navigate(['/certification/requests']);
        } else {
          this.router.navigate(['/certification/exams']);
        }
      });
  }
}
