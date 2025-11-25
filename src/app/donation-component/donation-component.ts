import { Component, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, Navigation } from '@angular/router';
import { DoacoesService, Doacao } from '../doacoes.service';
import { CampanhasService, Campanha } from '../campanhas.service';

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
  public selectedCampanha = signal<Campanha | null>(null);
  protected readonly campanhaId = signal<number | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private route: ActivatedRoute,
    private doacoesService: DoacoesService,
    private campanhasService: CampanhasService
  ) {
    this.donationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      street: ['', [Validators.required, Validators.minLength(3)]],
      number: ['', [Validators.required]],
      complement: [''],
      neighborhood: ['', [Validators.required, Validators.minLength(2)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
      zipCode: ['', [Validators.required, this.validateZipCode.bind(this)]],
      cpf: ['', [Validators.required, this.validateCpf.bind(this)]],
      amount: ['', [Validators.required, this.validateAmount.bind(this)]]
    });
  }

// donation-component.ts (dentro do ngOnInit)

  // donation-component.ts

    ngOnInit(): void {
          console.log('=== DonationComponent Inicializado ===');
          
          // Passo 1: Leitura MÍNIMA do ID da URL (obrigatório para formar a URL do FastAPI)
          const idFromRoute = this.route.snapshot.paramMap.get('campanhaId');

          if (idFromRoute) {
              const id = Number(idFromRoute);
              if (!isNaN(id)) {
                  // Passo 2: Imediatamente chama a API com o ID lido.
                  this.loadCampanha(id); 
                  return;
              }
          }

          // Se falhar a leitura do ID da URL
          console.error('❌ Nenhum ID de campanha válido na URL para buscar no FastAPI!');
          this.errorMessage.set('Campanha não encontrada. Redirecionando...');
          // Redireciona caso o acesso seja inválido.
      }

      private loadCampanha(campanhaId: number): void {
          console.log(`Buscando campanha ${campanhaId} no FastAPI...`);
          this.campanhasService.getCampanha(campanhaId).subscribe({ 
              next: (campanha: Campanha) => {
                  // Salva o objeto COMPLETO (com o ID e todos os dados)
                  this.selectedCampanha.set(campanha); 
                  console.log('✅ Campanha carregada do FastAPI:', campanha);
              },
              error: (error: any) => {
                  console.error('Erro ao carregar campanha do FastAPI:', error);
                  this.errorMessage.set('Erro ao carregar campanha. Tente novamente.');
              }
          });
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
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    const cents = parseInt(numbers, 10);
    const reais = cents / 100;
    return reais.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  private maskCPF(value: string): string {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return numbers.slice(0, 3) + '.' + numbers.slice(3);
    if (numbers.length <= 9) return numbers.slice(0, 3) + '.' + numbers.slice(3, 6) + '.' + numbers.slice(6);
    return numbers.slice(0, 3) + '.' + numbers.slice(3, 6) + '.' + numbers.slice(6, 9) + '-' + numbers.slice(9, 11);
  }

  private maskZipCode(value: string): string {
    const numbers = value.replace(/\D/g, '').slice(0, 8);
    if (numbers.length <= 5) return numbers;
    return numbers.slice(0, 5) + '-' + numbers.slice(5, 8);
  }

  private validateCpf(control: AbstractControl): ValidationErrors | null {
    const cpf = control.value?.replace(/\D/g, '');
    if (!cpf || cpf.length !== 11) {
      return { invalidCpf: true };
    }
    return null;
  }

  private validateZipCode(control: AbstractControl): ValidationErrors | null {
    const zipCode = control.value?.replace(/\D/g, '');
    if (!zipCode || zipCode.length !== 8) {
      return { invalidZipCode: true };
    }
    return null;
  }

  private validateAmount(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    const cleanValue = value.toString().replace(/\./g, '').replace(',', '.');
    const numValue = parseFloat(cleanValue);
    if (isNaN(numValue) || numValue <= 0) {
      return { invalidAmount: true };
    }
    return null;
  }

  // Adicione logo no início do onSubmit
  protected onSubmit(): void {
    console.log('=== onSubmit INICIADO ===');
    console.log('CampanhaId atual:', this.campanhaId());
    console.log('Campanha selecionada:', this.selectedCampanha());  

    // Verificar cada controle individualmente
    Object.keys(this.donationForm.controls).forEach(key => {
      const control = this.donationForm.get(key);
      console.log(`${key}: valid=${control?.valid}, value=${control?.value}, errors=${JSON.stringify(control?.errors)}`);
    });

    if (!this.donationForm.valid) {
      console.log('❌ Formulário inválido');
      this.errorMessage.set('Formulário inválido. Verifique todos os campos.');
      this.markFormGroupTouched(this.donationForm);
      return;
    }

    const campanha = this.selectedCampanha(); 

    if (!campanha?.id) {
      console.log('❌ CampanhaId não encontrado');
      this.errorMessage.set('Campanha não encontrada. Por favor, volte e tente novamente.');
      return;
    }

    const formData = this.donationForm.value;
    const cleanAmount = formData.amount.toString().replace(/\./g, '').replace(',', '.');
    const amount = parseFloat(cleanAmount);

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const doacao: Omit<Doacao, 'user_id'> = {
      campanha_id: campanha.id,
      valor: amount,
      doador_nome: formData.name,
      doador_email: formData.email,
      doador_cpf: formData.cpf.replace(/\D/g, ''),
      rua: formData.street,
      numero: formData.number,
      complemento: formData.complement || '',
      bairro: formData.neighborhood,
      cidade: formData.city,
      uf: formData.state.toUpperCase(),
      cep: formData.zipCode.replace(/\D/g, '')
    };

    console.log('✅ Enviando doação:', doacao);

    this.doacoesService.criarDoacao(doacao).subscribe({
      next: (response: any) => {
        console.log('✅ Resposta do backend:', response);
        this.isLoading.set(false);
        this.donationAmount.set(amount);

        const qrData = this.generateQRCodeData(formData, response.id);
        this.qrCodeData.set(qrData);
        const pattern = this.generateQRPattern();
        this.qrCodePattern.set(pattern);

        this.showQRCode.set(true);
        this.successMessage.set('Doação criada com sucesso! Escaneie o QR Code para confirmar o pagamento.');

        setTimeout(() => {
          const qrElement = document.getElementById('qr-code-section');
          if (qrElement) {
            qrElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('❌ Erro ao criar doação:', error);
        const errorMsg = error.error?.detail || error.message || 'Erro ao criar doação. Tente novamente.';
        this.errorMessage.set(errorMsg);
      }
    });
  }

  protected goBack(): void {
    this.router.navigate(['/home']);
  }

  protected printQRCode(): void {
    window.print();
  }

  protected downloadQRCode(): void {
    alert('QR Code seria baixado aqui. Em produção, isso baixaria a imagem do QR code.');
  }

  private generateQRCodeData(formData: any, doacaoId: number): string {
    const cleanAmount = formData.amount.toString().replace(/\./g, '').replace(',', '.');
    const amount = parseFloat(cleanAmount).toFixed(2);
    const timestamp = new Date().toISOString();

    const addressParts = [
      formData.street,
      formData.number,
      formData.complement ? ` - ${formData.complement}` : '',
      formData.neighborhood,
      formData.city,
      formData.state,
      formData.zipCode.replace(/\D/g, '')
    ].filter((part: string) => part).join(', ');

    return JSON.stringify({
      doacaoId: doacaoId,
      name: formData.name,
      email: formData.email,
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
      paymentMethod: 'PIX',
      campanhaId: this.campanhaId()
    });
  }

  private generateQRPattern(): boolean[][] {
    const size = 25;
    const pattern: boolean[][] = [];

    for (let i = 0; i < size; i++) {
      pattern[i] = [];
      for (let j = 0; j < size; j++) {
        const isFilled = Math.random() > 0.45;
        pattern[i][j] = isFilled;
      }
    }

    return pattern;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}