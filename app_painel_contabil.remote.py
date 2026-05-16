import os
import base64
import pandas as pd
import psycopg2
import streamlit as st

st.set_page_config(
    page_title="Painel Brandão Contabilidade",
    page_icon="📊",
    layout="wide",
)

def conectar():
    return psycopg2.connect(
        host=os.environ.get("DB_HOST", "postgres"),
        port=os.environ.get("DB_PORT", "5432"),
        dbname=os.environ.get("DB_NAME", "n8n"),
        user=os.environ.get("DB_USER", "n8n"),
        password=os.environ.get("DB_PASSWORD"),
    )

@st.cache_data(ttl=60)
def sql_df(sql):
    with conectar() as conn:
        return pd.read_sql_query(sql, conn)

def executar_sql_parametrizado(sql, params=None):
    with conectar() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params or [])
            try:
                resultado = cur.fetchall()
            except Exception:
                resultado = []
        conn.commit()
    return resultado



def validar_login_app(email, senha):
    """
    Valida login usando app_usuarios.senha_hash com crypt() no PostgreSQL.
    Não salva senha pura no Python nem no banco.
    """
    email = (email or "").strip().lower()
    senha = senha or ""

    if not email or not senha:
        return None

    sql = """
        SELECT
            id::text,
            nome,
            email,
            perfil_acesso,
            empresa_nome,
            empresa_cnpj,
            obrigar_troca_senha,
            COALESCE(tema_visual, 'ESCURO') AS tema_visual
        FROM app_usuarios
        WHERE lower(email) = lower(%s)
          AND ativo = TRUE
          AND senha_hash = crypt(%s, senha_hash)
        LIMIT 1;
    """

    with conectar() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (email, senha))
            row = cur.fetchone()

            if not row:
                return None

            usuario = {
                "id": row[0],
                "nome": row[1],
                "email": row[2],
                "perfil_acesso": row[3],
                "empresa_nome": row[4],
                "empresa_cnpj": row[5],
                "obrigar_troca_senha": row[6],
                "tema_visual": row[7] if len(row) > 7 else "ESCURO",
            }

            cur.execute(
                """
                UPDATE app_usuarios
                SET ultimo_login_em = NOW(),
                    atualizado_em = NOW()
                WHERE id = %s::uuid;
                """,
                (usuario["id"],),
            )

            cur.execute(
                """
                INSERT INTO app_auditoria_log (
                    usuario_id,
                    usuario_email,
                    perfil_acesso,
                    acao,
                    entidade,
                    observacao
                )
                VALUES (
                    %s::uuid,
                    %s,
                    %s,
                    'LOGIN_SUCESSO',
                    'app_usuarios',
                    'Login interno realizado com sucesso.'
                );
                """,
                (usuario["id"], usuario["email"], usuario["perfil_acesso"]),
            )

        conn.commit()

    return usuario


def registrar_auditoria_app(acao, entidade=None, entidade_id=None, perfil_id=None, cliente_nome=None, valor_anterior=None, valor_novo=None, observacao=None):
    """
    Log global para ações do painel. Vamos usar mais nas próximas fases.
    """
    usuario = st.session_state.get("usuario_logado") or {}

    try:
        executar_sql_parametrizado(
            """
            INSERT INTO app_auditoria_log (
                usuario_id,
                usuario_email,
                perfil_acesso,
                acao,
                entidade,
                entidade_id,
                perfil_id,
                cliente_nome,
                valor_anterior,
                valor_novo,
                observacao
            )
            VALUES (
                NULLIF(%s, '')::uuid,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s::jsonb,
                %s::jsonb,
                %s
            );
            """,
            [
                usuario.get("id", ""),
                usuario.get("email"),
                usuario.get("perfil_acesso"),
                acao,
                entidade,
                entidade_id,
                perfil_id,
                cliente_nome,
                None,
                None,
                observacao,
            ],
        )
    except Exception:
        # Nunca deixa uma falha de auditoria derrubar o painel.
        pass


def usuario_tem_permissao(permissao_codigo):
    usuario = st.session_state.get("usuario_logado")

    if not usuario:
        return False

    if usuario.get("perfil_acesso") == "ADMINISTRADOR":
        return True

    try:
        rows = executar_sql_parametrizado(
            """
            SELECT permitido
            FROM app_perfis_permissoes
            WHERE perfil_acesso = %s
              AND permissao_codigo = %s
            LIMIT 1;
            """,
            [usuario.get("perfil_acesso"), permissao_codigo],
        )

        return bool(rows and rows[0][0])
    except Exception:
        return False





def css_tema_visual_app(tema):
    tema = (tema or "ESCURO").upper()

    if tema == "CLARO":
        bg = "#f7f4ed"
        panel = "#ffffff"
        sidebar = "#111111"
        text = "#1f2937"
        muted = "#4b5563"
        border = "#e5dcc8"
        gold = "#b88722"
        input_bg = "#ffffff"
        input_text = "#111827"
        form_bg = "#ffffff"
    elif tema == "AUTOMATICO":
        bg = "#070707"
        panel = "#111111"
        sidebar = "#050505"
        text = "#f9fafb"
        muted = "#d1d5db"
        border = "#2a2418"
        gold = "#c9a24d"
        input_bg = "#151515"
        input_text = "#f9fafb"
        form_bg = "rgba(17, 17, 17, 0.82)"
    else:
        bg = "#070707"
        panel = "#111111"
        sidebar = "#050505"
        text = "#f9fafb"
        muted = "#d1d5db"
        border = "#2a2418"
        gold = "#c9a24d"
        input_bg = "#151515"
        input_text = "#f9fafb"
        form_bg = "rgba(17, 17, 17, 0.82)"

    css = """
    <style>
        :root {
            --brand-gold: __BRANDAO_GOLD__;
            --brand-bg: __BRANDAO_BG__;
            --brand-panel: __BRANDAO_PANEL__;
            --brand-sidebar: __BRANDAO_SIDEBAR__;
            --brand-text: __BRANDAO_TEXT__;
            --brand-muted: __BRANDAO_MUTED__;
            --brand-border: __BRANDAO_BORDER__;
            --brand-input: __BRANDAO_INPUT_BG__;
            --brand-input-text: __BRANDAO_INPUT_TEXT__;
            --brand-form-bg: __BRANDAO_FORM_BG__;
        }

        .stApp {
            background: var(--brand-bg) !important;
            color: var(--brand-text) !important;
        }

        [data-testid="stHeader"] {
            background: var(--brand-bg) !important;
        }

        [data-testid="stSidebar"] {
            background: linear-gradient(180deg, var(--brand-sidebar), #000000) !important;
            border-right: 1px solid rgba(201, 162, 77, 0.28);
        }

        [data-testid="stSidebar"] * {
            color: inherit;
        }

        .block-container {
            padding-top: 2.2rem !important;
            padding-bottom: 2rem !important;
        }

        h1, h2, h3, h4, h5, h6, p, span, label {
            color: var(--brand-text);
        }

        .brandao-sidebar-logo {
            text-align: center;
            padding: 0.75rem 0.25rem 1rem 0.25rem;
            border-bottom: 1px solid rgba(201, 162, 77, 0.35);
            margin-bottom: 1rem;
        }

        .brandao-sidebar-logo .brandao-title {
            font-size: 1.35rem;
            font-weight: 800;
            color: var(--brand-gold);
            line-height: 1.05;
        }

        .brandao-sidebar-logo .brandao-subtitle {
            font-size: 0.78rem;
            color: #ffffff;
            letter-spacing: 0.18em;
            margin-top: 0.15rem;
        }

        .brandao-top-card {
            background: linear-gradient(135deg, rgba(201,162,77,0.18), rgba(255,255,255,0.025));
            border: 1px solid rgba(201, 162, 77, 0.32);
            border-radius: 18px;
            padding: 1.25rem 1.35rem;
            margin: 0.35rem 0 1rem 0;
            box-shadow: 0 10px 30px rgba(0,0,0,0.20);
        }





        /* BRANDÃO DASHBOARD GRID K2A */

        .brandao-panel-card {
            background:
                radial-gradient(circle at 100% 0%, rgba(201,162,77,0.12), transparent 36%),
                linear-gradient(145deg, rgba(18,18,18,0.98), rgba(8,8,8,0.98));
            border: 1px solid rgba(201, 162, 77, 0.22);
            border-radius: 18px;
            padding: 0.95rem;
            box-shadow: 0 14px 32px rgba(0,0,0,0.25);
            min-height: 290px;
        }

        .brandao-panel-title {
            color: #ffffff !important;
            font-size: 1.05rem;
            font-weight: 950;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 0.25rem;
        }

        .brandao-panel-subtitle {
            color: rgba(245,245,245,0.62) !important;
            font-size: 0.78rem;
            margin-bottom: 0.75rem;
            line-height: 1.35;
        }

        .brandao-panel-badge {
            color: var(--brand-gold) !important;
            border: 1px solid rgba(201,162,77,0.55);
            border-radius: 9px;
            padding: 0.22rem 0.45rem;
            font-size: 0.68rem;
            font-weight: 900;
            background: rgba(201,162,77,0.08);
        }

        .brandao-mini-item {
            display: grid;
            grid-template-columns: 38px minmax(0,1fr) auto;
            gap: 0.55rem;
            align-items: center;
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 12px;
            padding: 0.55rem;
            margin-bottom: 0.48rem;
            background: rgba(255,255,255,0.025);
        }

        .brandao-mini-avatar {
            width: 34px;
            height: 34px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(201,162,77,0.14);
            border: 1px solid rgba(201,162,77,0.32);
            color: var(--brand-gold);
            font-weight: 950;
            font-size: 0.78rem;
        }

        .brandao-mini-name {
            color: #ffffff !important;
            font-size: 0.82rem;
            font-weight: 850;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .brandao-mini-desc {
            color: rgba(245,245,245,0.65) !important;
            font-size: 0.72rem;
            margin-top: 0.12rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .brandao-mini-tag {
            color: #f4c96b !important;
            border: 1px solid rgba(201,162,77,0.35);
            border-radius: 8px;
            padding: 0.22rem 0.4rem;
            font-size: 0.68rem;
            font-weight: 850;
            background: rgba(201,162,77,0.08);
            white-space: nowrap;
        }

        .brandao-mini-tag.danger {
            color: #ff7777 !important;
            border-color: rgba(255, 119, 119, 0.35);
            background: rgba(255,119,119,0.08);
        }

        .brandao-mini-tag.ok {
            color: #8fd18f !important;
            border-color: rgba(143, 209, 143, 0.35);
            background: rgba(143,209,143,0.08);
        }

        .brandao-empty-card {
            border: 1px solid rgba(143, 209, 143, 0.30);
            background: rgba(143, 209, 143, 0.08);
            color: #b7efb7 !important;
            border-radius: 12px;
            padding: 0.75rem;
            font-size: 0.82rem;
            font-weight: 750;
        }




        /* BRANDÃO LIMPEZA VISUAL REAL K2E */

        /* Esconde a barra antiga de abas horizontais.
           A navegação real agora fica pelo menu lateral. */
        div[data-testid="stTabs"] > div[role="tablist"] {
            display: none !important;
            height: 0 !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
        }

        div[data-testid="stTabs"] {
            margin-top: 0 !important;
            padding-top: 0 !important;
        }

        /* Sidebar: força todos os botões do menu no mesmo padrão */
        section[data-testid="stSidebar"] div[data-testid="stButton"] {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
        }

        section[data-testid="stSidebar"] div[data-testid="stButton"] > button {
            width: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
            height: 46px !important;
            min-height: 46px !important;
            max-height: 46px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            padding: 0 0.55rem !important;
            margin: 0.16rem 0 !important;
            border-radius: 13px !important;
            font-size: 0.92rem !important;
            font-weight: 850 !important;
            line-height: 1 !important;
            letter-spacing: -0.01em !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            border: 1px solid rgba(201,162,77,0.42) !important;
            background:
                linear-gradient(135deg, rgba(201,162,77,0.18), rgba(201,162,77,0.055)) !important;
            box-shadow: 0 8px 20px rgba(0,0,0,0.24) !important;
        }

        section[data-testid="stSidebar"] div[data-testid="stButton"] > button p {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            text-align: center !important;
            font-size: 0.92rem !important;
            font-weight: 850 !important;
            line-height: 1 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
        }

        section[data-testid="stSidebar"] div[data-testid="stButton"] > button:hover {
            border-color: rgba(201,162,77,0.88) !important;
            background:
                linear-gradient(135deg, rgba(201,162,77,0.34), rgba(201,162,77,0.12)) !important;
            transform: translateY(-1px);
        }

        /* Ajusta largura interna do menu para os botões ficarem alinhados */
        section[data-testid="stSidebar"] [data-testid="stVerticalBlock"] {
            gap: 0.34rem !important;
        }

        .brandao-sidebar-menu-title {
            text-align: center !important;
            font-size: 0.82rem !important;
            margin-top: 1.05rem !important;
        }

        .brandao-sidebar-menu-help {
            text-align: center !important;
            padding: 0 0.25rem !important;
        }


        /* BRANDÃO MENU LATERAL PADRONIZADO K1D */

        [data-testid="stSidebar"] div[data-testid="stButton"] {
            width: 100% !important;
            margin: 0 !important;
        }

        [data-testid="stSidebar"] div[data-testid="stButton"] > button {
            width: 100% !important;
            height: 44px !important;
            min-height: 44px !important;
            max-height: 44px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: flex-start !important;
            text-align: left !important;
            padding: 0 0.75rem !important;
            margin: 0.12rem 0 !important;
            border-radius: 12px !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            font-size: 0.86rem !important;
            line-height: 1 !important;
        }

        [data-testid="stSidebar"] div[data-testid="stButton"] > button p {
            width: 100% !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            margin: 0 !important;
            padding: 0 !important;
            line-height: 1 !important;
        }

        [data-testid="stSidebar"] div[data-testid="stButton"] > button[kind="secondary"] {
            background:
                linear-gradient(135deg, rgba(201,162,77,0.18), rgba(201,162,77,0.055)) !important;
        }


        /* BRANDÃO MENU LATERAL K1C */

        .brandao-sidebar-menu-title {
            color: var(--brand-gold) !important;
            font-size: 0.78rem;
            font-weight: 900;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            margin: 0.9rem 0.45rem 0.45rem 0.45rem;
        }

        .brandao-sidebar-menu-help {
            color: rgba(245,245,245,0.62) !important;
            font-size: 0.74rem;
            line-height: 1.35;
            margin: 0.25rem 0.45rem 0.7rem 0.45rem;
        }

        .brandao-sidebar-divider-soft {
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(201,162,77,0.35), transparent);
            margin: 0.85rem 0.25rem;
        }


        /* BRANDÃO PREMIUM SIDEBAR K1B */

        [data-testid="stSidebar"] {
            min-width: 270px !important;
            max-width: 310px !important;
        }

        [data-testid="stSidebar"] > div:first-child {
            padding-top: 1.2rem !important;
            background:
                radial-gradient(circle at 50% 0%, rgba(201,162,77,0.18), transparent 30%),
                linear-gradient(180deg, #050505 0%, #080806 48%, #000000 100%) !important;
        }

        .brandao-sidebar-logo {
            background: linear-gradient(145deg, rgba(201,162,77,0.10), rgba(255,255,255,0.02));
            border: 1px solid rgba(201,162,77,0.20);
            border-radius: 18px;
            padding: 1.1rem 0.65rem 1rem 0.65rem !important;
            margin: 0.4rem 0.3rem 1.1rem 0.3rem !important;
            box-shadow: 0 14px 30px rgba(0,0,0,0.28);
        }

        .brandao-sidebar-logo .brandao-title {
            font-size: 1.15rem !important;
            letter-spacing: 0.02em;
            color: var(--brand-gold) !important;
            text-shadow: 0 0 18px rgba(201,162,77,0.20);
        }

        .brandao-sidebar-logo .brandao-subtitle {
            font-size: 0.62rem !important;
            letter-spacing: 0.28em !important;
            color: #f5f5f5 !important;
        }

        [data-testid="stSidebar"] h1,
        [data-testid="stSidebar"] h2,
        [data-testid="stSidebar"] h3,
        [data-testid="stSidebar"] h4 {
            color: #ffffff !important;
            font-weight: 900 !important;
        }

        [data-testid="stSidebar"] p,
        [data-testid="stSidebar"] label,
        [data-testid="stSidebar"] span {
            color: rgba(245,245,245,0.92) !important;
        }

        [data-testid="stSidebar"] a {
            color: var(--brand-gold) !important;
            text-decoration: none !important;
            font-weight: 700 !important;
        }

        [data-testid="stSidebar"] [data-testid="stMarkdownContainer"] {
            font-size: 0.92rem;
        }

        [data-testid="stSidebar"] [data-testid="stSelectbox"] {
            background: linear-gradient(145deg, rgba(201,162,77,0.08), rgba(255,255,255,0.02));
            border: 1px solid rgba(201,162,77,0.18);
            border-radius: 14px;
            padding: 0.45rem 0.45rem 0.65rem 0.45rem;
            margin-bottom: 0.65rem;
        }

        [data-testid="stSidebar"] [data-baseweb="select"] > div {
            min-height: 42px !important;
            border-radius: 12px !important;
            background: rgba(12,12,12,0.96) !important;
            border: 1px solid rgba(201,162,77,0.55) !important;
            box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02);
        }

        [data-testid="stSidebar"] .stButton > button {
            width: 100% !important;
            min-height: 42px !important;
            justify-content: flex-start !important;
            border-radius: 13px !important;
            border: 1px solid rgba(201,162,77,0.42) !important;
            background:
                linear-gradient(135deg, rgba(201,162,77,0.20), rgba(201,162,77,0.055)) !important;
            color: #ffffff !important;
            font-weight: 800 !important;
            box-shadow: 0 8px 22px rgba(0,0,0,0.22);
            margin-top: 0.18rem !important;
            margin-bottom: 0.18rem !important;
        }

        [data-testid="stSidebar"] .stButton > button:hover {
            transform: translateY(-1px);
            border-color: rgba(201,162,77,0.85) !important;
            background:
                linear-gradient(135deg, rgba(201,162,77,0.36), rgba(201,162,77,0.13)) !important;
            box-shadow: 0 12px 26px rgba(0,0,0,0.32);
        }

        [data-testid="stSidebar"] details {
            border: 1px solid rgba(201,162,77,0.18) !important;
            border-radius: 14px !important;
            background: rgba(255,255,255,0.025) !important;
            padding: 0.25rem 0.4rem !important;
            margin: 0.45rem 0 0.6rem 0 !important;
        }

        [data-testid="stSidebar"] summary {
            color: #ffffff !important;
            font-weight: 850 !important;
        }

        [data-testid="stSidebar"] hr {
            border-color: rgba(201,162,77,0.22) !important;
            margin: 1rem 0 !important;
        }

        [data-testid="stSidebar"] .stAlert {
            border-radius: 14px !important;
            border: 1px solid rgba(201,162,77,0.22) !important;
            background: rgba(201,162,77,0.08) !important;
        }

        [data-testid="stSidebar"] [data-testid="stVerticalBlock"] {
            gap: 0.45rem !important;
        }

        .brandao-sidebar-user-card {
            border: 1px solid rgba(201,162,77,0.24);
            border-radius: 18px;
            padding: 0.9rem;
            background: linear-gradient(145deg, rgba(201,162,77,0.11), rgba(255,255,255,0.025));
            margin: 0.6rem 0.3rem 0.9rem 0.3rem;
            box-shadow: 0 12px 28px rgba(0,0,0,0.24);
        }

        .brandao-sidebar-user-name {
            color: #ffffff !important;
            font-weight: 900;
            font-size: 0.98rem;
            margin-bottom: 0.18rem;
        }

        .brandao-sidebar-user-role {
            color: var(--brand-gold) !important;
            font-size: 0.78rem;
            font-weight: 850;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }

        .brandao-sidebar-caption {
            color: rgba(245,245,245,0.62) !important;
            font-size: 0.76rem;
            line-height: 1.35;
            margin: 0.25rem 0.4rem 0.75rem 0.4rem;
        }


        /* BRANDÃO PREMIUM SHELL K1A */

        .brandao-hero-premium {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(280px, 520px);
            gap: 1rem;
            align-items: center;
            background:
                radial-gradient(circle at 15% 10%, rgba(201,162,77,0.18), transparent 30%),
                linear-gradient(135deg, rgba(16,16,16,0.98), rgba(30,24,13,0.94));
            border: 1px solid rgba(201, 162, 77, 0.34);
            border-radius: 20px;
            padding: 1.35rem 1.45rem;
            margin: 0.25rem 0 1.05rem 0;
            box-shadow: 0 18px 42px rgba(0,0,0,0.28);
        }

        .brandao-hero-title {
            color: #ffffff !important;
            font-size: 2rem;
            line-height: 1.08;
            font-weight: 950;
            letter-spacing: -0.04em;
            margin: 0;
        }

        .brandao-hero-subtitle {
            color: #d8d8d8 !important;
            font-size: 0.98rem;
            margin-top: 0.45rem;
        }

        .brandao-hero-contacts {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.7rem 1rem;
            border-left: 1px solid rgba(201,162,77,0.50);
            padding-left: 1.1rem;
        }

        .brandao-hero-contact-item {
            color: #f5f5f5 !important;
            font-size: 0.92rem;
            line-height: 1.25;
        }

        .brandao-hero-contact-item b {
            color: var(--brand-gold) !important;
            margin-right: 0.35rem;
        }

        .brandao-kpi-card {
            min-height: 116px;
            background:
                radial-gradient(circle at 85% 25%, rgba(201,162,77,0.16), transparent 34%),
                linear-gradient(145deg, rgba(20,20,20,0.98), rgba(12,12,12,0.98));
            border: 1px solid rgba(201, 162, 77, 0.24);
            border-radius: 16px;
            padding: 0.9rem 0.9rem 0.8rem 0.9rem;
            box-shadow: 0 12px 28px rgba(0,0,0,0.22);
            overflow: hidden;
            position: relative;
        }

        .brandao-kpi-top {
            display: flex;
            align-items: center;
            gap: 0.48rem;
            color: #ffffff !important;
            font-size: 0.82rem;
            font-weight: 800;
            min-height: 30px;
        }

        .brandao-kpi-icon {
            color: var(--brand-gold) !important;
            font-size: 1.35rem;
            line-height: 1;
        }

        .brandao-kpi-value {
            color: #ffffff !important;
            font-size: 2rem;
            font-weight: 950;
            line-height: 1.05;
            margin-top: 0.45rem;
            letter-spacing: -0.03em;
        }

        .brandao-kpi-sub {
            color: #8fd18f !important;
            font-size: 0.78rem;
            margin-top: 0.45rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .brandao-kpi-sub.warn {
            color: #f4c96b !important;
        }

        .brandao-kpi-sub.danger {
            color: #ff7777 !important;
        }

        .brandao-section-card {
            background: linear-gradient(145deg, rgba(16,16,16,0.98), rgba(10,10,10,0.98));
            border: 1px solid rgba(201, 162, 77, 0.20);
            border-radius: 18px;
            padding: 1rem;
            box-shadow: 0 12px 30px rgba(0,0,0,0.22);
        }

        @media (max-width: 1200px) {
            .brandao-hero-premium {
                grid-template-columns: 1fr;
            }

            .brandao-hero-contacts {
                border-left: none;
                border-top: 1px solid rgba(201,162,77,0.35);
                padding-left: 0;
                padding-top: 0.9rem;
            }
        }

        .brandao-contact-line {
            color: var(--brand-muted);
            font-size: 0.88rem;
            margin-top: 0.35rem;
        }

        [data-testid="stMetric"] {
            background: var(--brand-panel);
            border: 1px solid rgba(201, 162, 77, 0.22);
            border-radius: 16px;
            padding: 0.85rem 1rem;
            box-shadow: 0 8px 24px rgba(0,0,0,0.16);
        }

        [data-testid="stMetricLabel"] {
            color: var(--brand-muted) !important;
        }

        [data-testid="stMetricValue"] {
            color: var(--brand-text) !important;
        }

        [data-testid="stForm"] {
            background: var(--brand-form-bg) !important;
            border: 1px solid rgba(201, 162, 77, 0.24) !important;
            border-radius: 16px !important;
            padding: 1rem 1rem 1.1rem 1rem !important;
            box-shadow: 0 12px 30px rgba(0,0,0,0.20);
        }

        [data-testid="stTextInput"] label,
        [data-testid="stTextArea"] label,
        [data-testid="stSelectbox"] label,
        [data-testid="stCheckbox"] label,
        [data-testid="stDateInput"] label,
        [data-testid="stNumberInput"] label {
            color: var(--brand-text) !important;
            font-weight: 600 !important;
        }

        [data-testid="stTextInput"] input,
        [data-testid="stTextArea"] textarea,
        [data-testid="stNumberInput"] input,
        [data-testid="stDateInput"] input {
            background: var(--brand-input) !important;
            color: var(--brand-input-text) !important;
            border: 1px solid rgba(201, 162, 77, 0.52) !important;
            border-radius: 10px !important;
            caret-color: var(--brand-gold) !important;
        }

        [data-testid="stTextInput"] input::placeholder,
        [data-testid="stTextArea"] textarea::placeholder {
            color: rgba(180, 180, 180, 0.85) !important;
            opacity: 1 !important;
        }

        [data-testid="stTextInput"] input:focus,
        [data-testid="stTextArea"] textarea:focus,
        [data-testid="stNumberInput"] input:focus,
        [data-testid="stDateInput"] input:focus {
            border-color: var(--brand-gold) !important;
            box-shadow: 0 0 0 1px rgba(201, 162, 77, 0.42) !important;
        }

        [data-baseweb="select"] > div {
            background: var(--brand-input) !important;
            border: 1px solid rgba(201, 162, 77, 0.52) !important;
            color: var(--brand-input-text) !important;
            border-radius: 10px !important;
        }

        [data-baseweb="select"] span,
        [data-baseweb="select"] div {
            color: var(--brand-input-text) !important;
        }

        div[data-baseweb="popover"],
        ul[role="listbox"] {
            background: var(--brand-panel) !important;
            border: 1px solid rgba(201, 162, 77, 0.40) !important;
        }

        li[role="option"] {
            background: var(--brand-panel) !important;
            color: var(--brand-text) !important;
        }

        li[role="option"]:hover {
            background: rgba(201, 162, 77, 0.20) !important;
            color: var(--brand-text) !important;
        }

        div[data-testid="stDataFrame"] {
            border: 1px solid rgba(201, 162, 77, 0.16);
            border-radius: 14px;
            overflow: hidden;
        }

        .stButton > button {
            border-radius: 10px !important;
            border: 1px solid rgba(201, 162, 77, 0.58) !important;
            color: var(--brand-text) !important;
            background: linear-gradient(135deg, rgba(201,162,77,0.24), rgba(201,162,77,0.08)) !important;
        }

        .stButton > button:hover {
            border-color: var(--brand-gold) !important;
            color: var(--brand-gold) !important;
        }

        .stButton > button:disabled,
        .stButton > button[disabled] {
            background: rgba(255, 255, 255, 0.16) !important;
            color: rgba(255, 255, 255, 0.72) !important;
            border-color: rgba(201, 162, 77, 0.25) !important;
            opacity: 1 !important;
        }

        [data-testid="stCheckbox"] span {
            color: var(--brand-text) !important;
        }

        [data-testid="stExpander"] {
            border: 1px solid rgba(201, 162, 77, 0.20) !important;
            border-radius: 12px !important;
        }

        [data-testid="stTabs"] button {
            color: var(--brand-muted) !important;
        }

        [data-testid="stTabs"] button[aria-selected="true"] {
            color: var(--brand-gold) !important;
            border-bottom-color: var(--brand-gold) !important;
        }


        /* BRANDÃO CONTRASTE GLOBAL V3A */

        html, body {
            background: var(--brand-bg) !important;
        }

        [data-testid="stAppViewContainer"],
        [data-testid="stMain"],
        [data-testid="stMainBlockContainer"],
        section.main,
        div.block-container {
            background: var(--brand-bg) !important;
            color: var(--brand-text) !important;
        }

        [data-testid="stVerticalBlock"],
        [data-testid="stHorizontalBlock"] {
            color: var(--brand-text) !important;
        }

        .main .block-container {
            max-width: 100% !important;
            padding-left: 2.2rem !important;
            padding-right: 2.2rem !important;
        }

        /* Títulos e textos gerais */
        h1, h2, h3, h4, h5, h6,
        .stMarkdown,
        .stMarkdown p,
        .stMarkdown span,
        .stCaptionContainer,
        label,
        p {
            color: var(--brand-text) !important;
        }

        small,
        .stCaptionContainer,
        [data-testid="stCaptionContainer"] {
            color: var(--brand-muted) !important;
        }

        /* Separadores */
        hr {
            border-color: rgba(201, 162, 77, 0.20) !important;
        }

        /* Cabeçalho Brandão */
        .brandao-top-card {
            background:
                radial-gradient(circle at top left, rgba(201,162,77,0.24), transparent 34rem),
                linear-gradient(135deg, rgba(17,17,17,0.98), rgba(30,24,12,0.96)) !important;
            border: 1px solid rgba(201, 162, 77, 0.38) !important;
            color: var(--brand-text) !important;
        }

        .brandao-top-card h1,
        .brandao-top-card h2,
        .brandao-top-card p,
        .brandao-top-card div {
            color: var(--brand-text) !important;
        }

        .brandao-contact-line {
            color: #e8dcc3 !important;
        }

        /* Cards, métricas e containers */
        [data-testid="stMetric"],
        .brandao-kpi-card,
        .brandao-action-card,
        .brandao-command-hero {
            background:
                linear-gradient(145deg, rgba(15,15,15,0.98), rgba(27,23,14,0.98)) !important;
            border: 1px solid rgba(201, 162, 77, 0.30) !important;
            color: var(--brand-text) !important;
        }

        [data-testid="stMetricLabel"],
        [data-testid="stMetricLabel"] div,
        [data-testid="stMetricLabel"] p {
            color: var(--brand-muted) !important;
            opacity: 1 !important;
        }

        [data-testid="stMetricValue"],
        [data-testid="stMetricValue"] div {
            color: var(--brand-text) !important;
            opacity: 1 !important;
        }

        /* Alerts do Streamlit */
        [data-testid="stAlert"] {
            background: rgba(201, 162, 77, 0.12) !important;
            border: 1px solid rgba(201, 162, 77, 0.26) !important;
            color: var(--brand-text) !important;
            border-radius: 12px !important;
        }

        [data-testid="stAlert"] * {
            color: var(--brand-text) !important;
        }

        /* Forms */
        [data-testid="stForm"] {
            background: rgba(22, 22, 22, 0.92) !important;
            border: 1px solid rgba(201, 162, 77, 0.30) !important;
            color: var(--brand-text) !important;
        }

        [data-testid="stForm"] * {
            color: var(--brand-text);
        }

        /* Inputs e selects */
        input,
        textarea,
        [data-baseweb="select"] > div {
            background: #111111 !important;
            color: #f9fafb !important;
            border-color: rgba(201, 162, 77, 0.58) !important;
        }

        input::placeholder,
        textarea::placeholder {
            color: rgba(230, 230, 230, 0.65) !important;
            opacity: 1 !important;
        }

        [data-baseweb="select"] span,
        [data-baseweb="select"] div {
            color: #f9fafb !important;
        }

        div[data-baseweb="popover"],
        ul[role="listbox"],
        li[role="option"] {
            background: #111111 !important;
            color: #f9fafb !important;
        }

        li[role="option"]:hover {
            background: rgba(201, 162, 77, 0.18) !important;
            color: #ffffff !important;
        }

        /* Abas */
        [data-testid="stTabs"] {
            background: transparent !important;
            border-bottom: 1px solid rgba(201, 162, 77, 0.18) !important;
        }

        [data-testid="stTabs"] button {
            color: var(--brand-muted) !important;
            font-weight: 700 !important;
        }

        [data-testid="stTabs"] button[aria-selected="true"] {
            color: var(--brand-gold) !important;
            border-bottom: 2px solid var(--brand-gold) !important;
        }

        /* Dataframes: mantém tabela clara, mas melhora integração */
        div[data-testid="stDataFrame"] {
            background: #ffffff !important;
            border: 1px solid rgba(201, 162, 77, 0.22) !important;
            border-radius: 14px !important;
            box-shadow: 0 10px 26px rgba(0,0,0,0.18) !important;
        }

        /* Botões */
        .stButton > button {
            min-height: 2.25rem !important;
            font-weight: 700 !important;
        }

        .stButton > button:not([disabled]) {
            background: linear-gradient(135deg, rgba(201,162,77,0.30), rgba(116,84,21,0.24)) !important;
            color: #ffffff !important;
            border-color: rgba(201, 162, 77, 0.70) !important;
        }

        .stButton > button:not([disabled]):hover {
            color: #ffffff !important;
            border-color: var(--brand-gold) !important;
            box-shadow: 0 0 0 1px rgba(201,162,77,0.35) !important;
        }

        .stButton > button[disabled],
        .stButton > button:disabled {
            background: rgba(255,255,255,0.10) !important;
            color: rgba(255,255,255,0.70) !important;
            border-color: rgba(201,162,77,0.20) !important;
        }

        /* Expander administração */
        [data-testid="stExpander"] {
            background: rgba(12,12,12,0.82) !important;
            border: 1px solid rgba(201, 162, 77, 0.22) !important;
            color: var(--brand-text) !important;
        }

        [data-testid="stExpander"] * {
            color: var(--brand-text);
        }

        /* Sidebar */
        [data-testid="stSidebar"] {
            background: linear-gradient(180deg, #020202, #060606) !important;
        }

        [data-testid="stSidebar"] [data-testid="stMarkdownContainer"] p,
        [data-testid="stSidebar"] label,
        [data-testid="stSidebar"] span {
            color: #d7d7d7 !important;
        }

        [data-testid="stSidebar"] a {
            color: var(--brand-gold) !important;
        }

        /* Tema claro: manter área principal clara e legível */
        @media (prefers-color-scheme: light) {
            body {
                background: var(--brand-bg) !important;
            }
        }


        .brandao-footer {
            margin-top: 2rem;
            padding: 1rem 0;
            text-align: center;
            color: var(--brand-muted);
            border-top: 1px solid rgba(201, 162, 77, 0.18);
            font-size: 0.85rem;
        }

        /* BRANDÃO CODEX POLISH 20260516
           Camada final de acabamento: prevalece sobre tentativas anteriores sem
           alterar regras operacionais do painel. */
        .main .block-container {
            max-width: 1680px !important;
            padding-top: 1.35rem !important;
            padding-left: clamp(1rem, 2vw, 2rem) !important;
            padding-right: clamp(1rem, 2vw, 2rem) !important;
        }

        .brandao-hero-premium {
            grid-template-columns: minmax(0, 1fr) minmax(320px, 560px) !important;
            gap: clamp(1rem, 2vw, 1.8rem) !important;
            padding: clamp(1.25rem, 2.2vw, 2rem) !important;
            margin-bottom: 1.15rem !important;
            background:
                radial-gradient(circle at 8% 0%, rgba(255,218,125,0.18), transparent 28%),
                radial-gradient(circle at 100% 18%, rgba(201,162,77,0.12), transparent 26%),
                linear-gradient(135deg, rgba(12,12,12,0.98), rgba(31,24,11,0.96) 58%, rgba(4,4,4,0.98)) !important;
            box-shadow: 0 22px 55px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.04) !important;
        }

        .brandao-hero-title {
            max-width: 980px;
            font-size: clamp(1.72rem, 2.4vw, 2.55rem) !important;
            letter-spacing: -0.055em !important;
        }

        .brandao-hero-subtitle {
            max-width: 860px;
            color: rgba(245,245,245,0.74) !important;
            font-size: clamp(0.92rem, 1.15vw, 1.08rem) !important;
            line-height: 1.45 !important;
        }

        .brandao-hero-contacts {
            align-self: stretch;
            align-content: center;
            background: rgba(0,0,0,0.18);
            border: 1px solid rgba(201,162,77,0.20) !important;
            border-left: 1px solid rgba(201,162,77,0.36) !important;
            border-radius: 16px;
            padding: 1rem 1.1rem !important;
        }

        .brandao-hero-contact-item {
            display: flex;
            gap: 0.45rem;
            align-items: flex-start;
            color: rgba(245,245,245,0.84) !important;
            font-size: 0.88rem !important;
        }

        .brandao-kpi-card {
            min-height: 128px !important;
            padding: 1rem !important;
            border-radius: 18px !important;
            transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
        }

        .brandao-kpi-card:hover {
            transform: translateY(-2px);
            border-color: rgba(201,162,77,0.48) !important;
            box-shadow: 0 18px 38px rgba(0,0,0,0.30) !important;
        }

        .brandao-kpi-top {
            justify-content: space-between;
            gap: 0.7rem !important;
            color: rgba(245,245,245,0.82) !important;
            font-size: 0.78rem !important;
            text-transform: uppercase;
            letter-spacing: 0.045em;
        }

        .brandao-kpi-icon {
            order: 2;
            width: 34px;
            height: 34px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            background: rgba(201,162,77,0.12);
            border: 1px solid rgba(201,162,77,0.26);
            font-size: 1.18rem !important;
        }

        .brandao-kpi-value {
            font-size: clamp(2rem, 2.7vw, 2.75rem) !important;
            margin-top: 0.65rem !important;
        }

        .brandao-panel-card {
            min-height: 318px !important;
            padding: 1.05rem !important;
            border-radius: 20px !important;
            box-shadow: 0 18px 42px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.035) !important;
        }

        .brandao-panel-title {
            font-size: 1rem !important;
            letter-spacing: -0.025em;
        }

        .brandao-mini-item {
            grid-template-columns: 42px minmax(0,1fr) auto !important;
            gap: 0.72rem !important;
            padding: 0.68rem !important;
            border-radius: 14px !important;
            background: linear-gradient(135deg, rgba(255,255,255,0.045), rgba(255,255,255,0.018)) !important;
        }

        .brandao-mini-avatar {
            width: 38px !important;
            height: 38px !important;
            border-radius: 13px !important;
        }

        .brandao-mini-name {
            font-size: 0.86rem !important;
        }

        .brandao-mini-desc {
            color: rgba(245,245,245,0.58) !important;
            font-size: 0.74rem !important;
        }

        .brandao-mini-tag {
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        div[data-testid="stDataFrame"] {
            border-radius: 16px !important;
            box-shadow: 0 16px 34px rgba(0,0,0,0.24) !important;
        }

        @media (max-width: 1360px) {
            .brandao-hero-premium,
            .brandao-hero-contacts {
                grid-template-columns: 1fr !important;
            }

            .brandao-hero-contacts {
                border-left: 1px solid rgba(201,162,77,0.20) !important;
            }
        }

        @media (max-width: 760px) {
            .main .block-container {
                padding-left: 0.85rem !important;
                padding-right: 0.85rem !important;
            }

            .brandao-hero-premium {
                border-radius: 16px !important;
            }

            .brandao-hero-contacts {
                gap: 0.55rem !important;
                padding: 0.85rem !important;
            }

            .brandao-panel-card {
                min-height: auto !important;
            }

            .brandao-mini-item {
                grid-template-columns: 38px minmax(0,1fr) !important;
            }

            .brandao-mini-tag {
                grid-column: 2;
                justify-self: start;
                margin-top: 0.15rem;
            }
        }

        /* Login privado */
        .brandao-login-eyebrow {
            width: fit-content;
            margin: 0 auto 0.45rem auto;
            padding: 0.32rem 0.7rem;
            border-radius: 999px;
            color: #f4c96b !important;
            background: rgba(201,162,77,0.10);
            border: 1px solid rgba(201,162,77,0.30);
            font-size: 0.72rem;
            font-weight: 900;
            letter-spacing: 0.14em;
            text-transform: uppercase;
        }

        .brandao-login-hero {
            max-width: 1120px;
            margin: 0.25rem auto 0.75rem auto;
            padding: clamp(1rem, 2vw, 1.45rem);
            border-radius: 24px;
            border: 1px solid rgba(201,162,77,0.34);
            background:
                radial-gradient(circle at 8% 0%, rgba(255,220,140,0.16), transparent 32%),
                radial-gradient(circle at 95% 12%, rgba(201,162,77,0.11), transparent 28%),
                linear-gradient(145deg, rgba(12,12,12,0.98), rgba(31,24,12,0.95) 56%, rgba(5,5,5,0.98));
            box-shadow: 0 22px 58px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.04);
            text-align: center;
        }

        .brandao-login-title {
            color: #ffffff !important;
            font-size: clamp(1.65rem, 2.5vw, 2.4rem);
            font-weight: 950;
            letter-spacing: -0.055em;
            line-height: 1.03;
            margin: 0;
        }

        .brandao-login-subtitle {
            max-width: 760px;
            margin: 0.55rem auto 0 auto;
            color: rgba(245,245,245,0.74) !important;
            font-size: 0.96rem;
            line-height: 1.42;
        }

        .brandao-login-trust-row {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 0.45rem;
            margin-top: 0.85rem;
        }

        .brandao-login-pill {
            color: rgba(245,245,245,0.78) !important;
            border: 1px solid rgba(201,162,77,0.22);
            background: rgba(0,0,0,0.18);
            border-radius: 999px;
            padding: 0.28rem 0.62rem;
            font-size: 0.75rem;
            font-weight: 750;
        }

        .brandao-login-panel-copy {
            min-height: 252px;
            padding: 1.25rem;
            border-radius: 20px;
            border: 1px solid rgba(201,162,77,0.20);
            background: linear-gradient(145deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015));
        }

        .brandao-login-panel-copy h3 {
            margin: 0 0 0.55rem 0;
            color: #ffffff !important;
            font-size: 1.12rem;
            font-weight: 950;
            letter-spacing: -0.03em;
        }

        .brandao-login-panel-copy p {
            color: rgba(245,245,245,0.67) !important;
            font-size: 0.88rem;
            line-height: 1.5;
            margin: 0 0 0.7rem 0;
        }

        .brandao-login-note {
            color: rgba(245,245,245,0.58) !important;
            font-size: 0.78rem;
            line-height: 1.4;
            margin-top: 0.55rem;
            text-align: center;
        }

        .brandao-login-recovery {
            margin-top: 0.65rem;
            padding: 0.85rem;
            border-radius: 16px;
            border: 1px solid rgba(201,162,77,0.22);
            background: rgba(201,162,77,0.06);
        }

        .brandao-login-logo-spacer {
            margin-top: -0.65rem;
            margin-bottom: -0.15rem;
        }

        @media (max-height: 780px) and (min-width: 900px) {
            .main .block-container {
                padding-top: 0.65rem !important;
            }

            .brandao-login-hero {
                padding: 0.9rem 1.15rem !important;
            }

            .brandao-login-subtitle {
                margin-top: 0.35rem !important;
            }

            .brandao-login-trust-row {
                margin-top: 0.55rem !important;
            }
        }
    </style>
    """
    css = css.replace('__BRANDAO_GOLD__', gold)
    css = css.replace('__BRANDAO_BG__', bg)
    css = css.replace('__BRANDAO_PANEL__', panel)
    css = css.replace('__BRANDAO_SIDEBAR__', sidebar)
    css = css.replace('__BRANDAO_TEXT__', text)
    css = css.replace('__BRANDAO_MUTED__', muted)
    css = css.replace('__BRANDAO_BORDER__', border)
    css = css.replace('__BRANDAO_INPUT_BG__', input_bg)
    css = css.replace('__BRANDAO_INPUT_TEXT__', input_text)
    css = css.replace('__BRANDAO_FORM_BG__', form_bg)

    return css


