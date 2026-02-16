
import os
import psycopg2
from dotenv import load_dotenv
from difflib import SequenceMatcher

load_dotenv('.env.local')

# LISTA MESTRA FORNECIDA PELO USUÁRIO (15/02/2026)
# Formato: Chave (Nome Normalizado) -> Documento (Limpo)
CLIENTES_DATA = {
    "A BARATEIRA": "15550023000147",
    "AABB": "03997574000174",
    "AFAGAS": "24529076000177",
    "AGRO PET AVENIDA": "57792259000130",
    "ALCIONE MARTINS": "58878384000120",
    "ALEXANDRE GAMA": "19003363000109",
    "AMADO": "37189966000129",
    "ANA ÓTICAS": "30788153000106",
    "ANTONIO M. NANTES": "81279876115",
    "APM DARCY RIBEIRO": "02427937000173",
    "APM VESPASIANO": "37226693000145",
    "AROLDO JR": "63922258115",
    "AROLDO JUNIOR TESHA": "01325908000138",
    "AROLDO AGRO TESHA": "51095825000178",
    "AROLDO CORREA PARTICIPAÇÃO": "50720854000110",
    "AROLDO AGRO ITAOCA MATRIZ": "49915583000170",
    "AROLDO AGRO ITAOCA FILIAL": "49915583000250",
    "AROLDO ITAOCA PARTICIPAÇÃO": "49916243000163",
    "AROLDO AGRO FURNA MATRIZ": "49699495000188",
    "AROLDO FURNA PARTICIPAÇÃO": "49720313000103",
    "ASSOCIAÇÃO APOSENTADOS": "64308522000138",
    "ASSOCIACAO DO ASSENTAMENTO": "27895806000141",
    "BRANDÃO": "17448680000103",
    "C BUZZI": "08704388000113",
    "CAMPESTRE": "05156503000174",
    "COMERCIO CARVAO STA LAURA": "27520487000190",
    "CATITA": "36821640149",
    "COMIDA CASEIRA": "29170086000182",
    "CRISTINA": "13379585000144",
    "CRISTIANO KADU PIZZA": "14072880000116",
    "DANIEL ADVOGADO": "18238449000158",
    "DENISE": "02867525659",
    "DENISE PJ": "33759967000100",
    "DONIZETE CRUZEIRO": "00107984000104",
    "DORIVAL": "10520392191",
    "ELIAQUIM": "48016429000101",
    "ELIS CADU": "11734727000119",
    "EMA GRANATA": "91508967687",
    "ELEOZINA": "42136938134",
    "EVANIZE": "47390734000198",
    "LUIZ MARIO": "23741937134",
    "ITAOCA": "07388152172",
    "NOVO PARAISO": "00378723111",
    "PANTANAL": "02486911120",
    "RONDA EDUARDO": "98289497172",
    "FRANCISCO": "09547585000139",
    "FRANCISCO RECHE": "25779176191",
    "FRANCISCON PIZZARIA": "49315073000161",
    "FRUTILANDIA SERVIÇOS": "39604629000186",
    "GABARDO": "08217980000190",
    "GETULIO SCAPINELE": "39175235900",
    "GORDO": "78567300134",
    "GUINOMAR": "07402716104",
    "HELENA MEDEIROS": "19805060000100",
    "ITACIR": "25783890120",
    "ITACIR PJ": "44276498000195",
    "IVO IGNACIO": "31643384000194",
    "IZABEL POUSADA": "28382172000196",
    "JANICE": "71087427134",
    "JAQUES": "78560292187",
    "JORGE KAMADA": "00759589100",
    "JOSE JULIO": "13950835172",
    "JULIANO CESAR": "47484139000111",
    "JUNIOR ENERGISA": "52660916000171",
    "KADU": "07807596000185",
    "CADU CALHAS": "27012117000141",
    "LAURO JUNIOR": "97137669972",
    "LEONEL DE ABREU": "25085344120",
    "LEONILDA TOSO": "68101120068",
    "L H C SERVIÇOS": "23314077000131",
    "LIONS": "15554033000150",
    "LUCAS JIMENES": "36659620000184",
    "LUCAS TRUFFI": "53474387000184",
    "LUCIANA": "73266434072",
    "MAP": "45669746000120",
    "MARCOS NANTES": "77338170134",
    "MARCO AURELIO": "23092394100",
    "MARLENE LEDUR": "92156240159",
    "MAURICIO CORREA": "81569777187",
    "MAURICIO LACERDA": "50259631000106",
    "MAYARA NOGUEIRA": "21592460000126",
    "MG PETS": "35683261000138",
    "MOLINA": "12648736972",
    "NATALIA": "17879652000140",
    "ODILON": "13881388915",
    "ODON": "36778877120",
    "OUZIEL MERCADO": "60500004000160",
    "PATRICIANE": "48017076000156",
    "PAULO FRUTILANDIA": "49261236000170",
    "PAULO NANTES": "17209374191",
    "PAULO SEGURANÇA": "22112893000108",
    "PEDRO SUMIDA": "43666450172",
    "RICARDO": "14864845000130",
    "RISALVA": "07710657000191",
    "ROSENI": "13985507104",
    "RUBENS": "31197752153",
    "RUSTICOS": "32087250000105",
    "SEILA": "98595814104",
    "SERGIO KAMADA": "29824915168",
    "SGW": "19831640000171",
    "SOARES & LACERDA": "07206463000153",
    "STAR SHOP": "43649257000181",
    "STUMER": "19667590020",
    "SUPERMERCADO FRUTILANDIA": "04792962000181",
    "TECHVANCE": "54499732000105",
    "TENDA ESPIRITUALIDADE": "40413195000116",
    "TV PLANALTO": "21445482000163",
    "VALDECIR": "98536214953",
    "VALDIR SORRILHA": "00493588809",
    "VASCO": "33884498134",
    "WILCELENE": "28503192000178"
}

