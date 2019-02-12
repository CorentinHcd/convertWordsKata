import { AbstractControl } from '@angular/forms';

const CONST_MIN_VALUE = 2.0;
const CONST_MAX_VALUE = 1000000.0;

export function ValidateNumber(control: AbstractControl): { [key: string]: boolean } {
  if (isInt(control.value) && control.value >= CONST_MIN_VALUE && control.value <= CONST_MAX_VALUE) {
    return { validNumber: true };
  }
  return { validNumber: false };
}

/**
 * Tester si le chiffre est bien un entier
 * @param number Nombre à vérifier
 */
function isInt(number: any): boolean {
  return number % 1 === 0;
}
