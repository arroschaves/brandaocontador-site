import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST() {
    try {
        const rootDir = process.cwd();
        const scriptPath = path.join(rootDir, 'scripts', 'brandao_sync.py');

        console.log('Iniciando sincronização via script python:', scriptPath);

        // Executa o script python como um processo filho
        const pythonProcess = spawn('python', [scriptPath], {
            cwd: rootDir,
            env: { ...process.env }
        });

        let output = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
            console.log('Python stdout:', data.toString());
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.error('Python stderr:', data.toString());
        });

        // Retornamos imediatamente que a tarefa foi iniciada
        // O usuário verá o log no terminal ou poderíamos usar SSE para tempo real
        // Por simplificação brutalista, vamos retornar sucesso do 'disparo'

        return NextResponse.json({
            message: 'Sincronização iniciada com sucesso em segundo plano.',
            status: 'started'
        });

    } catch (error: any) {
        console.error('Erro ao disparar automação:', error);
        return NextResponse.json({
            error: 'Falha ao iniciar sincronização',
            details: error.message
        }, { status: 500 });
    }
}
