import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, NG_VALIDATORS, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ValidateNumber } from './../shared/validators/number.validator';
import { QuoteService } from './quote.service';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';

const VALUE_MILLION = 1000000;
const VALUE_THOUSAND = 1000;
const VALUE_HUNDRED = 100;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [{ provide: NG_VALIDATORS, useExisting: ValidateNumber, multi: true }]
})
export class HomeComponent implements OnInit {
  /**
   * Formulaire
   */
  checkForm: FormGroup;

  /**
   * FormControl pour les chiffres
   */
  numberCtrl: FormControl;

  quote: string;
  isLoading: boolean;

  /**
   * Unités en Français
   */
  fr_unitesTab: string[] = [
    'zéro',
    'un',
    'deux',
    'trois',
    'quatre',
    'cinq',
    'six',
    'sept',
    'huit',
    'neuf',
    'dix',
    'onze',
    'douze',
    'treize',
    'quatorze',
    'quinze',
    'seize',
    'dix sept',
    'dix huit',
    'dix neuf'
  ];

  /**
   * Dizaines en Français
   */
  fr_dizainesTab: string[] = [
    'zéro',
    'dix',
    'vingt',
    'trente',
    'quarante',
    'cinquante',
    'soixante',
    'soixante dix',
    'quatre vingt',
    'quatre vingt dix'
  ];

  /**
   * Unités en Anglais
   */
  en_unitesTab: string[] = [
    'zero',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'height',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thriteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen'
  ];

  /**
   * Dizaines en Anglais
   */
  en_dizainesTab: string[] = [
    'zero',
    'ten',
    'twenty',
    'thirty',
    'fourty',
    'fifty',
    'sixty',
    'seventy',
    'eighty',
    'ninety'
  ];

  /**
   * String résultant de la conversion de chiffres en lettres
   */
  numberConvertToWords = '';

  constructor(
    private quoteService: QuoteService,
    private _formBuilder: FormBuilder,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.numberCtrl = this._formBuilder.control('', [Validators.required, ValidateNumber]);
    this.initializeForm();
    this.isLoading = true;
    this.quoteService
      .getRandomQuote({ category: 'dev' })
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((quote: string) => {
        this.quote = quote;
      });
    this.translateService.onLangChange.subscribe(() => {
      this.numberConvertToWords = '';
      this.checkForm.get('numberCheck').setValue('');
      this.initializeForm();
    });
  }

  /**
   * Initialise le formulaire
   */
  initializeForm() {
    this.checkForm = this._formBuilder.group({
      numberCheck: this.numberCtrl
    });
  }

  /**
   * Converti le chiffre en mots
   * @param numToConvert Nombre à convertir
   */
  convertNumber(number: any, numberTmp?: any): any {
    if (number === 0) {
      return 'zero';
    }

    this.numberConvertToWords = '';

    if (Math.floor(number / VALUE_MILLION) > 0) {
      this.numberConvertToWords += this.convertNumber(Math.floor(number / VALUE_MILLION), numberTmp) + ' million ';
      number %= VALUE_MILLION;
    }

    if (Math.floor(number / VALUE_THOUSAND) > 0) {
      if (Math.floor(number / VALUE_THOUSAND) === 1 && this.checkLanguage() === 'fr') {
        this.numberConvertToWords += 'mille ';
      } else {
        this.checkLanguage() === 'fr'
          ? (this.numberConvertToWords +=
              this.convertNumber(Math.floor(number / VALUE_THOUSAND), numberTmp) + ' mille ')
          : (this.numberConvertToWords +=
              this.convertNumber(Math.floor(number / VALUE_THOUSAND), numberTmp) + ' thousand ');
      }
      number %= VALUE_THOUSAND;
    }

    if (Math.floor(number / VALUE_HUNDRED) > 0) {
      if (Math.floor(number / VALUE_HUNDRED) === 1 && this.checkLanguage() === 'fr') {
        this.checkLanguage() === 'fr'
          ? (this.numberConvertToWords += 'cent ')
          : (this.numberConvertToWords += 'hundred ');
      } else {
        this.checkLanguage() === 'fr'
          ? (this.numberConvertToWords += this.convertNumber(Math.floor(number / VALUE_HUNDRED), numberTmp) + ' cent ')
          : (this.numberConvertToWords +=
              this.convertNumber(Math.floor(number / VALUE_HUNDRED), numberTmp) + ' hundred ');
      }
      number %= VALUE_HUNDRED;
    }
    if (number < 20) {
      this.checkLanguage() === 'fr'
        ? (this.numberConvertToWords += this.fr_unitesTab[number])
        : (this.numberConvertToWords += this.en_unitesTab[number]);
    } else {
      this.checkLanguage() === 'fr'
        ? (this.numberConvertToWords += this.fr_dizainesTab[Math.floor(number / 10)])
        : (this.numberConvertToWords += this.en_dizainesTab[Math.floor(number / 10)]);
      if (number % 10 > 0) {
        this.checkLanguage() === 'fr'
          ? (this.numberConvertToWords += ' ' + this.fr_unitesTab[number % 10])
          : (this.numberConvertToWords += ' ' + this.en_unitesTab[number % 10]);
      }
    }

    return this.numberConvertToWords;
  }

  checkLanguage(): string {
    return this.translateService.currentLang;
  }

  /**
   * Tester si le chiffre est bien à virgule
   * @param number Nombre à vérifier
   */
  isFloat(number: any): boolean {
    return number === +number && number !== (number | 0);
  }
}
