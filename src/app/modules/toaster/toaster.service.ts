import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

/**
 * Service for showing toasters (using Material Snackbar)
 */
@Injectable()
export class ToasterService {
  private static readonly horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  private static readonly verticalPosition: MatSnackBarVerticalPosition = 'top';
  private static readonly duration = 5000;
  constructor(private readonly snackBar: MatSnackBar) {}

  show(message: string, action?: string) {
    this.snackBar.open(message, action, {
      horizontalPosition: ToasterService.horizontalPosition,
      verticalPosition: ToasterService.verticalPosition,
      duration: ToasterService.duration,
    });
  }
}
