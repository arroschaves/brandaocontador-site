import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logAudit } from '@/lib/utils/audit';
// @ts-ignore
import pdfParse from 'pdf-parse';

// Export for Edge/Node compatibility. pdf-parse requires Node.js runtime.
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
        }

        // 1. Converter Arquivo Padrão para Buffer NodeJS
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 2. Extrair Texto do PDF (Maestro Vision OCR/Parsing)
        let extractedText = '';
        try {
            const data = await pdfParse(buffer);
            extractedText = data.text;
        } catch (parseErr) {
            console.error('[Vision] Erro ao ler PDF:', parseErr);
            return NextResponse.json({ error: 'Falha ao processar o conteúdo do PDF. Certifique-se de que não é uma imagem escaneada sem texto.' }, { status: 422 });
        }

        // 3. Mineração de Metadados (RegEx Engine)
        // Busca CNPJ padrão: 00.000.000/0000-00 ou números puros
        const cnpjMatch = extractedText.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}/) || extractedText.match(/\d{14}/);
        const cnpjStr = cnpjMatch ? cnpjMatch[0].replace(/[^\d]/g, '') : null;

        // Identificação de Competência (Ex: 01/2026, jan/2026)
        const compMatch = extractedText.match(/(0[1-9]|1[0-2])\/(20\d{2})/);
        const competencia = compMatch ? compMatch[0] : null;

        // Identificação do Tipo de Documento
        let tipoDocumento = 'Outros';
        const txtUpper = extractedText.toUpperCase();
        if (txtUpper.includes('DOCUMENTO DE ARRECADAÇÃO DO SIMPLES NACIONAL') || txtUpper.includes('DAS')) {
            tipoDocumento = 'DAS';
        } else if (txtUpper.includes('FUNDO DE GARANTIA') || txtUpper.includes('FGTS')) {
            tipoDocumento = 'FGTS';
        } else if (txtUpper.includes('DOCUMENTO DE ARRECADAÇÃO DE RECEITAS FEDERAIS') || txtUpper.includes('DARF')) {
            tipoDocumento = 'DARF';
        } else if (txtUpper.includes('RECIBO DE ENTREGA') && txtUpper.includes('DCTFWEB')) {
            tipoDocumento = 'DCTFWeb';
        }

        // 4. Inteligência de Roteamento (Supabase)
        const supabase = await createClient();
        let empresaId = null;
        let driveFolderId = null;
        let razaoSocial = 'Empresa Desconhecida';

        if (cnpjStr) {
            const { data: empresa } = await supabase
                .schema('core')
                .from('empresas')
                .select('id, razao_social, drive_folder_id')
                .eq('cnpj', cnpjStr)
                .maybeSingle(); // Contornando o 406 Not Acceptable caso CNPJ não exista

            if (empresa) {
                empresaId = empresa.id;
                razaoSocial = empresa.razao_social;
                driveFolderId = empresa.drive_folder_id;
            }
        }

        // 5. Motor de Resposta
        // Neste momento a API apenas detecta e devolve a sugestão para a UI aceitar/reenviar ao Drive
        // Futuramente pode estender para enviar ao Google Drive direto daqui usando 'driveFolderId'
        const analysisResult = {
            identificado: !!empresaId,
            empresa_id: empresaId,
            razao_social: razaoSocial,
            cnpj_encontrado: cnpjStr,
            tipo_documento: tipoDocumento,
            competencia: competencia,
            drive_sugerido: driveFolderId
        };

        // Log de Auditoria Inteligente
        if (empresaId) {
            await logAudit({
                cliente_id: empresaId,
                acao: 'SISTEMA',
                detalhes: `AI VISION: PDF analisado. ${tipoDocumento} identificado (${file.name}).`,
                request
            });
        }

        return NextResponse.json({ success: true, metadata: analysisResult });

    } catch (error: any) {
        console.error('[Upload Inteligente] Falha Crítica:', error);
        return NextResponse.json({ error: 'Erro interno no Servidor Maestro Vision' }, { status: 500 });
    }
}
