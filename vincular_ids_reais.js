const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const googleDriveData = [
    { "id": "1RUhIiMGh3h9skU4Ns78gQfuojWN0E2k4", "name": "MAQUITA" },
    { "id": "1mx5Ew-CJZhbvU0j4KSxax3Lk7egPW0xr", "name": "ITA TRANSPORTES" },
    { "id": "1UAfgmXWhm7h3044wb_uVG20epqmM-yDE", "name": "GETULIO RODRIGUES" },
    { "id": "1eSV2McQVtFwqs0G0yex1VMO4i7h5Shjw", "name": "ALESSANDRO BRANDÃO" },
    { "id": "1-WaAI9XtFDkBH0NtyuaVdqVR0SbsyAyZ", "name": "LAURO FERREIRA DA SILVA" },
    { "id": "1m3a_ilomMjrvY419XJ85G9otGz10GPIW", "name": "HELIO MOURA" },
    { "id": "1-ePv_EjFuXIYf40Unwybj9SyDbvExWJB", "name": "CRISTINA CAPÃO SECO" },
    { "id": "1A9QX8cpb2UaOvhJLuE4IPiUMLVRiRNrQ", "name": "L. H. C. BENITES LTDA" },
    { "id": "1d4QHI_OxgMT2B6qf7ImSCewh6MIFX1Xe", "name": "RUBENS" },
    { "id": "1I036W0EVn9WNYW_RP8L__V5i9rMfwwE_", "name": "AROLDO CORREA PJ" },
    { "id": "1F3K9iMVJdf9Wm1S1Wf6WHpX9t4eN3bHr", "name": "AROLDO CORREA PF" },
    { "id": "1xSlOjW7bwpEehPA88xzygLVgxyFG0HUZ", "name": "WILCILENE" },
    { "id": "1hzRb6fOuthLIKYc0Sa3pahHAubS163no", "name": "WALDOMIRO  MOLINA" },
    { "id": "1QV23b4vWzZw0uXrP0wV1vAXQ0jVmfLsi", "name": "VALDIR SORRILHA" },
    { "id": "1ZNythHa-8j3XQTjK-PaFi8a-T7uK6552", "name": "VALDECIR GIBIM" },
    { "id": "1jxUELWjcSRCzsw5aRHTYL-0wsGW6IXV6", "name": "TV PLANALTO" },
    { "id": "1LqG70O6UA4TObabrdl9gnwBBwYnP4NEn", "name": "STUMER" },
    { "id": "1FcHUDZ2KLBhG6BLYEKZcqD14HmsDVMNk", "name": "STAR SHOP" },
    { "id": "1Nwl3_JIfwxERkdL-Ir3MDNm0BzUrFHtR", "name": "SOARES E LACERDA" },
    { "id": "1ccQC1p0bvRZ-yamU260aJ96XX2pAmizo", "name": "SERGIO KAMADA" },
    { "id": "1y29zLnQysu-N39GToewW0qakh6xYOUXV", "name": "SEILA" },
    { "id": "1h5pix9l4Qr_nayUX7xWG9wwPOg5LDdAP", "name": "ROSENI" },
    { "id": "1wzhQxqiJgQIoCzAgVEaBoaly1A5oom1d", "name": "RISALVA SOARES" },
    { "id": "1tYkJT6P3X7V9wykIoOp9LOfJTNVGLSHS", "name": "RICARDO PONTO COM" },
    { "id": "1LFHz_Xs-Eae766IXHCW1wA-j-RfwU4ZG", "name": "REDSON BONADIMAN" },
    { "id": "1Px-BOOuCP1hrD2tqGSNeMqt8NVuS_2X_", "name": "PEDRO SUMIDA" },
    { "id": "1R1rCWXEj6QXf1ZDx2rG3jkgFQnwffU-W", "name": "PATRICIANE" },
    { "id": "1CTLuuR15gYsBQ5MMWMde-g1MKjfngq6u", "name": "ODON" },
    { "id": "17Pi93qdQLjyaIYjLcYUrfYbGmmJwqhIK", "name": "ODILON" },
    { "id": "1wGrdevsuE7RDqHqZdhQed6g6YYRVlj9r", "name": "MG PETS" },
    { "id": "1tU96mw5KgYGcar7wzbmHWFv3v-Lc_rJ3", "name": "MAYARA NOGUEIRA" },
    { "id": "12KTEZ5XSITfVnjr43EfQBQUSCblqZtNh", "name": "MAURICIO CORREA" },
    { "id": "1EJT-JiIjfwcfrcwEtRhR5FFRMHe9Qwtv", "name": "MARLENE  LEDUR" },
    { "id": "1NofijKRjyvKxp_xdBUPWk3tu-qJTvtYC", "name": "MARCOS BRUNO NANTES" },
    { "id": "1dfHTa8t_IbZr8F_0S2-CXUE8E-DNM_8i", "name": "MAP" },
    { "id": "1OQU-dLHI9gLvZreQu_j1Ufax1Mp0Zbzj", "name": "LUIZ MARIO" },
    { "id": "1HVbrkbeoCPSK0GlV72dD_FK13_GCv574", "name": "LUCIANA" },
    { "id": "1k2rkQzHJvfoMpZjkfSvW-PSACzJYhUpN", "name": "JUNIOR ENERGISA" },
    { "id": "1ENR5Eo__ixqwrBOeMpi5aozHikJpSwbj", "name": "JULIO ABRITA" },
    { "id": "1D-XECzatr4iob44sQQVZu3fq8vzIwXm6", "name": "JULIANO ELETRONICA" },
    { "id": "13zTEF6GjWKxjifPtTwZB-ej9Zrd26y6o", "name": "JORGE KAMADA" },
    { "id": "1u8zXXJh8y0LeEFuaFZT73epvAhqM8k_6", "name": "IVO IGNACIO" },
    { "id": "11jtk--84ZY7o1mGurTowvBZu6vn-T5Eo", "name": "ITACIR BONADIMAN" },
    { "id": "1XAw_hXggxNKO3ttZiTn0Foqfo6IZDin_", "name": "HELIO" },
    { "id": "1WLP0NenAbkR6eUUcHoUt9FbFv8bMZvEr", "name": "HELENA MEDEIROS" },
    { "id": "1nBpbqQ5Rb_kgjMUIj26KSLXo8HHBJ0kO", "name": "GORDO" },
    { "id": "1k_HV000TJmBTpjPaa_98wO14pU-OKgah", "name": "GETULIO SCAPINELE" },
    { "id": "1tocVcZ8vrvAErz1hLthSPvfFOj0qHfSl", "name": "GABARDO" },
    { "id": "1rB9ACV9hTvnyLKlF7Ch1w5cb1dZWJluL", "name": "FRUTILANDIA" },
    { "id": "1w2TsUOyWoVAZ0ZCYe7vrdPKzUW0HegN-", "name": "FRANCISCON" },
    { "id": "1pKvFr0wZx8R_AcIm9Nfxa-0ZrE14EqSw", "name": "ELVIS PEREIRA" },
    { "id": "1Giv98CpoJZrJApEdK3DFwe5sKOZQ3o-z", "name": "ELIS" },
    { "id": "1K258_7vzrcZUz1C6mke7LSc4EhvpzU8y", "name": "EDUARDO BASSO" },
    { "id": "1fmMzgbn7r9CpVIesBqqgJ9X8p7L6fOqP", "name": "DORIVAL" },
    { "id": "1cEVQECLbV3dB9mK7MMR2LBf2g3XIKMMI", "name": "DONIZETE CRUZEIRO" },
    { "id": "1mVCXsCFri8FofWzkQhQkQ67SE_aD6VDy", "name": "DENISE PJ" },
    { "id": "1kHV-o_C_kATktz2FiyfyEav60Mned68m", "name": "DENISE GRANATA FAZENDA" },
    { "id": "1jOER77OATIkKVBoqRKzIZkeEOJmvk-G-", "name": "CRISTINA CAPÃO SECO" },
    { "id": "117WaWz5fiqcIEanRIaUo1RcBLFWztA9N", "name": "COMIDA CASEIRA" },
    { "id": "1bORfwV1oVC08XWuj9ZcDmYTRNHjfCsZN", "name": "CATITA" },
    { "id": "1NXGx3BCEC7sY_ygIy7ERlvSHEtuqdL1b", "name": "CAMPESTRE" },
    { "id": "1hqUWI0AituwnEHr-hC4_EpIkp6pRn_pg", "name": "CADU CALHAS" },
    { "id": "19AbUDGJSTnC8XFk1CF3lnbAqfhtDKUOL", "name": "BUBENS" },
    { "id": "1zwvfLrcCy7-8ouqnLJeXfzcYvfY-oPPo", "name": "BRANDAO" },
    { "id": "1pKCkFjSEcPtvdhfvuxYrInM2ITZvJ1JK", "name": "BARBEQ" },
    { "id": "1JOhp1lTmvlg4CRTeeZDVEE_SBliDFLsg", "name": "AROLDO JUNIOR" },
    { "id": "141E-o1t0j0X2Af_S40cxeeoQwHgG1gAr", "name": "AROLDO CORREA" },
    { "id": "1Ish2PTAA9ewzkAlWoELkJksZwXPIKqli", "name": "ANTONIO M. NANTES" },
    { "id": "1IsHnHwzUpwtEOqy39HhQbfJgGCvIhRTn", "name": "ANA OTICAS" },
    { "id": "1rpgk0Oo_oEnkITjytwpZlOiI6uY-iwHA", "name": "ALVES ADVOGADOS" },
    { "id": "1NE_EQwSJAcaJE0nr38H7AjR-FlV-Wz3K", "name": "ALEXANDRE GAMA  TONI" },
    { "id": "1dx40bMMrjdCunLhJBe-c479oGkMhbS7E", "name": "AABB" }
];