def aplicar_tema_visual_app():
    usuario = st.session_state.get("usuario_logado") or {}
    tema = usuario.get("tema_visual") or "ESCURO"
    st.markdown(css_tema_visual_app(tema), unsafe_allow_html=True)


def render_branding_sidebar_app():
    logo_paths = [
        "assets/logo_brandao.png",
        "assets/logo_brandao.jpg",
        "assets/LOGO 1.jpg",
        "assets/LOGO 2.jpg",
    ]

    logo_exibida = False
    for logo_path in logo_paths:
        if os.path.exists(logo_path):
            st.image(logo_path, width="stretch")
            logo_exibida = True
            break

    if not logo_exibida:
        st.markdown(
            """
            <div class="brandao-sidebar-logo">
                <div class="brandao-title">BC<br>BRANDÃO</div>
                <div class="brandao-subtitle">CONTABILIDADE</div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    st.caption("Gestão contábil, pendências, vencimentos e IA documental.")


def atualizar_tema_visual_usuario_app(novo_tema):
    usuario = st.session_state.get("usuario_logado")
    if not usuario:
        return

    novo_tema = (novo_tema or "ESCURO").upper()
    if novo_tema not in ("ESCURO", "CLARO", "AUTOMATICO", "BRANDAO"):
        novo_tema = "ESCURO"

    executar_sql_parametrizado(
        """
        UPDATE app_usuarios
        SET tema_visual = %s,
            atualizado_em = NOW()
        WHERE id = %s::uuid;
        """,
        [novo_tema, usuario["id"]],
    )

    usuario["tema_visual"] = novo_tema
    st.session_state["usuario_logado"] = usuario

    registrar_auditoria_app(
        "ALTERAR_TEMA_VISUAL",
        entidade="app_usuarios",
        entidade_id=usuario.get("id"),
        observacao=f"Tema visual alterado para {novo_tema}."
    )


def render_tema_usuario_sidebar_app():
    usuario = st.session_state.get("usuario_logado") or {}
    tema_atual = (usuario.get("tema_visual") or "ESCURO").upper()

    temas = ["ESCURO", "CLARO", "AUTOMATICO", "BRANDAO"]
    labels = {
        "ESCURO": "Escuro",
        "CLARO": "Claro",
        "AUTOMATICO": "Automático",
        "BRANDAO": "Brandão",
    }

    try:
        idx = temas.index(tema_atual)
    except ValueError:
        idx = 0

    tema_novo = st.selectbox(
        "Tema visual",
        temas,
        index=idx,
        format_func=lambda x: labels.get(x, x),
        key="select_tema_visual_usuario",
    )

    if tema_novo != tema_atual:
        atualizar_tema_visual_usuario_app(tema_novo)
        st.success("Tema visual atualizado.")
        st.rerun()




def render_menu_lateral_premium_app():
    st.markdown('<div class="brandao-sidebar-divider-soft"></div>', unsafe_allow_html=True)
    st.markdown('<div class="brandao-sidebar-menu-title">Menu operacional</div>', unsafe_allow_html=True)
    st.markdown(
        '<div class="brandao-sidebar-menu-help">Use os atalhos abaixo para orientar o trabalho. As abas superiores continuam ativas nesta fase.</div>',
        unsafe_allow_html=True,
    )

    itens_menu = [
        ("🏠 Dashboard", "DASHBOARD", "Abra a aba 🏠 Dashboard para visão geral."),
        ("👥 Clientes", "CLIENTES", "Abra a aba 👥 Clientes para filtros e lista geral."),
        ("🔎 Cliente", "CLIENTE", "Prepara a aba 🔎 Cliente para consulta/edição."),
        ("🚨 Pendências", "PENDENCIAS", "Abra a aba 🚨 Pendências para obrigações e pendências."),
        ("🤖 IA Documental", "IA_DOCUMENTAL", "Abra a aba 🤖 IA Documental para validar documentos lidos pela IA."),
        ("📅 Vencimentos", "VENCIMENTOS", "Use 🔐 Certificados e Procurações para certificados, procurações, alvarás e certidões."),
        ("📄 Folha/RH", "FOLHA_RH", "Abra a aba 📄 Folha/RH para controles trabalhistas."),
        ("🧾 Fiscal", "FISCAL", "Abra a aba 🧾 Fiscal para controles fiscais/XML."),
        ("🔐 Certificados/Procurações", "CERTIFICADOS", "Abra a aba 🔐 Certificados e Procurações."),
        ("⚙️ Configurações", "CONFIGURACOES", "Configurações operacionais e administração do painel."),
    ]

    for rotulo, destino, ajuda in itens_menu:
        if st.button(rotulo, key=f"menu_lateral_premium_{destino}"):
            st.session_state["menu_lateral_destino"] = destino

            if destino == "CLIENTE":
                st.session_state["abrir_cliente_automatico"] = True
            else:
                st.session_state["abrir_cliente_automatico"] = False

            st.info(ajuda)
            st.rerun()

    destino_atual = st.session_state.get("menu_lateral_destino")
    if destino_atual:
        st.caption(f"Atalho selecionado: {humanizar_codigo_visual(destino_atual)}")



def alterar_senha_usuario_app(senha_atual, nova_senha, confirmar_senha):
    usuario = st.session_state.get("usuario_logado")

    if not usuario:
        raise ValueError("Usuário não está logado.")

    senha_atual = senha_atual or ""
    nova_senha = nova_senha or ""
    confirmar_senha = confirmar_senha or ""

    if len(nova_senha) < 8:
        raise ValueError("A nova senha precisa ter pelo menos 8 caracteres.")

    if nova_senha != confirmar_senha:
        raise ValueError("A confirmação da nova senha não confere.")

    if senha_atual == nova_senha:
        raise ValueError("A nova senha precisa ser diferente da senha atual.")

    resultado = executar_sql_parametrizado(
        """
        UPDATE app_usuarios
        SET senha_hash = crypt(%s, gen_salt('bf')),
            obrigar_troca_senha = FALSE,
            atualizado_em = NOW()
        WHERE id = %s::uuid
          AND senha_hash = crypt(%s, senha_hash)
          AND ativo = TRUE
        RETURNING id::text, nome, email, perfil_acesso, empresa_nome, empresa_cnpj, obrigar_troca_senha, COALESCE(tema_visual, 'ESCURO');
        """,
        [
            nova_senha,
            usuario["id"],
            senha_atual,
        ],
    )

    if not resultado:
        raise ValueError("Senha atual inválida.")

    row = resultado[0]

    st.session_state["usuario_logado"] = {
        "id": row[0],
        "nome": row[1],
        "email": row[2],
        "perfil_acesso": row[3],
        "empresa_nome": row[4],
        "empresa_cnpj": row[5],
        "obrigar_troca_senha": row[6],
        "tema_visual": row[7] if len(row) > 7 else usuario.get("tema_visual", "ESCURO"),
    }

    registrar_auditoria_app(
        "ALTERAR_SENHA",
        entidade="app_usuarios",
        entidade_id=usuario.get("id"),
        observacao="Usuário alterou a senha pelo painel."
    )

    return True


def render_troca_senha_obrigatoria():
    usuario = st.session_state.get("usuario_logado")

    if not usuario:
        return

    st.markdown("## 🔐 Troca obrigatória de senha")
    st.warning("Este usuário está com senha temporária. Troque a senha para continuar usando o painel.")

    with st.form("form_troca_senha_obrigatoria"):
        senha_atual = st.text_input("Senha atual", type="password")
        nova_senha = st.text_input("Nova senha", type="password")
        confirmar_senha = st.text_input("Confirmar nova senha", type="password")
        salvar_senha = st.form_submit_button("Salvar nova senha")

    if salvar_senha:
        try:
            alterar_senha_usuario_app(senha_atual, nova_senha, confirmar_senha)
            st.success("Senha alterada com sucesso. O painel será recarregado.")
            st.rerun()
        except Exception as erro:
            st.error("Não foi possível alterar a senha.")
            st.exception(erro)

    st.stop()



def criar_ou_atualizar_usuario_app(nome, email, senha, perfil_acesso, obrigar_troca_senha=True):
    nome = (nome or "").strip()
    email = (email or "").strip().lower()
    senha = senha or ""
    perfil_acesso = (perfil_acesso or "FUNCIONARIO").strip().upper()

    if not nome:
        raise ValueError("Informe o nome do usuário.")
    if not email or "@" not in email:
        raise ValueError("Informe um e-mail válido.")
    if len(senha) < 8:
        raise ValueError("A senha precisa ter pelo menos 8 caracteres.")
    if perfil_acesso not in ("ADMINISTRADOR", "GERENTE", "FUNCIONARIO", "CONSULTA"):
        raise ValueError("Perfil de acesso inválido.")

    resultado = executar_sql_parametrizado(
        """
        INSERT INTO app_usuarios (
            nome,
            email,
            senha_hash,
            perfil_acesso,
            empresa_nome,
            empresa_cnpj,
            ativo,
            obrigar_troca_senha
        )
        VALUES (
            %s,
            %s,
            crypt(%s, gen_salt('bf')),
            %s,
            'A. S. CHAVES LTDA',
            '17448680000103',
            TRUE,
            %s
        )
        ON CONFLICT (email) DO UPDATE SET
            nome = EXCLUDED.nome,
            senha_hash = EXCLUDED.senha_hash,
            perfil_acesso = EXCLUDED.perfil_acesso,
            empresa_nome = EXCLUDED.empresa_nome,
            empresa_cnpj = EXCLUDED.empresa_cnpj,
            ativo = TRUE,
            obrigar_troca_senha = EXCLUDED.obrigar_troca_senha,
            atualizado_em = NOW()
        RETURNING id::text, nome, email, perfil_acesso;
        """,
        [nome, email, senha, perfil_acesso, obrigar_troca_senha],
    )

    registrar_auditoria_app(
        "CRIAR_ATUALIZAR_USUARIO_APP",
        entidade="app_usuarios",
        entidade_id=email,
        observacao=f"Usuário criado/atualizado pelo painel com perfil {perfil_acesso}."
    )

    return resultado


def render_admin_usuarios_sidebar():
    if not usuario_tem_permissao("usuarios.gerenciar"):
        return

    with st.expander("⚙️ Administração de usuários", expanded=False):
        st.caption("Somente administradores podem cadastrar ou atualizar usuários do painel.")

        with st.form("form_criar_usuario_app"):
            novo_nome = st.text_input("Nome do usuário", key="admin_novo_usuario_nome")
            novo_email = st.text_input("E-mail do usuário", key="admin_novo_usuario_email")
            novo_perfil = st.selectbox(
                "Perfil de acesso",
                ["FUNCIONARIO", "CONSULTA", "GERENTE", "ADMINISTRADOR"],
                format_func=lambda x: humanizar_codigo_visual(x),
                key="admin_novo_usuario_perfil",
            )
            nova_senha = st.text_input("Senha inicial", type="password", key="admin_novo_usuario_senha")
            obrigar_troca = st.checkbox(
                "Obrigar troca de senha no primeiro acesso",
                value=True,
                key="admin_novo_usuario_obrigar_troca",
            )

            salvar_usuario = st.form_submit_button("Criar/atualizar usuário")

        if salvar_usuario:
            try:
                criar_ou_atualizar_usuario_app(
                    novo_nome,
                    novo_email,
                    nova_senha,
                    novo_perfil,
                    obrigar_troca,
                )
                st.cache_data.clear()
                st.success("Usuário criado/atualizado com sucesso.")
                st.rerun()
            except Exception as erro:
                st.error("Não foi possível criar/atualizar o usuário.")
                st.exception(erro)

        usuarios_df = sql_df("""
            SELECT
                nome AS "Nome",
                email AS "E-mail",
                perfil_acesso AS "Perfil",
                ativo AS "Ativo",
                obrigar_troca_senha AS "Trocar senha",
                TO_CHAR(ultimo_login_em AT TIME ZONE 'America/Campo_Grande', 'DD/MM/YYYY HH24:MI') AS "Último login",
                TO_CHAR(criado_em AT TIME ZONE 'America/Campo_Grande', 'DD/MM/YYYY HH24:MI') AS "Criado em"
            FROM app_usuarios
            ORDER BY ativo DESC, perfil_acesso, nome;
        """)

        if not usuarios_df.empty:
            st.markdown("#### Usuários cadastrados")
            st.dataframe(preparar_df_visual(usuarios_df), width="stretch", height=220)

        try:
            recuperacoes_df = sql_df("""
                SELECT
                    usuario_email AS "E-mail",
                    TO_CHAR(criado_em AT TIME ZONE 'America/Campo_Grande', 'DD/MM/YYYY HH24:MI') AS "Solicitado em",
                    observacao AS "Observação"
                FROM app_auditoria_log
                WHERE acao = 'SOLICITAR_RECUPERACAO_SENHA'
                ORDER BY criado_em DESC
                LIMIT 8;
            """)
        except Exception:
            recuperacoes_df = pd.DataFrame()

        if not recuperacoes_df.empty:
            st.markdown("#### Solicitações recentes de senha")
            st.caption("Redefina a senha pelo formulário acima e mantenha a troca obrigatória marcada.")
            st.dataframe(preparar_df_visual(recuperacoes_df), width="stretch", height=180)




def render_logo_login_brandao_app():
    logo_paths = [
        "assets/logo_brandao.png",
        "assets/logo_brandao.jpg",
        "assets/LOGO 1.jpg",
        "assets/LOGO 2.jpg",
    ]

    for logo_path in logo_paths:
        if os.path.exists(logo_path):
            col1, col2, col3 = st.columns([1.2, 1, 1.2])
            with col2:
                st.image(logo_path, width="stretch")
            return


def solicitar_recuperacao_senha_app(email):
    email = (email or "").strip().lower()

    if not email or "@" not in email:
        raise ValueError("Informe o e-mail usado no painel.")

    usuario_id = None
    try:
        resultado = executar_sql_parametrizado(
            """
            SELECT id::text
            FROM app_usuarios
            WHERE lower(email) = %s
              AND ativo = TRUE
            LIMIT 1;
            """,
            [email],
        )
        if resultado:
            usuario_id = resultado[0][0]
    except Exception:
        usuario_id = None

    try:
        executar_sql_parametrizado(
            """
            INSERT INTO app_auditoria_log (
                usuario_id,
                usuario_email,
                perfil_acesso,
                acao,
                entidade,
                entidade_id,
                observacao
            )
            VALUES (
                %s::uuid,
                %s,
                'PUBLICO_LOGIN',
                'SOLICITAR_RECUPERACAO_SENHA',
                'app_usuarios',
                %s,
                'Solicitação de recuperação de senha feita pela tela de login. Administrador deve redefinir a senha manualmente.'
            );
            """,
            [usuario_id, email, usuario_id],
        )
    except Exception:
        pass

    return True


def exigir_login_app():
    """
    Bloqueia o painel até o usuário fazer login interno.
    """
    if st.session_state.get("usuario_logado"):
        usuario = st.session_state["usuario_logado"]
        usuario.setdefault("tema_visual", "ESCURO")
        aplicar_tema_visual_app()

        if usuario.get("obrigar_troca_senha"):
            render_troca_senha_obrigatoria()

        with st.sidebar:
            render_branding_sidebar_app()

            st.markdown("### 👤 Usuário")
            st.write(usuario.get("nome"))
            st.caption(f'Perfil: {usuario.get("perfil_acesso")}')
            st.caption(usuario.get("email"))

            render_tema_usuario_sidebar_app()
            render_menu_lateral_premium_app()

            if usuario.get("perfil_acesso") == "ADMINISTRADOR":
                render_admin_usuarios_sidebar()

            if st.button("Sair do painel", key="btn_logout_app"):
                registrar_auditoria_app(
                    "LOGOUT",
                    entidade="app_usuarios",
                    observacao="Usuário saiu do painel."
                )
                st.session_state.pop("usuario_logado", None)
                st.session_state.pop("abrir_cliente_automatico", None)
                st.rerun()

        return usuario

    st.markdown(css_tema_visual_app("BRANDAO"), unsafe_allow_html=True)

    st.markdown('<div class="brandao-login-logo-spacer"></div>', unsafe_allow_html=True)
    render_logo_login_brandao_app()

    st.markdown(
        """
        <div class="brandao-login-hero">
            <div class="brandao-login-eyebrow">Acesso privado</div>
            <h1 class="brandao-login-title">Painel Operacional Brandão</h1>
            <div class="brandao-login-subtitle">
                Controle interno de clientes, pendências, vencimentos, certificados, procurações,
                documentos e auditoria com apoio de IA.
            </div>
            <div class="brandao-login-trust-row">
                <span class="brandao-login-pill">Sem cadastro público</span>
                <span class="brandao-login-pill">Usuários aprovados pelo administrador</span>
                <span class="brandao-login-pill">Ambiente restrito do escritório</span>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    col_login_esq, col_login_centro, col_login_dir = st.columns([1.05, 0.9, 1.05])

    with col_login_esq:
        st.markdown(
            """
            <div class="brandao-login-panel-copy">
                <h3>Rotina contábil em uma visão só</h3>
                <p>Priorize pendências críticas, acompanhe vencimentos e mantenha o histórico operacional de cada cliente com mais clareza.</p>
                <p>O acesso é fechado: novos usuários e redefinições de senha continuam sob controle do administrador.</p>
                <div class="brandao-login-note">Dica: após o login, use o menu lateral para navegar pelas filas principais.</div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with col_login_centro:
        st.markdown("### Entrar no painel")
        st.caption("Informe seu e-mail e senha autorizados pelo escritório.")

        with st.form("form_login_interno_app"):
            email = st.text_input("E-mail", value="", placeholder="usuario@brandaocontador.com.br")
            senha = st.text_input("Senha", type="password")
            entrar = st.form_submit_button("Entrar no painel")

        if st.button("Esqueci minha senha", key="btn_esqueci_senha_login"):
            st.session_state["mostrar_recuperacao_senha_login"] = True

        if st.session_state.get("mostrar_recuperacao_senha_login"):
            st.markdown('<div class="brandao-login-recovery">', unsafe_allow_html=True)
            with st.form("form_recuperacao_senha_login"):
                email_recuperacao = st.text_input(
                    "E-mail cadastrado",
                    value=email if "email" in locals() else "",
                    placeholder="usuario@brandaocontador.com.br",
                    key="email_recuperacao_senha_login",
                )
                solicitar_recuperacao = st.form_submit_button("Solicitar redefinição ao administrador")

            st.caption("Por segurança, o painel não envia link automático. O administrador redefine a senha internamente.")
            st.markdown("</div>", unsafe_allow_html=True)

            if solicitar_recuperacao:
                try:
                    solicitar_recuperacao_senha_app(email_recuperacao)
                    st.success("Solicitação registrada. Fale com o administrador para receber uma nova senha temporária.")
                except Exception as erro:
                    st.error("Não foi possível registrar a solicitação.")
                    st.exception(erro)

    with col_login_dir:
        st.markdown(
            """
            <div class="brandao-login-panel-copy">
                <h3>Segurança sem complicar</h3>
                <p>Não existe auto-cadastro neste painel. Cada usuário nasce pelo administrador, com perfil e permissões definidos.</p>
                <p>Quando necessário, o administrador cria uma senha temporária e obriga a troca no primeiro acesso.</p>
                <div class="brandao-login-note">LGPD, auditoria e rastreabilidade continuam como premissas do sistema.</div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    if entrar:
        usuario = validar_login_app(email, senha)

        if usuario:
            st.session_state["usuario_logado"] = usuario
            st.success("Login realizado com sucesso.")
            st.rerun()
        else:
            st.error("E-mail ou senha inválidos, ou usuário inativo.")

    st.stop()




# === HELPERS VISUAIS PT-BR PARA TABELAS ===

def valor_vazio_visual(valor):
    try:
        return valor is None or pd.isna(valor)
    except Exception:
        return valor is None


def formatar_competencia_visual_python(valor):
    if valor_vazio_visual(valor):
        return ""
    s = str(valor).strip()
    if len(s) == 7 and s[4] == "-" and s[:4].isdigit() and s[5:7].isdigit():
        return f"{s[5:7]}/{s[:4]}"
    return s




def normalizar_competencia_input_python(valor):
    """
    Aceita competência no visual BR (MM/AAAA) ou no técnico (AAAA-MM)
    e devolve sempre AAAA-MM para salvar no banco.
    """
    if valor_vazio_visual(valor):
        return ""

    s = str(valor).strip()

    # Visual BR: 01/2026 -> 2026-01
    if len(s) == 7 and s[2] == "/" and s[:2].isdigit() and s[3:7].isdigit():
        return f"{s[3:7]}-{s[:2]}"

    # Técnico: 2026-01 -> mantém
    if len(s) == 7 and s[4] == "-" and s[:4].isdigit() and s[5:7].isdigit():
        return s

    return s


def formatar_data_visual_python(valor):
    if valor_vazio_visual(valor):
        return ""

    try:
        if hasattr(valor, "strftime"):
            return valor.strftime("%d/%m/%Y")
    except Exception:
        pass

    s = str(valor).strip()

    if len(s) >= 10 and s[4] == "-" and s[7] == "-" and s[:4].isdigit() and s[5:7].isdigit() and s[8:10].isdigit():
        return f"{s[8:10]}/{s[5:7]}/{s[:4]}"

    return s


def humanizar_codigo_visual(valor):
    if valor_vazio_visual(valor):
        return ""

    if valor is True or str(valor).strip().lower() == "true":
        return "Sim"
    if valor is False or str(valor).strip().lower() == "false":
        return "Não"

    s = str(valor).strip()

    mapa_exato = {
        "TODAS": "Todas",
        "TODOS": "Todos",

        # Perfis e grupos
        "PF": "Pessoa física",
        "PJ": "Pessoa jurídica",
        "PF_RURAL": "Produtor rural PF",
        "PRODUTOR_RURAL": "Produtor rural",
        "PESSOA_FISICA": "Pessoa física",
        "PESSOA_JURIDICA": "Pessoa jurídica",
        "PJ_ASSOCIACAO_ENTIDADE": "PJ associação/entidade",
        "PJ_SERVICO_ADVOCACIA": "PJ serviço/advocacia",
        "PJ_COMERCIO_VAREJISTA": "PJ comércio varejista",
        "PJ_ALIMENTACAO_COMERCIO": "PJ alimentação/comércio",
        "PJ_SAUDE": "PJ saúde",

        # Situação operacional
        "ATIVO": "Ativo",
        "INATIVO": "Inativo",
        "SEM_MOVIMENTO": "Sem movimento",
        "SUSPENSO": "Suspenso",
        "BAIXADO": "Baixado",

        # Status
        "PENDENTE": "Pendente",
        "PENDENTE_REVISAO": "Pendente revisão",
        "PENDENTE_QUALIFICACAO": "Pendente qualificação",
        "PENDENTE_DEFINICAO": "Pendente definição",
        "PENDENTE_VERIFICACAO": "Pendente verificação",
        "QUALIFICADO_MANUALMENTE": "Qualificado manualmente",
        "QUALIFICADO": "Qualificado",
        "REVISAR_CLIENTE_COM_FUNCIONARIOS": "Revisar cliente com funcionários",
        "REVISAR_SERVICO_NFSE": "Revisar serviço/NFS-e",
        "REVISAR_RURAL_AGRO": "Revisar rural/agro",
        "REVISAR_COMERCIO_NFE": "Revisar comércio/NF-e",
        "REVISAR_TRANSPORTE": "Revisar transporte",
        "ASSOCIACAO_ENTIDADE": "Associação/entidade",
        "COMERCIO": "Comércio",
        "ALIMENTACAO_COMERCIO": "Alimentação/comércio",
        "COMUNICACAO_TECNOLOGIA_EVENTOS": "Comunicação/tecnologia/eventos",
        "HOSPEDAGEM_TURISMO": "Hospedagem/turismo",
        "RURAL_AGRO": "Rural/agro",
        "SAUDE": "Saúde",
        "SAUDE_PET": "Saúde pet",
        "SERVICOS": "Serviços",
        "SERVICOS_CONTABEIS": "Serviços contábeis",
        "SERVICOS_JURIDICOS": "Serviços jurídicos",
        "ENGENHARIA": "Engenharia",
        "TRANSPORTE": "Transporte",
        "OK": "OK",
        "EM_DIA": "Em dia",
        "A_VENCER": "A vencer",
        "VENCIDO": "Vencido",
        "VALIDO": "Ativo",
        "VALIDA": "Ativo",

        # Áreas / categorias macro
        "FOLHA_RH": "Folha/RH",
        "RH_TRABALHISTA": "RH trabalhista",
        "FISCAL": "Fiscal",
        "FISCAL_NFE_XML": "Fiscal NF-e/XML",
        "SERVICOS_NFSE_FATURAMENTO": "Serviços/NFS-e/Faturamento",
        "CERTIFICADO_DIGITAL": "Certificado digital",
        "CERTIFICADOS_PROCURACOES": "Certificados/procurações",
        "PROCURACAO": "Procuração",
        "IMPOSTOS_GUIAS": "Impostos e guias",

        # Tipos de documentos / obrigações
        "FOLHA_PAGAMENTO": "Folha pagamento",
        "GUIA_IMPOSTO": "Guia imposto",
        "INSS_DCTFWEB": "INSS/DCTFWeb",
        "NFE": "NF-e",
        "NFSE": "NFS-e",
        "XML": "XML",
        "XML_NFE": "XML NF-e",
        "DANFE": "DANFE",
        "DAS": "DAS",
        "DARF": "DARF",
        "FGTS": "FGTS",
        "INSS": "INSS",
        "DCTFWEB": "DCTFWeb",
        "HOLERITE": "Holerite",
        "FATURAMENTO": "Faturamento",
        "RECIBO": "Recibo",
        "RESCISAO": "Rescisão",
        "FERIAS": "Férias",
        "ADMISSAO": "Admissão",
    }

    if s in mapa_exato:
        return mapa_exato[s]

    # Fallback genérico: remove underscore e preserva siglas contábeis/fiscais.
    if "_" in s:
        mapa_token = {
            "PF": "PF",
            "PJ": "PJ",
            "CPF": "CPF",
            "CNPJ": "CNPJ",
            "RH": "RH",
            "NFE": "NF-e",
            "NFSE": "NFS-e",
            "XML": "XML",
            "DANFE": "DANFE",
            "DAS": "DAS",
            "DARF": "DARF",
            "FGTS": "FGTS",
            "INSS": "INSS",
            "DCTFWEB": "DCTFWeb",
            "GPS": "GPS",
            "ECD": "ECD",
            "ECF": "ECF",
            "IRPF": "IRPF",
        }

        partes = []
        for token in s.split("_"):
            token = token.strip()
            if not token:
                continue
            partes.append(mapa_token.get(token, token.lower()))

        texto = " ".join(partes).strip()
        if texto:
            return texto[:1].upper() + texto[1:]

    return s


def coluna_de_codigo_visual(coluna):
    nome = str(coluna).strip().lower()

    termos_codigo = [
        "perfil",
        "status",
        "situação",
        "situacao",
        "tipo esperado",
        "tipo_esperado",
        "tipo documento",
        "tipo_documento",
        "categoria macro",
        "categoria_macro",
        "grupo",
        "área",
        "area",
        "regime",
        "cobrança",
        "cobranca",
    ]

    return any(t in nome for t in termos_codigo)


def nome_coluna_visual(coluna):
    c = str(coluna).strip()
    chave = c.lower()

    mapa_colunas = {
        "razao_social_nome": "Cliente",
        "cliente": "Cliente",
        "nome": "Nome",
        "cpf_cnpj": "CPF/CNPJ",
        "tipo_cliente": "Tipo cliente",

        "tem_funcionarios": "Tem funcionários",
        "tem funcionarios": "Tem funcionários",

        "perfil": "Perfil",
        "perfil_operacional": "Perfil",
        "grupo_operacional": "Grupo operacional",

        "tipo_esperado_drive": "Tipo esperado",
        "tipo_esperado": "Tipo esperado",
        "tipo esperado": "Tipo esperado",
        "tipo_documento": "Tipo documento",
        "tipo documento": "Tipo documento",
        "categoria_macro": "Categoria macro",
        "categoria macro": "Categoria macro",

        "competencia": "Competência",
        "competência": "Competência",
        "competencia_inicio": "Competência início",
        "competencia_fim": "Competência fim",
        "ultima_competencia": "Última competência",
        "ultima_competencia_baixada": "Última competência baixada",

        "data_emissao": "Data emissão",
        "data_vencimento": "Data vencimento",
        "vencimento": "Vencimento",
        "data_validade": "Data validade",
        "data_registro": "Data registro",
        "created_at": "Criado em",
        "updated_at": "Atualizado em",

        "status": "Status",
        "status_visual": "Status",
        "status_calculado": "Status",
        "status_qualificacao": "Status qualificação",
        "status_cobranca": "Status cobrança",
        "status_cobranca_folha": "Status cobrança folha",
        "status_cobranca_servico": "Status cobrança serviço",

        "total_pendencias": "Total pendências",
        "total_vencimentos_pendentes": "Vencimentos pendentes",
        "ordem_prioridade": "Prioridade",
    }

    if chave in mapa_colunas:
        return mapa_colunas[chave]

    if "_" in c:
        texto = c.replace("_", " ").strip()
        return texto[:1].upper() + texto[1:]

    return c


def preparar_df_visual(df):
    if df is None or df.empty:
        return df

    visual = df.copy()

    for col in list(visual.columns):
        nome = str(col).strip().lower()

        if "competencia" in nome or "competência" in nome:
            visual[col] = visual[col].map(formatar_competencia_visual_python)

        elif "data" in nome or "vencimento" in nome:
            visual[col] = visual[col].map(formatar_data_visual_python)

        elif str(visual[col].dtype) == "bool":
            visual[col] = visual[col].map(lambda x: "Sim" if x else "Não")

        elif coluna_de_codigo_visual(col):
            visual[col] = visual[col].map(humanizar_codigo_visual)

        else:
            # Em colunas comuns, só trata booleanos textuais para evitar mexer em nomes de clientes/arquivos.
            visual[col] = visual[col].map(
                lambda x: "Sim" if str(x).strip().lower() == "true"
                else ("Não" if str(x).strip().lower() == "false" else x)
            )

    visual = visual.rename(columns={col: nome_coluna_visual(col) for col in visual.columns})

    return visual

# === FIM HELPERS VISUAIS PT-BR PARA TABELAS ===



def _brandao_html_escape(valor):
    import html as _html
    if valor is None:
        return ""
    try:
        if pd.isna(valor):
            return ""
    except Exception:
        pass
    return _html.escape(str(valor))


def render_lista_executiva_brandao(titulo, subtitulo, df, campos, vazio="Nenhum item encontrado.", limite=6):
    st.markdown(f"#### {titulo}")
    if subtitulo:
        st.caption(subtitulo)

    if df is None or df.empty:
        st.success(vazio)
        return

    dados = df.head(limite).to_dict("records")
    partes = ['<div style="display:flex;flex-direction:column;gap:10px;">']

    for row in dados:
        titulo_item = _brandao_html_escape(row.get(campos[0], "") if len(campos) > 0 else "")
        detalhe1 = _brandao_html_escape(row.get(campos[1], "") if len(campos) > 1 else "")
        detalhe2 = _brandao_html_escape(row.get(campos[2], "") if len(campos) > 2 else "")
        detalhe3 = _brandao_html_escape(row.get(campos[3], "") if len(campos) > 3 else "")

        card = (
            '<div style="'
            'background:linear-gradient(145deg,rgba(18,18,18,0.98),rgba(31,26,16,0.96));'
            'border:1px solid rgba(201,162,77,0.24);'
            'border-radius:14px;'
            'padding:11px 13px;'
            'box-shadow:0 8px 20px rgba(0,0,0,0.18);'
            '">'
            f'<div style="font-size:13px;color:#ffffff;font-weight:850;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{titulo_item}</div>'
            f'<div style="font-size:12px;color:#d8c9a7;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{detalhe1}</div>'
            f'<div style="font-size:11.5px;color:#b9b9b9;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{detalhe2}</div>'
            f'<div style="font-size:11.5px;color:#8fd19e;margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{detalhe3}</div>'
            '</div>'
        )
        partes.append(card)

    partes.append("</div>")
    st.markdown("".join(partes), unsafe_allow_html=True)




def render_decisao_ia_documental(filtrado):
    st.divider()
    st.markdown("### ✅ Confirmar documento selecionado pela IA")

    if filtrado is None or filtrado.empty:
        st.info("Nenhum candidato disponível com os filtros atuais.")
        return

    opcoes_ia = []
    for _, row in filtrado.iterrows():
        validade = row.get("data_validade_detectada", "")
        if pd.isna(validade) or str(validade).strip() in ("", "NaT", "None"):
            validade_txt = "Sem validade"
        else:
            validade_txt = formatar_data_visual_python(validade)

        opcoes_ia.append(
            f'{int(row["auditoria_ia_id"])} | {row["cliente"]} | {row["tipo_documento_ia"]} | {row["subtipo_documento_ia"]} | {validade_txt}'
        )

    selecionado_ia = st.selectbox(
        "Selecionar candidato para decisão",
        opcoes_ia,
        key="ia_doc_candidato_para_decisao",
    )

    auditoria_ia_id = int(selecionado_ia.split(" | ")[0])
    linha_ia = filtrado[filtrado["auditoria_ia_id"] == auditoria_ia_id].iloc[0]

    d1, d2, d3, d4 = st.columns(4)
    d1.metric("Auditoria IA", auditoria_ia_id)
    d2.metric("Destino", str(linha_ia.get("destino_sugerido", "")))
    d3.metric("Status", str(linha_ia.get("status_candidato", "")))

    try:
        d4.metric("Confiança", f'{float(linha_ia.get("confianca_tipo_ia", 0)):.0%}')
    except Exception:
        d4.metric("Confiança", str(linha_ia.get("confianca_tipo_ia", "")))

    st.write("**Cliente:**", linha_ia.get("cliente", ""))
    st.write("**CPF/CNPJ:**", linha_ia.get("cpf_cnpj", ""))
    st.write("**Arquivo:**", linha_ia.get("nome_arquivo", ""))
    st.write("**Caminho no Drive:**", linha_ia.get("caminho_drive", ""))

    with st.expander("Resumo da IA", expanded=True):
        resumo = linha_ia.get("resumo_documento_ia", "")
        if resumo is None or str(resumo).strip() == "":
            st.write("Sem resumo disponível.")
        else:
            st.write(resumo)

    usuario_atual_ia = st.session_state.get("usuario_logado", {})
    perfil_usuario_ia = usuario_atual_ia.get("perfil_acesso", "")
    email_usuario_ia = usuario_atual_ia.get("email", "USUARIO_PAINEL")

    pode_decidir_ia = (
        perfil_usuario_ia == "ADMINISTRADOR"
        or usuario_tem_permissao("documentos.classificar")
        or usuario_tem_permissao("documentos.editar")
    )

    if not pode_decidir_ia:
        st.info("Seu usuário não tem permissão para decidir candidatos da IA.")

    motivo_ia = st.text_input(
        "Motivo/observação da decisão",
        value="Decisão registrada pelo painel IA Documental.",
        key="ia_doc_motivo_decisao",
    )

    b1, b2, b3, b4, b5 = st.columns(5)

    with b1:
        acao_confirmar_alvara = st.button(
            "Confirmar Alvará/Licença",
            disabled=(not pode_decidir_ia or linha_ia.get("destino_sugerido") != "ALVARA_LICENCA"),
            key="ia_doc_confirmar_alvara",
        )

    with b2:
        acao_confirmar_certidao = st.button(
            "Confirmar Certidão",
            disabled=(not pode_decidir_ia or linha_ia.get("destino_sugerido") != "CERTIDAO_NEGATIVA"),
            key="ia_doc_confirmar_certidao",
        )

    with b3:
        acao_duplicado = st.button(
            "Duplicado",
            disabled=not pode_decidir_ia,
            key="ia_doc_duplicado",
        )

    with b4:
        acao_ignorar = st.button(
            "Ignorar",
            disabled=not pode_decidir_ia,
            key="ia_doc_ignorar",
        )

    with b5:
        acao_revisar = st.button(
            "Revisar depois",
            disabled=not pode_decidir_ia,
            key="ia_doc_revisar",
        )

    try:
        if acao_confirmar_alvara:
            resultado = executar_sql_parametrizado(
                "SELECT * FROM contabilidade_confirmar_candidato_alvara_licenca_ia(%s, %s, %s);",
                [auditoria_ia_id, email_usuario_ia, motivo_ia],
            )
            st.cache_data.clear()
            st.success(f"Alvará/Licença processado: {resultado}")
            st.rerun()

        if acao_confirmar_certidao:
            resultado = executar_sql_parametrizado(
                "SELECT * FROM contabilidade_confirmar_candidato_certidao_negativa_ia(%s, %s, %s);",
                [auditoria_ia_id, email_usuario_ia, motivo_ia],
            )
            st.cache_data.clear()
            st.success(f"Certidão processada: {resultado}")
            st.rerun()

        if acao_duplicado:
            resultado = executar_sql_parametrizado(
                "SELECT * FROM contabilidade_decidir_candidato_legal_ia(%s, 'DUPLICADO', %s, %s);",
                [auditoria_ia_id, email_usuario_ia, motivo_ia],
            )
            st.cache_data.clear()
            st.success(f"Marcado como duplicado: {resultado}")
            st.rerun()

        if acao_ignorar:
            resultado = executar_sql_parametrizado(
                "SELECT * FROM contabilidade_decidir_candidato_legal_ia(%s, 'IGNORADO', %s, %s);",
                [auditoria_ia_id, email_usuario_ia, motivo_ia],
            )
            st.cache_data.clear()
            st.success(f"Ignorado: {resultado}")
            st.rerun()

        if acao_revisar:
            resultado = executar_sql_parametrizado(
                "SELECT * FROM contabilidade_decidir_candidato_legal_ia(%s, 'REVISAR_DEPOIS', %s, %s);",
                [auditoria_ia_id, email_usuario_ia, motivo_ia],
            )
            st.cache_data.clear()
            st.success(f"Enviado para revisar depois: {resultado}")
            st.rerun()

    except Exception as erro:
        st.error("Não foi possível registrar a decisão da IA.")
        st.exception(erro)

    st.info("Exclusão do Google Drive ainda não é automática. Duplicados irão para fila de decisão/log em fase posterior.")




def render_tratamento_alerta_cliente(alertas_cliente_filtrado, perfil_id):
    st.markdown("#### 🛠️ Tratamento do alerta")

    if alertas_cliente_filtrado is None or alertas_cliente_filtrado.empty:
        st.info("Nenhum alerta disponível para tratamento com os filtros atuais.")
        return

    colunas_obrigatorias = ["Tipo Alerta", "Origem", "Vencimento ID", "Tipo", "Nível"]
    faltando = [c for c in colunas_obrigatorias if c not in alertas_cliente_filtrado.columns]

    if faltando:
        st.info("Tratamento de alerta ainda não disponível para esta tabela.")
        return

    opcoes_map = {}

    for _, row in alertas_cliente_filtrado.iterrows():
        vencimento_id = int(row.get("Vencimento ID"))
        origem = str(row.get("Origem", ""))
        tipo = str(row.get("Tipo", ""))
        nivel = str(row.get("Nível", ""))
        tratamento = str(row.get("Tratamento", "ABERTO") or "ABERTO")
        validade = formatar_data_visual_python(row.get("Validade", ""))

        rotulo = f"{vencimento_id} | {origem} | {tipo} | {nivel} | {validade} | {humanizar_codigo_visual(tratamento)}"
        opcoes_map[rotulo] = row

    selecionado_alerta = st.selectbox(
        "Selecionar alerta para tratar",
        list(opcoes_map.keys()),
        key=f"select_tratamento_alerta_cliente_{perfil_id}",
    )

    linha_alerta = opcoes_map[selecionado_alerta]

    usuario_alerta = st.session_state.get("usuario_logado", {}) or {}
    perfil_usuario_alerta = usuario_alerta.get("perfil_acesso", "")
    email_usuario_alerta = usuario_alerta.get("email", "USUARIO_PAINEL")

    pode_tratar_alerta = (
        perfil_usuario_alerta in ("ADMINISTRADOR", "GERENTE", "FUNCIONARIO")
        or usuario_tem_permissao("alertas.tratar")
    )

    if not pode_tratar_alerta:
        st.info("Seu usuário não tem permissão para tratar alertas.")

    status_opcoes = [
        "ABERTO",
        "EM_ANALISE",
        "AGUARDANDO_CLIENTE",
        "RESOLVIDO",
        "DISPENSADO",
    ]

    status_atual = str(linha_alerta.get("Tratamento", "ABERTO") or "ABERTO").upper()

    try:
        status_idx = status_opcoes.index(status_atual)
    except ValueError:
        status_idx = 0

    st.write("**Mensagem:**", linha_alerta.get("Mensagem", ""))
    st.write("**Arquivo:**", linha_alerta.get("Arquivo", ""))

    novo_status_alerta = st.selectbox(
        "Novo status do tratamento",
        status_opcoes,
        index=status_idx,
        key=f"novo_status_tratamento_alerta_{perfil_id}",
        format_func=lambda x: humanizar_codigo_visual(x),
    )

    observacao_alerta = st.text_area(
        "Observação do tratamento",
        value=str(linha_alerta.get("Obs tratamento", "") or ""),
        key=f"observacao_tratamento_alerta_{perfil_id}",
        height=90,
    )

    salvar_tratamento_alerta = st.button(
        "Salvar tratamento do alerta",
        disabled=not pode_tratar_alerta,
        key=f"btn_salvar_tratamento_alerta_{perfil_id}",
    )

    if salvar_tratamento_alerta:
        try:
            resultado = executar_sql_parametrizado(
                """
                SELECT *
                FROM contabilidade_atualizar_tratamento_alerta(
                    %s, %s, %s, %s, %s, %s, %s
                );
                """,
                [
                    str(linha_alerta.get("Tipo Alerta")),
                    str(linha_alerta.get("Origem")),
                    int(linha_alerta.get("Vencimento ID")),
                    int(perfil_id),
                    novo_status_alerta,
                    email_usuario_alerta,
                    observacao_alerta,
                ],
            )

            st.cache_data.clear()
            st.success(f"Tratamento atualizado com sucesso: {resultado}")
            st.rerun()

        except Exception as erro:
            st.error("Não foi possível atualizar o tratamento do alerta.")
            st.exception(erro)




def render_atribuir_responsavel_alerta_dashboard(fila_filtrada):
    st.markdown("#### 👤 Atribuir responsável ao alerta")

    if fila_filtrada is None or fila_filtrada.empty:
        st.info("Nenhum alerta disponível para atribuição com os filtros atuais.")
        return

    colunas_obrigatorias = [
        "Tipo Alerta",
        "Origem",
        "Vencimento ID",
        "Perfil ID",
        "Cliente",
        "Tipo",
        "Tratamento",
        "Nível",
    ]

    faltando = [c for c in colunas_obrigatorias if c not in fila_filtrada.columns]

    if faltando:
        st.info("Atribuição de responsável ainda não disponível para esta tabela.")
        return

    usuario_atual = st.session_state.get("usuario_logado", {}) or {}
    perfil_usuario = usuario_atual.get("perfil_acesso", "")
    email_usuario = usuario_atual.get("email", "USUARIO_PAINEL")

    pode_atribuir = (
        perfil_usuario == "ADMINISTRADOR"
        or usuario_tem_permissao("alertas.atribuir")
        or usuario_tem_permissao("usuarios.gerenciar")
    )

    if not pode_atribuir:
        st.info("Seu usuário não tem permissão para atribuir alertas.")
        return

    try:
        usuarios_df = sql_df("""
            SELECT
                email,
                nome,
                perfil_acesso,
                ativo
            FROM app_usuarios
            WHERE ativo = TRUE
            ORDER BY
                CASE perfil_acesso
                    WHEN 'ADMINISTRADOR' THEN 1
                    WHEN 'GERENTE' THEN 2
                    WHEN 'FUNCIONARIO' THEN 3
                    ELSE 9
                END,
                nome,
                email;
        """)
    except Exception as erro:
        usuarios_df = pd.DataFrame()
        st.error("Não foi possível carregar usuários para atribuição.")
        st.exception(erro)

    if usuarios_df.empty:
        st.warning("Nenhum usuário ativo encontrado para atribuição.")
        return

    opcoes_alerta = {}

    for _, row in fila_filtrada.iterrows():
        vencimento_id = int(row.get("Vencimento ID"))
        perfil_id_alerta = int(row.get("Perfil ID"))
        origem = str(row.get("Origem", ""))
        tipo = str(row.get("Tipo", ""))
        cliente = str(row.get("Cliente", ""))
        nivel = str(row.get("Nível", ""))
        tratamento = str(row.get("Tratamento", ""))
        validade = formatar_data_visual_python(row.get("Validade", ""))

        rotulo = (
            f"{vencimento_id} | Perfil {perfil_id_alerta} | {origem} | {tipo} | "
            f"{nivel} | {tratamento} | {validade} | {cliente}"
        )

        opcoes_alerta[rotulo] = row

    alerta_escolhido = st.selectbox(
        "Selecionar alerta para atribuir",
        list(opcoes_alerta.keys()),
        key="dashboard_atribuir_alerta_selecionado",
    )

    linha_alerta = opcoes_alerta[alerta_escolhido]

    usuarios_df["rotulo"] = (
        usuarios_df["nome"].astype(str)
        + " | "
        + usuarios_df["email"].astype(str)
        + " | "
        + usuarios_df["perfil_acesso"].astype(str)
    )

    usuario_rotulo = st.selectbox(
        "Responsável",
        usuarios_df["rotulo"].tolist(),
        key="dashboard_atribuir_alerta_responsavel",
    )

    responsavel_email = str(
        usuarios_df[usuarios_df["rotulo"] == usuario_rotulo].iloc[0]["email"]
    )

    observacao_atribuicao = st.text_area(
        "Observação da atribuição",
        value="Responsável atribuído pelo Dashboard.",
        key="dashboard_atribuir_alerta_observacao",
        height=80,
    )

    st.write("**Alerta selecionado:**", linha_alerta.get("Mensagem", ""))
    st.write("**Responsável selecionado:**", responsavel_email)

    confirmar_atribuicao = st.button(
        "Atribuir responsável",
        key="dashboard_btn_atribuir_responsavel_alerta",
    )

    if confirmar_atribuicao:
        try:
            resultado = executar_sql_parametrizado(
                """
                SELECT *
                FROM contabilidade_atribuir_responsavel_alerta(
                    %s, %s, %s, %s, %s, %s, %s
                );
                """,
                [
                    str(linha_alerta.get("Tipo Alerta")),
                    str(linha_alerta.get("Origem")),
                    int(linha_alerta.get("Vencimento ID")),
                    int(linha_alerta.get("Perfil ID")),
                    responsavel_email,
                    email_usuario,
                    observacao_atribuicao,
                ],
            )

            st.cache_data.clear()
            st.success(f"Responsável atribuído com sucesso: {resultado}")
            st.rerun()

        except Exception as erro:
            st.error("Não foi possível atribuir responsável ao alerta.")
            st.exception(erro)




def render_como_resolver_alerta_topo(fila_topo_filtrada):
    st.markdown("#### 🧭 Resolver alerta selecionado")

    if fila_topo_filtrada is None or fila_topo_filtrada.empty:
        st.info("Nenhum alerta disponível para resolução com os filtros atuais.")
        return

    colunas_obrigatorias = [
        "Tipo Alerta",
        "Origem",
        "Vencimento ID",
        "Perfil ID",
        "Cliente",
        "Tipo",
        "Tratamento",
        "Nível",
        "Ação recomendada",
        "Onde resolver",
        "Roteiro",
        "Destino ação",
    ]

    faltando = [c for c in colunas_obrigatorias if c not in fila_topo_filtrada.columns]

    if faltando:
        st.info("Roteiro de resolução ainda não disponível para esta tabela.")
        return

    opcoes_alerta = {}

    for _, row in fila_topo_filtrada.iterrows():
        vencimento_id = int(row.get("Vencimento ID"))
        perfil_id_alerta = int(row.get("Perfil ID"))
        origem = str(row.get("Origem", ""))
        tipo = str(row.get("Tipo", ""))
        cliente = str(row.get("Cliente", ""))
        nivel = str(row.get("Nível", ""))
        tratamento = str(row.get("Tratamento", ""))
        validade = formatar_data_visual_python(row.get("Validade", ""))

        rotulo = (
            f"{vencimento_id} | Perfil {perfil_id_alerta} | {nivel} | {tratamento} | "
            f"{origem} | {tipo} | {validade} | {cliente}"
        )

        opcoes_alerta[rotulo] = row

    alerta_escolhido = st.selectbox(
        "Selecionar alerta",
        list(opcoes_alerta.keys()),
        key="topo_resolver_alerta_selecionado",
    )

    linha = opcoes_alerta[alerta_escolhido]

    st.markdown(
        f"""
        <div style="
            border:1px solid rgba(201,162,77,0.35);
            border-radius:18px;
            padding:18px;
            margin:10px 0 14px 0;
            background:linear-gradient(145deg,rgba(18,18,18,0.98),rgba(34,28,15,0.96));
            box-shadow:0 12px 30px rgba(0,0,0,0.20);
        ">
            <div style="font-size:18px;font-weight:900;color:#ffffff;margin-bottom:8px;">
                {linha.get("Cliente", "")}
            </div>
            <div style="font-size:13px;color:#d8c9a7;font-weight:800;margin-bottom:8px;">
                {linha.get("Nível", "")} • {linha.get("Tratamento", "")} • {linha.get("Origem", "")} • {linha.get("Tipo", "")}
            </div>
            <div style="font-size:14px;color:#ffffff;margin-bottom:8px;">
                <b>Ação recomendada:</b> {linha.get("Ação recomendada", "")}
            </div>
            <div style="font-size:14px;color:#d8d8d8;margin-bottom:8px;">
                <b>Onde resolver:</b> {linha.get("Onde resolver", "")}
            </div>
            <div style="font-size:14px;color:#c7c7c7;line-height:1.45;">
                <b>Como resolver:</b> {linha.get("Roteiro", "")}
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    usuario_atual = st.session_state.get("usuario_logado", {}) or {}
    email_usuario = usuario_atual.get("email", "USUARIO_PAINEL")
    perfil_usuario = str(usuario_atual.get("perfil_acesso", "") or "").upper()

    pode_tratar = (
        perfil_usuario in ("ADMINISTRADOR", "GERENTE", "FUNCIONARIO")
        or usuario_tem_permissao("alertas.tratar")
    )

    c1, c2, c3, c4, c5 = st.columns(5)

    with c1:
        abrir_cliente = st.button(
            "Abrir cliente",
            key="topo_btn_abrir_cliente_alerta",
        )

    with c2:
        em_analise = st.button(
            "Em análise",
            disabled=not pode_tratar,
            key="topo_btn_alerta_em_analise",
        )

    with c3:
        aguardando = st.button(
            "Aguardando cliente",
            disabled=not pode_tratar,
            key="topo_btn_alerta_aguardando",
        )

    with c4:
        resolvido = st.button(
            "Resolvido",
            disabled=not pode_tratar,
            key="topo_btn_alerta_resolvido",
        )

    with c5:
        dispensado = st.button(
            "Dispensado",
            disabled=not pode_tratar,
            key="topo_btn_alerta_dispensado",
        )

    if abrir_cliente:
        st.session_state["abrir_cliente_automatico"] = True
        st.session_state["perfil_id_preselecionado"] = int(linha.get("Perfil ID"))
        st.session_state["cliente_preselecionado_nome"] = str(linha.get("Cliente", ""))
        st.success("Cliente preparado para edição. Abra/consulte a aba 🔎 Cliente.")
        st.rerun()

    observacao_rapida = st.text_input(
        "Observação rápida",
        value="Tratamento atualizado pela Minha Fila de Trabalho.",
        key="topo_observacao_resolver_alerta",
    )

    novo_status = None

    if em_analise:
        novo_status = "EM_ANALISE"
    elif aguardando:
        novo_status = "AGUARDANDO_CLIENTE"
    elif resolvido:
        novo_status = "RESOLVIDO"
    elif dispensado:
        novo_status = "DISPENSADO"

    if novo_status:
        try:
            resultado = executar_sql_parametrizado(
                """
                SELECT *
                FROM contabilidade_atualizar_tratamento_alerta(
                    %s, %s, %s, %s, %s, %s, %s
                );
                """,
                [
                    str(linha.get("Tipo Alerta")),
                    str(linha.get("Origem")),
                    int(linha.get("Vencimento ID")),
                    int(linha.get("Perfil ID")),
                    novo_status,
                    email_usuario,
                    observacao_rapida,
                ],
            )

            st.cache_data.clear()
            st.success(f"Alerta atualizado com sucesso: {resultado}")
            st.rerun()

        except Exception as erro:
            st.error("Não foi possível atualizar o alerta.")
            st.exception(erro)




def render_hero_premium_brandao():
    st.markdown(
        """
        <div class="brandao-hero-premium">
            <div>
                <h1 class="brandao-hero-title">Painel Operacional — Brandão Contabilidade</h1>
                <div class="brandao-hero-subtitle">
                    Gestão contábil, pendências, vencimentos, usuários, auditoria e validação documental com IA.
                </div>
            </div>
            <div class="brandao-hero-contacts">
                <div class="brandao-hero-contact-item"><b>✉</b> adm@brandaocontador.com.br</div>
                <div class="brandao-hero-contact-item"><b>📍</b> Rua Santa Catarina, 1010<br>Centro — Sidrolândia/MS</div>
                <div class="brandao-hero-contact-item"><b>☎</b> 67 3272-3266</div>
                <div class="brandao-hero-contact-item"><b>☘</b> 67 99601-1356</div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def valor_kpi_seguro(kpi, campo, padrao=0):
    try:
        return int(kpi.get(campo, padrao))
    except Exception:
        try:
            return int(kpi[campo])
        except Exception:
            return padrao


def contar_vencimentos_por_origem(origem):
    try:
        df = sql_df(f"""
            SELECT COUNT(*) AS total
            FROM vw_app_vencimentos
            WHERE origem = '{origem}';
        """)
        if df.empty:
            return 0
        return int(df.iloc[0]["total"])
    except Exception:
        return 0


def contar_ia_documental_total():
    try:
        df = sql_df("""
            SELECT COUNT(*) AS total
            FROM documentos_auditoria_ia_cliente;
        """)
        if df.empty:
            return 0
        return int(df.iloc[0]["total"])
    except Exception:
        return 0


def render_kpi_card_premium(icone, titulo, valor, subtitulo="", classe_sub=""):
    st.markdown(
        f"""
        <div class="brandao-kpi-card">
            <div class="brandao-kpi-top">
                <span class="brandao-kpi-icon">{icone}</span>
                <span>{titulo}</span>
            </div>
            <div class="brandao-kpi-value">{valor}</div>
            <div class="brandao-kpi-sub {classe_sub}">{subtitulo}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_kpis_premium_brandao(kpi):
    total_clientes = valor_kpi_seguro(kpi, "total_clientes")
    pendencias = valor_kpi_seguro(kpi, "pendencias_abertas")
    criticas = valor_kpi_seguro(kpi, "pendencias_criticas_abertas")
    certificados = valor_kpi_seguro(kpi, "total_certificados")
    procuracoes = valor_kpi_seguro(kpi, "total_procuracoes")
    alvaras = contar_vencimentos_por_origem("ALVARA_LICENCA")
    certidoes = contar_vencimentos_por_origem("CERTIDAO_NEGATIVA")
    ia_total = contar_ia_documental_total()

    cards = [
        ("👥", "Clientes", total_clientes, "Ativos", ""),
        ("📋", "Pendências", pendencias, "Abertas", "warn"),
        ("⚠️", "Críticas", criticas, "Requer atenção", "danger"),
        ("🛡️", "Certificados", certificados, "Controle digital", ""),
        ("🤝", "Procurações", procuracoes, "Portais e acessos", ""),
        ("🏛️", "Alvarás/Licenças", alvaras, "Validados", ""),
        ("🏅", "Certidões", certidoes, "Controle legal", ""),
        ("🤖", "IA Documental", ia_total, "Docs analisados", ""),
    ]

    for inicio in range(0, len(cards), 4):
        cols = st.columns(4)
        for col, card in zip(cols, cards[inicio:inicio + 4]):
            with col:
                render_kpi_card_premium(*card)




def safe_html_text_brandao(valor):
    s = "" if valor is None else str(valor)
    return (
        s.replace("&", "&amp;")
         .replace("<", "&lt;")
         .replace(">", "&gt;")
         .replace('"', "&quot;")
         .replace("'", "&#39;")
    )


def iniciais_cliente_visual_brandao(nome):
    partes = [p for p in str(nome or "").replace("(", " ").split() if p.strip()]
    if not partes:
        return "BC"
    if len(partes) == 1:
        return partes[0][:2].upper()
    return (partes[0][:1] + partes[1][:1]).upper()


def render_lista_premium_brandao(titulo, subtitulo, badge, itens, vazio="Nenhum item encontrado."):
    html = []
    html.append('<div class="brandao-panel-card">')
    html.append(
        '<div class="brandao-panel-title"><span>'
        + safe_html_text_brandao(titulo)
        + '</span><span class="brandao-panel-badge">'
        + safe_html_text_brandao(badge)
        + '</span></div>'
    )
    html.append('<div class="brandao-panel-subtitle">' + safe_html_text_brandao(subtitulo) + '</div>')

    if not itens:
        html.append('<div class="brandao-empty-card">' + safe_html_text_brandao(vazio) + '</div>')
    else:
        for item in itens:
            iniciais = safe_html_text_brandao(item.get("iniciais", "BC"))
            nome = safe_html_text_brandao(item.get("nome", ""))
            desc = safe_html_text_brandao(item.get("desc", ""))
            tag = safe_html_text_brandao(item.get("tag", ""))
            classe = safe_html_text_brandao(item.get("classe", ""))

            html.append('<div class="brandao-mini-item">')
            html.append('<div class="brandao-mini-avatar">' + iniciais + '</div>')
            html.append('<div class="brandao-mini-main">')
            html.append('<div class="brandao-mini-name">' + nome + '</div>')
            html.append('<div class="brandao-mini-desc">' + desc + '</div>')
            html.append('</div>')
            html.append('<div class="brandao-mini-tag ' + classe + '">' + tag + '</div>')
            html.append('</div>')

    html.append("</div>")
    st.markdown("".join(html), unsafe_allow_html=True)


def montar_itens_alertas_dashboard_brandao(limite=5):
    try:
        df = sql_df(
            "SELECT cliente, tipo_controle, nivel_alerta_visual, status_tratamento_visual, "
            "dias_para_vencer, mensagem_alerta "
            "FROM vw_app_fila_alertas_com_roteiro "
            "ORDER BY ordem_nivel, ordem_tratamento, data_validade NULLS FIRST, cliente "
            f"LIMIT {int(limite)};"
        )
    except Exception:
        df = pd.DataFrame()

    itens = []
    for _, row in df.iterrows():
        cliente = str(row.get("cliente", ""))
        nivel = str(row.get("nivel_alerta_visual", ""))
        status = str(row.get("status_tratamento_visual", ""))
        tipo = str(row.get("tipo_controle", ""))
        dias = row.get("dias_para_vencer", "")

        classe = "danger" if nivel.lower().startswith("cr") else ""
        itens.append({
            "iniciais": iniciais_cliente_visual_brandao(cliente),
            "nome": cliente,
            "desc": f"{tipo} • {status} • {dias if dias not in (None, '') else 'sem prazo'} dias",
            "tag": nivel or "Alerta",
            "classe": classe,
        })
    return itens


def montar_itens_ia_dashboard_brandao(limite=5):
    try:
        df = sql_df(
            "SELECT razao_social_nome, nome_arquivo, tipo_documento_ia, subtipo_documento_ia, status_candidato "
            "FROM vw_app_candidatos_alvaras_certidoes_pendentes "
            "ORDER BY auditoria_ia_id DESC "
            f"LIMIT {int(limite)};"
        )
    except Exception:
        df = pd.DataFrame()

    itens = []
    for _, row in df.iterrows():
        cliente = str(row.get("razao_social_nome", ""))
        arquivo = str(row.get("nome_arquivo", ""))
        tipo = str(row.get("tipo_documento_ia", ""))
        status = humanizar_codigo_visual(row.get("status_candidato", ""))

        itens.append({
            "iniciais": "IA",
            "nome": arquivo or cliente,
            "desc": f"{cliente} • {tipo}",
            "tag": status or "IA",
            "classe": "ok",
        })
    return itens


def montar_itens_vencimentos_dashboard_brandao(limite=5):
    try:
        df = sql_df(
            "SELECT cliente_raiz_nome, tipo_controle, data_validade, "
            "dias_para_vencer_calculado, status_calculado "
            "FROM vw_app_vencimentos "
            "WHERE data_validade IS NOT NULL "
            "AND status_calculado IN ('VENCIDO', 'VENCIDA', 'VENCENDO_30_DIAS', 'VENCENDO_60_DIAS', 'VENCENDO_90_DIAS', 'PENDENTE_VERIFICACAO') "
            "ORDER BY ordem_status, data_validade NULLS FIRST, cliente_raiz_nome "
            f"LIMIT {int(limite)};"
        )
    except Exception:
        df = pd.DataFrame()

    itens = []
    for _, row in df.iterrows():
        cliente = str(row.get("cliente_raiz_nome", ""))
        tipo = str(row.get("tipo_controle", ""))
        validade = formatar_data_visual_python(row.get("data_validade", ""))
        dias = row.get("dias_para_vencer_calculado", "")
        status = humanizar_codigo_visual(row.get("status_calculado", ""))

        classe = "danger" if "vencid" in status.lower() else ""
        itens.append({
            "iniciais": iniciais_cliente_visual_brandao(cliente),
            "nome": tipo,
            "desc": f"{cliente} • {validade}",
            "tag": f"{dias} dias" if dias not in (None, "") else status,
            "classe": classe,
        })
    return itens


def montar_itens_atividades_dashboard_brandao(limite=5):
    try:
        df = sql_df(
            "SELECT usuario_email, acao, entidade, observacao, criado_em "
            "FROM app_auditoria_log "
            "ORDER BY criado_em DESC "
            f"LIMIT {int(limite)};"
        )
    except Exception:
        df = pd.DataFrame()

    itens = []
    for _, row in df.iterrows():
        acao = humanizar_codigo_visual(row.get("acao", ""))
        usuario = str(row.get("usuario_email", ""))
        obs = str(row.get("observacao", ""))
        criado = formatar_data_visual_python(row.get("criado_em", ""))

        itens.append({
            "iniciais": "✓",
            "nome": acao,
            "desc": f"{usuario} • {obs}",
            "tag": criado or "recente",
            "classe": "ok",
        })
    return itens


def render_dashboard_grid_premium_brandao():
    alertas = montar_itens_alertas_dashboard_brandao(5)
    ia = montar_itens_ia_dashboard_brandao(5)
    vencimentos = montar_itens_vencimentos_dashboard_brandao(5)
    atividades = montar_itens_atividades_dashboard_brandao(5)

    col1, col2, col3 = st.columns([1.05, 1.35, 1])

    with col1:
        render_lista_premium_brandao(
            "🚨 Alertas por cliente",
            "Pendências operacionais priorizadas para tratamento.",
            "Ver todos",
            alertas,
            vazio="Nenhum alerta operacional aberto.",
        )

    with col2:
        render_lista_premium_brandao(
            "🤖 Documentos encontrados pela IA",
            "Valide os documentos detectados e classifique corretamente.",
            "IA",
            ia,
            vazio="Nenhum candidato de IA pendente no momento.",
        )

    with col3:
        render_lista_premium_brandao(
            "📅 Vencimentos próximos",
            "Documentos e controles que exigem atenção.",
            "Vencer",
            vencimentos,
            vazio="Nenhum vencimento próximo encontrado.",
        )

    col4, col5 = st.columns([1.35, 1])

    with col4:
        try:
            criticos_df = sql_df(
                "SELECT risco AS \"Risco\", cliente AS \"Cliente\", tipo_pessoa AS \"Tipo\", "
                "perfil_operacional AS \"Perfil operacional\", pendencias_abertas AS \"Pendências abertas\", "
                "obrigatorias_pendentes AS \"Obrigatórias\", criticas_pendentes AS \"Críticas\", altas_pendentes AS \"Altas\" "
                "FROM vw_app_clientes_mais_criticos "
                "ORDER BY criticas_pendentes DESC, altas_pendentes DESC, pendencias_abertas DESC "
                "LIMIT 8;"
            )
        except Exception:
            criticos_df = pd.DataFrame()

        st.markdown("### 🚨 Pendências críticas")
        if criticos_df.empty:
            st.info("Nenhuma pendência crítica encontrada.")
        else:
            tabela(criticos_df, altura=250)

    with col5:
        render_lista_premium_brandao(
            "🕘 Atividades recentes",
            "Últimas ações registradas no painel.",
            "Log",
            atividades,
            vazio="Nenhuma atividade recente encontrada.",
        )



def tabela(df, altura=500):
    st.dataframe(preparar_df_visual(df), width="stretch", height=altura)

usuario_logado = exigir_login_app()

render_hero_premium_brandao()

try:
    kpi = sql_df("SELECT * FROM vw_app_dashboard_kpis;").iloc[0]

    render_kpis_premium_brandao(kpi)

    st.divider()
    abas_labels_padrao = [
        "🏠 Dashboard",
        "👥 Clientes",
        "🔎 Cliente",
        "🚨 Pendências",
        "📄 Folha/RH",
        "🧾 Fiscal",
        "🔐 Certificados e Procurações",
            "🤖 IA Documental",

    ]

    # Navegação real pelo menu lateral:
    # o Streamlit abre a primeira aba por padrão, então reorganizamos a ordem
    # colocando a aba escolhida pelo menu na primeira posição.
    destino_menu_lateral = st.session_state.get("menu_lateral_destino", "DASHBOARD")

    if st.session_state.get("abrir_cliente_automatico", False):
        destino_menu_lateral = "CLIENTE"

    mapa_destino_tab = {
        "DASHBOARD": "DASHBOARD",
        "CLIENTES": "CLIENTES",
        "CLIENTE": "CLIENTE",
        "PENDENCIAS": "PENDENCIAS",
        "FOLHA_RH": "FOLHA_RH",
        "FISCAL": "FISCAL",
        "CERTIFICADOS": "CERTIFICADOS",
        "VENCIMENTOS": "CERTIFICADOS",
        "IA_DOCUMENTAL": "IA_DOCUMENTAL",
        "CONFIGURACOES": "DASHBOARD",
    }

    destino_tab_ativo = mapa_destino_tab.get(destino_menu_lateral, "DASHBOARD")

    ordem_tabs_config = [
        ("DASHBOARD", "aba1", 0),
        ("CLIENTES", "aba2", 1),
        ("CLIENTE", "aba_cliente", 2),
        ("PENDENCIAS", "aba3", 3),
        ("FOLHA_RH", "aba4", 4),
        ("FISCAL", "aba5", 5),
        ("CERTIFICADOS", "aba6", 6),
        ("IA_DOCUMENTAL", "aba_ia", 7),
    ]

    if destino_tab_ativo != "DASHBOARD":
        ordem_tabs_config = (
            [item for item in ordem_tabs_config if item[0] == destino_tab_ativo]
            + [item for item in ordem_tabs_config if item[0] != destino_tab_ativo]
        )

    tabs_criadas = st.tabs([abas_labels_padrao[idx_label] for _, _, idx_label in ordem_tabs_config])

    tabs_por_variavel = {}
    for (_codigo, nome_variavel, _idx_label), tab_obj in zip(ordem_tabs_config, tabs_criadas):
        tabs_por_variavel[nome_variavel] = tab_obj

    aba1 = tabs_por_variavel["aba1"]
    aba2 = tabs_por_variavel["aba2"]
    aba_cliente = tabs_por_variavel["aba_cliente"]
    aba3 = tabs_por_variavel["aba3"]
    aba4 = tabs_por_variavel["aba4"]
    aba5 = tabs_por_variavel["aba5"]
    aba6 = tabs_por_variavel["aba6"]
    aba_ia = tabs_por_variavel["aba_ia"]

    with aba1:
        st.markdown("## 🧭 Centro de comando do escritório")

        st.markdown("### 🚀 Minha Fila de Trabalho")

        usuario_topo_fila = st.session_state.get("usuario_logado", {}) or {}
        email_topo_fila = str(usuario_topo_fila.get("email", "") or "").strip().lower().replace("'", "''")
        perfil_topo_fila = str(usuario_topo_fila.get("perfil_acesso", "") or "").strip().upper()

        filtro_topo_fila_sql = ""
        texto_topo_fila = "Visão geral da fila operacional do escritório."

        if perfil_topo_fila not in ("ADMINISTRADOR", "GERENTE"):
            filtro_topo_fila_sql = f"WHERE LOWER(COALESCE(responsavel_email, '')) = '{email_topo_fila}'"
            texto_topo_fila = "Você está vendo apenas os alertas atribuídos ao seu usuário."

        try:
            minha_fila_topo_df = sql_df(f"""
                SELECT
                    tipo_alerta AS "Tipo Alerta",
                    vencimento_id AS "Vencimento ID",
                    perfil_id AS "Perfil ID",
                    status_tratamento_visual AS "Tratamento",
                    nivel_alerta_visual AS "Nível",
                    origem AS "Origem",
                    tipo_controle AS "Tipo",
                    cliente AS "Cliente",
                    cpf_cnpj AS "CPF/CNPJ",
                    data_validade AS "Validade",
                    dias_para_vencer AS "Dias",
                    responsavel_email AS "Responsável",
                    mensagem_alerta AS "Mensagem",
                    acao_recomendada AS "Ação recomendada",
                    onde_resolver AS "Onde resolver",
                    roteiro_resolucao AS "Roteiro",
                    destino_acao AS "Destino ação"
                FROM vw_app_fila_alertas_com_roteiro
                {filtro_topo_fila_sql}
                ORDER BY ordem_nivel, ordem_tratamento, data_validade NULLS FIRST, cliente
                LIMIT 80;
            """)
        except Exception as erro:
            minha_fila_topo_df = pd.DataFrame()
            st.error("Não foi possível carregar sua fila de trabalho.")
            st.exception(erro)

        if minha_fila_topo_df.empty:
            st.success("Nenhuma tarefa operacional atribuída no momento.")
        else:
            st.caption(texto_topo_fila)

            tratamento_topo = minha_fila_topo_df["Tratamento"].astype(str)
            nivel_topo = minha_fila_topo_df["Nível"].astype(str)

            mt1, mt2, mt3, mt4, mt5 = st.columns(5)
            mt1.metric("Minha fila", len(minha_fila_topo_df))
            mt2.metric("Aberto", int((tratamento_topo == "Aberto").sum()))
            mt3.metric("Em análise", int((tratamento_topo == "Em análise").sum()))
            mt4.metric("Aguardando cliente", int((tratamento_topo == "Aguardando cliente").sum()))
            mt5.metric("Alto/Crítico", int(nivel_topo.isin(["Alto", "Crítico"]).sum()))

            with st.expander("Ver minha fila de trabalho", expanded=False):
                ft1, ft2, ft3 = st.columns([1, 1, 2])

                with ft1:
                    tratamentos_topo = ["Todos"] + sorted(minha_fila_topo_df["Tratamento"].dropna().astype(str).unique().tolist())
                    filtro_tratamento_topo = st.selectbox(
                        "Tratamento",
                        tratamentos_topo,
                        key="topo_fila_tratamento",
                    )

                with ft2:
                    niveis_topo = ["Todos"] + sorted(minha_fila_topo_df["Nível"].dropna().astype(str).unique().tolist())
                    filtro_nivel_topo = st.selectbox(
                        "Nível",
                        niveis_topo,
                        key="topo_fila_nivel",
                    )

                with ft3:
                    busca_topo = st.text_input(
                        "Buscar cliente, CNPJ, tipo, responsável ou mensagem",
                        key="topo_fila_busca",
                    )

                minha_fila_topo_filtrada = minha_fila_topo_df.copy()

                if filtro_tratamento_topo != "Todos":
                    minha_fila_topo_filtrada = minha_fila_topo_filtrada[
                        minha_fila_topo_filtrada["Tratamento"] == filtro_tratamento_topo
                    ]

                if filtro_nivel_topo != "Todos":
                    minha_fila_topo_filtrada = minha_fila_topo_filtrada[
                        minha_fila_topo_filtrada["Nível"] == filtro_nivel_topo
                    ]

                if busca_topo.strip():
                    termo_topo = busca_topo.strip().lower()
                    mask_topo = (
                        minha_fila_topo_filtrada["Cliente"].astype(str).str.lower().str.contains(termo_topo, na=False)
                        | minha_fila_topo_filtrada["CPF/CNPJ"].astype(str).str.lower().str.contains(termo_topo, na=False)
                        | minha_fila_topo_filtrada["Tipo"].astype(str).str.lower().str.contains(termo_topo, na=False)
                        | minha_fila_topo_filtrada["Responsável"].astype(str).str.lower().str.contains(termo_topo, na=False)
                        | minha_fila_topo_filtrada["Mensagem"].astype(str).str.lower().str.contains(termo_topo, na=False)
                    )
                    minha_fila_topo_filtrada = minha_fila_topo_filtrada[mask_topo]

                st.metric("Itens filtrados", len(minha_fila_topo_filtrada))

                fila_topo_visual = minha_fila_topo_filtrada.drop(
                    columns=[
                        "Tipo Alerta",
                        "Vencimento ID",
                        "Perfil ID",
                        "Ação recomendada",
                        "Onde resolver",
                        "Roteiro",
                        "Destino ação",
                    ],
                    errors="ignore",
                )
                tabela(fila_topo_visual.head(40), altura=260)

                render_como_resolver_alerta_topo(minha_fila_topo_filtrada)

        st.divider()

        render_dashboard_grid_premium_brandao()

        st.divider()

        with st.expander("📊 Ver visão rápida antiga do dashboard", expanded=False):
            st.caption("Visão rápida das prioridades, documentos encontrados pela IA, vencimentos e ações pendentes.")

            try:
                ia_pendentes_total = executar_sql_parametrizado("""
                    SELECT COUNT(*)
                    FROM vw_app_candidatos_alvaras_certidoes_pendentes;
                """)[0][0]
            except Exception:
                ia_pendentes_total = 0

            try:
                vencimentos_criticos_total = executar_sql_parametrizado("""
                    SELECT COUNT(*)
                    FROM vw_app_vencimentos
                    WHERE ordem_status IN (1, 2, 3)
                       OR status_calculado IN ('VENCIDO', 'A_VENCER', 'PENDENTE');
                """)[0][0]
            except Exception:
                vencimentos_criticos_total = 0

            exec1, exec2, exec3, exec4 = st.columns(4)
            exec1.metric("🚨 Críticas abertas", int(kpi["pendencias_criticas_abertas"]))
            exec2.metric("📌 Pendências abertas", int(kpi["pendencias_abertas"]))
            exec3.metric("🤖 IA aguardando validação", int(ia_pendentes_total))
            exec4.metric("📅 Vencimentos atenção", int(vencimentos_criticos_total))


        with st.expander("📚 Ver painéis operacionais detalhados", expanded=False):
            st.markdown("### 🚨 Central de Alertas")

            try:
                alertas_df = sql_df("""
                    SELECT
                        nivel_alerta AS "Nível",
                        origem AS "Origem",
                        tipo_controle AS "Tipo",
                        cliente AS "Cliente",
                        cpf_cnpj AS "CPF/CNPJ",
                        data_validade AS "Validade",
                        dias_para_vencer AS "Dias",
                        status_calculado AS "Status",
                        status_tratamento AS "Tratamento",
                        responsavel_email AS "Responsável",
                        observacao_tratamento AS "Obs tratamento",
                        mensagem_alerta AS "Mensagem"
                    FROM vw_app_alertas_vencimentos_tratamento
                    ORDER BY ordem_alerta, data_validade NULLS FIRST, cliente
                    LIMIT 200;
                """)
            except Exception as erro:
                alertas_df = pd.DataFrame()
                st.error("Não foi possível carregar a Central de Alertas.")
                st.exception(erro)

            if alertas_df.empty:
                st.success("Nenhum alerta de vencimento encontrado.")
            else:
                a1, a2, a3, a4, a5 = st.columns(5)

                nivel_series = alertas_df["Nível"].astype(str).str.upper()

                a1.metric("Críticos", int((nivel_series == "CRITICO").sum()))
                a2.metric("Altos", int((nivel_series == "ALTO").sum()))
                a3.metric("Médios", int((nivel_series == "MEDIO").sum()))
                a4.metric("Baixos", int((nivel_series == "BAIXO").sum()))
                a5.metric("A verificar", int((nivel_series == "VERIFICAR").sum()))

                st.caption("Alertas gerados automaticamente a partir de certificados, procurações, alvarás, licenças e certidões.")

                st.markdown("#### Status de tratamento dos alertas")
                tratamento_series = alertas_df["Tratamento"].fillna("ABERTO").astype(str).str.upper()

                t1, t2, t3, t4, t5 = st.columns(5)
                t1.metric("Aberto", int((tratamento_series == "ABERTO").sum()))
                t2.metric("Em análise", int((tratamento_series == "EM_ANALISE").sum()))
                t3.metric("Aguardando cliente", int((tratamento_series == "AGUARDANDO_CLIENTE").sum()))
                t4.metric("Resolvido", int((tratamento_series == "RESOLVIDO").sum()))
                t5.metric("Dispensado", int((tratamento_series == "DISPENSADO").sum()))

                with st.expander("Ver alertas prioritários", expanded=False):
                    filtro_alerta_col1, filtro_alerta_col2, filtro_alerta_col3 = st.columns([1, 1, 2])

                    with filtro_alerta_col1:
                        niveis = ["Todos"] + sorted(alertas_df["Nível"].dropna().astype(str).unique().tolist())
                        filtro_nivel_alerta = st.selectbox(
                            "Nível do alerta",
                            niveis,
                            key="dashboard_filtro_nivel_alerta",
                            format_func=lambda x: humanizar_codigo_visual(x),
                        )

                    with filtro_alerta_col2:
                        tratamentos = ["Todos"] + sorted(alertas_df["Tratamento"].fillna("ABERTO").astype(str).unique().tolist())
                        filtro_tratamento_alerta = st.selectbox(
                            "Tratamento",
                            tratamentos,
                            key="dashboard_filtro_tratamento_alerta",
                            format_func=lambda x: humanizar_codigo_visual(x),
                        )

                    with filtro_alerta_col3:
                        busca_alerta = st.text_input(
                            "Buscar cliente, CNPJ, tipo ou mensagem",
                            key="dashboard_busca_alerta",
                        )

                    alertas_filtrado = alertas_df.copy()

                    if filtro_nivel_alerta != "Todos":
                        alertas_filtrado = alertas_filtrado[alertas_filtrado["Nível"] == filtro_nivel_alerta]

                    if filtro_tratamento_alerta != "Todos":
                        alertas_filtrado = alertas_filtrado[alertas_filtrado["Tratamento"] == filtro_tratamento_alerta]

                    if busca_alerta.strip():
                        termo_alerta = busca_alerta.strip().lower()
                        mask_alerta = (
                            alertas_filtrado["Cliente"].astype(str).str.lower().str.contains(termo_alerta, na=False)
                            | alertas_filtrado["CPF/CNPJ"].astype(str).str.lower().str.contains(termo_alerta, na=False)
                            | alertas_filtrado["Tipo"].astype(str).str.lower().str.contains(termo_alerta, na=False)
                            | alertas_filtrado["Mensagem"].astype(str).str.lower().str.contains(termo_alerta, na=False)
                        )
                        alertas_filtrado = alertas_filtrado[mask_alerta]

                    tabela(alertas_filtrado.head(50), altura=330)

            st.divider()

            st.markdown("### 📋 Minha Fila Operacional")

            # FILA OPERACIONAL POR PERFIL DE USUÁRIO
            usuario_fila = st.session_state.get("usuario_logado", {}) or {}
            email_usuario_fila = str(usuario_fila.get("email", "") or "").strip().lower()
            perfil_usuario_fila = str(usuario_fila.get("perfil_acesso", "") or "").strip().upper()

            filtro_fila_sql = ""
            if perfil_usuario_fila not in ("ADMINISTRADOR", "GERENTE"):
                filtro_fila_sql = f"WHERE LOWER(COALESCE(responsavel_email, '')) = '{email_usuario_fila}'"

            try:
                fila_operacional_df = sql_df(f"""
                    SELECT
                        tipo_alerta AS "Tipo Alerta",
                        vencimento_id AS "Vencimento ID",
                        perfil_id AS "Perfil ID",
                        status_tratamento_visual AS "Tratamento",
                        nivel_alerta_visual AS "Nível",
                        origem AS "Origem",
                        tipo_controle AS "Tipo",
                        cliente AS "Cliente",
                        cpf_cnpj AS "CPF/CNPJ",
                        data_validade AS "Validade",
                        dias_para_vencer AS "Dias",
                        responsavel_email AS "Responsável",
                        mensagem_alerta AS "Mensagem"
                    FROM vw_app_fila_alertas_operacional
                    {filtro_fila_sql}
                    ORDER BY ordem_nivel, ordem_tratamento, data_validade NULLS FIRST, cliente
                    LIMIT 300;
                """)
            except Exception as erro:
                fila_operacional_df = pd.DataFrame()
                st.error("Não foi possível carregar a Minha Fila Operacional.")
                st.exception(erro)

            if fila_operacional_df.empty:
                st.success("Nenhum alerta operacional aberto no momento.")
            else:
                tratamento_fila = fila_operacional_df["Tratamento"].astype(str)
                nivel_fila = fila_operacional_df["Nível"].astype(str)

                mf1, mf2, mf3, mf4, mf5 = st.columns(5)
                mf1.metric("Total na fila", len(fila_operacional_df))
                mf2.metric("Aberto", int((tratamento_fila == "Aberto").sum()))
                mf3.metric("Em análise", int((tratamento_fila == "Em análise").sum()))
                mf4.metric("Aguardando cliente", int((tratamento_fila == "Aguardando cliente").sum()))
                mf5.metric("Alto/Crítico", int(nivel_fila.isin(["Alto", "Crítico"]).sum()))

                with st.expander("Ver Minha Fila Operacional", expanded=False):
                    ff1, ff2, ff3 = st.columns([1, 1, 2])

                    with ff1:
                        tratamentos_fila = ["Todos"] + sorted(fila_operacional_df["Tratamento"].dropna().astype(str).unique().tolist())
                        filtro_tratamento_fila = st.selectbox(
                            "Tratamento",
                            tratamentos_fila,
                            key="dashboard_fila_operacional_tratamento",
                        )

                    with ff2:
                        niveis_fila = ["Todos"] + sorted(fila_operacional_df["Nível"].dropna().astype(str).unique().tolist())
                        filtro_nivel_fila = st.selectbox(
                            "Nível",
                            niveis_fila,
                            key="dashboard_fila_operacional_nivel",
                        )

                    with ff3:
                        busca_fila = st.text_input(
                            "Buscar cliente, CNPJ, tipo, responsável ou mensagem",
                            key="dashboard_fila_operacional_busca",
                        )

                    fila_filtrada = fila_operacional_df.copy()

                    if filtro_tratamento_fila != "Todos":
                        fila_filtrada = fila_filtrada[fila_filtrada["Tratamento"] == filtro_tratamento_fila]

                    if filtro_nivel_fila != "Todos":
                        fila_filtrada = fila_filtrada[fila_filtrada["Nível"] == filtro_nivel_fila]

                    if busca_fila.strip():
                        termo_fila = busca_fila.strip().lower()
                        mask_fila = (
                            fila_filtrada["Cliente"].astype(str).str.lower().str.contains(termo_fila, na=False)
                            | fila_filtrada["CPF/CNPJ"].astype(str).str.lower().str.contains(termo_fila, na=False)
                            | fila_filtrada["Tipo"].astype(str).str.lower().str.contains(termo_fila, na=False)
                            | fila_filtrada["Responsável"].astype(str).str.lower().str.contains(termo_fila, na=False)
                            | fila_filtrada["Mensagem"].astype(str).str.lower().str.contains(termo_fila, na=False)
                        )
                        fila_filtrada = fila_filtrada[mask_fila]

                    st.metric("Itens filtrados da fila", len(fila_filtrada))

                    fila_visual = fila_filtrada.drop(
                        columns=["Tipo Alerta", "Vencimento ID", "Perfil ID"],
                        errors="ignore",
                    )
                    tabela(fila_visual.head(80), altura=340)

                    if perfil_usuario_fila in ("ADMINISTRADOR", "GERENTE"):
                        render_atribuir_responsavel_alerta_dashboard(fila_filtrada)
                    else:
                        st.info("Você está visualizando apenas os alertas atribuídos ao seu usuário.")

            st.divider()

            st.markdown("### 👤 Fila por responsável")

            try:
                fila_resp_df = sql_df("""
                    SELECT
                        responsavel_visual AS "Responsável",
                        status_tratamento_visual AS "Tratamento",
                        nivel_alerta_visual AS "Nível",
                        total_alertas AS "Total alertas",
                        total_alto_critico AS "Alto/Crítico",
                        total_abertos AS "Abertos",
                        total_em_analise AS "Em análise",
                        total_aguardando_cliente AS "Aguardando cliente",
                        proxima_validade AS "Próxima validade"
                    FROM vw_app_fila_alertas_responsaveis
                    ORDER BY
                        CASE WHEN responsavel_chave = 'SEM_RESPONSAVEL' THEN 1 ELSE 2 END,
                        ordem_tratamento,
                        ordem_nivel,
                        responsavel_visual;
                """)
            except Exception as erro:
                fila_resp_df = pd.DataFrame()
                st.error("Não foi possível carregar a fila por responsável.")
                st.exception(erro)

            if fila_resp_df.empty:
                st.success("Nenhum alerta operacional por responsável no momento.")
            else:
                total_sem_resp = int((fila_resp_df["Responsável"].astype(str) == "Sem responsável").sum())
                total_responsaveis = int((fila_resp_df["Responsável"].astype(str) != "Sem responsável").sum())
                soma_alertas = int(fila_resp_df["Total alertas"].sum())
                soma_alto_critico = int(fila_resp_df["Alto/Crítico"].sum())
                soma_aguardando = int(fila_resp_df["Aguardando cliente"].sum())

                fr1, fr2, fr3, fr4, fr5 = st.columns(5)
                fr1.metric("Total alertas", soma_alertas)
                fr2.metric("Sem responsável", total_sem_resp)
                fr3.metric("Responsáveis ativos", total_responsaveis)
                fr4.metric("Alto/Crítico", soma_alto_critico)
                fr5.metric("Aguardando cliente", soma_aguardando)

                with st.expander("Ver fila por responsável", expanded=False):
                    r1, r2, r3 = st.columns([1.2, 1, 2])

                    with r1:
                        responsaveis = ["Todos"] + sorted(fila_resp_df["Responsável"].dropna().astype(str).unique().tolist())
                        filtro_resp = st.selectbox(
                            "Responsável",
                            responsaveis,
                            key="dashboard_fila_responsavel_filtro_responsavel",
                        )

                    with r2:
                        tratamentos_resp = ["Todos"] + sorted(fila_resp_df["Tratamento"].dropna().astype(str).unique().tolist())
                        filtro_tratamento_resp = st.selectbox(
                            "Tratamento",
                            tratamentos_resp,
                            key="dashboard_fila_responsavel_filtro_tratamento",
                        )

                    with r3:
                        busca_resp = st.text_input(
                            "Buscar responsável, tratamento ou nível",
                            key="dashboard_fila_responsavel_busca",
                        )

                    fila_resp_filtrada = fila_resp_df.copy()

                    if filtro_resp != "Todos":
                        fila_resp_filtrada = fila_resp_filtrada[fila_resp_filtrada["Responsável"] == filtro_resp]

                    if filtro_tratamento_resp != "Todos":
                        fila_resp_filtrada = fila_resp_filtrada[fila_resp_filtrada["Tratamento"] == filtro_tratamento_resp]

                    if busca_resp.strip():
                        termo_resp = busca_resp.strip().lower()
                        mask_resp = (
                            fila_resp_filtrada["Responsável"].astype(str).str.lower().str.contains(termo_resp, na=False)
                            | fila_resp_filtrada["Tratamento"].astype(str).str.lower().str.contains(termo_resp, na=False)
                            | fila_resp_filtrada["Nível"].astype(str).str.lower().str.contains(termo_resp, na=False)
                        )
                        fila_resp_filtrada = fila_resp_filtrada[mask_resp]

                    st.metric("Linhas filtradas", len(fila_resp_filtrada))
                    tabela(fila_resp_filtrada, altura=260)

            st.divider()

            with st.expander("🚨 Ver atenção imediata antiga", expanded=False):
                st.markdown("### 🚨 Atenção imediata")

                col_alertas, col_ia, col_venc = st.columns([1.12, 1.12, 1])

                with col_alertas:
                    try:
                        pend_criticas_home = sql_df("""
                            SELECT
                                cliente AS "Cliente",
                                tipo_esperado AS "Tipo",
                                subtipo_documento AS "Subtipo",
                                app_competencia_br(competencia) AS "Competência"
                            FROM vw_app_pendencias
                            ORDER BY
                                CASE
                                    WHEN semaforo ILIKE '%CRIT%' THEN 1
                                    WHEN semaforo ILIKE '%ALTA%' THEN 2
                                    ELSE 9
                                END,
                                competencia,
                                cliente
                            LIMIT 8;
                        """)
                        render_lista_executiva_brandao(
                            "Pendências críticas",
                            "Clientes e obrigações que precisam de ação.",
                            pend_criticas_home,
                            ["Cliente", "Tipo", "Subtipo", "Competência"],
                            vazio="Nenhuma pendência crítica encontrada.",
                            limite=6,
                        )
                    except Exception:
                        try:
                            pend_criticas_home = sql_df("SELECT * FROM vw_app_pendencias LIMIT 6;")
                            render_lista_executiva_brandao(
                                "Pendências críticas",
                                "Resumo alternativo da fila de pendências.",
                                pend_criticas_home,
                                list(pend_criticas_home.columns[:4]),
                                vazio="Nenhuma pendência crítica encontrada.",
                                limite=6,
                            )
                        except Exception:
                            st.info("Resumo de pendências críticas ainda não disponível nesta view.")

                with col_ia:
                    try:
                        ia_home = sql_df("""
                            SELECT
                                razao_social_nome AS "Cliente",
                                tipo_documento_ia AS "Documento",
                                subtipo_documento_ia AS "Subtipo",
                                COALESCE(TO_CHAR(data_validade_detectada, 'DD/MM/YYYY'), 'Sem validade') AS "Validade"
                            FROM vw_app_candidatos_alvaras_certidoes_pendentes
                            ORDER BY ordem_prioridade, data_validade_detectada NULLS FIRST, razao_social_nome
                            LIMIT 8;
                        """)
                        render_lista_executiva_brandao(
                            "Documentos encontrados pela IA",
                            "Alvarás, licenças e certidões aguardando validação.",
                            ia_home,
                            ["Cliente", "Documento", "Subtipo", "Validade"],
                            vazio="Nenhum candidato de IA pendente no momento.",
                            limite=6,
                        )
                    except Exception:
                        st.info("Fila de IA documental ainda não disponível.")

                with col_venc:
                    try:
                        venc_home = sql_df("""
                            SELECT
                                razao_social_nome AS "Cliente",
                                tipo_controle AS "Controle",
                                COALESCE(TO_CHAR(data_validade, 'DD/MM/YYYY'), 'Sem validade') AS "Validade",
                                status_calculado AS "Status"
                            FROM vw_app_vencimentos
                            WHERE data_validade IS NULL
                               OR data_validade <= CURRENT_DATE + INTERVAL '60 days'
                               OR status_calculado IN ('VENCIDO', 'A_VENCER', 'PENDENTE')
                            ORDER BY ordem_status, data_validade NULLS FIRST, razao_social_nome
                            LIMIT 8;
                        """)
                        render_lista_executiva_brandao(
                            "Próximos vencimentos",
                            "Documentos e controles que exigem atenção.",
                            venc_home,
                            ["Cliente", "Controle", "Validade", "Status"],
                            vazio="Sem vencimentos críticos nos próximos 60 dias.",
                            limite=6,
                        )
                    except Exception:
                        st.info("Resumo de vencimentos ainda não disponível.")



        st.markdown("### ⚡ Atalhos rápidos")
        at1, at2, at3, at4 = st.columns(4)

        with at1:
            st.info("👥 **Clientes**\n\nUse a aba Clientes para filtrar por perfil, pendência e qualificação.")
        with at2:
            st.info("🔎 **Cliente**\n\nAbra a ficha completa para editar dados operacionais e revisar pendências.")
        with at3:
            st.info("🤖 **IA Documental**\n\nPróxima etapa: confirmar documentos encontrados pela IA.")
        with at4:
            st.info("📅 **Vencimentos**\n\nCertificados, procurações, alvarás, licenças e certidões.")

        st.divider()

        with st.expander("⚙️ Configuração operacional do painel", expanded=False):
            st.subheader("⚙️ Configuração operacional do painel")

            config_painel = sql_df("""
                SELECT
                    competencia_operacional_atual,
                    app_competencia_br(competencia_operacional_atual) AS competencia_operacional_atual_br
                FROM vw_app_configuracao_painel;
            """)

            competencia_atual_tecnica = "2026-05"
            competencia_atual_visual = "05/2026"

            if not config_painel.empty:
                competencia_atual_tecnica = str(config_painel.iloc[0]["competencia_operacional_atual"])
                competencia_atual_visual = str(config_painel.iloc[0]["competencia_operacional_atual_br"])

            st.metric("Competência operacional atual", competencia_atual_visual)

            with st.form(key="form_competencia_operacional_painel"):
                nova_competencia_visual = st.text_input(
                    "Alterar competência operacional atual",
                    value=competencia_atual_visual,
                    help="Use MM/AAAA. Exemplo: 05/2026. Internamente o sistema salva como AAAA-MM.",
                    key="input_competencia_operacional_visual",
                )

                confirmar_competencia = st.checkbox(
                    "Confirmo que desejo alterar a competência operacional do painel.",
                    key="confirmar_competencia_operacional_painel",
                )

                if not usuario_tem_permissao("configuracoes.editar"):
                    st.info("Seu usuário não tem permissão para alterar a competência operacional do painel.")

                salvar_competencia = st.form_submit_button("Salvar competência operacional", disabled=not usuario_tem_permissao("configuracoes.editar"))

                if salvar_competencia:
                    if not confirmar_competencia:
                        st.error("Marque a confirmação antes de salvar.")
                    else:
                        try:
                            resultado = executar_sql_parametrizado(
                                """
                                SELECT *
                                FROM contabilidade_atualizar_competencia_operacional_painel(%s, %s);
                                """,
                                [
                                    nova_competencia_visual,
                                    "USUARIO_PAINEL",
                                ],
                            )

                            st.cache_data.clear()
                            st.success("Competência operacional atualizada com sucesso.")
                            if resultado:
                                st.write(resultado)
                            st.rerun()

                        except Exception as erro:
                            st.error("Não foi possível atualizar a competência operacional.")
                            st.exception(erro)
        st.divider()

        with st.expander("📊 Ver resumos técnicos do dashboard", expanded=False):
            st.subheader("📌 Resumo por área")

            areas = sql_df("""
                SELECT *
                FROM vw_app_dashboard_resumo_areas
                ORDER BY
                    CASE area
                        WHEN 'FOLHA/RH' THEN 1
                        WHEN 'FISCAL' THEN 2
                        WHEN 'CERTIFICADOS' THEN 3
                        WHEN 'PROCURAÇÕES' THEN 4
                        ELSE 9
                    END;
            """)

            cols = st.columns(4)
            for i, row in areas.iterrows():
                with cols[i % 4]:
                    st.metric(
                        row["area"],
                        int(row["pendencias"]),
                        f'{int(row["criticas"])} críticas | {int(row["altas"])} altas'
                    )

            st.divider()

            st.subheader("📅 Resumo mensal 2026")
            mensal = sql_df("""
                SELECT
                    app_competencia_br(competencia) AS "Competência",
                    total_obrigacoes AS "Total obrigações",
                    encontradas AS "Encontradas",
                    pendentes AS "Pendentes",
                    obrigatorias_pendentes AS "Obrigatórias pendentes",
                    criticas_pendentes AS "Críticas pendentes",
                    altas_pendentes AS "Altas pendentes"
                FROM vw_app_resumo_mensal_2026
                ORDER BY competencia;
            """)
            tabela(mensal, 320)

            st.subheader("📊 Progresso da qualificação operacional")

            resumo_qualificacao = sql_df("""
                SELECT *
                FROM vw_app_resumo_qualificacao_operacional;
            """)

            if not resumo_qualificacao.empty:
                rq = resumo_qualificacao.iloc[0]

                qcol1, qcol2, qcol3, qcol4 = st.columns(4)
                qcol1.metric("Clientes qualificados", int(rq["clientes_qualificados"]))
                qcol2.metric("Pendentes revisão", int(rq["clientes_pendentes_revisao"]))
                qcol3.metric("Com movimento fiscal", int(rq["com_movimento_fiscal"]))
                qcol4.metric("Sem movimento", int(rq["sem_movimento"]))

                qcol5, qcol6, qcol7, qcol8 = st.columns(4)
                qcol5.metric("Com folha/RH", int(rq["precisa_folha"]))
                qcol6.metric("Emite NF-e", int(rq["emite_nfe"]))
                qcol7.metric("Emite NFS-e", int(rq["emite_nfse"]))
                qcol8.metric("Somente acessórias", int(rq["marcados_somente_obrigacoes_acessorias"]))

            st.markdown("#### Qualificação por grupo")
            resumo_grupo = sql_df("""
                SELECT
                    app_grupo_qualificacao_br(grupo_qualificacao) AS "Grupo",
                    app_status_qualificacao_br(status_qualificacao) AS "Status",
                    clientes AS "Clientes"
                FROM vw_app_resumo_qualificacao_por_grupo;
            """)
            tabela(resumo_grupo, 260)

            st.markdown("#### Qualificação por perfil operacional")
            resumo_perfil = sql_df("""
                SELECT
                    app_perfil_operacional_br(perfil_operacional) AS "Perfil operacional",
                    clientes AS "Clientes",
                    qualificados AS "Qualificados",
                    pendentes AS "Pendentes",
                    com_funcionarios AS "Com funcionários",
                    emite_nfe AS "Emite NF-e",
                    emite_nfse AS "Emite NFS-e",
                    somente_acessorias AS "Somente acessórias"
                FROM vw_app_resumo_qualificacao_por_perfil;
            """)
            tabela(resumo_perfil, 360)

            st.divider()

            st.subheader("🚨 Clientes mais críticos")
            top = sql_df("""
                SELECT
                    nivel_risco AS "Risco",
                    razao_social_nome AS "Cliente",
                    tipo_pessoa AS "Tipo",
                    app_perfil_operacional_br(perfil_operacional) AS "Perfil operacional",
                    app_boolean_br(tem_funcionarios) AS "Funcionários",
                    total_pendencias_abertas AS "Pendências abertas",
                    pendencias_obrigatorias AS "Obrigatórias",
                    pendencias_criticas AS "Críticas",
                    pendencias_altas AS "Altas",
                    total_vencimentos_pendentes AS "Vencimentos pendentes"
                FROM vw_app_dashboard_clientes_criticos
                LIMIT 40;
            """)
            tabela(top, 600)



    with aba_ia:
        st.subheader("🤖 IA Documental — fila de validação")
        st.caption("Documentos encontrados pela IA no Google Drive. Nesta primeira etapa, apenas conferimos a fila; na próxima etapa entram os botões de confirmação.")

        try:
            candidatos_ia = sql_df("""
                SELECT
                    auditoria_ia_id,
                    perfil_id,
                    COALESCE(razao_social_nome, cliente_raiz_nome, cliente_detectado_ia, 'Cliente não identificado') AS cliente,
                    COALESCE(cpf_cnpj, cpf_cnpj_detectado_ia, '') AS cpf_cnpj,
                    nome_arquivo,
                    tipo_documento_ia,
                    subtipo_documento_ia,
                    categoria_ia,
                    destino_sugerido,
                    data_emissao_detectada,
                    data_validade_detectada,
                    status_candidato,
                    confianca_tipo_ia,
                    caminho_drive,
                    resumo_documento_ia
                FROM vw_app_candidatos_alvaras_certidoes_pendentes
                ORDER BY
                    ordem_prioridade,
                    data_validade_detectada NULLS FIRST,
                    cliente
            """)
        except Exception as erro:
            candidatos_ia = pd.DataFrame()
            st.error("Não foi possível carregar a fila de candidatos da IA.")
            st.exception(erro)

        if candidatos_ia.empty:
            st.success("Nenhum documento pendente de validação pela IA no momento.")
        else:
            c1, c2, c3, c4 = st.columns(4)
            c1.metric("Candidatos IA", len(candidatos_ia))
            c2.metric("Alvarás/Licenças", int((candidatos_ia["destino_sugerido"] == "ALVARA_LICENCA").sum()))
            c3.metric("Certidões", int((candidatos_ia["destino_sugerido"] == "CERTIDAO_NEGATIVA").sum()))
            c4.metric("Prontos validação", int((candidatos_ia["status_candidato"] == "PRONTO_VALIDACAO").sum()))

            st.divider()

            f1, f2, f3 = st.columns([1, 1, 1.5])

            with f1:
                destinos = ["Todos"] + sorted(candidatos_ia["destino_sugerido"].dropna().unique().tolist())
                filtro_destino = st.selectbox("Destino sugerido", destinos, key="ia_doc_filtro_destino")

            with f2:
                status_lista = ["Todos"] + sorted(candidatos_ia["status_candidato"].dropna().unique().tolist())
                filtro_status = st.selectbox("Status candidato", status_lista, key="ia_doc_filtro_status")

            with f3:
                busca_ia = st.text_input("Buscar cliente, arquivo, tipo ou CNPJ", key="ia_doc_busca")

            filtrado = candidatos_ia.copy()

            if filtro_destino != "Todos":
                filtrado = filtrado[filtrado["destino_sugerido"] == filtro_destino]

            if filtro_status != "Todos":
                filtrado = filtrado[filtrado["status_candidato"] == filtro_status]

            if busca_ia.strip():
                termo = busca_ia.strip().lower()
                mask = (
                    filtrado["cliente"].astype(str).str.lower().str.contains(termo, na=False)
                    | filtrado["cpf_cnpj"].astype(str).str.lower().str.contains(termo, na=False)
                    | filtrado["nome_arquivo"].astype(str).str.lower().str.contains(termo, na=False)
                    | filtrado["tipo_documento_ia"].astype(str).str.lower().str.contains(termo, na=False)
                    | filtrado["subtipo_documento_ia"].astype(str).str.lower().str.contains(termo, na=False)
                )
                filtrado = filtrado[mask]

            st.metric("Itens filtrados", len(filtrado))

            cols_tabela = [
                "auditoria_ia_id",
                "cliente",
                "cpf_cnpj",
                "nome_arquivo",
                "tipo_documento_ia",
                "subtipo_documento_ia",
                "destino_sugerido",
                "data_emissao_detectada",
                "data_validade_detectada",
                "status_candidato",
                "confianca_tipo_ia",
            ]

            tabela(filtrado[cols_tabela], altura=420)

            render_decisao_ia_documental(filtrado)

        st.divider()

    with aba2:
        st.subheader("Clientes")
        busca = st.text_input("Buscar cliente")

        clientes = sql_df("""
            SELECT
                razao_social_nome AS "Cliente",
                cpf_cnpj AS "CPF/CNPJ",
                tipo_pessoa AS "Tipo",
                app_perfil_operacional_br(perfil_operacional) AS "Perfil operacional",
                REPLACE(COALESCE(segmento_operacional, 'Não informado'), '_', ' ') AS "Segmento operacional",
                app_boolean_br(tem_funcionarios) AS "Funcionários",
                app_boolean_br(produtor_rural) AS "Produtor rural",
                telefone AS "Telefone",
                email AS "E-mail",
                total_pendencias_abertas AS "Pendências abertas",
                pendencias_obrigatorias AS "Obrigatórias",
                pendencias_criticas AS "Críticas",
                pendencias_altas AS "Altas",
                total_vencimentos_pendentes AS "Vencimentos pendentes"
            FROM vw_app_clientes
            ORDER BY total_pendencias_abertas DESC, razao_social_nome;
        """)

        if busca.strip():
            termo = busca.strip().lower()
            clientes = clientes[
                clientes.astype(str)
                .apply(lambda col: col.str.lower().str.contains(termo, na=False))
                .any(axis=1)
            ]

        st.metric("Clientes filtrados", len(clientes))
        tabela(clientes, 650)


        st.markdown("### 🧭 Roteiro de qualificação por grupo")

        roteiro_qualificacao = sql_df("""
            SELECT
                grupo_qualificacao,
                acao_sugerida,
                COUNT(*) AS total_clientes,
                COUNT(*) FILTER (WHERE tem_funcionarios = TRUE) AS com_funcionarios,
                COUNT(*) FILTER (WHERE precisa_folha = TRUE) AS precisa_folha,
                COUNT(*) FILTER (WHERE tem_movimento_fiscal IS NULL) AS movimento_fiscal_pendente,
                COUNT(*) FILTER (WHERE emite_nfe IS NULL) AS nfe_pendente,
                COUNT(*) FILTER (WHERE emite_nfse IS NULL) AS nfse_pendente,
                MIN(ordem_qualificacao) AS prioridade
            FROM vw_app_fila_qualificacao_clientes
            GROUP BY grupo_qualificacao, acao_sugerida
            ORDER BY prioridade, total_clientes DESC, grupo_qualificacao;
        """)

        if roteiro_qualificacao.empty:
            st.success("Nenhum grupo pendente de qualificação encontrado.")
        else:
            tabela(roteiro_qualificacao, 300)

            grupos_roteiro = roteiro_qualificacao["grupo_qualificacao"].dropna().astype(str).tolist()

            grupo_roteiro_escolhido = st.selectbox(
                "Escolha um grupo para revisar",
                grupos_roteiro,
                format_func=lambda x: humanizar_codigo_visual(x),
                key="grupo_roteiro_qualificacao_select",
            )

            clientes_grupo_roteiro = sql_df(f"""
                SELECT
                    perfil_id,
                    razao_social_nome,
                    cpf_cnpj,
                    tipo_pessoa,
                    perfil_operacional,
                    segmento_operacional,
                    situacao_fiscal,
                    status_qualificacao,
                    tem_funcionarios,
                    precisa_folha,
                    tem_movimento_fiscal,
                    emite_nfe,
                    emite_nfse,
                    precisa_apuracao_fiscal,
                    somente_obrigacoes_acessorias,
                    grupo_qualificacao,
                    acao_sugerida
                FROM vw_app_fila_qualificacao_clientes
                WHERE grupo_qualificacao = '{grupo_roteiro_escolhido.replace("'", "''")}'
                ORDER BY ordem_qualificacao, razao_social_nome
                LIMIT 300;
            """)

            st.markdown("#### Clientes do grupo selecionado")
            st.info(
                "Use esta lista para revisar cliente por cliente. A alteração continua sendo feita na aba 🔎 Cliente, "
                "preservando histórico e evitando mudança em massa sem conferência."
            )

            tabela(clientes_grupo_roteiro, 480)

            if not clientes_grupo_roteiro.empty:
                clientes_grupo_atalho = clientes_grupo_roteiro.copy()
                clientes_grupo_atalho["_perfil_visual"] = clientes_grupo_atalho["perfil_operacional"].map(humanizar_codigo_visual)
                clientes_grupo_atalho["_status_visual"] = clientes_grupo_atalho["status_qualificacao"].map(humanizar_codigo_visual)

                clientes_grupo_atalho["atalho_rotulo"] = (
                    clientes_grupo_atalho["perfil_id"].astype(str)
                    + " | "
                    + clientes_grupo_atalho["razao_social_nome"].astype(str)
                    + " | "
                    + clientes_grupo_atalho["cpf_cnpj"].astype(str)
                    + " | "
                    + clientes_grupo_atalho["_perfil_visual"].astype(str)
                    + " | "
                    + clientes_grupo_atalho["_status_visual"].astype(str)
                )

                cliente_grupo_atalho = st.selectbox(
                    "Selecionar cliente deste grupo para abrir na aba 🔎 Cliente",
                    clientes_grupo_atalho["atalho_rotulo"].tolist(),
                    key="atalho_cliente_grupo_qualificacao_select",
                )

                if st.button("Preparar cliente do grupo para edição", key="btn_preparar_cliente_grupo_qualificacao"):
                    cliente_grupo_linha = clientes_grupo_atalho[
                        clientes_grupo_atalho["atalho_rotulo"] == cliente_grupo_atalho
                    ].iloc[0]

                    st.session_state["perfil_id_preselecionado"] = int(cliente_grupo_linha["perfil_id"])
                    st.session_state["cliente_preselecionado_nome"] = str(cliente_grupo_linha["razao_social_nome"])
                    st.session_state["abrir_cliente_automatico"] = True
                    st.rerun()

                    st.success(
                        "Cliente preparado para edição. Agora clique na aba 🔎 Cliente: ele já estará selecionado."
                    )
                    st.rerun()

        st.divider()

        st.divider()

        st.subheader("🧭 Fila de qualificação operacional")

        st.markdown("### 📊 Resumo da qualificação operacional")

        resumo_qualificacao_geral = sql_df("""
            SELECT
                COUNT(*) AS total_clientes,
                COUNT(*) FILTER (WHERE status_qualificacao = 'QUALIFICADO_MANUALMENTE') AS qualificados,
                COUNT(*) FILTER (WHERE status_qualificacao <> 'QUALIFICADO_MANUALMENTE' OR status_qualificacao IS NULL) AS pendentes,
                COUNT(*) FILTER (WHERE tem_movimento_fiscal IS NULL) AS pendente_movimento_fiscal,
                COUNT(*) FILTER (WHERE emite_nfe IS NULL) AS pendente_nfe,
                COUNT(*) FILTER (WHERE emite_nfse IS NULL) AS pendente_nfse,
                COUNT(*) FILTER (WHERE tem_funcionarios = TRUE) AS com_funcionarios,
                COUNT(*) FILTER (WHERE tem_funcionarios = FALSE) AS sem_funcionarios,
                COUNT(*) FILTER (WHERE precisa_folha = TRUE) AS precisa_folha,
                COUNT(*) FILTER (WHERE precisa_folha = FALSE) AS nao_precisa_folha
            FROM contabilidade_cliente_configuracao_operacional;
        """)

        if not resumo_qualificacao_geral.empty:
            rq = resumo_qualificacao_geral.iloc[0]

            q1, q2, q3, q4, q5 = st.columns(5)
            q1.metric("Clientes", int(rq["total_clientes"]))
            q2.metric("Qualificados", int(rq["qualificados"]))
            q3.metric("Pendentes", int(rq["pendentes"]))
            q4.metric("Mov. fiscal pendente", int(rq["pendente_movimento_fiscal"]))
            q5.metric("NF-e/NFS-e pendente", int(rq["pendente_nfe"]) + int(rq["pendente_nfse"]))

            q6, q7, q8, q9 = st.columns(4)
            q6.metric("Com funcionários", int(rq["com_funcionarios"]))
            q7.metric("Sem funcionários", int(rq["sem_funcionarios"]))
            q8.metric("Precisa folha", int(rq["precisa_folha"]))
            q9.metric("Não precisa folha", int(rq["nao_precisa_folha"]))

        resumo_grupo_qualificacao = sql_df("""
            SELECT
                grupo_qualificacao,
                acao_sugerida,
                COUNT(*) AS total
            FROM vw_app_fila_qualificacao_clientes
            GROUP BY grupo_qualificacao, acao_sugerida
            ORDER BY total DESC, grupo_qualificacao;
        """)

        if not resumo_grupo_qualificacao.empty:
            st.markdown("#### Resumo por grupo de qualificação")
            tabela(resumo_grupo_qualificacao, 260)

        resumo_perfil_qualificacao = sql_df("""
            SELECT
                tipo_pessoa,
                perfil_operacional,
                segmento_operacional,
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status_qualificacao = 'QUALIFICADO_MANUALMENTE') AS qualificados,
                COUNT(*) FILTER (WHERE status_qualificacao <> 'QUALIFICADO_MANUALMENTE' OR status_qualificacao IS NULL) AS pendentes,
                COUNT(*) FILTER (WHERE tem_movimento_fiscal IS NULL) AS pendente_movimento_fiscal,
                COUNT(*) FILTER (WHERE emite_nfe IS NULL) AS pendente_nfe,
                COUNT(*) FILTER (WHERE emite_nfse IS NULL) AS pendente_nfse,
                COUNT(*) FILTER (WHERE tem_funcionarios IS NULL) AS pendente_funcionarios,
                COUNT(*) FILTER (WHERE precisa_folha IS NULL) AS pendente_folha
            FROM contabilidade_cliente_configuracao_operacional
            GROUP BY tipo_pessoa, perfil_operacional, segmento_operacional
            ORDER BY tipo_pessoa, perfil_operacional, segmento_operacional;
        """)

        if not resumo_perfil_qualificacao.empty:
            st.markdown("#### Pendências por perfil operacional")
            tabela(resumo_perfil_qualificacao, 360)

        st.divider()

        st.caption("Lista simples para identificar quais clientes ainda precisam ter a ficha operacional revisada.")

        fila_qualificacao = sql_df("""
            SELECT
                perfil_id,
                razao_social_nome,
                cpf_cnpj,
                tipo_pessoa,
                perfil_operacional,
                app_perfil_operacional_br(perfil_operacional) AS perfil_operacional_visual,
                segmento_operacional,
                grupo_qualificacao,
                app_grupo_qualificacao_br(grupo_qualificacao) AS grupo_qualificacao_visual,
                status_qualificacao,
                app_status_qualificacao_br(status_qualificacao) AS status_qualificacao_visual,
                situacao_fiscal,
                REPLACE(COALESCE(situacao_fiscal, 'Não informado'), '_', ' ') AS situacao_fiscal_visual,
                tem_funcionarios,
                app_boolean_br(tem_funcionarios) AS tem_funcionarios_visual,
                tem_movimento_fiscal,
                app_boolean_br(tem_movimento_fiscal) AS tem_movimento_fiscal_visual,
                emite_nfe,
                app_boolean_br(emite_nfe) AS emite_nfe_visual,
                emite_nfse,
                app_boolean_br(emite_nfse) AS emite_nfse_visual,
                precisa_apuracao_fiscal,
                app_boolean_br(precisa_apuracao_fiscal) AS precisa_apuracao_fiscal_visual,
                somente_obrigacoes_acessorias,
                app_boolean_br(somente_obrigacoes_acessorias) AS somente_obrigacoes_acessorias_visual,
                acao_sugerida
            FROM vw_app_fila_qualificacao_clientes
            ORDER BY ordem_qualificacao, razao_social_nome
            LIMIT 300;
        """)

        st.markdown("#### Filtros da qualificação operacional")

        col_fg1, col_fg2, col_fg3, col_fg4 = st.columns(4)

        mapa_grupos_qualificacao = dict(
            zip(
                fila_qualificacao["grupo_qualificacao_visual"].astype(str),
                fila_qualificacao["grupo_qualificacao"].astype(str),
            )
        )

        grupos_qualificacao_visual = ["Todos"] + sorted(
            fila_qualificacao["grupo_qualificacao_visual"].dropna().astype(str).unique().tolist()
        )

        filtro_grupo_qualificacao_visual = col_fg1.selectbox(
            "Grupo de qualificação",
            grupos_qualificacao_visual,
            key="filtro_grupo_qualificacao_simples",
        )

        filtro_grupo_qualificacao = (
            "TODOS"
            if filtro_grupo_qualificacao_visual == "Todos"
            else mapa_grupos_qualificacao.get(filtro_grupo_qualificacao_visual, "TODOS")
        )

        mapa_status_qualificacao = dict(
            zip(
                fila_qualificacao["status_qualificacao_visual"].astype(str),
                fila_qualificacao["status_qualificacao"].astype(str),
            )
        )

        status_qualificacao_lista_visual = ["Todos"] + sorted(
            fila_qualificacao["status_qualificacao_visual"].dropna().astype(str).unique().tolist()
        )

        filtro_status_qualificacao_visual = col_fg2.selectbox(
            "Status da qualificação",
            status_qualificacao_lista_visual,
            key="filtro_status_qualificacao_simples",
        )

        filtro_status_qualificacao = (
            "TODOS"
            if filtro_status_qualificacao_visual == "Todos"
            else mapa_status_qualificacao.get(filtro_status_qualificacao_visual, "TODOS")
        )

        mapa_perfis_operacionais = dict(
            zip(
                fila_qualificacao["perfil_operacional_visual"].astype(str),
                fila_qualificacao["perfil_operacional"].astype(str),
            )
        )

        perfis_operacionais_lista_visual = ["Todos"] + sorted(
            fila_qualificacao["perfil_operacional_visual"].dropna().astype(str).unique().tolist()
        )

        filtro_perfil_operacional_visual = col_fg3.selectbox(
            "Perfil operacional",
            perfis_operacionais_lista_visual,
            key="filtro_perfil_operacional_qualificacao_simples",
        )

        filtro_perfil_operacional = (
            "TODOS"
            if filtro_perfil_operacional_visual == "Todos"
            else mapa_perfis_operacionais.get(filtro_perfil_operacional_visual, "TODOS")
        )

        busca_qualificacao_cliente = col_fg4.text_input(
            "Buscar cliente/CNPJ",
            value="",
            key="busca_cliente_cnpj_qualificacao_simples",
        )

        fila_qualificacao_filtrada = fila_qualificacao.copy()

        if filtro_grupo_qualificacao != "TODOS":
            fila_qualificacao_filtrada = fila_qualificacao_filtrada[
                fila_qualificacao_filtrada["grupo_qualificacao"].astype(str) == filtro_grupo_qualificacao
            ]

        if filtro_status_qualificacao != "TODOS":
            fila_qualificacao_filtrada = fila_qualificacao_filtrada[
                fila_qualificacao_filtrada["status_qualificacao"].astype(str) == filtro_status_qualificacao
            ]

        if filtro_perfil_operacional != "TODOS":
            fila_qualificacao_filtrada = fila_qualificacao_filtrada[
                fila_qualificacao_filtrada["perfil_operacional"].astype(str) == filtro_perfil_operacional
            ]

        if busca_qualificacao_cliente.strip():
            termo = busca_qualificacao_cliente.strip().lower()
            fila_qualificacao_filtrada = fila_qualificacao_filtrada[
                fila_qualificacao_filtrada["razao_social_nome"].astype(str).str.lower().str.contains(termo, na=False)
                | fila_qualificacao_filtrada["cpf_cnpj"].astype(str).str.lower().str.contains(termo, na=False)
            ]

        col_q1, col_q2, col_q3 = st.columns(3)
        col_q1.metric("Clientes filtrados", len(fila_qualificacao_filtrada))
        col_q2.metric(
            "Pendentes",
            int((fila_qualificacao_filtrada["status_qualificacao"] == "PENDENTE_REVISAO").sum())
        )
        col_q3.metric(
            "Qualificados",
            int((fila_qualificacao_filtrada["status_qualificacao"] == "QUALIFICADO_MANUALMENTE").sum())
        )

        fila_qualificacao_visual = fila_qualificacao_filtrada.copy()

        colunas_fila_visual = {
            "razao_social_nome": "Cliente",
            "cpf_cnpj": "CPF/CNPJ",
            "tipo_pessoa": "Tipo",
            "perfil_operacional_visual": "Perfil operacional",
            "grupo_qualificacao_visual": "Grupo de qualificação",
            "status_qualificacao_visual": "Status",
            "situacao_fiscal_visual": "Situação fiscal",
            "tem_funcionarios_visual": "Funcionários",
            "tem_movimento_fiscal_visual": "Movimento fiscal",
            "emite_nfe_visual": "Emite NF-e",
            "emite_nfse_visual": "Emite NFS-e",
            "precisa_apuracao_fiscal_visual": "Precisa apuração",
            "somente_obrigacoes_acessorias_visual": "Somente acessórias",
            "acao_sugerida": "Ação sugerida",
        }

        colunas_existentes = [
            coluna for coluna in colunas_fila_visual.keys()
            if coluna in fila_qualificacao_visual.columns
        ]

        tabela(
            fila_qualificacao_visual[colunas_existentes].rename(columns=colunas_fila_visual),
            520
        )

        st.markdown("#### Atalho para correção do cliente")

        if fila_qualificacao_filtrada.empty:
            st.info("Nenhum cliente disponível no filtro atual para preparar edição.")
        else:
            fila_atalho = fila_qualificacao_filtrada.copy()
            fila_atalho["atalho_rotulo"] = (
                fila_atalho["perfil_id"].astype(str)
                + " | "
                + fila_atalho["razao_social_nome"].astype(str)
                + " | "
                + fila_atalho["cpf_cnpj"].astype(str)
            )

            cliente_atalho = st.selectbox(
                "Selecionar cliente filtrado para abrir na aba 🔎 Cliente",
                fila_atalho["atalho_rotulo"].tolist(),
                key="atalho_cliente_qualificacao_select",
            )

            if st.button("Preparar cliente para edição", key="btn_preparar_cliente_qualificacao"):
                cliente_atalho_linha = fila_atalho[fila_atalho["atalho_rotulo"] == cliente_atalho].iloc[0]
                st.session_state["perfil_id_preselecionado"] = int(cliente_atalho_linha["perfil_id"])
                st.session_state["cliente_preselecionado_nome"] = str(cliente_atalho_linha["razao_social_nome"])
                st.session_state["abrir_cliente_automatico"] = True
                st.rerun()

                st.success(
                    "Cliente preparado para edição. Agora clique na aba 🔎 Cliente: ele já estará selecionado."
                )

    with aba_cliente:
        if st.session_state.get("abrir_cliente_automatico", False):
            st.info("Cliente aberto automaticamente pelo atalho. Você pode editar normalmente nesta aba.")
            if st.button("Voltar ao layout normal das abas", key="btn_voltar_layout_normal_abas"):
                st.session_state["abrir_cliente_automatico"] = False
                st.rerun()

        st.subheader("🔎 Detalhe do cliente")

        lista_clientes = sql_df("""
            SELECT
                perfil_id,
                razao_social_nome,
                cpf_cnpj,
                tipo_pessoa,
                perfil_operacional,
                app_perfil_operacional_br(perfil_operacional) AS perfil_operacional_visual,
                total_pendencias_abertas,
                pendencias_criticas,
                total_vencimentos_pendentes
            FROM vw_app_clientes
            ORDER BY razao_social_nome;
        """)

        lista_clientes["rotulo"] = (
            lista_clientes["razao_social_nome"].astype(str)
            + " | "
            + lista_clientes["cpf_cnpj"].astype(str)
            + " | "
            + lista_clientes["perfil_operacional_visual"].astype(str)
        )

        rotulos_clientes = lista_clientes["rotulo"].tolist()
        indice_cliente_padrao = 0

        perfil_preselecionado = st.session_state.get("perfil_id_preselecionado")

        if perfil_preselecionado is not None:
            cliente_pre = lista_clientes[lista_clientes["perfil_id"] == perfil_preselecionado]

            if not cliente_pre.empty:
                rotulo_pre = cliente_pre.iloc[0]["rotulo"]
                if rotulo_pre in rotulos_clientes:
                    indice_cliente_padrao = rotulos_clientes.index(rotulo_pre)

                st.info(
                    "Cliente preparado para edição: "
                    + str(st.session_state.get("cliente_preselecionado_nome", ""))
                )

        if perfil_preselecionado is not None:
            cliente_pre = lista_clientes[lista_clientes["perfil_id"] == perfil_preselecionado]

            if not cliente_pre.empty:
                rotulo_pre = cliente_pre.iloc[0]["rotulo"]

                if rotulo_pre in rotulos_clientes:
                    st.session_state["select_cliente_detalhe"] = rotulo_pre

        escolhido = st.selectbox(
            "Escolha o cliente",
            rotulos_clientes,
            index=indice_cliente_padrao,
            key="select_cliente_detalhe",
        )
        cliente_linha = lista_clientes[lista_clientes["rotulo"] == escolhido].iloc[0]
        perfil_id = int(cliente_linha["perfil_id"])

        cadastro = sql_df(f"""
            SELECT
                razao_social_nome,
                cpf_cnpj,
                tipo_pessoa,
                perfil_operacional,
                segmento_operacional,
                tem_funcionarios,
                produtor_rural,
                telefone,
                email,
                total_pendencias_abertas,
                pendencias_obrigatorias,
                pendencias_criticas,
                pendencias_altas,
                total_vencimentos_pendentes
            FROM vw_app_clientes
            WHERE perfil_id = {perfil_id};
        """).iloc[0]

        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Pendências abertas", int(cadastro["total_pendencias_abertas"]))
        c2.metric("Críticas", int(cadastro["pendencias_criticas"]))
        c3.metric("Altas", int(cadastro["pendencias_altas"]))
        c4.metric("Vencimentos pendentes", int(cadastro["total_vencimentos_pendentes"]))

        st.markdown("### 🚨 Alertas deste cliente")

        try:
            alertas_cliente_df = sql_df(f"""
                SELECT
                    tipo_alerta AS "Tipo Alerta",
                    vencimento_id AS "Vencimento ID",
                    perfil_id AS "Perfil ID",
                    nivel_alerta AS "Nível",
                    origem AS "Origem",
                    tipo_controle AS "Tipo",
                    data_validade AS "Validade",
                    dias_para_vencer AS "Dias",
                    status_calculado AS "Status",
                    status_tratamento AS "Tratamento",
                    responsavel_email AS "Responsável",
                    observacao_tratamento AS "Obs tratamento",
                    mensagem_alerta AS "Mensagem",
                    nome_arquivo AS "Arquivo",
                    caminho_drive AS "Caminho Drive"
                FROM vw_app_alertas_vencimentos_tratamento
                WHERE perfil_id = {perfil_id}
                ORDER BY ordem_alerta, data_validade NULLS FIRST, tipo_controle;
            """)
        except Exception as erro:
            alertas_cliente_df = pd.DataFrame()
            st.error("Não foi possível carregar os alertas deste cliente.")
            st.exception(erro)

        if alertas_cliente_df.empty:
            st.success("Este cliente não possui alertas de vencimento no momento.")
        else:
            nivel_cliente = alertas_cliente_df["Nível"].astype(str).str.upper()

            ac1, ac2, ac3, ac4, ac5 = st.columns(5)
            ac1.metric("Críticos", int((nivel_cliente == "CRITICO").sum()))
            ac2.metric("Altos", int((nivel_cliente == "ALTO").sum()))
            ac3.metric("Médios", int((nivel_cliente == "MEDIO").sum()))
            ac4.metric("Baixos", int((nivel_cliente == "BAIXO").sum()))
            ac5.metric("A verificar", int((nivel_cliente == "VERIFICAR").sum()))

            with st.expander("Ver alertas do cliente", expanded=True):
                filtro_alerta_cliente_col1, filtro_alerta_cliente_col2 = st.columns([1, 2])

                with filtro_alerta_cliente_col1:
                    niveis_cliente = ["Todos"] + sorted(alertas_cliente_df["Nível"].dropna().astype(str).unique().tolist())
                    filtro_nivel_cliente = st.selectbox(
                        "Nível",
                        niveis_cliente,
                        key=f"cliente_filtro_nivel_alerta_{perfil_id}",
                        format_func=lambda x: humanizar_codigo_visual(x),
                    )

                with filtro_alerta_cliente_col2:
                    busca_alerta_cliente = st.text_input(
                        "Buscar tipo, mensagem, arquivo ou caminho",
                        key=f"cliente_busca_alerta_{perfil_id}",
                    )

                alertas_cliente_filtrado = alertas_cliente_df.copy()

                if filtro_nivel_cliente != "Todos":
                    alertas_cliente_filtrado = alertas_cliente_filtrado[
                        alertas_cliente_filtrado["Nível"] == filtro_nivel_cliente
                    ]

                if busca_alerta_cliente.strip():
                    termo_alerta_cliente = busca_alerta_cliente.strip().lower()
                    mask_alerta_cliente = (
                        alertas_cliente_filtrado["Tipo"].astype(str).str.lower().str.contains(termo_alerta_cliente, na=False)
                        | alertas_cliente_filtrado["Mensagem"].astype(str).str.lower().str.contains(termo_alerta_cliente, na=False)
                        | alertas_cliente_filtrado["Arquivo"].astype(str).str.lower().str.contains(termo_alerta_cliente, na=False)
                        | alertas_cliente_filtrado["Caminho Drive"].astype(str).str.lower().str.contains(termo_alerta_cliente, na=False)
                    )
                    alertas_cliente_filtrado = alertas_cliente_filtrado[mask_alerta_cliente]

                alertas_cliente_visual = alertas_cliente_filtrado.drop(
                    columns=["Tipo Alerta", "Vencimento ID", "Perfil ID"],
                    errors="ignore",
                )
                tabela(alertas_cliente_visual, altura=260)

                render_tratamento_alerta_cliente(alertas_cliente_filtrado, perfil_id)

        st.divider()

        st.markdown("### Situação operacional")
        situacao_df = sql_df(f"""
            SELECT
                app_situacao_operacional_br(situacao_operacional) AS "Situação",
                app_competencia_br(competencia_inicio) AS "Desde",
                CASE
                    WHEN competencia_fim IS NULL OR competencia_fim = '' THEN 'Em aberto'
                    ELSE app_competencia_br(competencia_fim)
                END AS "Até",
                motivo AS "Motivo",
                observacao AS "Observação"
            FROM vw_app_cliente_situacao_atual
            WHERE perfil_id = {perfil_id};
        """)

        if not situacao_df.empty:
            situacao_linha = situacao_df.iloc[0]
            s1, s2, s3 = st.columns(3)
            s1.metric("Situação", str(situacao_linha["Situação"]))
            s2.metric("Desde", str(situacao_linha["Desde"]))
            s3.metric("Até", str(situacao_linha["Até"]))

        tabela(situacao_df, 140)

        st.markdown("### Histórico de situação operacional")
        historico_situacao_df = sql_df(f"""
            SELECT
                app_situacao_operacional_br(situacao_operacional) AS "Situação",
                app_competencia_br(competencia_inicio) AS "Desde",
                CASE
                    WHEN competencia_fim IS NULL OR competencia_fim = '' THEN 'Em aberto'
                    ELSE app_competencia_br(competencia_fim)
                END AS "Até",
                TO_CHAR(data_inicio, 'DD/MM/YYYY') AS "Data início",
                CASE
                    WHEN data_fim IS NULL THEN ''
                    ELSE TO_CHAR(data_fim, 'DD/MM/YYYY')
                END AS "Data fim",
                motivo AS "Motivo",
                observacao AS "Observação",
                TO_CHAR(criado_em AT TIME ZONE 'America/Campo_Grande', 'DD/MM/YYYY HH24:MI') AS "Criado em"
            FROM vw_app_cliente_situacao_historico
            WHERE perfil_id = {perfil_id}
            ORDER BY data_inicio DESC, id DESC;
        """)
        tabela(historico_situacao_df, 220)

        st.markdown("### Alterar situação operacional")
        st.warning("Esta ação grava histórico operacional do cliente. Não exclui cliente e não mexe no Google Drive.")

        with st.form(key=f"form_situacao_{perfil_id}"):
            col_sit1, col_sit2 = st.columns(2)

            situacoes_operacionais_opcoes = ["SEM_MOVIMENTO", "INATIVO", "SUSPENSO", "BAIXADO", "ATIVO"]
            situacoes_operacionais_mapa = {
                "SEM_MOVIMENTO": "Sem movimento",
                "INATIVO": "Inativo",
                "SUSPENSO": "Suspenso",
                "BAIXADO": "Baixado",
                "ATIVO": "Ativo",
            }

            nova_situacao = col_sit1.selectbox(
                "Nova situação",
                situacoes_operacionais_opcoes,
                format_func=lambda x: situacoes_operacionais_mapa.get(x, humanizar_codigo_visual(x)),
                key=f"nova_situacao_{perfil_id}",
            )

            competencia_inicio = col_sit2.text_input(
                "Competência de início",
                value="05/2026",
                help="Use MM/AAAA. Exemplo: 05/2026.",
                key=f"competencia_inicio_{perfil_id}",
            )

            motivo_situacao = st.text_input(
                "Motivo",
                value="Alteração manual no painel",
                key=f"motivo_situacao_{perfil_id}",
            )

            observacao_situacao = st.text_area(
                "Observação",
                value="",
                key=f"observacao_situacao_{perfil_id}",
            )

            confirmar_situacao = st.checkbox(
                "Confirmo que desejo registrar esta nova situação para este cliente.",
                key=f"confirmar_situacao_{perfil_id}",
            )

            enviar_situacao = st.form_submit_button("Registrar situação operacional")

            if enviar_situacao:
                if not confirmar_situacao:
                    st.error("Marque a confirmação antes de registrar.")
                else:
                    try:
                        resultado = executar_sql_parametrizado(
                            """
                            SELECT *
                            FROM contabilidade_registrar_situacao_cliente(
                                %s, %s, app_normalizar_competencia(%s), %s, %s
                            );
                            """,
                            [
                                perfil_id,
                                nova_situacao,
                                competencia_inicio,
                                motivo_situacao,
                                observacao_situacao,
                            ],
                        )
                        st.cache_data.clear()
                        st.success("Situação operacional registrada com sucesso. Atualize a página ou troque de cliente para ver o histórico atualizado.")
                        if resultado:
                            st.write(resultado)
                    except Exception as erro:
                        st.error("Não foi possível registrar a situação operacional.")
                        st.exception(erro)

        st.markdown("### Cadastro")
        cadastro_df = sql_df(f"""
            SELECT
                razao_social_nome AS "Cliente",
                cpf_cnpj AS "CPF/CNPJ",
                tipo_pessoa AS "Tipo",
                app_perfil_operacional_br(perfil_operacional) AS "Perfil operacional",
                REPLACE(COALESCE(segmento_operacional, 'Não informado'), '_', ' ') AS "Segmento operacional",
                app_boolean_br(tem_funcionarios) AS "Funcionários",
                app_boolean_br(produtor_rural) AS "Produtor rural",
                telefone AS "Telefone",
                email AS "E-mail"
            FROM vw_app_clientes
            WHERE perfil_id = {perfil_id};
        """)
        tabela(cadastro_df, 120)

        st.markdown("### Ficha operacional do cliente")
        ficha_operacional = sql_df(f"""
            SELECT
                REPLACE(COALESCE(regime_tributario, 'Não informado'), '_', ' ') AS "Regime tributário",
                app_perfil_operacional_br(perfil_operacional) AS "Perfil operacional",
                REPLACE(COALESCE(segmento_operacional, 'Não informado'), '_', ' ') AS "Segmento",
                app_situacao_fiscal_br(situacao_fiscal) AS "Situação fiscal",
                app_boolean_br(tem_movimento_fiscal) AS "Movimento fiscal",
                app_boolean_br(emite_nfe) AS "Emite NF-e",
                app_boolean_br(emite_nfse) AS "Emite NFS-e",
                app_boolean_br(precisa_apuracao_fiscal) AS "Precisa apuração",
                app_boolean_br(tem_funcionarios) AS "Funcionários",
                app_boolean_br(precisa_folha) AS "Precisa folha/RH",
                app_boolean_br(somente_obrigacoes_acessorias) AS "Somente acessórias",
                app_boolean_br(cliente_associacao_entidade) AS "Associação/entidade",
                app_boolean_br(cliente_filantropico) AS "Filantrópico",
                app_boolean_br(cliente_prestador_servico) AS "Prestador serviço",
                app_boolean_br(cliente_comercio) AS "Comércio",
                app_boolean_br(cliente_rural_agro) AS "Rural/agro",
                app_competencia_br(competencia_inicio) AS "Competência início",
                CASE
                    WHEN competencia_fim IS NULL OR competencia_fim = '' THEN 'Em aberto'
                    ELSE app_competencia_br(competencia_fim)
                END AS "Competência fim",
                app_status_qualificacao_br(status_qualificacao) AS "Qualificação",
                observacao AS "Observação"
            FROM vw_app_cliente_configuracao_operacional
            WHERE perfil_id = {perfil_id};
        """)

        if ficha_operacional.empty:
            st.warning("Ficha operacional ainda não criada para este cliente.")
        else:
            ficha = ficha_operacional.iloc[0]

            fo1, fo2, fo3, fo4 = st.columns(4)
            fo1.metric("Regime", str(ficha["Regime tributário"]))
            fo2.metric("Situação fiscal", str(ficha["Situação fiscal"]))
            fo3.metric("Funcionários", str(ficha["Funcionários"]))
            fo4.metric("Qualificação", str(ficha["Qualificação"]))

            tabela(ficha_operacional, 260)

            st.markdown("### Editar ficha operacional")
            st.warning("Esta ação atualiza a qualificação operacional do cliente e grava histórico. Ainda não recalcula pendências automaticamente.")

            pode_editar_ficha_operacional = usuario_tem_permissao("ficha_operacional.editar")
            if not pode_editar_ficha_operacional:
                st.info("Seu usuário pode visualizar esta ficha, mas não possui permissão para editar.")

            ficha_raw_df = sql_df(f"""
                SELECT *
                FROM vw_app_cliente_configuracao_operacional
                WHERE perfil_id = {perfil_id};
            """)

            if not ficha_raw_df.empty:
                ficha_raw = ficha_raw_df.iloc[0]

                def bool_label(valor):
                    try:
                        if pd.isna(valor):
                            return "Não informado"
                    except Exception:
                        pass
                    if valor is True or str(valor).lower() == "true":
                        return "Sim"
                    if valor is False or str(valor).lower() == "false":
                        return "Não"
                    return "Não informado"

                def label_bool(rotulo):
                    if rotulo == "Sim":
                        return True
                    if rotulo == "Não":
                        return False
                    return None

                bool_opcoes = ["Não informado", "Sim", "Não"]

                def competencia_visual(valor):
                    if valor is None:
                        return ""
                    texto = str(valor)
                    if texto in ("", "None", "nan", "NaT"):
                        return ""
                    if len(texto) >= 7 and texto[4] == "-":
                        return texto[5:7] + "/" + texto[0:4]
                    return texto

                regimes = [
                    "PENDENTE",
                    "MEI",
                    "SIMPLES_NACIONAL",
                    "LUCRO_PRESUMIDO",
                    "LUCRO_REAL",
                    "IMUNE_ISENTA",
                    "PRODUTOR_RURAL_PF",
                ]

                regimes_mapa = {
                    "PENDENTE": "Pendente",
                    "MEI": "MEI",
                    "SIMPLES_NACIONAL": "Simples Nacional",
                    "LUCRO_PRESUMIDO": "Lucro Presumido",
                    "LUCRO_REAL": "Lucro Real",
                    "IMUNE_ISENTA": "Imune/Isenta",
                    "PRODUTOR_RURAL_PF": "Produtor rural PF",
                }

                situacoes_fiscais = [
                    "PENDENTE_QUALIFICACAO",
                    "TEM_MOVIMENTO",
                    "SEM_MOVIMENTO",
                    "SOMENTE_OBRIGACOES_ACESSORIAS",
                    "NAO_APLICAVEL",
                ]

                situacoes_fiscais_mapa = {
                    "PENDENTE_QUALIFICACAO": "Pendente qualificação",
                    "TEM_MOVIMENTO": "Tem movimento",
                    "SEM_MOVIMENTO": "Sem movimento",
                    "SOMENTE_OBRIGACOES_ACESSORIAS": "Somente obrigações acessórias",
                    "NAO_APLICAVEL": "Não aplicável",
                }

                regime_atual = "" if ficha_raw["regime_tributario"] is None else str(ficha_raw["regime_tributario"])
                if regime_atual not in regimes:
                    regime_atual = "PENDENTE"

                situacao_atual = "" if ficha_raw["situacao_fiscal"] is None else str(ficha_raw["situacao_fiscal"])
                if situacao_atual not in situacoes_fiscais:
                    situacao_atual = "PENDENTE_QUALIFICACAO"

                with st.form(key=f"form_ficha_operacional_{perfil_id}"):
                    e1, e2, e3 = st.columns(3)

                    regime_form = e1.selectbox(
                        "Regime tributário",
                        regimes,
                        index=regimes.index(regime_atual),
                        format_func=lambda x: regimes_mapa.get(x, humanizar_codigo_visual(x)),
                        key=f"regime_operacional_{perfil_id}",
                    )

                    situacao_fiscal_form = e2.selectbox(
                        "Situação fiscal",
                        situacoes_fiscais,
                        index=situacoes_fiscais.index(situacao_atual),
                        format_func=lambda x: situacoes_fiscais_mapa.get(x, humanizar_codigo_visual(x)),
                        key=f"situacao_fiscal_{perfil_id}",
                    )

                    competencia_inicio_form = e3.text_input(
                        "Competência início",
                        value=competencia_visual(ficha_raw["competencia_inicio"]),
                        help="Use MM/AAAA. Exemplo: 01/2026.",
                        key=f"competencia_inicio_operacional_{perfil_id}",
                    )

                    competencia_fim_form = st.text_input(
                        "Competência fim, se houver",
                        value=competencia_visual(ficha_raw["competencia_fim"]),
                        help="Use MM/AAAA ou deixe vazio se o cliente continua ativo nessa qualificação.",
                        key=f"competencia_fim_operacional_{perfil_id}",
                    )

                    b1, b2, b3, b4 = st.columns(4)

                    tem_movimento_form = b1.selectbox(
                        "Tem movimento fiscal?",
                        bool_opcoes,
                        index=bool_opcoes.index(bool_label(ficha_raw["tem_movimento_fiscal"])),
                        key=f"tem_movimento_fiscal_{perfil_id}",
                    )

                    emite_nfe_form = b2.selectbox(
                        "Emite NF-e?",
                        bool_opcoes,
                        index=bool_opcoes.index(bool_label(ficha_raw["emite_nfe"])),
                        key=f"emite_nfe_{perfil_id}",
                    )

                    emite_nfse_form = b3.selectbox(
                        "Emite NFS-e?",
                        bool_opcoes,
                        index=bool_opcoes.index(bool_label(ficha_raw["emite_nfse"])),
                        key=f"emite_nfse_{perfil_id}",
                    )

                    precisa_apuracao_form = b4.selectbox(
                        "Precisa apuração fiscal?",
                        bool_opcoes,
                        index=bool_opcoes.index(bool_label(ficha_raw["precisa_apuracao_fiscal"])),
                        key=f"precisa_apuracao_fiscal_{perfil_id}",
                    )

                    f1, f2, f3 = st.columns(3)

                    tem_funcionarios_form = f1.selectbox(
                        "Tem funcionários?",
                        bool_opcoes,
                        index=bool_opcoes.index(bool_label(ficha_raw["tem_funcionarios"])),
                        key=f"tem_funcionarios_operacional_{perfil_id}",
                    )

                    precisa_folha_form = f2.selectbox(
                        "Precisa folha/RH?",
                        bool_opcoes,
                        index=bool_opcoes.index(bool_label(ficha_raw["precisa_folha"])),
                        key=f"precisa_folha_operacional_{perfil_id}",
                    )

                    somente_acessorias_form = f3.selectbox(
                        "Somente obrigações acessórias?",
                        bool_opcoes,
                        index=bool_opcoes.index(bool_label(ficha_raw["somente_obrigacoes_acessorias"])),
                        key=f"somente_acessorias_{perfil_id}",
                    )

                    p1, p2, p3, p4, p5 = st.columns(5)

                    associacao_form = p1.selectbox(
                        "Associação/entidade?",
                        bool_opcoes,
                        index=bool_opcoes.index(bool_label(ficha_raw["cliente_associacao_entidade"])),
                        key=f"associacao_entidade_{perfil_id}",
                    )

                    filantropico_form = p2.selectbox(
                        "Filantrópico?",
                        bool_opcoes,
                        index=bool_opcoes.index(bool_label(ficha_raw["cliente_filantropico"])),
                        key=f"filantropico_{perfil_id}",
                    )

                    prestador_form = p3.selectbox(
                        "Prestador de serviço?",
                        bool_opcoes,
                        index=bool_opcoes.index(bool_label(ficha_raw["cliente_prestador_servico"])),
                        key=f"prestador_servico_{perfil_id}",
                    )

                    comercio_form = p4.selectbox(
                        "Comércio?",
                        bool_opcoes,
                        index=bool_opcoes.index(bool_label(ficha_raw["cliente_comercio"])),
                        key=f"comercio_{perfil_id}",
                    )

                    rural_form = p5.selectbox(
                        "Rural/agro?",
                        bool_opcoes,
                        index=bool_opcoes.index(bool_label(ficha_raw["cliente_rural_agro"])),
                        key=f"rural_agro_{perfil_id}",
                    )

                    observacao_form = st.text_area(
                        "Observação da qualificação",
                        value="" if ficha_raw["observacao"] is None else str(ficha_raw["observacao"]),
                        key=f"observacao_ficha_operacional_{perfil_id}",
                    )

                    confirmar_ficha = st.checkbox(
                        "Confirmo que desejo atualizar a ficha operacional deste cliente.",
                        key=f"confirmar_ficha_operacional_{perfil_id}",
                    )

                    enviar_ficha = st.form_submit_button("Salvar ficha operacional", disabled=not pode_editar_ficha_operacional)

                    if enviar_ficha:
                        if not confirmar_ficha:
                            st.error("Marque a confirmação antes de salvar.")
                        else:
                            try:
                                resultado = executar_sql_parametrizado(
                                    """
                                    SELECT *
                                    FROM contabilidade_atualizar_configuracao_operacional_cliente(
                                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                                        %s, %s, %s, %s, %s, %s, app_normalizar_competencia(NULLIF(%s, '')),
                                        app_normalizar_competencia(NULLIF(%s, '')), %s
                                    );
                                    """,
                                    [
                                        perfil_id,
                                        regime_form,
                                        situacao_fiscal_form,
                                        label_bool(tem_movimento_form),
                                        label_bool(emite_nfe_form),
                                        label_bool(emite_nfse_form),
                                        label_bool(precisa_apuracao_form),
                                        label_bool(tem_funcionarios_form),
                                        label_bool(precisa_folha_form),
                                        label_bool(somente_acessorias_form),
                                        label_bool(associacao_form),
                                        label_bool(filantropico_form),
                                        label_bool(prestador_form),
                                        label_bool(comercio_form),
                                        label_bool(rural_form),
                                        normalizar_competencia_input_python(competencia_inicio_form),
                                        normalizar_competencia_input_python(competencia_fim_form),
                                        observacao_form,
                                        "USUARIO_PAINEL",
                                    ],
                                )

                                st.cache_data.clear()
                                st.success("Ficha operacional atualizada com sucesso. Atualize a página ou troque de cliente para ver os dados atualizados.")
                                registrar_auditoria_app(
                                    "ATUALIZAR_FICHA_OPERACIONAL",
                                    entidade="contabilidade_cliente_configuracao_operacional",
                                    entidade_id=str(perfil_id),
                                    perfil_id=int(perfil_id),
                                    cliente_nome=str(ficha_raw.get("razao_social_nome", "")),
                                    observacao="Ficha operacional atualizada pelo painel."
                                )

                                if resultado:
                                    st.write(resultado)

                            except Exception as erro:
                                st.error("Não foi possível atualizar a ficha operacional.")
                                st.exception(erro)

        st.markdown("### Captura Fiscal / XML / NF-e")
        captura_df = sql_df(f"""
            SELECT
                controla_xml,
                metodo_captura_xml,
                certificado_xml_status,
                usa_auxilio_nfe,
                gera_danfe_pdf,
                ultima_competencia_baixada,
                ultima_data_download,
                pasta_origem_local,
                pasta_destino_drive,
                status_captura,
                observacao
            FROM vw_app_cliente_captura_fiscal
            WHERE perfil_id = {perfil_id};
        """)

        if not captura_df.empty:
            captura_linha = captura_df.iloc[0]
            cf1, cf2, cf3 = st.columns(3)
            cf1.metric("Controla XML", "Sim" if bool(captura_linha["controla_xml"]) else "Não")

            captura_visual_cards = sql_df(f"""
                SELECT
                    app_metodo_captura_xml_br(metodo_captura_xml) AS metodo,
                    app_status_captura_br(status_captura) AS status
                FROM vw_app_cliente_captura_fiscal
                WHERE perfil_id = {perfil_id};
            """).iloc[0]

            cf2.metric("Método", str(captura_visual_cards["metodo"]))
            cf3.metric("Status", str(captura_visual_cards["status"]))

        captura_visual = sql_df(f"""
            SELECT
                app_boolean_br(controla_xml) AS "Controla XML",
                app_metodo_captura_xml_br(metodo_captura_xml) AS "Método de captura",
                app_status_certificado_xml_br(certificado_xml_status) AS "Status do certificado",
                app_boolean_br(usa_auxilio_nfe) AS "Usa AuxílioNFe",
                app_boolean_br(gera_danfe_pdf) AS "Gera DANFE/PDF",
                app_competencia_br(ultima_competencia_baixada) AS "Última competência baixada",
                CASE
                    WHEN ultima_data_download IS NULL THEN ''
                    ELSE TO_CHAR(ultima_data_download, 'DD/MM/YYYY')
                END AS "Última data download",
                pasta_origem_local AS "Pasta origem local",
                pasta_destino_drive AS "Pasta destino Drive",
                app_status_captura_br(status_captura) AS "Status captura",
                observacao AS "Observação"
            FROM vw_app_cliente_captura_fiscal
            WHERE perfil_id = {perfil_id};
        """)

        tabela(captura_visual, 220)

        st.markdown("### Editar Captura Fiscal / XML")
        st.info("Use este bloco para informar como o XML/NF-e/DANFE deste cliente será controlado. Esta ação grava log e não mexe no Google Drive.")

        if not captura_df.empty:
            cap = captura_df.iloc[0]

            metodos_xml = [
                "PENDENTE_DEFINICAO",
                "AUXILIO_NFE_A1",
                "A3_MANUAL",
                "CLIENTE_ENVIA",
                "SEFAZ_MANUAL",
                "NAO_APLICAVEL",
            ]

            metodos_xml_mapa = {
                "PENDENTE_DEFINICAO": "Pendente definição",
                "AUXILIO_NFE_A1": "AuxílioNFe / A1",
                "A3_MANUAL": "A3 manual",
                "CLIENTE_ENVIA": "Cliente envia",
                "SEFAZ_MANUAL": "SEFAZ manual",
                "NAO_APLICAVEL": "Não aplicável",
            }

            status_certificados_xml = [
                "PENDENTE_VERIFICACAO",
                "A1_DISPONIVEL",
                "A3_TOKEN_CARTAO",
                "NAO_TEMOS",
                "VENCIDO",
                "NAO_APLICAVEL",
            ]

            status_certificados_xml_mapa = {
                "PENDENTE_VERIFICACAO": "Pendente verificação",
                "A1_DISPONIVEL": "A1 disponível",
                "A3_TOKEN_CARTAO": "A3 token/cartão",
                "NAO_TEMOS": "Não temos",
                "VENCIDO": "Vencido",
                "NAO_APLICAVEL": "Não aplicável",
            }

            with st.form(key=f"form_captura_fiscal_{perfil_id}"):
                cf_col1, cf_col2, cf_col3 = st.columns(3)

                controla_xml_form = cf_col1.checkbox(
                    "Controla XML/NF-e",
                    value=bool(cap["controla_xml"]),
                    key=f"controla_xml_{perfil_id}",
                )

                metodo_atual = str(cap["metodo_captura_xml"])
                if metodo_atual not in metodos_xml:
                    metodo_atual = "PENDENTE_DEFINICAO"

                metodo_xml_form = cf_col2.selectbox(
                    "Método de captura",
                    metodos_xml,
                    index=metodos_xml.index(metodo_atual),
                    format_func=lambda x: metodos_xml_mapa.get(x, humanizar_codigo_visual(x)),
                    key=f"metodo_xml_{perfil_id}",
                )

                cert_atual = str(cap["certificado_xml_status"])
                if cert_atual not in status_certificados_xml:
                    cert_atual = "PENDENTE_VERIFICACAO"

                certificado_xml_form = cf_col3.selectbox(
                    "Status do certificado",
                    status_certificados_xml,
                    index=status_certificados_xml.index(cert_atual),
                    format_func=lambda x: status_certificados_xml_mapa.get(x, humanizar_codigo_visual(x)),
                    key=f"certificado_xml_{perfil_id}",
                )

                cf_col4, cf_col5, cf_col6 = st.columns(3)

                usa_auxilio_form = cf_col4.checkbox(
                    "Usa AuxílioNFe",
                    value=bool(cap["usa_auxilio_nfe"]),
                    key=f"usa_auxilio_{perfil_id}",
                )

                gera_danfe_form = cf_col5.checkbox(
                    "Gera DANFE/PDF",
                    value=bool(cap["gera_danfe_pdf"]),
                    key=f"gera_danfe_{perfil_id}",
                )

                ultima_comp_form = cf_col6.text_input(
                    "Última competência baixada",
                    value=competencia_visual(cap["ultima_competencia_baixada"]),
                    help="Use MM/AAAA. Exemplo: 04/2026.",
                    key=f"ultima_comp_xml_{perfil_id}",
                )

                ultima_data_form = st.text_input(
                    "Última data de download",
                    value="" if cap["ultima_data_download"] is None else str(cap["ultima_data_download"]),
                    help="Formato YYYY-MM-DD. Pode deixar vazio.",
                    key=f"ultima_data_xml_{perfil_id}",
                )

                pasta_origem_form = st.text_input(
                    "Pasta origem local",
                    value="" if cap["pasta_origem_local"] is None else str(cap["pasta_origem_local"]),
                    help="Exemplo: C:\\AuxilioNFe\\XML",
                    key=f"pasta_origem_xml_{perfil_id}",
                )

                pasta_destino_form = st.text_input(
                    "Pasta destino no Drive",
                    value="" if cap["pasta_destino_drive"] is None else str(cap["pasta_destino_drive"]),
                    key=f"pasta_destino_xml_{perfil_id}",
                )

                obs_captura_form = st.text_area(
                    "Observação",
                    value="" if cap["observacao"] is None else str(cap["observacao"]),
                    key=f"obs_captura_xml_{perfil_id}",
                )

                confirmar_captura = st.checkbox(
                    "Confirmo que desejo atualizar a Captura Fiscal/XML deste cliente.",
                    key=f"confirmar_captura_xml_{perfil_id}",
                )

                if not usuario_tem_permissao("documentos.classificar"):
                    st.info("Seu usuário não tem permissão para salvar Captura Fiscal/XML.")

                enviar_captura = st.form_submit_button("Salvar Captura Fiscal/XML", disabled=not usuario_tem_permissao("documentos.classificar"))

                if enviar_captura:
                    if not confirmar_captura:
                        st.error("Marque a confirmação antes de salvar.")
                    else:
                        try:
                            resultado = executar_sql_parametrizado(
                                """
                                SELECT *
                                FROM contabilidade_atualizar_captura_fiscal_cliente(
                                    %s,
                                    %s,
                                    %s,
                                    %s,
                                    %s,
                                    %s,
                                    app_normalizar_competencia(NULLIF(%s, '')),
                                    NULLIF(%s, '')::date,
                                    NULLIF(%s, ''),
                                    NULLIF(%s, ''),
                                    NULL,
                                    NULLIF(%s, '')
                                );
                                """,
                                [
                                    perfil_id,
                                    controla_xml_form,
                                    metodo_xml_form,
                                    certificado_xml_form,
                                    usa_auxilio_form,
                                    gera_danfe_form,
                                    ultima_comp_form,
                                    ultima_data_form,
                                    pasta_origem_form,
                                    pasta_destino_form,
                                    obs_captura_form,
                                ],
                            )
                            st.cache_data.clear()
                            st.success("Captura Fiscal/XML atualizada com sucesso. Atualize a página ou troque de cliente para ver os dados atualizados.")
                            if resultado:
                                st.write(resultado)
                        except Exception as erro:
                            st.error("Não foi possível atualizar a Captura Fiscal/XML.")
                            st.exception(erro)

        st.markdown("### AuxílioNFe / XML local")
        aux_resumo = sql_df(f"""
            SELECT
                total_xml_2026,
                total_xml_com_pdf,
                total_xml_sem_pdf,
                primeira_competencia,
                ultima_competencia,
                competencias_com_xml,
                valor_total_xml,
                xmls_como_emitente,
                xmls_como_destinatario
            FROM vw_app_auxilio_nfe_resumo_cliente
            WHERE perfil_id = {perfil_id};
        """)

        if aux_resumo.empty:
            st.info("Nenhum XML local do AuxílioNFe encontrado para este cliente em 2026.")
        else:
            aux = aux_resumo.iloc[0]
            ax1, ax2, ax3, ax4 = st.columns(4)
            ax1.metric("XMLs 2026", int(aux["total_xml_2026"]))
            ax2.metric("Com PDF", int(aux["total_xml_com_pdf"]))
            ax3.metric("Sem PDF", int(aux["total_xml_sem_pdf"]))
            ax4.metric("Última competência", str(aux["ultima_competencia"]))

            tabela(aux_resumo, 160)

            aux_detalhe = sql_df(f"""
                SELECT
                    competencia,
                    data_emissao,
                    numero_nfe,
                    serie_nfe,
                    tipo_match_cliente,
                    nome_emitente,
                    nome_destinatario,
                    natureza_operacao,
                    valor_total,
                    pdf_encontrado,
                    caminho_xml_local,
                    caminho_pdf_local
                FROM vw_app_cliente_auxilio_nfe_detalhe
                WHERE perfil_id = {perfil_id}
                ORDER BY competencia DESC, data_emissao DESC, numero_nfe
                LIMIT 500;
            """)

            st.markdown("#### Notas locais encontradas")
            tabela(aux_detalhe, 420)

        st.markdown("### Fiscal / XML por competência")
        fiscal_xml_comp = sql_df(f"""
            SELECT
                competencia,
                obrigacoes_fiscais,
                obrigacoes_obrigatorias,
                total_xml_local,
                total_xml_com_pdf,
                total_xml_sem_pdf,
                valor_total_xml_local,
                status_xml_local,
                leitura_operacional
            FROM vw_app_cliente_fiscal_xml_competencia
            WHERE perfil_id = {perfil_id}
            ORDER BY competencia;
        """)

        if fiscal_xml_comp.empty:
            st.info("Nenhum resumo fiscal/XML por competência encontrado para este cliente.")
        else:
            fx1, fx2, fx3, fx4 = st.columns(4)
            fx1.metric("Competências fiscais", len(fiscal_xml_comp))
            fx2.metric("XMLs locais", int(fiscal_xml_comp["total_xml_local"].sum()))
            fx3.metric("Com PDF", int(fiscal_xml_comp["total_xml_com_pdf"].sum()))
            fx4.metric("Sem PDF", int(fiscal_xml_comp["total_xml_sem_pdf"].sum()))

            tabela(fiscal_xml_comp, 360)

        st.markdown("### Pendências do cliente")
        pend_cliente = sql_df(f"""
            SELECT
                competencia,
                semaforo,
                tipo_esperado_drive,
                tipo_documento,
                subtipo_documento,
                obrigatorio,
                prioridade,
                pasta_sugerida,
                como_resolver,
                caminho_sugerido_resolucao
            FROM vw_app_cliente_pendencias_detalhe
            WHERE perfil_id = {perfil_id}
            ORDER BY ordem_prioridade, competencia, tipo_esperado_drive;
        """)

        st.metric("Pendências deste cliente", len(pend_cliente))

        pend_cliente_visual = sql_df(f"""
            SELECT
                app_competencia_br(competencia) AS "Competência",
                app_semaforo_br(semaforo) AS "Semáforo",
                REPLACE(COALESCE(tipo_esperado_drive, 'Não informado'), '_', ' ') AS "Tipo esperado no Drive",
                REPLACE(COALESCE(tipo_documento, 'Não informado'), '_', ' ') AS "Tipo documento",
                subtipo_documento AS "Subtipo documento",
                app_boolean_br(obrigatorio) AS "Obrigatório",
                app_prioridade_br(prioridade) AS "Prioridade",
                pasta_sugerida AS "Pasta sugerida",
                como_resolver AS "Como resolver",
                caminho_sugerido_resolucao AS "Caminho sugerido"
            FROM vw_app_cliente_pendencias_detalhe
            WHERE perfil_id = {perfil_id}
            ORDER BY ordem_prioridade, competencia, tipo_esperado_drive;
        """)

        tabela(pend_cliente_visual, 500)

        st.markdown("### Certificados e procurações do cliente")
        venc_cliente = sql_df(f"""
            SELECT
                id,
                origem,
                perfil_id,
                cpf_cnpj_cliente,
                status_calculado,
                tipo_controle,
                sistema_orgao,
                titular_responsavel,
                data_emissao,
                data_validade,
                dias_para_vencer_calculado,
                senha_status,
                observacao
            FROM vw_app_vencimentos
            WHERE perfil_id = {perfil_id}
            ORDER BY ordem_status, origem, tipo_controle;
        """)

        st.metric("Certificados/procurações deste cliente", len(venc_cliente))

        venc_cliente_visual = sql_df(f"""
            SELECT
                app_origem_controle_br(origem) AS "Origem",
                app_status_vencimento_br(status_calculado) AS "Status",
                REPLACE(COALESCE(tipo_controle, 'Não informado'), '_', ' ') AS "Tipo controle",
                sistema_orgao AS "Sistema/órgão",
                titular_responsavel AS "Titular/responsável",
                CASE
                    WHEN data_emissao IS NULL THEN ''
                    ELSE TO_CHAR(data_emissao, 'DD/MM/YYYY')
                END AS "Data emissão",
                CASE
                    WHEN data_validade IS NULL THEN ''
                    ELSE TO_CHAR(data_validade, 'DD/MM/YYYY')
                END AS "Data validade",
                dias_para_vencer_calculado AS "Dias para vencer",
                REPLACE(COALESCE(senha_status, ''), '_', ' ') AS "Status senha",
                observacao AS "Observação"
            FROM vw_app_vencimentos
            WHERE perfil_id = {perfil_id}
            ORDER BY ordem_status, origem, tipo_controle;
        """)

        tabela(venc_cliente_visual, 420)

        st.markdown("### Editar certificado digital do cliente")
        st.warning("Esta ação atualiza validade/status do certificado e grava histórico. Não salva senha pura no banco.")

        def data_input_texto(valor):
            try:
                if pd.isna(valor):
                    return ""
            except Exception:
                pass

            if valor is None:
                return ""

            texto = str(valor)
            if texto in ("NaT", "None", "nan"):
                return ""

            return texto[:10]

        def status_certificado_form(status):
            mapa = {
                "VALIDO": "ATIVO",
                "VALIDA": "ATIVO",
                "VENCIDO": "VENCIDO",
                "VENCIDA": "VENCIDO",
                "VENCENDO": "VENCENDO",
                "PENDENTE_VERIFICACAO": "PENDENTE_VERIFICACAO",
            }
            return mapa.get(str(status), "PENDENTE_VERIFICACAO")

        def status_procuracao_form(status):
            mapa = {
                "VALIDO": "ATIVA",
                "VALIDA": "ATIVA",
                "VENCIDO": "VENCIDA",
                "VENCIDA": "VENCIDA",
                "VENCENDO": "VENCENDO",
                "PENDENTE_VERIFICACAO": "PENDENTE_VERIFICACAO",
            }
            return mapa.get(str(status), "PENDENTE_VERIFICACAO")

        certificados_cliente = venc_cliente[venc_cliente["origem"] == "CERTIFICADO_DIGITAL"].copy()

        if certificados_cliente.empty:
            st.info("Nenhum certificado digital encontrado para este cliente.")
        else:
            mapa_status_vencimento_python = {
                "VALIDO": "Válido",
                "VALIDA": "Válida",
                "VENCIDO": "Vencido",
                "VENCIDA": "Vencida",
                "VENCENDO": "Vencendo",
                "PENDENTE_VERIFICACAO": "Pendente verificação",
                "NAO_POSSUI": "Não possui",
                "DISPENSADO": "Dispensado",
                "DISPENSADA": "Dispensada",
            }

            certificados_cliente["status_visual"] = certificados_cliente["status_calculado"].astype(str).replace(mapa_status_vencimento_python)

            certificados_cliente["rotulo_certificado"] = (
                certificados_cliente["id"].astype(str)
                + " | "
                + certificados_cliente["tipo_controle"].astype(str)
                + " | "
                + certificados_cliente["status_visual"].astype(str)
            )

            cert_escolhido = st.selectbox(
                "Certificado digital",
                certificados_cliente["rotulo_certificado"].tolist(),
                key=f"certificado_edicao_{perfil_id}",
            )

            cert_linha = certificados_cliente[
                certificados_cliente["rotulo_certificado"] == cert_escolhido
            ].iloc[0]

            status_cert_opcoes = [
                "PENDENTE_VERIFICACAO",
                "ATIVO",
                "VENCENDO",
                "VENCIDO",
                "NAO_POSSUI",
                "DISPENSADO",
                "REVOGADO",
                "SUBSTITUIDO",
            ]

            senha_status_opcoes = [
                "NAO_CADASTRADA",
                "CADASTRADA_REFERENCIA",
                "NAO_APLICAVEL",
                "PENDENTE_VERIFICACAO",
            ]

            status_cert_atual = status_certificado_form(cert_linha["status_calculado"])
            if status_cert_atual not in status_cert_opcoes:
                status_cert_atual = "PENDENTE_VERIFICACAO"

            senha_status_atual = str(cert_linha["senha_status"])
            if senha_status_atual not in senha_status_opcoes:
                senha_status_atual = "NAO_CADASTRADA"

            with st.form(key=f"form_editar_certificado_{perfil_id}_{int(cert_linha['id'])}"):
                cc1, cc2, cc3, cc4 = st.columns(4)

                cert_data_emissao = cc1.text_input(
                    "Data emissão certificado",
                    value=data_input_texto(cert_linha["data_emissao"]),
                    help="Use o formato interno AAAA-MM-DD. Exemplo: 2026-01-10.",
                    key=f"cert_data_emissao_{perfil_id}_{int(cert_linha['id'])}",
                )

                cert_data_validade = cc2.text_input(
                    "Data validade certificado",
                    value=data_input_texto(cert_linha["data_validade"]),
                    help="Use o formato interno AAAA-MM-DD. No visual depois ficará DD/MM/AAAA.",
                    key=f"cert_data_validade_{perfil_id}_{int(cert_linha['id'])}",
                )

                cert_status = cc3.selectbox(
                    "Status certificado",
                    status_cert_opcoes,
                    index=status_cert_opcoes.index(status_cert_atual),
                    format_func=lambda x: mapa_status_vencimento_python.get(x, humanizar_codigo_visual(x)),
                    key=f"cert_status_{perfil_id}_{int(cert_linha['id'])}",
                )

                mapa_senha_status = {
                    "NAO_CADASTRADA": "Não cadastrada",
                    "CADASTRADA_REFERENCIA": "Cadastrada por referência",
                    "NAO_APLICAVEL": "Não aplicável",
                    "PENDENTE_VERIFICACAO": "Pendente verificação",
                }

                cert_senha_status = cc4.selectbox(
                    "Status senha",
                    senha_status_opcoes,
                    index=senha_status_opcoes.index(senha_status_atual),
                    format_func=lambda x: mapa_senha_status.get(x, humanizar_codigo_visual(x)),
                    key=f"cert_senha_status_{perfil_id}_{int(cert_linha['id'])}",
                )

                cert_observacao = st.text_area(
                    "Observação certificado",
                    value="" if cert_linha["observacao"] is None else str(cert_linha["observacao"]),
                    key=f"cert_observacao_{perfil_id}_{int(cert_linha['id'])}",
                )

                cert_confirmar = st.checkbox(
                    "Confirmo que desejo atualizar este certificado digital.",
                    key=f"cert_confirmar_{perfil_id}_{int(cert_linha['id'])}",
                )

                if not usuario_tem_permissao("certificados.editar"):
                    st.info("Seu usuário não tem permissão para editar certificados digitais.")

                cert_salvar = st.form_submit_button("Salvar certificado digital", disabled=not usuario_tem_permissao("certificados.editar"))

                if cert_salvar:
                    if not cert_confirmar:
                        st.error("Marque a confirmação antes de salvar.")
                    else:
                        try:
                            resultado = executar_sql_parametrizado(
                                """
                                SELECT *
                                FROM contabilidade_atualizar_certificado_digital(
                                    %s,
                                    NULLIF(%s, '')::DATE,
                                    NULLIF(%s, '')::DATE,
                                    %s,
                                    %s,
                                    %s,
                                    %s
                                );
                                """,
                                [
                                    int(cert_linha["id"]),
                                    cert_data_emissao,
                                    cert_data_validade,
                                    cert_status,
                                    cert_senha_status,
                                    cert_observacao,
                                    "USUARIO_PAINEL",
                                ],
                            )

                            st.cache_data.clear()
                            st.success("Certificado digital atualizado com sucesso.")
                            if resultado:
                                st.write(resultado)
                            st.rerun()

                        except Exception as erro:
                            st.error("Não foi possível atualizar o certificado digital.")
                            st.exception(erro)

        st.markdown("### Editar procuração do cliente")
        st.warning("Esta ação atualiza validade/status da procuração e grava histórico.")

        procuracoes_cliente = venc_cliente[venc_cliente["origem"] == "PROCURACAO"].copy()

        if procuracoes_cliente.empty:
            st.info("Nenhuma procuração encontrada para este cliente.")
        else:
            procuracoes_cliente["status_visual"] = procuracoes_cliente["status_calculado"].astype(str).replace(mapa_status_vencimento_python)

            procuracoes_cliente["rotulo_procuracao"] = (
                procuracoes_cliente["id"].astype(str)
                + " | "
                + procuracoes_cliente["tipo_controle"].astype(str)
                + " | "
                + procuracoes_cliente["status_visual"].astype(str)
            )

            proc_escolhida = st.selectbox(
                "Procuração",
                procuracoes_cliente["rotulo_procuracao"].tolist(),
                key=f"procuracao_edicao_{perfil_id}",
            )

            proc_linha = procuracoes_cliente[
                procuracoes_cliente["rotulo_procuracao"] == proc_escolhida
            ].iloc[0]

            status_proc_opcoes = [
                "PENDENTE_VERIFICACAO",
                "ATIVA",
                "VENCENDO",
                "VENCIDA",
                "NAO_POSSUI",
                "DISPENSADA",
                "REVOGADA",
                "SUBSTITUIDA",
            ]

            status_proc_atual = status_procuracao_form(proc_linha["status_calculado"])
            if status_proc_atual not in status_proc_opcoes:
                status_proc_atual = "PENDENTE_VERIFICACAO"

            with st.form(key=f"form_editar_procuracao_{perfil_id}_{int(proc_linha['id'])}"):
                pp1, pp2, pp3 = st.columns(3)

                proc_data_emissao = pp1.text_input(
                    "Data emissão procuração",
                    value=data_input_texto(proc_linha["data_emissao"]),
                    help="Use o formato interno AAAA-MM-DD. Exemplo: 2026-01-10.",
                    key=f"proc_data_emissao_{perfil_id}_{int(proc_linha['id'])}",
                )

                proc_data_validade = pp2.text_input(
                    "Data validade procuração",
                    value=data_input_texto(proc_linha["data_validade"]),
                    help="Use o formato interno AAAA-MM-DD. No visual depois ficará DD/MM/AAAA.",
                    key=f"proc_data_validade_{perfil_id}_{int(proc_linha['id'])}",
                )

                proc_status = pp3.selectbox(
                    "Status procuração",
                    status_proc_opcoes,
                    index=status_proc_opcoes.index(status_proc_atual),
                    format_func=lambda x: mapa_status_vencimento_python.get(x, humanizar_codigo_visual(x)),
                    key=f"proc_status_{perfil_id}_{int(proc_linha['id'])}",
                )

                proc_observacao = st.text_area(
                    "Observação procuração",
                    value="" if proc_linha["observacao"] is None else str(proc_linha["observacao"]),
                    key=f"proc_observacao_{perfil_id}_{int(proc_linha['id'])}",
                )

                proc_confirmar = st.checkbox(
                    "Confirmo que desejo atualizar esta procuração.",
                    key=f"proc_confirmar_{perfil_id}_{int(proc_linha['id'])}",
                )

                if not usuario_tem_permissao("procuracoes.editar"):
                    st.info("Seu usuário não tem permissão para editar procurações.")

                proc_salvar = st.form_submit_button("Salvar procuração", disabled=not usuario_tem_permissao("procuracoes.editar"))

                if proc_salvar:
                    if not proc_confirmar:
                        st.error("Marque a confirmação antes de salvar.")
                    else:
                        try:
                            resultado = executar_sql_parametrizado(
                                """
                                SELECT *
                                FROM contabilidade_atualizar_procuracao_cliente(
                                    %s,
                                    NULLIF(%s, '')::DATE,
                                    NULLIF(%s, '')::DATE,
                                    %s,
                                    %s,
                                    %s
                                );
                                """,
                                [
                                    int(proc_linha["id"]),
                                    proc_data_emissao,
                                    proc_data_validade,
                                    proc_status,
                                    proc_observacao,
                                    "USUARIO_PAINEL",
                                ],
                            )

                            st.cache_data.clear()
                            st.success("Procuração atualizada com sucesso.")
                            if resultado:
                                st.write(resultado)
                            st.rerun()

                        except Exception as erro:
                            st.error("Não foi possível atualizar a procuração.")
                            st.exception(erro)


        st.markdown("### Histórico de certificados/procurações")
        historico_vencimentos = sql_df(f"""
            SELECT
                app_origem_controle_br(origem) AS "Origem",
                registro_id AS "Registro",
                CASE
                    WHEN origem = 'CERTIFICADO_DIGITAL'
                        THEN CONCAT_WS(' ', valor_novo->>'tipo_certificado', valor_novo->>'subtipo_certificado')
                    WHEN origem = 'PROCURACAO'
                        THEN REPLACE(COALESCE(valor_novo->>'tipo_procuracao', ''), '_', ' ')
                    ELSE app_origem_controle_br(origem)
                END AS "Tipo controle",
                CASE
                    WHEN COALESCE(valor_anterior->>'data_emissao', '') ~ '^[0-9]{{4}}-[0-9]{{2}}-[0-9]{{2}}$'
                        THEN TO_CHAR((valor_anterior->>'data_emissao')::DATE, 'DD/MM/YYYY')
                    ELSE ''
                END AS "Data emissão anterior",
                CASE
                    WHEN COALESCE(valor_novo->>'data_emissao', '') ~ '^[0-9]{{4}}-[0-9]{{2}}-[0-9]{{2}}$'
                        THEN TO_CHAR((valor_novo->>'data_emissao')::DATE, 'DD/MM/YYYY')
                    ELSE ''
                END AS "Data emissão nova",
                CASE
                    WHEN COALESCE(valor_anterior->>'data_validade', '') ~ '^[0-9]{{4}}-[0-9]{{2}}-[0-9]{{2}}$'
                        THEN TO_CHAR((valor_anterior->>'data_validade')::DATE, 'DD/MM/YYYY')
                    ELSE ''
                END AS "Data validade anterior",
                CASE
                    WHEN COALESCE(valor_novo->>'data_validade', '') ~ '^[0-9]{{4}}-[0-9]{{2}}-[0-9]{{2}}$'
                        THEN TO_CHAR((valor_novo->>'data_validade')::DATE, 'DD/MM/YYYY')
                    ELSE ''
                END AS "Data validade nova",
                app_status_vencimento_br(
                    COALESCE(valor_anterior->>'status_certificado', valor_anterior->>'status_procuracao', '')
                ) AS "Status anterior",
                app_status_vencimento_br(
                    COALESCE(valor_novo->>'status_certificado', valor_novo->>'status_procuracao', '')
                ) AS "Status novo",
                REPLACE(COALESCE(motivo, ''), '_', ' ') AS "Motivo",
                observacao AS "Observação",
                atualizado_por AS "Atualizado por",
                TO_CHAR(criado_em AT TIME ZONE 'America/Campo_Grande', 'DD/MM/YYYY HH24:MI') AS "Criado em"
            FROM contabilidade_vencimentos_alteracoes_log
            WHERE perfil_id = {perfil_id}
            ORDER BY criado_em DESC
            LIMIT 50;
        """)

        if historico_vencimentos.empty:
            st.info("Ainda não há histórico de alteração de certificado/procuração para este cliente.")
        else:
            st.metric("Alterações registradas", len(historico_vencimentos))
            tabela(historico_vencimentos, 360)


    with aba3:
        st.subheader("Pendências abertas")
        pend = sql_df("""
            SELECT
                perfil_id,
                competencia,
                semaforo,
                razao_social_nome,
                cpf_cnpj,
                tipo_pessoa,
                perfil_operacional,
                tem_funcionarios,
                tipo_esperado_drive,
                categoria_macro,
                tipo_documento,
                subtipo_documento,
                obrigatorio,
                prioridade,
                pasta_sugerida,
                regra_alerta
            FROM vw_app_pendencias_priorizadas
            ORDER BY ordem_prioridade, competencia, razao_social_nome
            LIMIT 3000;
        """)
        st.metric("Pendências carregadas", len(pend))
        tabela(pend, 700)

        st.markdown("#### Atalho Pendências para correção do cliente")

        if pend.empty:
            st.info("Nenhuma pendência disponível para preparar edição.")
        else:
            pend_atalho = pend.copy()
            pend_atalho["_competencia_visual"] = pend_atalho["competencia"].map(formatar_competencia_visual_python)
            pend_atalho["_tipo_documento_visual"] = pend_atalho["tipo_documento"].map(humanizar_codigo_visual)
            pend_atalho["_subtipo_documento_visual"] = pend_atalho["subtipo_documento"].map(humanizar_codigo_visual)

            pend_atalho["atalho_rotulo"] = (
                pend_atalho["perfil_id"].astype(str)
                + " | "
                + pend_atalho["razao_social_nome"].astype(str)
                + " | "
                + pend_atalho["cpf_cnpj"].astype(str)
                + " | "
                + pend_atalho["_competencia_visual"].astype(str)
                + " | "
                + pend_atalho["_tipo_documento_visual"].astype(str)
                + " | "
                + pend_atalho["_subtipo_documento_visual"].astype(str)
            )

            pendencia_atalho = st.selectbox(
                "Selecionar pendência para abrir o cliente na aba 🔎 Cliente",
                pend_atalho["atalho_rotulo"].tolist(),
                key="atalho_pendencias_cliente_select",
            )

            if st.button("Preparar cliente da pendência para edição", key="btn_preparar_cliente_pendencias"):
                pendencia_atalho_linha = pend_atalho[
                    pend_atalho["atalho_rotulo"] == pendencia_atalho
                ].iloc[0]

                st.session_state["perfil_id_preselecionado"] = int(pendencia_atalho_linha["perfil_id"])
                st.session_state["cliente_preselecionado_nome"] = str(pendencia_atalho_linha["razao_social_nome"])
                st.session_state["abrir_cliente_automatico"] = True
                st.rerun()

                st.success(
                    "Cliente preparado para edição. Agora clique na aba 🔎 Cliente: ele já estará selecionado."
                )

    with aba4:
        st.subheader("📄 Folha/RH — pendências críticas")

        folha_resumo = sql_df("""
            SELECT *
            FROM vw_app_folha_resumo_competencia
            ORDER BY competencia, tipo_esperado_drive;
        """)
        st.markdown("Resumo por competência")
        tabela(folha_resumo, 350)

        folha = sql_df("""
            SELECT
                c.perfil_id,
                f.competencia,
                f.semaforo,
                f.razao_social_nome,
                c.cpf_cnpj,
                f.tipo_pessoa,
                f.perfil_operacional,
                f.tem_funcionarios,
                f.tipo_esperado_drive,
                f.tipo_documento,
                f.subtipo_documento,
                f.obrigatorio,
                f.prioridade,
                f.pasta_sugerida,
                f.regra_alerta
            FROM vw_app_folha_pendencias f
            LEFT JOIN vw_app_clientes c
                ON c.razao_social_nome = f.razao_social_nome
            ORDER BY f.competencia, f.razao_social_nome, f.tipo_esperado_drive
            LIMIT 3000;
        """)

        busca_folha = st.text_input("Buscar em Folha/RH", key="busca_folha")
        if busca_folha.strip():
            termo = busca_folha.strip().lower()
            folha = folha[
                folha.astype(str)
                .apply(lambda col: col.str.lower().str.contains(termo, na=False))
                .any(axis=1)
            ]

        st.metric("Pendências de Folha/RH", len(folha))
        tabela(folha, 700)

        st.divider()

        st.markdown("### Fila operacional Folha/RH")
        st.info("Esta fila considera a ficha operacional do cliente: funcionários, necessidade de folha/RH e qualificação cadastral.")

        folha_operacional = sql_df("""
            SELECT
                perfil_id,
                app_competencia_br(competencia) AS competencia,
                semaforo,
                razao_social_nome,
                cpf_cnpj,
                tipo_pessoa,
                perfil_operacional,
                tipo_esperado_drive,
                tipo_documento,
                subtipo_documento,
                obrigatorio,
                prioridade,
                app_boolean_br(ficha_tem_funcionarios) AS ficha_tem_funcionarios,
                app_boolean_br(precisa_folha) AS precisa_folha,
                status_qualificacao,
                status_cobranca_folha,
                acao_operacional_folha
            FROM vw_app_folha_fila_acao_operacional
            ORDER BY ordem_folha, competencia, razao_social_nome, tipo_documento
            LIMIT 3000;
        """)

        if folha_operacional.empty:
            st.success("Nenhuma ação operacional de Folha/RH encontrada.")
        else:
            st.markdown("#### Filtros Folha/RH operacional")

            col_fo1, col_fo2, col_fo3 = st.columns(3)

            status_folha_lista = ["TODOS"] + sorted(
                folha_operacional["status_cobranca_folha"].dropna().astype(str).unique().tolist()
            )

            competencias_folha_lista = ["TODAS"] + sorted(
                folha_operacional["competencia"].dropna().astype(str).unique().tolist()
            )

            filtro_status_folha_operacional = col_fo1.selectbox(
                "Status cobrança Folha/RH",
                status_folha_lista,
                format_func=lambda x: humanizar_codigo_visual(x),
                key="filtro_status_folha_operacional",
            )

            filtro_competencia_folha_operacional = col_fo2.selectbox(
                "Filtro por competência Folha/RH operacional",
                competencias_folha_lista,
                format_func=lambda x: formatar_competencia_visual_python(x),
                key="filtro_competencia_folha_operacional",
            )

            busca_folha_operacional = col_fo3.text_input(
                "Buscar cliente/CNPJ Folha/RH operacional",
                value="",
                key="busca_cliente_cnpj_folha_operacional",
            )

            folha_operacional_filtrada = folha_operacional.copy()

            if filtro_status_folha_operacional != "TODOS":
                folha_operacional_filtrada = folha_operacional_filtrada[
                    folha_operacional_filtrada["status_cobranca_folha"].astype(str) == filtro_status_folha_operacional
                ]

            if filtro_competencia_folha_operacional != "TODAS":
                folha_operacional_filtrada = folha_operacional_filtrada[
                    folha_operacional_filtrada["competencia"].astype(str) == filtro_competencia_folha_operacional
                ]

            if busca_folha_operacional.strip():
                termo = busca_folha_operacional.strip().lower()
                folha_operacional_filtrada = folha_operacional_filtrada[
                    folha_operacional_filtrada["razao_social_nome"].astype(str).str.lower().str.contains(termo, na=False)
                    | folha_operacional_filtrada["cpf_cnpj"].astype(str).str.lower().str.contains(termo, na=False)
                ]

            fo1, fo2, fo3, fo4 = st.columns(4)
            fo1.metric("Itens filtrados", len(folha_operacional_filtrada))
            fo2.metric("Cobrar normal", int((folha_operacional_filtrada["status_cobranca_folha"] == "COBRAR_NORMAL").sum()))
            fo3.metric("Pend. qualificação", int((folha_operacional_filtrada["status_cobranca_folha"] == "PENDENTE_QUALIFICACAO").sum()))
            fo4.metric("Clientes", int(folha_operacional_filtrada["razao_social_nome"].nunique()))

            tabela(folha_operacional_filtrada, 520)

            st.markdown("#### Atalho Folha/RH operacional para correção do cliente")

            if folha_operacional_filtrada.empty:
                st.info("Nenhum cliente disponível no filtro atual de Folha/RH operacional.")
            else:
                folha_operacional_atalho = folha_operacional_filtrada.copy()
                folha_operacional_atalho["_competencia_visual"] = folha_operacional_atalho["competencia"].map(formatar_competencia_visual_python)
                folha_operacional_atalho["_tipo_documento_visual"] = folha_operacional_atalho["tipo_documento"].map(humanizar_codigo_visual)
                folha_operacional_atalho["_subtipo_documento_visual"] = folha_operacional_atalho["subtipo_documento"].map(humanizar_codigo_visual)
                folha_operacional_atalho["_status_visual"] = folha_operacional_atalho["status_cobranca_folha"].map(humanizar_codigo_visual)

                folha_operacional_atalho["atalho_rotulo"] = (
                    folha_operacional_atalho["perfil_id"].astype(str)
                    + " | "
                    + folha_operacional_atalho["razao_social_nome"].astype(str)
                    + " | "
                    + folha_operacional_atalho["cpf_cnpj"].astype(str)
                    + " | "
                    + folha_operacional_atalho["_competencia_visual"].astype(str)
                    + " | "
                    + folha_operacional_atalho["_tipo_documento_visual"].astype(str)
                    + " | "
                    + folha_operacional_atalho["_subtipo_documento_visual"].astype(str)
                    + " | "
                    + folha_operacional_atalho["_status_visual"].astype(str)
                )

                folha_operacional_item = st.selectbox(
                    "Selecionar item de Folha/RH operacional para abrir o cliente na aba 🔎 Cliente",
                    folha_operacional_atalho["atalho_rotulo"].tolist(),
                    key="atalho_folha_operacional_cliente_select",
                )

                if st.button("Preparar cliente da Folha/RH operacional para edição", key="btn_preparar_cliente_folha_operacional"):
                    folha_operacional_linha = folha_operacional_atalho[
                        folha_operacional_atalho["atalho_rotulo"] == folha_operacional_item
                    ].iloc[0]

                    st.session_state["perfil_id_preselecionado"] = int(folha_operacional_linha["perfil_id"])
                    st.session_state["cliente_preselecionado_nome"] = str(folha_operacional_linha["razao_social_nome"])
                    st.session_state["abrir_cliente_automatico"] = True
                    st.rerun()

                    st.success(
                        "Cliente preparado para edição. Agora clique na aba 🔎 Cliente: ele já estará selecionado."
                    )
                    st.rerun()

        st.markdown("#### Atalho Folha/RH para correção do cliente")

        if folha.empty:
            st.info("Nenhuma pendência de Folha/RH disponível para preparar edição.")
        else:
            folha_atalho = folha.copy()
            folha_atalho["_competencia_visual"] = folha_atalho["competencia"].map(formatar_competencia_visual_python)
            folha_atalho["_tipo_documento_visual"] = folha_atalho["tipo_documento"].map(humanizar_codigo_visual)
            folha_atalho["_subtipo_documento_visual"] = folha_atalho["subtipo_documento"].map(humanizar_codigo_visual)

            folha_atalho["atalho_rotulo"] = (
                folha_atalho["perfil_id"].astype(str)
                + " | "
                + folha_atalho["razao_social_nome"].astype(str)
                + " | "
                + folha_atalho["cpf_cnpj"].astype(str)
                + " | "
                + folha_atalho["_competencia_visual"].astype(str)
                + " | "
                + folha_atalho["_tipo_documento_visual"].astype(str)
                + " | "
                + folha_atalho["_subtipo_documento_visual"].astype(str)
            )

            folha_item_atalho = st.selectbox(
                "Selecionar pendência de Folha/RH para abrir o cliente na aba 🔎 Cliente",
                folha_atalho["atalho_rotulo"].tolist(),
                key="atalho_folha_cliente_select",
            )

            if st.button("Preparar cliente da Folha/RH para edição", key="btn_preparar_cliente_folha"):
                folha_atalho_linha = folha_atalho[
                    folha_atalho["atalho_rotulo"] == folha_item_atalho
                ].iloc[0]

                st.session_state["perfil_id_preselecionado"] = int(folha_atalho_linha["perfil_id"])
                st.session_state["cliente_preselecionado_nome"] = str(folha_atalho_linha["razao_social_nome"])
                st.session_state["abrir_cliente_automatico"] = True
                st.rerun()

                st.success(
                    "Cliente preparado para edição. Agora clique na aba 🔎 Cliente: ele já estará selecionado."
                )

    with aba5:
        st.subheader("🧾 Fiscal — pendências altas")

        fiscal_resumo = sql_df("""
            SELECT *
            FROM vw_app_fiscal_resumo_competencia
            ORDER BY competencia, tipo_esperado_drive;
        """)
        st.markdown("Resumo por competência")
        tabela(fiscal_resumo, 350)

        fiscal = sql_df("""
            SELECT
                competencia,
                semaforo,
                razao_social_nome,
                tipo_pessoa,
                perfil_operacional,
                tem_funcionarios,
                tipo_esperado_drive,
                tipo_documento,
                subtipo_documento,
                obrigatorio,
                prioridade,
                pasta_sugerida,
                regra_alerta
            FROM vw_app_fiscal_pendencias
            ORDER BY competencia, razao_social_nome, tipo_esperado_drive
            LIMIT 3000;
        """)

        busca_fiscal = st.text_input("Buscar em Fiscal", key="busca_fiscal")
        if busca_fiscal.strip():
            termo = busca_fiscal.strip().lower()
            fiscal = fiscal[
                fiscal.astype(str)
                .apply(lambda col: col.str.lower().str.contains(termo, na=False))
                .any(axis=1)
            ]

        st.metric("Pendências fiscais", len(fiscal))
        tabela(fiscal, 700)

        st.markdown("### Serviços / NFS-e / Faturamento")
        st.info("Fila operacional para clientes de serviço: NFS-e, nota fiscal de serviço e controle de faturamento por competência.")

        fila_servicos = sql_df("""
            SELECT
                perfil_id,
                app_competencia_br(competencia) AS competencia,
                razao_social_nome AS cliente,
                cpf_cnpj,
                tipo_documento,
                subtipo_documento,
                situacao_fiscal,
                status_qualificacao,
                status_cobranca_servico,
                acao_operacional_servico,
                app_boolean_br(emite_nfse) AS emite_nfse,
                app_boolean_br(precisa_apuracao_fiscal) AS precisa_apuracao_fiscal,
                app_boolean_br(tem_funcionarios) AS tem_funcionarios,
                app_boolean_br(precisa_folha) AS precisa_folha
            FROM vw_app_servicos_nfse_fila_acao_operacional
            ORDER BY ordem_servico, competencia, cliente, tipo_documento
            LIMIT 1200;
        """)

        if fila_servicos.empty:
            st.success("Nenhuma ação de NFS-e/faturamento encontrada.")
        else:
            st.markdown("#### Filtros de serviços / NFS-e / Faturamento")

            col_sv1, col_sv2, col_sv3 = st.columns(3)

            status_servicos_lista = ["TODOS"] + sorted(
                fila_servicos["status_cobranca_servico"].dropna().astype(str).unique().tolist()
            )

            competencias_servicos_lista = ["TODAS"] + sorted(
                fila_servicos["competencia"].dropna().astype(str).unique().tolist()
            )

            filtro_status_servicos = col_sv1.selectbox(
                "Status cobrança serviço",
                status_servicos_lista,
                format_func=lambda x: humanizar_codigo_visual(x),
                key="filtro_status_servicos_nfse",
            )

            filtro_competencia_servicos = col_sv2.selectbox(
                "Filtro por competência serviços",
                competencias_servicos_lista,
                format_func=lambda x: formatar_competencia_visual_python(x),
                key="filtro_competencia_servicos_nfse",
            )

            busca_servicos_cliente = col_sv3.text_input(
                "Buscar cliente/CNPJ serviços",
                value="",
                key="busca_cliente_cnpj_servicos_nfse",
            )

            fila_servicos_filtrada = fila_servicos.copy()

            if filtro_status_servicos != "TODOS":
                fila_servicos_filtrada = fila_servicos_filtrada[
                    fila_servicos_filtrada["status_cobranca_servico"].astype(str) == filtro_status_servicos
                ]

            if filtro_competencia_servicos != "TODAS":
                fila_servicos_filtrada = fila_servicos_filtrada[
                    fila_servicos_filtrada["competencia"].astype(str) == filtro_competencia_servicos
                ]

            if busca_servicos_cliente.strip():
                termo = busca_servicos_cliente.strip().lower()
                fila_servicos_filtrada = fila_servicos_filtrada[
                    fila_servicos_filtrada["cliente"].astype(str).str.lower().str.contains(termo, na=False)
                    | fila_servicos_filtrada["cpf_cnpj"].astype(str).str.lower().str.contains(termo, na=False)
                ]

            fs1, fs2, fs3, fs4 = st.columns(4)
            fs1.metric("Itens filtrados", len(fila_servicos_filtrada))
            fs2.metric("Cobrar normal", int((fila_servicos_filtrada["status_cobranca_servico"] == "COBRAR_NORMAL").sum()))
            fs3.metric("Pend. qualificação", int((fila_servicos_filtrada["status_cobranca_servico"] == "PENDENTE_QUALIFICACAO").sum()))
            fs4.metric("Clientes", int(fila_servicos_filtrada["cliente"].nunique()))

            tabela(fila_servicos_filtrada, 420)

            st.markdown("#### Atalho serviços para correção do cliente")

            if fila_servicos_filtrada.empty:
                st.info("Nenhum cliente disponível no filtro atual de serviços.")
            else:
                fila_servicos_atalho = fila_servicos_filtrada.copy()
                fila_servicos_atalho["_competencia_visual"] = fila_servicos_atalho["competencia"].map(formatar_competencia_visual_python)
                fila_servicos_atalho["_tipo_documento_visual"] = fila_servicos_atalho["tipo_documento"].map(humanizar_codigo_visual)

                fila_servicos_atalho["atalho_rotulo"] = (
                    fila_servicos_atalho["perfil_id"].astype(str)
                    + " | "
                    + fila_servicos_atalho["cliente"].astype(str)
                    + " | "
                    + fila_servicos_atalho["cpf_cnpj"].astype(str)
                    + " | "
                    + fila_servicos_atalho["_competencia_visual"].astype(str)
                    + " | "
                    + fila_servicos_atalho["_tipo_documento_visual"].astype(str)
                )

                servico_atalho = st.selectbox(
                    "Selecionar cliente de serviços para abrir na aba 🔎 Cliente",
                    fila_servicos_atalho["atalho_rotulo"].tolist(),
                    key="atalho_servicos_cliente_select",
                )

                if st.button("Preparar cliente de serviços para edição", key="btn_preparar_cliente_servicos"):
                    servico_atalho_linha = fila_servicos_atalho[
                        fila_servicos_atalho["atalho_rotulo"] == servico_atalho
                    ].iloc[0]

                    st.session_state["perfil_id_preselecionado"] = int(servico_atalho_linha["perfil_id"])
                    st.session_state["cliente_preselecionado_nome"] = str(servico_atalho_linha["cliente"])
                    st.session_state["abrir_cliente_automatico"] = True
                    st.rerun()

                    st.success(
                        "Cliente preparado para edição. Agora clique na aba 🔎 Cliente: ele já estará selecionado."
                    )

        st.divider()

        st.markdown("### Fiscal / XML geral por competência")
        st.info("Resumo geral cruzando obrigações fiscais 2026 com XMLs locais encontrados no AuxílioNFe.")

        fiscal_xml_resumo = sql_df("""
            SELECT
                competencia,
                status_xml_local,
                clientes,
                obrigacoes_fiscais,
                obrigacoes_obrigatorias,
                total_xml_local,
                total_xml_com_pdf,
                total_xml_sem_pdf,
                valor_total_xml_local
            FROM vw_app_fiscal_xml_resumo_geral
            ORDER BY competencia, status_xml_local;
        """)

        if fiscal_xml_resumo.empty:
            st.warning("Nenhum resumo fiscal/XML geral encontrado.")
        else:
            fg1, fg2, fg3, fg4 = st.columns(4)
            fg1.metric("Linhas resumo", len(fiscal_xml_resumo))
            fg2.metric("XMLs locais", int(fiscal_xml_resumo["total_xml_local"].sum()))
            fg3.metric("Com PDF", int(fiscal_xml_resumo["total_xml_com_pdf"].sum()))
            fg4.metric("Sem PDF", int(fiscal_xml_resumo["total_xml_sem_pdf"].sum()))

            tabela(fiscal_xml_resumo, 320)

        st.markdown("### Fila de ação Fiscal / XML")
        st.info("Lista operacional do que precisa ser resolvido: baixar XML, gerar PDF/DANFE, completar arquivos ou conferir no Drive.")

        fila_fiscal = sql_df("""
            SELECT
                perfil_id,
                app_competencia_br(competencia) AS competencia,
                app_semaforo_fiscal_br(semaforo_fiscal) AS semaforo_fiscal,
                app_status_cobranca_fiscal_br(status_cobranca_fiscal) AS status_cobranca_fiscal,
                app_acao_operacional_fiscal_br(acao_operacional_fiscal) AS acao_sugerida,
                razao_social_nome AS cliente,
                cpf_cnpj AS cpf_cnpj,
                regime_tributario,
                perfil_operacional,
                segmento_operacional,
                situacao_fiscal,
                status_qualificacao,
                obrigacoes_obrigatorias,
                total_xml_local,
                total_xml_com_pdf,
                total_xml_sem_pdf,
                valor_total_xml_local,
                app_status_xml_local_br(status_xml_local) AS status_xml_local,
                leitura_operacional
            FROM vw_app_fiscal_xml_fila_acao_operacional
            ORDER BY ordem_operacional, ordem_acao, competencia, razao_social_nome
            LIMIT 2000;
        """)

        if fila_fiscal.empty:
            st.success("Nenhuma ação fiscal/XML pendente encontrada.")
        else:
            st.markdown("#### Filtros da fila fiscal")

            f1, f2, f3, f4, f5 = st.columns(5)

            competencias_fila = ["TODAS"] + sorted(fila_fiscal["competencia"].dropna().astype(str).unique().tolist())
            semaforos_fila = ["TODOS"] + sorted(fila_fiscal["semaforo_fiscal"].dropna().astype(str).unique().tolist())
            cobrancas_fila = ["TODOS"] + sorted(fila_fiscal["status_cobranca_fiscal"].dropna().astype(str).unique().tolist())
            acoes_fila = ["TODAS"] + sorted(fila_fiscal["acao_sugerida"].dropna().astype(str).unique().tolist())

            filtro_competencia = f1.selectbox(
                "Competência",
                competencias_fila,
                format_func=lambda x: formatar_competencia_visual_python(x),
                key="filtro_competencia_fila_fiscal",
            )

            filtro_semaforo = f2.selectbox(
                "Filtro semáforo fiscal",
                semaforos_fila,
                format_func=lambda x: humanizar_codigo_visual(x),
                key="filtro_semaforo_fila_fiscal",
            )

            filtro_cobranca = f3.selectbox(
                "Status cobrança fiscal",
                cobrancas_fila,
                format_func=lambda x: humanizar_codigo_visual(x),
                key="filtro_cobranca_fila_fiscal",
            )

            filtro_acao = f4.selectbox(
                "Ação sugerida",
                acoes_fila,
                format_func=lambda x: humanizar_codigo_visual(x),
                key="filtro_acao_fila_fiscal",
            )

            busca_cliente_fiscal = f5.text_input(
                "Buscar cliente/CNPJ",
                value="",
                key="busca_cliente_fila_fiscal",
            )

            fila_filtrada = fila_fiscal.copy()

            if filtro_competencia != "TODAS":
                fila_filtrada = fila_filtrada[fila_filtrada["competencia"].astype(str) == filtro_competencia]

            if filtro_semaforo != "TODOS":
                fila_filtrada = fila_filtrada[fila_filtrada["semaforo_fiscal"].astype(str) == filtro_semaforo]

            if filtro_cobranca != "TODOS":
                fila_filtrada = fila_filtrada[fila_filtrada["status_cobranca_fiscal"].astype(str) == filtro_cobranca]

            if filtro_acao != "TODAS":
                fila_filtrada = fila_filtrada[fila_filtrada["acao_sugerida"].astype(str) == filtro_acao]

            if busca_cliente_fiscal.strip():
                termo = busca_cliente_fiscal.strip().lower()
                fila_filtrada = fila_filtrada[
                    fila_filtrada["cliente"].astype(str).str.lower().str.contains(termo, na=False)
                    | fila_filtrada["cpf_cnpj"].astype(str).str.lower().str.contains(termo, na=False)
                ]

            fa1, fa2, fa3, fa4 = st.columns(4)
            fa1.metric("Itens filtrados", len(fila_filtrada))
            fa2.metric("Cobrar normal", int((fila_filtrada["status_cobranca_fiscal"] == "Cobrar normal").sum()))
            fa3.metric("Pend. qualificação", int((fila_filtrada["status_cobranca_fiscal"] == "Pendente de qualificação").sum()))
            fa4.metric("Não cobrar", int(fila_filtrada["status_cobranca_fiscal"].astype(str).str.startswith("Não cobrar").sum()))

            tabela(fila_filtrada, 500)

            st.markdown("#### Atalho Fiscal/XML para correção do cliente")

            if fila_filtrada.empty:
                st.info("Nenhum cliente disponível no filtro atual Fiscal/XML.")
            else:
                fila_fiscal_atalho = fila_filtrada.copy()
                fila_fiscal_atalho["_competencia_visual"] = fila_fiscal_atalho["competencia"].map(formatar_competencia_visual_python)
                fila_fiscal_atalho["_status_xml_visual"] = fila_fiscal_atalho["status_xml_local"].map(humanizar_codigo_visual)

                fila_fiscal_atalho["atalho_rotulo"] = (
                    fila_fiscal_atalho["perfil_id"].astype(str)
                    + " | "
                    + fila_fiscal_atalho["cliente"].astype(str)
                    + " | "
                    + fila_fiscal_atalho["cpf_cnpj"].astype(str)
                    + " | "
                    + fila_fiscal_atalho["_competencia_visual"].astype(str)
                    + " | "
                    + fila_fiscal_atalho["_status_xml_visual"].astype(str)
                )

                fiscal_atalho = st.selectbox(
                    "Selecionar cliente Fiscal/XML para abrir na aba 🔎 Cliente",
                    fila_fiscal_atalho["atalho_rotulo"].tolist(),
                    key="atalho_fiscal_xml_cliente_select",
                )

                if st.button("Preparar cliente Fiscal/XML para edição", key="btn_preparar_cliente_fiscal_xml"):
                    fiscal_atalho_linha = fila_fiscal_atalho[
                        fila_fiscal_atalho["atalho_rotulo"] == fiscal_atalho
                    ].iloc[0]

                    st.session_state["perfil_id_preselecionado"] = int(fiscal_atalho_linha["perfil_id"])
                    st.session_state["cliente_preselecionado_nome"] = str(fiscal_atalho_linha["cliente"])
                    st.session_state["abrir_cliente_automatico"] = True
                    st.rerun()

                    st.success(
                        "Cliente preparado para edição. Agora clique na aba 🔎 Cliente: ele já estará selecionado."
                    )

        st.markdown("### Fiscal / XML por cliente")
        fiscal_xml_clientes = sql_df("""
            SELECT
                competencia,
                razao_social_nome,
                cpf_cnpj,
                obrigacoes_fiscais,
                obrigacoes_obrigatorias,
                total_xml_local,
                total_xml_com_pdf,
                total_xml_sem_pdf,
                valor_total_xml_local,
                status_xml_local,
                leitura_operacional
            FROM vw_app_fiscal_xml_clientes_geral
            ORDER BY competencia, status_xml_local, razao_social_nome
            LIMIT 2000;
        """)

        tabela(fiscal_xml_clientes, 480)

        st.markdown("### XML sem cliente / candidatos")
        st.info("XMLs encontrados no AuxílioNFe, mas que ainda não pertencem a nenhum cliente operacional cadastrado no painel.")

        candidatos_xml = sql_df("""
            SELECT
                cpf_cnpj,
                nome_lista_esocial,
                nomes_xml_encontrados,
                tipo_pessoa,
                primeira_competencia,
                ultima_competencia,
                total_xml,
                com_pdf,
                sem_pdf,
                valor_total,
                status_candidato,
                status_decisao,
                motivo_decisao,
                observacao_decisao,
                acao_sugerida
            FROM vw_app_auxilio_nfe_candidatos_cliente_painel
            ORDER BY total_xml DESC, valor_total DESC;
        """)

        if candidatos_xml.empty:
            st.success("Nenhum XML sem cliente identificado no momento.")
        else:
            cx1, cx2, cx3, cx4 = st.columns(4)
            cx1.metric("Candidatos", len(candidatos_xml))
            cx2.metric("XMLs sem cliente", int(candidatos_xml["total_xml"].sum()))
            cx3.metric("Com PDF", int(candidatos_xml["com_pdf"].sum()))
            cx4.metric("Sem PDF", int(candidatos_xml["sem_pdf"].sum()))

            tabela(candidatos_xml, 360)

            st.markdown("### Decidir candidato XML")
            st.warning("Esta ação só registra a decisão. Não cadastra cliente automaticamente e não mexe no Google Drive.")

            candidatos_xml["rotulo_decisao"] = (
                candidatos_xml["cpf_cnpj"].astype(str)
                + " | "
                + candidatos_xml["nome_lista_esocial"].astype(str)
                + " | "
                + candidatos_xml["status_decisao"].astype(str)
            )

            candidato_escolhido = st.selectbox(
                "Candidato XML",
                candidatos_xml["rotolo_decisao"].tolist() if "rotolo_decisao" in candidatos_xml.columns else candidatos_xml["rotulo_decisao"].tolist(),
                key="candidato_xml_decisao_select",
            )

            candidato_linha = candidatos_xml[candidatos_xml["rotulo_decisao"] == candidato_escolhido].iloc[0]
            candidato_cpf_cnpj = str(candidato_linha["cpf_cnpj"])

            clientes_vinculo = sql_df("""
                SELECT
                    perfil_id,
                    razao_social_nome,
                    cpf_cnpj,
                    tipo_pessoa,
                    perfil_operacional
                FROM vw_app_clientes
                ORDER BY razao_social_nome;
            """)

            clientes_vinculo["rotulo_vinculo"] = (
                clientes_vinculo["perfil_id"].astype(str)
                + " | "
                + clientes_vinculo["razao_social_nome"].astype(str)
                + " | "
                + clientes_vinculo["cpf_cnpj"].astype(str)
            )

            with st.form(key=f"form_decisao_xml_{candidato_cpf_cnpj}"):
                status_opcoes = [
                    "PENDENTE_ANALISE",
                    "CADASTRAR_CLIENTE_OPERACIONAL",
                    "CLIENTE_ANTIGO_INATIVO",
                    "FORA_DO_PAINEL",
                    "VINCULAR_A_CLIENTE_EXISTENTE",
                ]

                status_atual = str(candidato_linha["status_decisao"])
                if status_atual not in status_opcoes:
                    status_atual = "PENDENTE_ANALISE"

                nova_decisao = st.selectbox(
                    "Decisão",
                    status_opcoes,
                    index=status_opcoes.index(status_atual),
                    key=f"nova_decisao_xml_{candidato_cpf_cnpj}",
                )

                cliente_vinculado_rotulo = st.selectbox(
                    "Cliente existente para vínculo",
                    [""] + clientes_vinculo["rotulo_vinculo"].tolist(),
                    help="Use somente se a decisão for VINCULAR_A_CLIENTE_EXISTENTE.",
                    key=f"cliente_vinculo_xml_{candidato_cpf_cnpj}",
                )

                motivo_decisao = st.text_input(
                    "Motivo",
                    value="DECISAO_MANUAL_CANDIDATO_XML",
                    key=f"motivo_decisao_xml_{candidato_cpf_cnpj}",
                )

                observacao_decisao = st.text_area(
                    "Observação",
                    value="",
                    key=f"observacao_decisao_xml_{candidato_cpf_cnpj}",
                )

                confirmar_decisao = st.checkbox(
                    "Confirmo que desejo registrar esta decisão para o candidato XML.",
                    key=f"confirmar_decisao_xml_{candidato_cpf_cnpj}",
                )

                if not usuario_tem_permissao("documentos.classificar"):
                    st.info("Seu usuário não tem permissão para registrar decisão de XML.")

                enviar_decisao = st.form_submit_button("Registrar decisão do candidato XML", disabled=not usuario_tem_permissao("documentos.classificar"))

                if enviar_decisao:
                    if not confirmar_decisao:
                        st.error("Marque a confirmação antes de registrar.")
                    else:
                        perfil_id_vinculado = None

                        if nova_decisao == "VINCULAR_A_CLIENTE_EXISTENTE":
                            if not cliente_vinculado_rotulo:
                                st.error("Para vincular a cliente existente, escolha um cliente.")
                                st.stop()

                            perfil_id_vinculado = int(cliente_vinculado_rotulo.split(" | ")[0])

                        try:
                            resultado = executar_sql_parametrizado(
                                """
                                SELECT *
                                FROM contabilidade_decidir_candidato_xml_cliente(
                                    %s, %s, %s, %s, %s, %s
                                );
                                """,
                                [
                                    candidato_cpf_cnpj,
                                    nova_decisao,
                                    perfil_id_vinculado,
                                    motivo_decisao,
                                    observacao_decisao,
                                    "USUARIO_PAINEL",
                                ],
                            )

                            st.cache_data.clear()
                            st.success("Decisão registrada com sucesso. Atualize a página ou troque de aba para ver o status atualizado.")

                            if resultado:
                                st.write(resultado)

                        except Exception as erro:
                            st.error("Não foi possível registrar a decisão.")
                            st.exception(erro)

            st.markdown("### Histórico de decisões XML")
            historico_decisao_xml = sql_df(f"""
                SELECT
                    status_anterior,
                    status_novo,
                    perfil_id_vinculado_anterior,
                    perfil_id_vinculado_novo,
                    cliente_vinculado_nome_anterior,
                    cliente_vinculado_nome_novo,
                    motivo_anterior,
                    motivo_novo,
                    observacao_anterior,
                    observacao_nova,
                    decidido_por,
                    origem_alteracao,
                    criado_em
                FROM contabilidade_auxilio_nfe_candidato_decisao_log
                WHERE cpf_cnpj = '{candidato_cpf_cnpj}'
                ORDER BY criado_em DESC, id DESC;
            """)

            if historico_decisao_xml.empty:
                st.info("Ainda não existe histórico de decisão para este candidato.")
            else:
                tabela(historico_decisao_xml, 300)


    with aba6:
        st.subheader("🏛️ Alvarás, Licenças e Certidões")
        st.caption("Controles legais validados pela IA ou lançados manualmente: alvarás, licenças, certidões e vencimentos.")

        try:
            legais_df = sql_df("""
                SELECT
                    origem AS "Origem",
                    perfil_id AS "Perfil ID",
                    cliente_raiz_nome AS "Cliente",
                    cpf_cnpj_cliente AS "CPF/CNPJ",
                    tipo_controle AS "Tipo",
                    sistema_orgao AS "Órgão",
                    data_emissao AS "Emissão",
                    data_validade AS "Validade",
                    dias_para_vencer_calculado AS "Dias para vencer",
                    status_calculado AS "Status",
                    nome_arquivo AS "Arquivo",
                    caminho_drive AS "Caminho Drive"
                FROM vw_app_vencimentos
                WHERE origem IN ('ALVARA_LICENCA', 'CERTIDAO_NEGATIVA')
                ORDER BY
                    ordem_status,
                    data_validade NULLS FIRST,
                    cliente_raiz_nome,
                    tipo_controle;
            """)
        except Exception as erro:
            legais_df = pd.DataFrame()
            st.error("Não foi possível carregar Alvarás, Licenças e Certidões.")
            st.exception(erro)

        if legais_df.empty:
            st.info("Ainda não existem alvarás, licenças ou certidões ativas na view de vencimentos.")
        else:
            l1, l2, l3, l4 = st.columns(4)

            total_legais = len(legais_df)
            total_vencidos = int((legais_df["Status"].astype(str).str.upper() == "VENCIDO").sum())
            total_vencendo = int(legais_df["Status"].astype(str).str.upper().str.contains("VENCENDO", na=False).sum())
            total_em_dia = int((legais_df["Status"].astype(str).str.upper() == "EM_DIA").sum())

            l1.metric("Total legais", total_legais)
            l2.metric("Vencidos", total_vencidos)
            l3.metric("A vencer", total_vencendo)
            l4.metric("Em dia", total_em_dia)

            st.divider()

            f1, f2, f3 = st.columns([1, 1, 2])

            with f1:
                origens = ["Todos"] + sorted(legais_df["Origem"].dropna().astype(str).unique().tolist())
                filtro_origem_legal = st.selectbox(
                    "Origem",
                    origens,
                    key="filtro_origem_vencimentos_legais",
                    format_func=lambda x: humanizar_codigo_visual(x),
                )

            with f2:
                status_lista = ["Todos"] + sorted(legais_df["Status"].dropna().astype(str).unique().tolist())
                filtro_status_legal = st.selectbox(
                    "Status",
                    status_lista,
                    key="filtro_status_vencimentos_legais",
                    format_func=lambda x: humanizar_codigo_visual(x),
                )

            with f3:
                busca_legal = st.text_input(
                    "Buscar cliente, CNPJ, tipo, órgão ou arquivo",
                    key="busca_vencimentos_legais",
                )

            legais_filtrado = legais_df.copy()

            if filtro_origem_legal != "Todos":
                legais_filtrado = legais_filtrado[legais_filtrado["Origem"] == filtro_origem_legal]

            if filtro_status_legal != "Todos":
                legais_filtrado = legais_filtrado[legais_filtrado["Status"] == filtro_status_legal]

            if busca_legal.strip():
                termo = busca_legal.strip().lower()
                mask = (
                    legais_filtrado["Cliente"].astype(str).str.lower().str.contains(termo, na=False)
                    | legais_filtrado["CPF/CNPJ"].astype(str).str.lower().str.contains(termo, na=False)
                    | legais_filtrado["Tipo"].astype(str).str.lower().str.contains(termo, na=False)
                    | legais_filtrado["Órgão"].astype(str).str.lower().str.contains(termo, na=False)
                    | legais_filtrado["Arquivo"].astype(str).str.lower().str.contains(termo, na=False)
                )
                legais_filtrado = legais_filtrado[mask]

            st.metric("Itens filtrados", len(legais_filtrado))
            tabela(legais_filtrado, altura=360)

            st.info("Próxima melhoria: botões para inativar duplicado, abrir cliente, abrir histórico e gerar alertas por vencimento.")

        st.divider()

        st.subheader("Certificados digitais e procurações")
        venc = sql_df("""
            SELECT
                perfil_id,
                origem,
                status_calculado,
                razao_social_nome,
                cpf_cnpj_cliente,
                tipo_pessoa,
                tipo_controle,
                sistema_orgao,
                titular_responsavel,
                data_emissao,
                data_validade,
                dias_para_vencer_calculado,
                senha_status,
                caminho_drive,
                observacao
            FROM vw_app_vencimentos
            ORDER BY ordem_status, origem, razao_social_nome, tipo_controle;
        """)
        st.metric("Registros", len(venc))
        tabela(venc, 700)

        st.markdown("#### Atalho Certificados/Procurações para correção do cliente")

        if venc.empty:
            st.info("Nenhum certificado/procuração disponível para preparar edição.")
        else:
            venc_atalho = venc.copy()
            venc_atalho["_origem_visual"] = venc_atalho["origem"].map(humanizar_codigo_visual)
            venc_atalho["_tipo_controle_visual"] = venc_atalho["tipo_controle"].map(humanizar_codigo_visual)
            venc_atalho["_status_visual"] = venc_atalho["status_calculado"].map(humanizar_codigo_visual)

            venc_atalho["atalho_rotulo"] = (
                venc_atalho["perfil_id"].astype(str)
                + " | "
                + venc_atalho["razao_social_nome"].astype(str)
                + " | "
                + venc_atalho["cpf_cnpj_cliente"].astype(str)
                + " | "
                + venc_atalho["_origem_visual"].astype(str)
                + " | "
                + venc_atalho["_tipo_controle_visual"].astype(str)
                + " | "
                + venc_atalho["_status_visual"].astype(str)
            )

            venc_item_atalho = st.selectbox(
                "Selecionar certificado/procuração para abrir o cliente na aba 🔎 Cliente",
                venc_atalho["atalho_rotulo"].tolist(),
                key="atalho_vencimentos_cliente_select",
            )

            if st.button("Preparar cliente de Certificados/Procurações para edição", key="btn_preparar_cliente_vencimentos"):
                venc_atalho_linha = venc_atalho[
                    venc_atalho["atalho_rotulo"] == venc_item_atalho
                ].iloc[0]

                st.session_state["perfil_id_preselecionado"] = int(venc_atalho_linha["perfil_id"])
                st.session_state["cliente_preselecionado_nome"] = str(venc_atalho_linha["razao_social_nome"])
                st.session_state["abrir_cliente_automatico"] = True
                st.rerun()

                st.success(
                    "Cliente preparado para edição. Agora clique na aba 🔎 Cliente: ele já estará selecionado."
                )
                st.rerun()

except Exception as e:
    st.error("Erro ao carregar o painel.")
    st.exception(e)
