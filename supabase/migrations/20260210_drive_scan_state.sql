-- Migration: 20260210_drive_scan_state.sql
-- Objetivo: Controlar o estado do último scan do Drive Watcher
-- Autor: Antigravity AI
-- Data: 2026-02-10

CREATE TABLE IF NOT EXISTS public.drive_scan_state (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    last_scan_at TIMESTAMPTZ DEFAULT NOW(),
    total_files_found INT DEFAULT 0,
    total_activities_created INT DEFAULT 0,
    scan_duration_ms INT DEFAULT 0,
    error_message TEXT
);

-- Inserir registro inicial (marca "agora" como ponto de partida)
INSERT INTO public.drive_scan_state (last_scan_at, total_files_found, total_activities_created)
VALUES (NOW(), 0, 0);

-- RLS
ALTER TABLE public.drive_scan_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "drive_scan_state_select" ON public.drive_scan_state
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "drive_scan_state_all" ON public.drive_scan_state
FOR ALL USING (true);
