from sqlalchemy import Table, Column, Integer, String, Float, DateTime, Boolean, ForeignKey, func
from db import Base
from datetime import datetime, timezone

# Tabela de usuários
users = Table(
    "users",
    Base.metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("username", String(50), unique=True, nullable=False),
    Column("cpf", String(14), unique=True, nullable=False),
    Column("email", String(100), unique=True, nullable=False),
    Column("password", String(255), nullable=False),
)

# Tabela de campanhas de doação
campanhas = Table(
    "campanhas",
    Base.metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("nome", String(200), nullable=False),
    Column("tipo_categoria", String(1000)),
    Column("descricao", String(1000)),
    Column("localizacao", String(100), default="São Paulo, SP", server_default="São Paulo, SP"),
    Column("meta_valor", Float, nullable=False),
    Column("valor_arrecadado", Float, default=0.0, server_default="0.0"),
    Column("website", String(1000)),
    Column("telefone", String(20)),
    Column("data_inicio", DateTime(timezone=True), server_default=func.now()),
    Column("data_fim", DateTime(timezone=True), nullable=True),
    Column("ativa", Boolean, default=True, server_default="true"),
    Column("email", String(1000), nullable=True),
    Column("rating", Float, default=4.8, server_default="4.8"),
)

# Tabela de doações
doacoes = Table(
    "doacoes",
    Base.metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("campanha_id", Integer, ForeignKey("campanhas.id", ondelete="CASCADE"), nullable=False),
    Column("user_id", Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
    Column("valor", Float, nullable=False),
    Column("doador_nome", String(200), nullable=False),
    Column("doador_cpf", String(14), nullable=False),
    Column("doador_email", String(100), nullable=True),
    
    Column("rua", String(200), nullable=False),
    Column("numero", String(20), nullable=False),
    Column("complemento", String(100), nullable=True),
    Column("bairro", String(100), nullable=False),
    Column("cidade", String(100), nullable=False),
    Column("uf", String(2), nullable=False),
    Column("cep", String(8), nullable=False),
    
    Column("data_doacao", DateTime(timezone=True), server_default=func.now()),
    Column("metodo_pagamento", String(50), default="PIX", server_default="PIX"),
    Column("status", String(20), default="pendente", server_default="pendente"),
    Column("pix_code", String(500), nullable=True),
    Column("pix_qr_code", String(1000), nullable=True),
)