import os
import json

DIR = r"e:\PROJETOS\brandaocontador-site\workflow_n8n_baixados_criados_projeto"

TABLE_MAP = {
    "clientes": "core.empresas",
    "atendimentos": "core.atendimentos",
    "unidades_fiscais": "core.unidades_fiscais",
    "obrigacoes_acessorias": "fiscal.calendario",
    "obrigacoes_templates": "fiscal.obrigacoes_templates",
    "activity_log": "audit.logs"
}

def fix_workflow(filepath):
    print(f"🔧 Corrigindo: {os.path.basename(filepath)}")
    with open(filepath, 'r', encoding='utf-8') as f:
        workflow = json.load(f)
    
    modified = False
    
    # Percorrer todos os nós
    for node in workflow.get('nodes', []):
        if node.get('type') == 'n8n-nodes-base.supabase':
            params = node.get('parameters', {})
            table_id = params.get('tableId')
            
            if table_id in TABLE_MAP:
                old = table_id
                new = TABLE_MAP[table_id]
                params['tableId'] = new
                print(f"  ✅ [Node: {node['name']}] Tabela {old} -> {new}")
                modified = True
            
            # Alguns nós usam tableId em filters
            if 'filters' in params:
                # O Supabase node v1 em n8n tem uma estrutura específica para filtros
                pass # usually it uses the top-level tableId for the query context

        # Corrigir referências de campos em expressões se necessário
        # Nota: razao_social vs nome. 
        # Vou assumir que 'nome' deve ser mantido se o usuário preferir, 
        # mas no core.empresas o campo principal é razao_social.
        # Vou deixar as expressões como estão por enquanto para evitar quebrar lógica visual, 
        # a menos que eu tenha certeza que o campo 'nome' não existe no core.empresas.
        # No core.empresas, eu criei 'razao_social' e 'nome' (fantasia). Então deve funcionar.

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(workflow, f, indent=2, ensure_ascii=False)
        print(f"  💾 Salvo com sucesso.")
    else:
        print(f"  ∅ Nenhuma alteração necessária.")

def main():
    for filename in os.listdir(DIR):
        if filename.endswith(".json"):
            fix_workflow(os.path.join(DIR, filename))

if __name__ == "__main__":
    main()