async function vincularIdsReais() {
    console.log('🚀 Iniciando atualização de IDs REAIS do Google Drive...');

    // 1. Buscar todos os clientes do CRM para mapear nomes exatos
    const { data: clientesCrm } = await supabase.from('clientes').select('id, nome');

    if (!clientesCrm) {
        console.error('❌ Não foi possível carregar clientes do CRM.');
        return;
    }

    let atualizados = 0;
    let naoEncontrados = 0;

    for (const driveItem of googleDriveData) {
        // Tentativa de match exato ou parcial (resolvendo casos como "ALEXANDRE GAMA  TONI" vs "ALEXANDRE GAMA / TONI")
        const nomeDriveLimpo = driveItem.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

        const clienteRecord = clientesCrm.find(c => {
            const nomeCrmLimpo = c.nome.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            return nomeCrmLimpo === nomeDriveLimpo || c.nome.toUpperCase() === driveItem.name.toUpperCase();
        });

        if (clienteRecord) {
            const { error } = await supabase
                .from('clientes')
                .update({ drive_folder_id: driveItem.id })
                .eq('id', clienteRecord.id);

            if (error) {
                console.error(`❌ Erro ao atualizar ${driveItem.name}:`, error.message);
            } else {
                console.log(`✅ ${driveItem.name} ➔ ID: ${driveItem.id}`);
                atualizados++;
            }
        } else {
            console.log(`⚠️  Não encontrei o cliente "${driveItem.name}" no CRM.`);
            naoEncontrados++;
        }
    }

    console.log('\n---------------------------------------------------');
    console.log(`✨ Sincronização de IDs concluída!`);
    console.log(`✅ Sucesso: ${atualizados}`);
    console.log(`⚠️  Não mapeados: ${naoEncontrados}`);
    console.log('---------------------------------------------------');
}

vincularIdsReais();
