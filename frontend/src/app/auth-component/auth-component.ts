import { Component, OnInit, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface AuthResponse {
  token: string;
  user_id: number;
  email: string;
  name?: string;
}

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-component.html',
  styleUrls: ['./auth-component.sass']
})
export class AuthComponent implements OnInit {
  // Platform check
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  // Properties for the template
  protected readonly logoPath = '/assets/logo.png';
  protected readonly projectName = 'Juntos+';

  // Signals
  protected readonly isLoginMode = signal<boolean>(true);
  protected readonly isLoading = signal<boolean>(false);
  protected readonly errorMessage = signal<string>('');

  // Reactive Forms
  loginForm!: FormGroup;
  registerForm!: FormGroup;

  private apiUrl = 'http://localhost:8000';

  constructor(
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    console.log('🔧 AuthComponent inicializado');
    console.log('🌐 isBrowser:', this.isBrowser);

    // Effect para reagir às mudanças no modo
    effect(() => {
      const isLogin = this.isLoginMode();
      console.log('Modo alterado:', isLogin ? 'Login' : 'Registro');
      this.errorMessage.set('');
    });
  }

  ngOnInit(): void {
    console.log('📋 ngOnInit chamado');
    // Inicializar formulários
    this.initForms();

    // Verificar se já está autenticado - APENAS NO NAVEGADOR
    if (this.isBrowser) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const expiry = payload.exp * 1000;
          
          if (Date.now() < expiry) {
            console.log('✅ Usuário já autenticado, redirecionando...');
            this.router.navigate(['/home']);
          } else {
            console.log('⚠️ Token expirado, removendo...');
            localStorage.removeItem('token');
            localStorage.removeItem('user_id');
            localStorage.removeItem('user_email');
            localStorage.removeItem('user_name');
          }
        } catch (e) {
          console.error('❌ Erro ao validar token:', e);
          localStorage.removeItem('token');
          localStorage.removeItem('user_id');
          localStorage.removeItem('user_email');
          localStorage.removeItem('user_name');
        }
      }
    } else {
      console.log('⚠️ SSR detectado - pulando verificação de autenticação');
    }
  }

  private initForms(): void {
    // Formulário de Login
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Formulário de Registro
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required, this.cpfValidator]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });

    console.log('✅ Formulários inicializados');
  }

  // Validador customizado para CPF
  private cpfValidator(control: AbstractControl): { [key: string]: any } | null {
    const cpf = control.value?.replace(/\D/g, '');
    if (!cpf || cpf.length !== 11) {
      return { invalidCpf: true };
    }
    return null;
  }

  // Validador para senhas coincidentes
  private passwordMatchValidator(group: AbstractControl): { [key: string]: any } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  protected toggleMode(): void {
    this.isLoginMode.set(!this.isLoginMode());
    this.errorMessage.set('');
    this.loginForm.reset();
    this.registerForm.reset();
  }

  protected onLoginSubmit(): void {
    console.log('===== 🔐 TENTATIVA DE LOGIN =====');
    
    if (this.loginForm.invalid) {
      console.log('⚠️ Formulário inválido');
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.errorMessage.set('');
    this.isLoading.set(true);

    const loginData = this.loginForm.value;
    const url = `${this.apiUrl}/login`;

    console.log('📤 Enviando requisição para:', url);
    console.log('📧 Email:', loginData.email);

    this.http.post<AuthResponse>(url, loginData).subscribe({
      next: (response) => {
        console.log('===== ✅ LOGIN BEM-SUCEDIDO =====');
        console.log('📦 Response completa:', response);
        console.log('📦 Tipo da response:', typeof response);
        console.log('📦 Keys da response:', Object.keys(response));
        console.log('🔑 Token:', response.token);
        console.log('👤 User ID:', response.user_id);
        console.log('👤 Tipo do User ID:', typeof response.user_id);
        console.log('📧 Email:', response.email);
        console.log('📝 Name:', response.name);
        console.log('================================');
        
        // Salvar token e dados do usuário - APENAS NO NAVEGADOR
        if (this.isBrowser) {
          if (response.token) {
            localStorage.setItem('token', response.token);
            console.log('✅ Token salvo no localStorage');
          } else {
            console.warn('⚠️ Token não encontrado na response');
          }
          
          if (response.user_id !== undefined && response.user_id !== null) {
            localStorage.setItem('user_id', response.user_id.toString());
            console.log('✅ User ID salvo:', response.user_id);
          } else {
            console.warn('⚠️ user_id não encontrado na response');
            console.warn('⚠️ Campos disponíveis:', Object.keys(response));
          }
          
          if (response.email) {
            localStorage.setItem('user_email', response.email);
            console.log('✅ Email salvo');
          }
          
          if (response.name) {
            localStorage.setItem('user_name', response.name);
            console.log('✅ Name salvo');
          }

          console.log('📦 localStorage atual:', {
            token: localStorage.getItem('token')?.substring(0, 20) + '...',
            user_id: localStorage.getItem('user_id'),
            user_email: localStorage.getItem('user_email'),
            user_name: localStorage.getItem('user_name')
          });
        } else {
          console.log('⚠️ SSR detectado - não salvando no localStorage');
        }
        
        this.isLoading.set(false);
        console.log('🚀 Navegando para /home');
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('===== ❌ ERRO NO LOGIN =====');
        console.error('📦 Error completo:', error);
        console.error('🔢 Status:', error.status);
        console.error('📝 Status Text:', error.statusText);
        console.error('🌐 URL:', error.url);
        console.error('💬 Message:', error.message);
        console.error('📄 Error body:', error.error);
        console.error('============================');
        
        this.isLoading.set(false);
        
        if (error.status === 401) {
          this.errorMessage.set('Email ou senha incorretos');
        } else if (error.status === 404) {
          this.errorMessage.set('Rota não encontrada. Verifique a URL da API');
        } else if (error.status === 0) {
          this.errorMessage.set('Não foi possível conectar ao servidor');
        } else {
          this.errorMessage.set(error.error?.detail || 'Erro ao fazer login');
        }
      }
    });
  }

  protected onRegisterSubmit(): void {
    console.log('===== 📝 TENTATIVA DE REGISTRO =====');
    
    if (this.registerForm.invalid) {
      console.log('⚠️ Formulário inválido');
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.errorMessage.set('');
    this.isLoading.set(true);

    const registerData = {
      name: this.registerForm.value.username,
      cpf: this.registerForm.value.cpf.replace(/\D/g, ''),
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    };

    const url = `${this.apiUrl}/register`;

    console.log('📤 Enviando requisição para:', url);
    console.log('📦 Dados:', { ...registerData, password: '***' });

    this.http.post<AuthResponse>(url, registerData).subscribe({
      next: (response) => {
        console.log('===== ✅ REGISTRO BEM-SUCEDIDO =====');
        console.log('📦 Response completa:', response);
        console.log('📦 Keys da response:', Object.keys(response));
        console.log('====================================');
        
        // Salvar token e dados do usuário - APENAS NO NAVEGADOR
        if (this.isBrowser) {
          if (response.token) {
            localStorage.setItem('token', response.token);
            console.log('✅ Token salvo');
          }
          
          if (response.user_id !== undefined && response.user_id !== null) {
            localStorage.setItem('user_id', response.user_id.toString());
            console.log('✅ User ID salvo:', response.user_id);
          } else {
            console.warn('⚠️ user_id não encontrado na response');
          }
          
          if (response.email) {
            localStorage.setItem('user_email', response.email);
            console.log('✅ Email salvo');
          }
          
          if (response.name) {
            localStorage.setItem('user_name', response.name);
            console.log('✅ Name salvo');
          }
        } else {
          console.log('⚠️ SSR detectado - não salvando no localStorage');
        }
        
        this.isLoading.set(false);
        console.log('🚀 Navegando para /home');
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('===== ❌ ERRO NO REGISTRO =====');
        console.error('📦 Error completo:', error);
        console.error('🔢 Status:', error.status);
        console.error('====================================');
        
        this.isLoading.set(false);
        
        if (error.status === 400) {
          this.errorMessage.set('Email já cadastrado');
        } else if (error.status === 404) {
          this.errorMessage.set('Rota não encontrada. Verifique a URL da API');
        } else if (error.status === 0) {
          this.errorMessage.set('Não foi possível conectar ao servidor');
        } else {
          this.errorMessage.set(error.error?.detail || 'Erro ao criar conta');
        }
      }
    });
  }
}