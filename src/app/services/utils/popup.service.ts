import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class PopupService {

  constructor() { }


  showMessage(title: string, message: string, icon: 'success' | 'error' | 'warning' | 'info' | 'question' = 'info') {
    Swal.fire({
      title: title,
      text: message,
      icon: icon,
      confirmButtonText: 'CERRAR'
    });
  }


  loader(title: string = 'Cargando...', message: string = '') {
    Swal.fire({
      title: title,
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });
  }


  async showConfirmation
    (title: string, message: string,  confirmButtonText: string = 'Aceptar', cancelButtonText: string = 'Cancelar'
  ): Promise<boolean> {

    const result = await Swal.fire({
      title: title,
      text: message,
      icon: 'question',
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText
    });

    return result.isConfirmed;
  }

  close() {
    Swal.close();
  }
}