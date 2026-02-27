import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [
    RouterModule
  ],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.scss'
})
export class ErrorPageComponent {
  status?: number;
  message?: string;

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(data => {
      this.status = data['status'];
      this.message = this.getMessageForStatus(this.status);
    });
  }

  private getMessageForStatus(status?: number): string {
    switch (status) {
      case 403:
        return "Access Denied: You don't have permission to access this page.";
      case 404:
        return 'Page Not Found: The page you are looking for does not exist.';
      default:
        return 'An unexpected error occurred.';
    }
  }
}
