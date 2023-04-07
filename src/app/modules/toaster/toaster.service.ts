import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

/**
 * Service for showing toasters (using Material Snackbar)
 */
@Injectable()
export class ToasterService {
  private readonly horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  private readonly verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  private readonly duration = 5000;
  constructor(private readonly snackBar: MatSnackBar, private readonly zone: NgZone) {}

  show(message: string, action?: string) {
    this.zone.run(() => {
      this.snackBar.open(message, action, {
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
        duration: this.duration,
        panelClass: 'app-snackbar',
      });
    });
  }
}
