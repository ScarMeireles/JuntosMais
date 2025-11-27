from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from db import database, Base, engine
from models import users, campanhas, doacoes
from schemas import (
    UserLogin, UserCreate,
    CampanhaCreate, CampanhaUpdate, CampanhaResponse,
    DoacaoCreate, DoacaoResponse, DoacaoConfirmacao
)
from typing import List, Optional
from datetime import datetime

app = FastAPI(
    title="API de Doações para ONGs",
    description="API completa para gerenciar usuários, campanhas e doações.",
    version="2.0.0"
)
Base.metadata.create_all(engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

def hash_password(password: str) -> str:
    """Gera hash bcrypt da senha (trunca em 72 bytes se necessário)"""
    import bcrypt
    # Limitar a 72 bytes (limite do bcrypt)
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha corresponde ao hash"""
    import bcrypt
    # Limitar a 72 bytes (limite do bcrypt)
    password_bytes = plain_password.encode('utf-8')[:72]
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)

@app.on_event("startup")
async def startup():
    """Conecta ao banco na inicialização"""
    await database.connect()
    print("✅ Conectado ao PostgreSQL")

@app.on_event("shutdown")
async def shutdown():
    """Desconecta do banco ao encerrar"""
    await database.disconnect()
    print("❌ Desconectado do PostgreSQL")


@app.post("/register", status_code=201)
async def register(user: UserCreate):
    """Registra um novo usuário com senha hasheada"""
    
    query_username = users.select().where(users.c.username == user.username)
    existing_username = await database.fetch_one(query_username)
    
    if existing_username:
        raise HTTPException(status_code=400, detail="Nome de usuário já existente")
    
    query_email = users.select().where(users.c.email == user.email)
    existing_email = await database.fetch_one(query_email)
    
    if existing_email:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    query_cpf = users.select().where(users.c.cpf == user.cpf)
    existing_cpf = await database.fetch_one(query_cpf)
    
    if existing_cpf:
        raise HTTPException(status_code=400, detail="CPF já cadastrado")
    
    hashed_password = hash_password(user.password)
    
    query_insert = users.insert().values(
        username=user.username,
        cpf=user.cpf,
        email=user.email,
        password=hashed_password
    )
    
    user_id = await database.execute(query_insert)
    
    return {
        "id": user_id,
        "username": user.username,
        "email": user.email,
        "message": "Cadastro realizado com sucesso"
    }

@app.post("/login")
async def login(user: UserLogin):
    """Autentica usuário e retorna informações básicas"""
    
    query = users.select().where(users.c.email == user.email)
    db_user = await database.fetch_one(query)
    
    if not db_user:
        raise HTTPException(status_code=401, detail="Email ou senha inválidos")
    
    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Email ou senha inválidos")
    
    return {
        "message": "Login realizado com sucesso",
        "user": {
            "id": db_user.id,
            "username": db_user.username,
            "email": db_user.email,
            "cpf": db_user.cpf
        }
    }

@app.get("/users/me/{user_id}")
async def get_user_profile(user_id: int):
    """Obtém perfil do usuário"""
    query = users.select().where(users.c.id == user_id)
    user = await database.fetch_one(query)
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "cpf": user.cpf
    }

@app.post("/campanhas", response_model=CampanhaResponse, status_code=201)
async def criar_campanha(campanha: CampanhaCreate):
    """Cria uma nova campanha de doação"""
    query = campanhas.insert().values(
        nome=campanha.nome,
        tipo_categoria=campanha.tipo_categoria,
        descricao=campanha.descricao,
        meta_valor=campanha.meta_valor,
        localizacao=campanha.localizacao or "São Paulo, SP",
        website=campanha.website,
        telefone=campanha.telefone,
        email=campanha.email,
        data_fim=campanha.data_fim,
        valor_arrecadado=0.0,
        ativa=True,
        rating=4.8
    )
    
    campanha_id = await database.execute(query)
    
    query_select = campanhas.select().where(campanhas.c.id == campanha_id)
    db_campanha = await database.fetch_one(query_select)
    
    percentual = (db_campanha.valor_arrecadado / db_campanha.meta_valor) * 100
    
    return {**dict(db_campanha), "percentual_atingido": percentual}

@app.get("/campanhas", response_model=List[CampanhaResponse])
async def listar_campanhas(ativas: Optional[bool] = True, limit: int = 100):
    """Lista todas as campanhas (ativas por padrão)"""
    query = campanhas.select().limit(limit).order_by(campanhas.c.data_inicio.desc())
    
    if ativas is not None:
        query = query.where(campanhas.c.ativa == ativas)
    
    results = await database.fetch_all(query)
    
    campanhas_list = []
    for camp in results:
        percentual = (camp.valor_arrecadado / camp.meta_valor) * 100 if camp.meta_valor > 0 else 0
        campanhas_list.append({
            **dict(camp), 
            "percentual_atingido": percentual,
            "rating": camp.rating if camp.rating is not None else 4.8
        })
    
    return campanhas_list

@app.get("/campanhas/{campanha_id}", response_model=CampanhaResponse)
async def obter_campanha(campanha_id: int):
    """Obtém detalhes de uma campanha específica"""
    query = campanhas.select().where(campanhas.c.id == campanha_id)
    campanha = await database.fetch_one(query)
    
    if not campanha:
        raise HTTPException(status_code=404, detail="Campanha não encontrada")
    
    percentual = (campanha.valor_arrecadado / campanha.meta_valor) * 100 if campanha.meta_valor > 0 else 0
    
    return {
        **dict(campanha), 
        "percentual_atingido": percentual,
        "rating": campanha.rating if campanha.rating is not None else 4.8
    }

# @app.patch("/campanhas/{campanha_id}", response_model=CampanhaResponse)
# async def atualizar_campanha(campanha_id: int, campanha_update: CampanhaUpdate):
#     """Atualiza uma campanha existente"""
#     query = campanhas.select().where(campanhas.c.id == campanha_id)
#     existing = await database.fetch_one(query)
    
#     if not existing:
#         raise HTTPException(status_code=404, detail="Campanha não encontrada")
    
#     update_data = campanha_update.dict(exclude_unset=True)
    
#     if update_data:
#         query_update = campanhas.update().where(campanhas.c.id == campanha_id).values(**update_data)
#         await database.execute(query_update)
    
#     query_select = campanhas.select().where(campanhas.c.id == campanha_id)
#     updated_campanha = await database.fetch_one(query_select)
    
#     percentual = (updated_campanha.valor_arrecadado / updated_campanha.meta_valor) * 100
    
#     return {
#         **dict(updated_campanha), 
#         "percentual_atingido": percentual,
#         "rating": updated_campanha.rating if updated_campanha.rating is not None else 4.8
#     }

@app.delete("/campanhas/{campanha_id}")
async def deletar_campanha(campanha_id: int):
    """Desativa uma campanha"""
    query = campanhas.select().where(campanhas.c.id == campanha_id)
    existing = await database.fetch_one(query)
    
    if not existing:
        raise HTTPException(status_code=404, detail="Campanha não encontrada")

    query_update = campanhas.update().where(campanhas.c.id == campanha_id).values(ativa=False)
    await database.execute(query_update)
    
    return {"message": "Campanha desativada com sucesso"}


@app.post("/doacoes/", response_model=DoacaoResponse, status_code=201)
async def criar_doacao(doacao: DoacaoCreate):
    """Cria uma nova doação (status pendente)"""
    query = campanhas.select().where(campanhas.c.id == doacao.campanha_id)
    campanha = await database.fetch_one(query)
    
    if not campanha:
        raise HTTPException(status_code=404, detail="Campanha não encontrada")
    
    if not campanha.ativa:
        raise HTTPException(status_code=400, detail="Campanha não está ativa")
    
    query_insert = doacoes.insert().values(
        campanha_id=doacao.campanha_id,
        user_id=doacao.user_id,
        valor=doacao.valor,
        doador_nome=doacao.doador_nome,
        rua=doacao.rua,
        numero=doacao.numero,
        complemento=doacao.complemento,
        bairro=doacao.bairro,
        cidade=doacao.cidade,
        uf=doacao.uf,
        cep=doacao.cep,
        doador_cpf=doacao.doador_cpf,
        doador_email=doacao.doador_email,
        status="pendente",
        metodo_pagamento="PIX"
    )
    
    doacao_id = await database.execute(query_insert)
    
    query_select = doacoes.select().where(doacoes.c.id == doacao_id)
    db_doacao = await database.fetch_one(query_select)
    
    return dict(db_doacao)

@app.patch("/doacoes/{doacao_id}/confirmar", response_model=DoacaoConfirmacao)
async def confirmar_doacao(doacao_id: int):
    """Confirma uma doação e atualiza o valor arrecadado da campanha"""
    query = doacoes.select().where(doacoes.c.id == doacao_id)
    doacao = await database.fetch_one(query)
    
    if not doacao:
        raise HTTPException(status_code=404, detail="Doação não encontrada")
    
    if doacao.status == "confirmado":
        raise HTTPException(status_code=400, detail="Doação já confirmada")
    
    query_update = doacoes.update().where(doacoes.c.id == doacao_id).values(status="confirmado")
    await database.execute(query_update)
    
    query_campanha = campanhas.select().where(campanhas.c.id == doacao.campanha_id)
    campanha = await database.fetch_one(query_campanha)
    
    novo_valor = campanha.valor_arrecadado + doacao.valor
    
    query_update_campanha = campanhas.update().where(
        campanhas.c.id == doacao.campanha_id
    ).values(valor_arrecadado=novo_valor)
    
    await database.execute(query_update_campanha)
    
    percentual = (novo_valor / campanha.meta_valor) * 100 if campanha.meta_valor > 0 else 0
    
    return {
        "message": "Doação confirmada com sucesso",
        "novo_valor_arrecadado": novo_valor,
        "percentual_atingido": percentual
    }

@app.patch("/doacoes/{doacao_id}/cancelar")
async def cancelar_doacao(doacao_id: int):
    """Cancela uma doação pendente"""
    query = doacoes.select().where(doacoes.c.id == doacao_id)
    doacao = await database.fetch_one(query)
    
    if not doacao:
        raise HTTPException(status_code=404, detail="Doação não encontrada")
    
    if doacao.status == "confirmado":
        raise HTTPException(status_code=400, detail="Não é possível cancelar doação já confirmada")
    
    query_update = doacoes.update().where(doacoes.c.id == doacao_id).values(status="cancelado")
    await database.execute(query_update)
    
    return {"message": "Doação cancelada com sucesso"}

@app.get("/doacoes/campanha/{campanha_id}", response_model=List[DoacaoResponse])
async def listar_doacoes_campanha(campanha_id: int, status: Optional[str] = None):
    """Lista todas as doações de uma campanha"""
    query = doacoes.select().where(doacoes.c.campanha_id == campanha_id).order_by(doacoes.c.data_doacao.desc())
    
    if status:
        query = query.where(doacoes.c.status == status)
    
    results = await database.fetch_all(query)
    return [dict(d) for d in results]

# @app.get("/doacoes/user/{user_id}", response_model=List[DoacaoResponse])
# async def listar_doacoes_usuario(user_id: int):
#     """Lista todas as doações de um usuário"""
#     query = doacoes.select().where(doacoes.c.user_id == user_id).order_by(doacoes.c.data_doacao.desc())
#     results = await database.fetch_all(query)
#     return [dict(d) for d in results]

@app.get("/doacoes/{doacao_id}", response_model=DoacaoResponse)
async def obter_doacao(doacao_id: int):
    """Obtém detalhes de uma doação específica"""
    query = doacoes.select().where(doacoes.c.id == doacao_id)
    doacao = await database.fetch_one(query)
    
    if not doacao:
        raise HTTPException(status_code=404, detail="Doação não encontrada")
    
    return dict(doacao)

@app.get("/stats/campanha/{campanha_id}")
async def estatisticas_campanha(campanha_id: int):
    """Retorna estatísticas de uma campanha"""
    query_camp = campanhas.select().where(campanhas.c.id == campanha_id)
    campanha = await database.fetch_one(query_camp)
    
    if not campanha:
        raise HTTPException(status_code=404, detail="Campanha não encontrada")
    
    query_count = f"SELECT COUNT(*) as total FROM doacoes WHERE campanha_id = {campanha_id} AND status = 'confirmado'"
    total_doacoes = await database.fetch_one(query_count)
    
    query_avg = f"SELECT AVG(valor) as media FROM doacoes WHERE campanha_id = {campanha_id} AND status = 'confirmado'"
    doacao_media = await database.fetch_one(query_avg)
    
    percentual = (campanha.valor_arrecadado / campanha.meta_valor) * 100
    
    return {
        "campanha_id": campanha_id,
        "nome": campanha.nome,
        "meta_valor": campanha.meta_valor,
        "valor_arrecadado": campanha.valor_arrecadado,
        "percentual_atingido": round(percentual, 2),
        "total_doacoes": total_doacoes['total'] if total_doacoes else 0,
        "doacao_media": round(doacao_media['media'], 2) if doacao_media and doacao_media['media'] else 0,
        "falta_arrecadar": campanha.meta_valor - campanha.valor_arrecadado
    }

@app.get("/stats/geral")
async def estatisticas_gerais():
    """Retorna estatísticas gerais da plataforma"""
    query_camp = "SELECT COUNT(*) as total FROM campanhas WHERE ativa = true"
    total_campanhas = await database.fetch_one(query_camp)
    
    query_total = "SELECT SUM(valor_arrecadado) as total FROM campanhas WHERE ativa = true"
    total_arrecadado = await database.fetch_one(query_total)
    
    query_doacoes = "SELECT COUNT(*) as total FROM doacoes WHERE status = 'confirmado'"
    total_doacoes = await database.fetch_one(query_doacoes)
    
    query_users = "SELECT COUNT(*) as total FROM users"
    total_usuarios = await database.fetch_one(query_users)
    
    return {
        "total_campanhas_ativas": total_campanhas['total'] if total_campanhas else 0,
        "total_arrecadado": total_arrecadado['total'] if total_arrecadado and total_arrecadado['total'] else 0,
        "total_doacoes": total_doacoes['total'] if total_doacoes else 0,
        "total_usuarios": total_usuarios['total'] if total_usuarios else 0
    }

@app.get("/")
def root():
    return {
        "message": "🎯 API de Doações para ONGs",
        "version": "2.0.0",
        "docs": "/docs",
        "endpoints": {
            "auth": {
                "register": "POST /register",
                "login": "POST /login",
                "profile": "GET /users/me/{user_id}"
            },
            "campanhas": {
                "listar": "GET /campanhas/",
                "criar": "POST /campanhas/",
                "detalhes": "GET /campanhas/{id}",
                "atualizar": "PATCH /campanhas/{id}",
                "desativar": "DELETE /campanhas/{id}"
            },
            "doacoes": {
                "criar": "POST /doacoes/",
                "confirmar": "PATCH /doacoes/{id}/confirmar",
                "cancelar": "PATCH /doacoes/{id}/cancelar",
                "listar_campanha": "GET /doacoes/campanha/{campanha_id}",
                "listar_usuario": "GET /doacoes/user/{user_id}"
            },
            "stats": {
                "campanha": "GET /stats/campanha/{id}",
                "geral": "GET /stats/geral"
            }
        }
    }

@app.get("/health")
async def health_check():
    """Verifica se a API e o banco estão funcionando"""
    try:
        await database.fetch_one("SELECT 1")
        return {
            "status": "healthy",
            "database": "connected",
            "message": "API funcionando corretamente"
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Erro no banco de dados: {str(e)}")
