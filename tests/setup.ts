import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mocks globais se necessário
vi.mock('@/lib/supabase/admin', () => ({
    createAdminClient: vi.fn(),
}));

// Mock do NextRequest/NextResponse se necessário
// (Normalmente o Vitest já lida bem, mas podemos precisar de polyfills se usar algo específico)
