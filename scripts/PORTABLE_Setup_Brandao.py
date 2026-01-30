import json
import os
import sys
import tkinter as tk
from tkinter import messagebox

# DADOS DOS 69 CLIENTES EMBUTIDOS DIRETAMENTE NO CÓDIGO (SEGURANÇA 2026)
# Isso torna o EXE 100% independente de arquivos externos.
def get_client_data():
    return [
        {
                "id": "26c598e9-508f-4138-b324-795feb9859bd",
                "nome": "AABB SIDROLANDIA",
                "doc": "03997574000174",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "a3ec4908-b3bb-4622-9f0b-3a1f1c5a9759",
                "nome": "AGROPECUARIA ITAOCA LTDA",
                "doc": "49915583000170",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "642bee42-f6a1-45fc-b8a2-ddd196608748",
                "nome": "ALESSANDRO BRANDÃO",
                "doc": "",
                "is_pj": False,
                "unidades": []
        },
        {
                "id": "bedb1207-504a-434e-acf7-bce5d2c83426",
                "nome": "ALEXANDRE GAMA / TONI",
                "doc": "19003363000109",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "6433e171-5c93-4a05-a1d9-3a87ff97a1de",
                "nome": "ALVES ADVOGADOS",
                "doc": "18238449000158",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "691a025a-c2c5-4cc7-8b69-5d4d52ecaaf1",
                "nome": "ANA LUCIA GOMES FRISO",
                "doc": "30788153000106",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "09e846e5-37c7-4e90-af83-497d86e301a2",
                "nome": "ANTONIO M. NANTES",
                "doc": "81279876115",
                "is_pj": False,
                "unidades": []
        },
        {
                "id": "7c10ea9e-91c3-4615-b8d5-6a95c7f8bb47",
                "nome": "AROLDO FERREIRA CORREA",
                "doc": "07388152172",
                "is_pj": False,
                "unidades": []
        },
        {
                "id": "c1e492f4-0a2f-4470-8932-1aeb1366554e",
                "nome": "AROLDO FERREIRA CORREA JUNIOR",
                "doc": "63922258115",
                "is_pj": False,
                "unidades": []
        },
        {
                "id": "2a2c7e1b-ade6-412d-a8be-552f0290b5fb",
                "nome": "A. S. CHAVES LTDA",
                "doc": "17448680000103",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "3c26c394-f047-428d-861b-be2f2b4a0975",
                "nome": "CADU CALHAS",
                "doc": "27012117000141",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "247a9731-cb49-4f77-8f2e-d9f2582e9b7c",
                "nome": "CAMPESTRE FLORES LTDA",
                "doc": "05156503000174",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "35b8bfc4-5795-4b68-ae7f-1ef4c14887c0",
                "nome": "CATITA",
                "doc": "36821640149",
                "is_pj": False,
                "unidades": []
        },
        {
                "id": "0fd89d2d-347e-4003-b932-885d09662605",
                "nome": "CRISTINA CAPAO SECO",
                "doc": "13379585000144",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "5692495d-e353-4e60-ba53-556c7be0d44d",
                "nome": "DENISE GRANATA NOGUEIRA DE SOUZA",
                "doc": "02867525659",
                "is_pj": False,
                "unidades": []
        },
        {
                "id": "f1155760-2099-448d-8133-bdc0891a148e",
                "nome": "DENISE GRANATA NOGUEIRA DE SOUZA LTDA",
                "doc": "33759967000100",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "f075eda0-aaed-49c2-a0fe-4c6246c4d256",
                "nome": "D. F. DOS SANTOS LTDA",
                "doc": "49315073000161",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "ffb3be60-2c3f-415b-bce9-059eed37f8cd",
                "nome": "DONIZETE CRUZEIRO",
                "doc": "107984000104",
                "is_pj": False,
                "unidades": []
        },
        {
                "id": "36d4ccd3-0ecf-41bd-8000-fe4b87f795f1",
                "nome": "DORIVAL  BASSO",
                "doc": "10520392191",
                "is_pj": False,
                "unidades": [
                        {
                                "cliente_id": "36d4ccd3-0ecf-41bd-8000-fe4b87f795f1",
                                "nome_identificador": "GERAL",
                                "inscricao_estadual": None,
                                "tipo_unidade": "PROPRIEDADE_RURAL"
                        }
                ]
        },
        {
                "id": "320b2346-e722-4e6c-aa36-5bb1778eddcd",
                "nome": "E. A. SORRILHA LTDA",
                "doc": "48016429000101",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "24391511-15b1-41e0-b981-16217a3ca395",
                "nome": "EDUARDO BASSO",
                "doc": "98289497172",
                "is_pj": False,
                "unidades": [
                        {
                                "cliente_id": "24391511-15b1-41e0-b981-16217a3ca395",
                                "nome_identificador": "GERAL",
                                "inscricao_estadual": None,
                                "tipo_unidade": "PROPRIEDADE_RURAL"
                        }
                ]
        },
        {
                "id": "60c6ebdf-1173-49df-a435-dcff1fe37479",
                "nome": "ELVIS LEANDRO",
                "doc": "00378723111",
                "is_pj": False,
                "unidades": []
        },
        {
                "id": "0f4ec71d-08d6-4f35-86e5-206e0c55759d",
                "nome": "E. RODRIGUERO",
                "doc": "11734727000119",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "6eb4f1db-89a3-4e73-8926-ea9ddb11a078",
                "nome": "FRUTILANDIA SERVIÇOS",
                "doc": "39604629000186",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "fd3ea2d4-9d14-43ce-a661-2274f32f2a5c",
                "nome": "GETULIO RODRIGUES",
                "doc": "",
                "is_pj": False,
                "unidades": []
        },
        {
                "id": "f7c5e437-822b-4d8d-b9ee-ecf7ee36a6b1",
                "nome": "GETULIO SCAPINELE",
                "doc": "39175235900",
                "is_pj": False,
                "unidades": [
                        {
                                "cliente_id": "f7c5e437-822b-4d8d-b9ee-ecf7ee36a6b1",
                                "nome_identificador": "GERAL",
                                "inscricao_estadual": None,
                                "tipo_unidade": "PROPRIEDADE_RURAL"
                        }
                ]
        },
        {
                "id": "4687133d-d63c-452a-a640-bab2f34e5475",
                "nome": "GORDO",
                "doc": "78567300134",
                "is_pj": False,
                "unidades": [
                        {
                                "cliente_id": "4687133d-d63c-452a-a640-bab2f34e5475",
                                "nome_identificador": "GERAL",
                                "inscricao_estadual": None,
                                "tipo_unidade": "PROPRIEDADE_RURAL"
                        }
                ]
        },
        {
                "id": "ca8d5e48-1a45-45c3-b8f6-60f23edc5b9e",
                "nome": "HELENA MEDEIROS",
                "doc": "19805060000100",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "81285b39-6a9e-434d-b4a4-1d9cbd2cfee6",
                "nome": "HELIO",
                "doc": "02486911120",
                "is_pj": False,
                "unidades": []
        },
        {
                "id": "c4f2527a-9f8a-4abb-b876-7490be7e7d8c",
                "nome": "HELIO MOURA",
                "doc": "",
                "is_pj": False,
                "unidades": [
                        {
                                "cliente_id": "c4f2527a-9f8a-4abb-b876-7490be7e7d8c",
                                "nome_identificador": "GERAL",
                                "inscricao_estadual": None,
                                "tipo_unidade": "PROPRIEDADE_RURAL"
                        }
                ]
        },
        {
                "id": "8dc67625-70d9-48e6-91d9-a1deabace2a2",
                "nome": "IGNACIO TRANSPORTES",
                "doc": "31643384000194",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "4f627487-77c8-46fd-8a6f-69909f674083",
                "nome": "ITACIR BONADIMAN",
                "doc": "25783890120",
                "is_pj": False,
                "unidades": []
        },
        {
                "id": "896ba617-ac4e-4a49-a975-6d9677fa7ae3",
                "nome": "ITA TRANSPORTES",
                "doc": "",
                "is_pj": False,
                "unidades": []
        },
        {
                "id": "402a7fbb-0285-4469-b9fd-5b26ccb55019",
                "nome": "JORGE KAMADA",
                "doc": "759589100",
                "is_pj": False,
                "unidades": []
        },
        {
                "id": "0dd68bbc-050c-4393-ac8d-28920075fccc",
                "nome": "JOSE ADEMIR GABARDO",
                "doc": "08217980000190",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "75b9b38d-6512-4b25-bb20-d20942228e73",
                "nome": "JOSE JULIO ABRITA",
                "doc": "13950835172",
                "is_pj": False,
                "unidades": []
        },
        {
                "id": "f2bf9e92-0d20-4fa1-ae55-30e048e34ab5",
                "nome": "J. P. ALCARAS LTDA",
                "doc": "52660916000171",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "7a628233-1b3a-46ad-8519-44768d039170",
                "nome": "JULIANO ELETRONICA",
                "doc": "47484139000111",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "52cde061-0693-4bd0-b58e-d41f9920b0ab",
                "nome": "LAURO FERREIRA DA SILVA",
                "doc": "",
                "is_pj": False,
                "unidades": []
        },
        {
                "id": "614fb008-4f04-4207-9394-3564cea3f348",
                "nome": "L. H. C. BENITES LTDA",
                "doc": "23314077000131",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "34b64bd6-bb0c-4b35-9f12-2e0021a148c2",
                "nome": "LUCIANA",
                "doc": "73266434072",
                "is_pj": False,
                "unidades": [
                        {
                                "cliente_id": "34b64bd6-bb0c-4b35-9f12-2e0021a148c2",
                                "nome_identificador": "GERAL",
                                "inscricao_estadual": None,
                                "tipo_unidade": "PROPRIEDADE_RURAL"
                        }
                ]
        },
        {
                "id": "094d6c27-5cb6-44f0-bf9f-4f65d28aa78d",
                "nome": "LUIZ MARIO",
                "doc": "23741937134",
                "is_pj": False,
                "unidades": [
                        {
                                "cliente_id": "094d6c27-5cb6-44f0-bf9f-4f65d28aa78d",
                                "nome_identificador": "GERAL",
                                "inscricao_estadual": None,
                                "tipo_unidade": "PROPRIEDADE_RURAL"
                        }
                ]
        },
        {
                "id": "7d861f7d-c63f-430d-a59d-2f535985a0a0",
                "nome": "MAP LTDA",
                "doc": "45669746000120",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "285da41f-c57c-4d37-8e2c-e8633e641ef4",
                "nome": "MAQUITA",
                "doc": "",
                "is_pj": False,
                "unidades": [
                        {
                                "cliente_id": "285da41f-c57c-4d37-8e2c-e8633e641ef4",
                                "nome_identificador": "FAZENDA MAQUITA",
                                "inscricao_estadual": None,
                                "tipo_unidade": "PROPRIEDADE_RURAL"
                        }
                ]
        },
        {
                "id": "5ee9d905-57e3-42f1-9d3e-c5df53c5e1c8",
                "nome": "MARCOS BRUNO NANTES",
                "doc": "77338170134",
                "is_pj": False,
                "unidades": [
                        {
                                "cliente_id": "5ee9d905-57e3-42f1-9d3e-c5df53c5e1c8",
                                "nome_identificador": "FAZENDA LAGOA",
                                "inscricao_estadual": None,
                                "tipo_unidade": "PROPRIEDADE_RURAL"
                        }
                ]
        },
        {
                "id": "ce47a50f-212e-4083-98e9-f10d7de87ac6",
                "nome": "MARLENE  LEDUR",
                "doc": "92156240159",
                "is_pj": False,
                "unidades": []
        },
        {
                "id": "8873801d-e19f-4c2c-aefb-4f0406b1d7b2",
                "nome": "MAURICIO CORREA GARCIA JUNIOR",
                "doc": "81569777187",
                "is_pj": False,
                "unidades": [
                        {
                                "cliente_id": "8873801d-e19f-4c2c-aefb-4f0406b1d7b2",
                                "nome_identificador": "GERAL",
                                "inscricao_estadual": None,
                                "tipo_unidade": "PROPRIEDADE_RURAL"
                        },
                        {
                                "cliente_id": "8873801d-e19f-4c2c-aefb-4f0406b1d7b2",
                                "nome_identificador": "FAZENDA PAULICEIA",
                                "inscricao_estadual": None,
                                "tipo_unidade": "PROPRIEDADE_RURAL"
                        }
                ]
        },
        {
                "id": "6cc8d265-1d04-4e65-9642-f98a1901e714",
                "nome": "MAYARA NOGUEIRA",
                "doc": "21592460000126",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "67807290-bc7f-4387-ad44-3d511b654efe",
                "nome": "MG PETS LTDA",
                "doc": "35683261000138",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "d4bc6a37-8c52-453c-8094-0339f9e9a3e1",
                "nome": "ODILON",
                "doc": "13881388915",
                "is_pj": False,
                "unidades": [
                        {
                                "cliente_id": "d4bc6a37-8c52-453c-8094-0339f9e9a3e1",
                                "nome_identificador": "GERAL",
                                "inscricao_estadual": None,
                                "tipo_unidade": "PROPRIEDADE_RURAL"
                        }
                ]
        },
        {
                "id": "1275d61d-b1d8-41a1-9aec-fc5198332740",
                "nome": "ODON BARBOSA",
                "doc": "36778877120",
                "is_pj": False,
                "unidades": [
                        {
                                "cliente_id": "1275d61d-b1d8-41a1-9aec-fc5198332740",
                                "nome_identificador": "GERAL",
                                "inscricao_estadual": None,
                                "tipo_unidade": "PROPRIEDADE_RURAL"
                        }
                ]
        },
        {
                "id": "5a866b30-8c0b-437f-bd1c-27162a2b3255",
                "nome": "PATRICIANE",
                "doc": "48017076000156",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "6b13fb2e-f402-4d6d-9d7c-ca0310e7d564",
                "nome": "PEDRO SUMIDA",
                "doc": "43666450172",
                "is_pj": False,
                "unidades": [
                        {
                                "cliente_id": "6b13fb2e-f402-4d6d-9d7c-ca0310e7d564",
                                "nome_identificador": "GERAL",
                                "inscricao_estadual": None,
                                "tipo_unidade": "PROPRIEDADE_RURAL"
                        }
                ]
        },
        {
                "id": "2dd5ccd2-cb92-4373-a16b-0409e4953a72",
                "nome": "PONTOCOM LTDA",
                "doc": "14864845000130",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "a22fdef3-6d9a-4250-ac52-ce0eb91f6898",
                "nome": "REDSON BONADIMAN",
                "doc": "03975724170",
                "is_pj": False,
                "unidades": []
        },
        {
                "id": "34b68103-4494-42f5-adc8-4bdd44c352ee",
                "nome": "RESTAURANTE COMIDA CASEIRA LTDA",
                "doc": "29170086000182",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "d0907d08-4a67-4a0f-ad77-fad91b76be47",
                "nome": "RISALVA SOARES DE LACERDA",
                "doc": "07710657000191",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "424b765a-61d6-4bc0-89d8-ba50ccaf2ead",
                "nome": "ROSENI",
                "doc": "13985507104",
                "is_pj": False,
                "unidades": [
                        {
                                "cliente_id": "424b765a-61d6-4bc0-89d8-ba50ccaf2ead",
                                "nome_identificador": "GERAL",
                                "inscricao_estadual": None,
                                "tipo_unidade": "PROPRIEDADE_RURAL"
                        }
                ]
        },
        {
                "id": "f18c7137-c2cd-4d7a-97bf-fc4a6997b692",
                "nome": "RUBENS",
                "doc": "31197752153",
                "is_pj": False,
                "unidades": []
        },
        {
                "id": "7da40d9b-a186-40aa-80fe-132f09c39fe4",
                "nome": "SEILA",
                "doc": "98595814104",
                "is_pj": False,
                "unidades": []
        },
        {
                "id": "81363889-3c67-4c74-b483-f1b9da6c03c4",
                "nome": "SERGIO KAMADA",
                "doc": "29824915168",
                "is_pj": False,
                "unidades": [
                        {
                                "cliente_id": "81363889-3c67-4c74-b483-f1b9da6c03c4",
                                "nome_identificador": "GERAL",
                                "inscricao_estadual": None,
                                "tipo_unidade": "PROPRIEDADE_RURAL"
                        }
                ]
        },
        {
                "id": "d4dfd6bd-b02c-4e5f-b6fc-3b8ec93753fa",
                "nome": "SOARES E LACERDA",
                "doc": "07206463000153",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "ecc15e43-1445-4089-826f-c9f7b7dfb8f7",
                "nome": "STAR SHOP",
                "doc": "43649257000181",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "7d2a4ab3-353b-4bb7-95ba-691914558724",
                "nome": "STUMER",
                "doc": "19667590020",
                "is_pj": False,
                "unidades": []
        },
        {
                "id": "154269c6-524a-4aaf-9600-d6bb108d4ebe",
                "nome": "TV PLANALTO TELECOMUNICACOES INFORMACOES E NEGOCIOS LTDA",
                "doc": "21445482000163",
                "is_pj": True,
                "unidades": []
        },
        {
                "id": "46df6e3f-8a6c-441d-ac0e-fecb8c52d583",
                "nome": "VALDECIR GIBIM",
                "doc": "98536214953",
                "is_pj": False,
                "unidades": [
                        {
                                "cliente_id": "46df6e3f-8a6c-441d-ac0e-fecb8c52d583",
                                "nome_identificador": "GERAL",
                                "inscricao_estadual": None,
                                "tipo_unidade": "PROPRIEDADE_RURAL"
                        }
                ]
        },
        {
                "id": "fd2de9c0-15d1-4661-a51a-c2527e62f58f",
                "nome": "VALDIR SORRILHA",
                "doc": "00493588809",
                "is_pj": False,
                "unidades": []
        },
        {
                "id": "edebfe8c-88d3-45a3-acca-dc20361d430d",
                "nome": "WALDOMIRO  MOLINA",
                "doc": "12648736972",
                "is_pj": False,
                "unidades": []
        },
        {
                "id": "f12f137c-45d1-401a-8136-c783b30c3ae0",
                "nome": "W. P. FRANCA SOARES",
                "doc": "28503192000178",
                "is_pj": True,
                "unidades": []
        }
]

