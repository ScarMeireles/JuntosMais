import { Component, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-donation-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './donation-component.html',
  styleUrl: './donation-component.sass'
})
export class DonationComponent implements OnInit {
  protected readonly donationForm: FormGroup;
  protected readonly showQRCode = signal(false);
  protected readonly qrCodeData = signal<string>('');
  protected readonly qrCodePattern = signal<boolean[][]>([]);
  protected readonly donationAmount = signal<number>(0);
  protected readonly selectedNGO = signal<any>(null);

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.donationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      street: ['', [Validators.required, Validators.minLength(3)]],
      number: ['', [Validators.required]],
      complement: [''],
      neighborhood: ['', [Validators.required, Validators.minLength(2)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
      zipCode: ['', [Validators.required, this.zipCodeValidator]],
      cpf: ['', [Validators.required, this.cpfValidator]],
      amount: ['', [Validators.required, Validators.min(1), this.amountValidator]]
    });
  }

  ngOnInit(): void {
    // Verificar se há dados passados via state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const state = navigation.extras.state;
      if (state['ngo']) {
        this.selectedNGO.set(state['ngo']);
      }
      if (state['amount']) {
        this.donationForm.patchValue({ amount: state['amount'] });
      }
    }
  }

  protected onCPFInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const masked = this.maskCPF(value);
    if (masked !== value) {
      this.donationForm.get('cpf')?.setValue(masked, { emitEvent: false });
    }
  }

  protected onAmountInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const masked = this.maskAmount(value);
    if (masked !== value) {
      this.donationForm.get('amount')?.setValue(masked, { emitEvent: false });
    }
  }

  protected onZipCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const masked = this.maskZipCode(value);
    if (masked !== value) {
      this.donationForm.get('zipCode')?.setValue(masked, { emitEvent: false });
    }
  }

  protected onStateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.toUpperCase();
    if (value !== input.value) {
      this.donationForm.get('state')?.setValue(value, { emitEvent: false });
    }
  }

  private maskAmount(value: string): string {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    if (!numbers) {
      return '';
    }
    
    // Converte para centavos e depois formata
    const cents = parseInt(numbers, 10);
    const reais = cents / 100;
    
    // Formata como moeda brasileira
    return reais.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  private maskCPF(value: string): string {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    
    // Aplica a máscara
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return numbers.slice(0, 3) + '.' + numbers.slice(3);
    } else if (numbers.length <= 9) {
      return numbers.slice(0, 3) + '.' + numbers.slice(3, 6) + '.' + numbers.slice(6);
    } else {
      return numbers.slice(0, 3) + '.' + numbers.slice(3, 6) + '.' + numbers.slice(6, 9) + '-' + numbers.slice(9, 11);
    }
  }

  private maskZipCode(value: string): string {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '').slice(0, 8);
    
    // Aplica a máscara de CEP (00000-000)
    if (numbers.length <= 5) {
      return numbers;
    } else {
      return numbers.slice(0, 5) + '-' + numbers.slice(5, 8);
    }
  }

  protected onSubmit(): void {
    if (this.donationForm.valid) {
      // Gerar dados mockados para o QR code
      const formData = this.donationForm.value;
      // Converter valor formatado para número
      const cleanAmount = formData.amount.toString().replace(/\./g, '').replace(',', '.');
      const amount = parseFloat(cleanAmount);
      this.donationAmount.set(amount);
      
      const qrData = this.generateQRCodeData(formData);
      this.qrCodeData.set(qrData);
      
      // Gerar padrão do QR code
      const pattern = this.generateQRPattern();
      this.qrCodePattern.set(pattern);
      
      this.showQRCode.set(true);
      
      // Scroll para o QR code
      setTimeout(() => {
        const qrElement = document.getElementById('qr-code-section');
        if (qrElement) {
          qrElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } else {
      this.markFormGroupTouched(this.donationForm);
    }
  }

  protected goBack(): void {
    this.router.navigate(['/home']);
  }

  protected printQRCode(): void {
    window.print();
  }

  protected downloadQRCode(): void {
    // Simular download do QR code
    alert('QR Code seria baixado aqui. Em produção, isso baixaria a imagem do QR code.');
  }

  private generateQRCodeData(formData: any): string {
    // Gerar dados mockados para o QR code
    const donationId = 'DON-' + Date.now();
    // Converter valor formatado (ex: "1.234,56") para número
    const cleanAmount = formData.amount.toString().replace(/\./g, '').replace(',', '.');
    const amount = parseFloat(cleanAmount).toFixed(2);
    const timestamp = new Date().toISOString();
    
    // Montar endereço completo
    const addressParts = [
      formData.street,
      formData.number,
      formData.complement ? ` - ${formData.complement}` : '',
      formData.neighborhood,
      formData.city,
      formData.state,
      formData.zipCode.replace(/\D/g, '')
    ].filter(part => part).join(', ');
    
    return JSON.stringify({
      donationId: donationId,
      name: formData.name,
      cpf: formData.cpf.replace(/\D/g, ''),
      address: {
        street: formData.street,
        number: formData.number,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode.replace(/\D/g, ''),
        fullAddress: addressParts
      },
      amount: amount,
      timestamp: timestamp,
      paymentMethod: 'PIX'
    });
  }

  private amountValidator(control: any): { [key: string]: any } | null {
    const value = control.value;
    if (!value) {
      return { required: true };
    }
    // Remove formatação e converte para número
    const cleanValue = value.toString().replace(/\./g, '').replace(',', '.');
    const numValue = parseFloat(cleanValue);
    if (isNaN(numValue) || numValue <= 0) {
      return { invalidAmount: true };
    }
    return null;
  }

  private generateQRPattern(): boolean[][] {
    // Gerar um padrão que simula um QR code (25x25 células)
    const size = 25;
    const pattern: boolean[][] = [];
    
    for (let i = 0; i < size; i++) {
      pattern[i] = [];
      for (let j = 0; j < size; j++) {
        // Criar um padrão que pareça um QR code real
        // Deixar algumas áreas mais densas e outras mais esparsas
        const isFilled = Math.random() > 0.45;
        pattern[i][j] = isFilled;
      }
    }
    
    return pattern;
  }

  private cpfValidator(control: any): { [key: string]: any } | null {
    const cpf = control.value?.replace(/\D/g, '');
    if (!cpf || cpf.length !== 11) {
      return { invalidCpf: true };
    }
    return null;
  }

  private zipCodeValidator(control: any): { [key: string]: any } | null {
    const zipCode = control.value?.replace(/\D/g, '');
    if (!zipCode || zipCode.length !== 8) {
      return { invalidZipCode: true };
    }
    return null;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}

