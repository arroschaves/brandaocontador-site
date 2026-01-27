"""
CORREÇÃO CRÍTICA: brandao_enrich.py

PROBLEMA IDENTIFICADO:
- O script está CRIANDO novos clientes em vez de ATUALIZAR existentes
- Criou 122 clientes com nome NULL
- Duplicou todos os clientes

SOLUÇÃO:
- Desabilitar COMPLETAMENTE a criação de novos clientes
- Apenas ATUALIZAR clientes existentes
"""

import os
import json
from supabase import create_client

# Configuração Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

class BrandaoEnricher:
    def __init__(self):
        self.supabase = supabase
    
    def enrich_all(self):
        """
        Enriquece dados dos clientes EXISTENTES.
        
        REGRA CRÍTICA: NUNCA cria novos clientes!
        Apenas atualiza clientes que já existem no banco.
        """
        print("🧠 ENRIQUECENDO DADOS NO CRM...")
        
        # Carregar relatório de arquivos
        with open("public/automation_report.json", "r", encoding="utf-8") as f:
            files = json.load(f)
        
        # Processar apenas XMLs (para extrair razão social)
        xml_files = [f for f in files if f.get("doc_type") == "NFE_XML"]
        
        print(f"📄 Encontrados {len(xml_files)} XMLs para processar")
        
        for xml_file in xml_files:
            try:
                # Extrair dados do XML
                razao_social = self.extract_razao_social(xml_file["path"])
                
                if not razao_social:
                    continue
                
                # BUSCAR cliente existente por razão social
                result = self.supabase.table("clientes").select("*").ilike("razao_social", f"%{razao_social}%").execute()
                
                if result.data and len(result.data) > 0:
                    # Cliente EXISTE - atualizar
                    client_id = result.data[0]["id"]
                    
                    # ⚠️ NUNCA atualizar o campo "nome" (nome fantasia)
                    # Apenas atualizar razao_social se estiver vazio
                    if not result.data[0].get("razao_social"):
                        self.supabase.table("clientes").update({
                            "razao_social": razao_social
                        }).eq("id", client_id).execute()
                        
                        print(f"✅ Atualizado: {razao_social}")
                else:
                    # Cliente NÃO existe - IGNORAR (não criar!)
                    print(f"⏭️ Cliente não encontrado (ignorando): {razao_social}")
                    
            except Exception as e:
                print(f"❌ Erro ao processar {xml_file['name']}: {e}")
        
        print("✅ Enriquecimento concluído!")
    
    def extract_razao_social(self, xml_path):
        """Extrai razão social do XML"""
        # TODO: Implementar extração real do XML
        # Por enquanto, retorna None
        return None

if __name__ == "__main__":
    enricher = BrandaoEnricher()
    enricher.enrich_all()
