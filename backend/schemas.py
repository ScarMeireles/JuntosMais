from pydantic import BaseModel, validator, Field, EmailStr
from typing import Optional
from datetime import datetime

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    cpf: str = Field(..., min_length=11, max_length=14)
    email: EmailStr
    password: str = Field(..., min_length=6)
    
    @validator('cpf')
    def validar_cpf(cls, v):
        cpf_limpo = ''.join(filter(str.isdigit, v))
        if len(cpf_limpo) != 11:
            raise ValueError('CPF deve conter 11 dígitos')
        return cpf_limpo

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    cpf: str
    
    class Config:
        from_attributes = True

class CampanhaBase(BaseModel):
    nome: str = Field(..., min_length=3, max_length=200)
    tipo_categoria: str = Field(max_length=1000)
    descricao: Optional[str] = Field(None, max_length=1000)
    localizacao: Optional[str] = "São Paulo, SP"
    meta_valor: float = Field(..., gt=0)
    website: Optional[str] = Field(None, max_length=1000)
    telefone: Optional[str] = Field(None, max_length=14)
    email: Optional[EmailStr] = None
    data_fim: Optional[datetime] = None
    
    
    @validator('meta_valor')
    def meta_positiva(cls, v):
        if v <= 0:
            raise ValueError('Meta deve ser maior que zero')
        return v

class CampanhaCreate(CampanhaBase):
    pass

class CampanhaUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=3, max_length=200)
    descricao: Optional[str] = Field(None, max_length=1000)
    meta_valor: Optional[float] = Field(None, gt=0)
    data_fim: Optional[datetime] = None
    ativa: Optional[bool] = None
    imagem_url: Optional[str] = None
    localizacao: Optional[str] = None

class CampanhaResponse(CampanhaBase):
    id: int
    valor_arrecadado: float
    data_inicio: datetime
    ativa: bool
    percentual_atingido: float
    rating: float
    
    class Config:
        from_attributes = True


class DoacaoBase(BaseModel):
    campanha_id: int
    valor: float = Field(..., gt=0)
    doador_nome: str = Field(..., min_length=3, max_length=200)
    doador_cpf: str = Field(..., min_length=11, max_length=14)
    doador_email: Optional[EmailStr] = None
    rua: str = Field(..., min_length=3)
    numero: str = Field(..., min_length=1)
    complemento: Optional[str] = None
    bairro: str = Field(..., min_length=2)
    cidade: str = Field(..., min_length=2)
    uf: str = Field(..., min_length=2, max_length=2)
    cep: str = Field(..., min_length=8, max_length=8)
    
    @validator('valor')
    def valor_positivo(cls, v):
        if v <= 0:
            raise ValueError('Valor deve ser maior que zero')
        return v
    
    @validator('doador_cpf', 'cep')
    def limpar_formatacao(cls, v):
        return ''.join(filter(str.isdigit, v))
    
    @validator('uf')
    def uf_maiuscula(cls, v):
        return v.upper()

class DoacaoCreate(DoacaoBase):
    user_id: Optional[int] = None

class DoacaoResponse(DoacaoBase):
    id: int
    data_doacao: datetime
    metodo_pagamento: str
    status: str
    pix_code: Optional[str] = None
    pix_qr_code: Optional[str] = None
    user_id: Optional[int] = None
    
    class Config:
        from_attributes = True

class DoacaoConfirmacao(BaseModel):
    message: str
    novo_valor_arrecadado: float
    percentual_atingido: float