ROOT_DIR = "C:\\Brandao_Contabilidade"

MONTHS = ["01_Janeiro", "02_Fevereiro", "03_Marco", "04_Abril", "05_Maio", "06_Junho", "07_Julho", "08_Agosto", "09_Setembro", "10_Outubro", "11_Novembro", "12_Dezembro", "13_Salario"]
RH_CATEGORIES = ["AVISO_PREVIO", "FGTS", "FICHAS_EMPREGADOS", "INSS", "PEDIDO_REGISTRO", "RECIBO_FERIAS", "RECIBO_FOLHA", "RECIBO_RESCISAO"]
YEARS = ["2024", "2025", "2026"]

def clean_name(name):
    for char in r'<>:"/\\|?*':
        name = name.replace(char, '_')
    return name.strip()

def process_unit_folders(base_path):
    fiscal_path = os.path.join(base_path, "01 - FISCAL")
    for y in YEARS:
        for m in MONTHS:
            if m == "13_Salario": continue
            os.makedirs(os.path.join(fiscal_path, y, m), exist_ok=True)
            
    rh_path = os.path.join(base_path, "02 - RH")
    for cat in RH_CATEGORIES:
        for y in YEARS:
            for m in MONTHS:
                if m == "13_Salario" and cat not in ["RECIBO_FOLHA", "RECIBO_FERIAS"]:
                    continue
                os.makedirs(os.path.join(rh_path, cat, y, m), exist_ok=True)
                
    guias_path = os.path.join(base_path, "03 - IMPOSTOS E GUIAS")
    for y in YEARS:
        for m in MONTHS:
            if m == "13_Salario": continue
            os.makedirs(os.path.join(guias_path, y, m), exist_ok=True)

