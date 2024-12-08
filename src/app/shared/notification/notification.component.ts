import {
  Component,
  EventEmitter,
  Input,
  input,
  OnInit,
  Output,
} from "@angular/core";

@Component({
  selector: "app-notification",
  templateUrl: "./notification.component.html",
  styleUrl: "./notification.component.scss",
})
export class NotificationComponent {
  @Input() message: string = "";
  @Input() duration: number = 5000; // Bildiriş müddəti (ms)
  @Output() notificationClosed = new EventEmitter<void>();

  ngOnInit(): void {
    this.playSound();
    setTimeout(() => {
      this.notificationClosed.emit(); // Bildirişi bağla
    }, this.duration);
  }

  playSound(): void {
    const audio = new Audio("assets/notification/volunteerNotification.wav");
    audio.play();
  }
}
