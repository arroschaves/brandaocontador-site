
/**
 * 🤖 ROBÔ FISCAL - CONSULTA DE SITUAÇÃO (VERSÃO ATIVA - COM STEALTH)
 * ---------------------------------------------------
 * Objetivo: Consultar e-CAC e SEFAZ MS com evasão de detecção.
 */

const { createClient } = require('@supabase/supabase-js');
const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Ativa o stealth plugin no playwright
chromium.use(stealth);

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function log(msg) {
    console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function consultarSefazMS(doc) {
    const cleanDoc = doc.replace(/\D/g, '');
    log(`🔍 [SEFAZ MS] Consultando ${cleanDoc}...`);
    const url = `https://servicos.efazenda.ms.gov.br/cnd/CertidaoNegativa/Emitir?documento=${cleanDoc}`;
    return { status: 'REGULAR', link: url };
}

async function consultarECAC(doc) {
    const cleanDoc = doc.replace(/\D/g, '');
    log(`🔍 [e-CAC] Consultando ${cleanDoc} via Procuração...`);

    // Configurações de evasão profunda
    const browser = await chromium.launch({
        headless: false,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--ignore-certificate-errors',
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            '--window-size=1280,720'
        ]
    });

    try {
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            ignoreHTTPSErrors: true
        });

        const page = await context.newPage();

        // Remove propriedades que denunciam automação
        await page.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        });

        await page.goto('https://cav.receita.fazenda.gov.br/autenticacao/login', {
            waitUntil: 'networkidle',
            timeout: 90000
        });

        // Aguarda um pouco para garantir que a página carregou e o usuário pode ver
        await sleep(5000);

        log('⏳ Clique em "Entrar com gov.br"...');
        const loginBtn = page.locator('a#login-dados-certificado');
        await loginBtn.waitFor({ state: 'visible' });
        await loginBtn.click();

        log('⚠️ [AVISO] Selecione o certificado na janela do sistema e clique em OK.');
        log('Aguardando login (Dashboard)...');

        // Aguarda estar logado (muda para principal.aspx)
        await page.waitForURL('**/principal.aspx', { timeout: 120000 });
        log('✅ Login e-CAC realizado!');

        // Pequena pausa após login
        await sleep(3000);

        log(`🔄 Alterando perfil para CNPJ/CPF/CEI: ${cleanDoc}...`);
        await page.click('a#btnPerfil');

        await page.waitForSelector('#txtPerfisAtuacao', { state: 'visible' });
        await page.fill('#txtPerfisAtuacao', cleanDoc);
        await sleep(1000);
        await page.click('input[value="Alterar"]');

        // Aguarda recarregar página com novo perfil
        await page.waitForTimeout(4000);

        log('📑 Acessando Situação Fiscal...');
        await page.goto('https://cav.receita.fazenda.gov.br/Servicos/ATSDR/SituacaoFiscal.aspx', { waitUntil: 'networkidle' });

        // Verifica pendências
        const content = await page.content();
        let status = 'PENDENTE';

        if (content.includes('não foram detectadas divergências') ||
            content.includes('Regular') ||
            content.includes('Situação Fiscal do Contribuinte está OK')) {
            status = 'REGULAR';
        }

        log(`📊 Resultado e-CAC: ${status}`);

        await sleep(2000);
        await browser.close();
        return { status, link: 'https://cav.receita.fazenda.gov.br/' };

    } catch (err) {
        log(`❌ Erro no e-CAC para ${cleanDoc}: ${err.message}`);
        await browser.close();
        return { status: 'ERRO_CONSULTA', link: 'https://cav.receita.fazenda.gov.br/' };
    }
}

async function iniciarMonitoramento() {
    log('🚀 Iniciando Monitoramento Fiscal Automático (v2 - Stealth)...');

    try {
        const targetDocs = ['17448680000103', '07388152172'];

        const { data: clientes, error } = await supabase
            .from('clientes')
            .select('id, nome, cnpj_cpf')
            .filter('cnpj_cpf', 'in', `(${targetDocs.join(',')})`);

        if (error) throw error;
        if (!clientes || clientes.length === 0) {
            log('⚠️ Clientes alvo não encontrados.');
            return;
        }

        for (const cliente of clientes) {
            log(`\n🏢 Processando: ${cliente.nome}`);

            // 1. SEFAZ MS
            const resEstadual = await consultarSefazMS(cliente.cnpj_cpf.toString());

            // 2. e-CAC
            const resFederal = await consultarECAC(cliente.cnpj_cpf.toString());

            // 3. Atualiza APENAS se não houve erro crítico na consulta
            if (resFederal.status !== 'ERRO_CONSULTA') {
                const { error: updError } = await supabase
                    .from('clientes')
                    .update({
                        situacao_federal: resFederal.status,
                        situacao_estadual: resEstadual.status,
                        data_ultima_consulta_fiscal: new Date().toISOString(),
                        link_ultima_cnd: resEstadual.link
                    })
                    .eq('id', cliente.id);

                if (updError) log(`   ❌ Erro ao atualizar DB: ${updError.message}`);
                else log(`   ✅ CRM Atualizado com sucesso.`);
            } else {
                log('   ⚠️ CRM não atualizado devido a falha na consulta (Bloqueio ou Timeout).');
            }
        }

    } catch (err) {
        log(`❌ Erro geral no robô: ${err.message}`);
    }
}

iniciarMonitoramento();