def run_setup():
    root = tk.Tk()
    root.withdraw()
    
    try:
        clientes = get_client_data()
        
        for c in clientes:
            safe_name = clean_name(c['nome'])
            client_folder = os.path.join(ROOT_DIR, f"{safe_name} ({c['doc']})")
            
            static_folders = [
                "01 - CND (Certidões Negativas)", "02 - PENDÊNCIAS FISCAIS (Federal, Estadual, Municipal)",
                "03 - DOCUMENTOS PESSOAIS", "04 - CERTIFICADO DIGITAL", "05 - DOCUMENTOS TERRA",
                "06 - IRPF", "07 - JUNTA COMERCIAL", "08 - FATURAMENTO", "09 - CAEPF"
            ]
            
            for sf in static_folders:
                os.makedirs(os.path.join(client_folder, sf), exist_ok=True)
                
            unidades = c.get('unidades', [])
            op_root = os.path.join(client_folder, "10 - RH - ESCRITA - CONTABILIDADE")
            
            if not unidades:
                process_unit_folders(op_root)
            else:
                for idx, u in enumerate(unidades, start=1):
                    u_ident = clean_name(u['nome_identificador'].upper())
                    ie = u.get('inscricao_estadual', '')
                    label = f"{idx:02d} - {u_ident}"
                    if ie: label += f" - IE {ie}"
                    process_unit_folders(os.path.join(op_root, label))

        messagebox.showinfo("Sucesso", f"Estrutura de {len(clientes)} clientes criada com sucesso no disco C:!")
    except Exception as e:
        messagebox.showerror("Erro", f"Ocorreu um erro fatal: {e}")

if __name__ == "__main__":
    run_setup()
