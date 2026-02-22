import { test, expect } from '@playwright/test';

// Teste de Autenticação básico
test.describe('Autenticação e Proteção de Rotas', () => {

    test('Deve redirecionar acesso anônimo do /admin para /login', async ({ page }) => {
        // Tenta acessar página restrita
        await page.goto('/admin');

        // Como está sem sessão válida, Supabase middleware deve enviar para Login
        await expect(page).toHaveURL(/.*\/login/);
    });

    test('A Página de Login deve renderizar corretamente', async ({ page }) => {
        await page.goto('/login');

        // Verifica presença da Logo/Título
        await expect(page.locator('text=Brandão Contabilidade')).toBeVisible();

        // Verifica elementos do form
        const emailInput = page.locator('input[type="email"]');
        await expect(emailInput).toBeVisible();

        const passwordInput = page.locator('input[type="password"]');
        await expect(passwordInput).toBeVisible();

        const submitBtn = page.locator('button[type="submit"]');
        await expect(submitBtn).toBeVisible();
    });
});
