import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { ConfirmationDialogComponent } from './shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NotificationComponent, ConfirmationDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Dynamic Forms';
}
