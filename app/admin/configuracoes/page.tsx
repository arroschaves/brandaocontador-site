'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Settings, User, Mail, Building, Bell, Shield } from 'lucide-react'

export default function SettingsPage() {
    const [loading, setLoading] = useState(false)

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50/50 min-h-screen">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Configurações</h2>
                    <p className="text-slate-500">
                        Gerencie as informações do seu escritório e preferências da conta.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-none shadow-md bg-white">
                    <CardHeader className="border-b border-slate-100 flex flex-row items-center space-x-2">
                        <Building className="h-5 w-5 text-slate-400" />
                        <CardTitle className="text-xl">Dados do Escritório</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="org-name">Nome da Organização</Label>
                                    <Input id="org-name" placeholder="Brandão Contabilidade" defaultValue="Brandão Contabilidade" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cnpj">CNPJ</Label>
                                    <Input id="cnpj" placeholder="00.000.000/0001-00" defaultValue="00.000.000/0001-00" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Endereço</Label>
                                <Input id="address" placeholder="Av. Principal, 1000" />
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button className="bg-slate-900 text-white hover:bg-slate-800 px-8">
                                    Salvar Alterações
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="col-span-3 border-none shadow-md bg-white h-fit">
                    <CardHeader className="border-b border-slate-100 flex flex-row items-center space-x-2">
                        <Shield className="h-5 w-5 text-slate-400" />
                        <CardTitle className="text-xl">Segurança & Acesso</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100">
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium text-slate-900">Autenticação em Dois Fatores</p>
                                <p className="text-xs text-slate-500">Adicione uma camada extra de segurança.</p>
                            </div>
                            <Button variant="outline" size="sm">Ativar</Button>
                        </div>
                        <div className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="current-pass">Senha Atual</Label>
                                <Input id="current-pass" type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-pass">Nova Senha</Label>
                                <Input id="new-pass" type="password" />
                            </div>
                            <Button className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200 border-none shadow-none">
                                Atualizar Senha
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