def clean_doc(doc):
    return ''.join(filter(str.isdigit, doc))

def similar(a, b):
    return SequenceMatcher(None, a.upper(), b.upper()).ratio()

def main():
    print("🧠 Cruzando dados da Planilha com o Banco...")
    
    db_url = os.environ.get("DATABASE_URL")
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()

    # Buscar todas empresas do banco
    cur.execute("SELECT id, razao_social FROM core.empresas")
    empresas_banco = cur.fetchall()
    
    updates = 0
    
    for emp in empresas_banco:
        emp_id = emp[0]
        emp_nome = emp[1]
        
        # Tentar encontrar MATCH manual na lista
        achou = False
        melhor_match = None
        maior_score = 0
        
        for nome_lista, doc_lista in CLIENTES_DATA.items():
            # 1. Match Perfeito (Contém)
            if nome_lista.upper() in emp_nome.upper():
                doc_limpo = clean_doc(doc_lista)
                cur.execute("UPDATE core.empresas SET documento = %s WHERE id = %s", (doc_limpo, emp_id))
                print(f"✅ MATCH EXATO: {emp_nome} -> {doc_limpo} ({nome_lista})")
                achou = True
                updates += 1
                break
            
            # 2. Match Similaridade (Fuzzy)
            score = similar(nome_lista, emp_nome)
            if score > 0.8 and score > maior_score:
                maior_score = score
                melhor_match = (nome_lista, doc_lista)

        if not achou and melhor_match:
            doc_limpo = clean_doc(melhor_match[1])
            print(f"⚠️ MATCH SIMILAR ({maior_score:.2f}): {emp_nome} -> {doc_limpo} ({melhor_match[0]})")
            cur.execute("UPDATE core.empresas SET documento = %s WHERE id = %s", (doc_limpo, emp_id))
            updates += 1

    conn.commit()
    print(f"\n🎉 Total atualizado: {updates} de {len(empresas_banco)} empresas.")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    main()
