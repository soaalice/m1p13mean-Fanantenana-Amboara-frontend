import { Component } from '@angular/core';
import { Location, NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [
    NgIf,
    RouterModule
  ],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.scss'
})
export class ErrorPageComponent {
  status?: number;
  message?: string;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private authService: AuthService
  ) {
    this.route.data.subscribe(data => {
      this.status = data['status'];
      this.message = this.getMessageForStatus(this.status);
    });
  }

  goBack(): void {
    this.location.back();
  }

  goToLogin(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private getMessageForStatus(status?: number): string {
    switch (status) {
      case 403:
        return "Accès refusé : Vous n'avez pas la permission d'accéder à cette page.";
      case 404:
        return 'Page non trouvée : La page que vous recherchez n’existe pas.';
      default:
        return 'Une erreur inattendue s’est produite.';
    }
  }
}
