
"use client";

import type { Patient } from "@/types";
import { calculateAge } from "@/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, UserPlus, SearchX } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";

interface PatientListClientProps {
  patients: Patient[];
  searchTerm?: string;
}

export function PatientListClient({ patients, searchTerm }: PatientListClientProps) {
  if (patients.length === 0) {
    const isSearching = searchTerm && searchTerm.trim() !== "";
    const message = isSearching
        ? `Nenhum paciente corresponde à busca por "${searchTerm}".`
        : "Nenhum paciente cadastrado."; 
    const IconComponent = isSearching ? SearchX : UserPlus;

    return (
        <Card className="w-full text-center shadow-md">
            <CardContent className="py-10 flex flex-col items-center justify-center min-h-[200px]">
                <IconComponent className="h-16 w-16 text-muted-foreground opacity-75 mb-4" />
                <p className="text-lg text-muted-foreground">{message}</p>
                {!isSearching && (
                    <Button asChild size="lg" className="mt-6">
                        <Link href="/patients/new">
                        <UserPlus className="mr-2 h-5 w-5" /> Adicionar Novo Paciente
                        </Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Gênero</TableHead>
                <TableHead>Registrado Em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{calculateAge(patient.dob)}</TableCell>
                  <TableCell>
                    <Badge variant={patient.gender === 'female' ? 'default' : patient.gender === 'male' ? 'secondary' : 'outline'} className="capitalize">
                      {patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Feminino' : 'Outro'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(patient.registrationDate).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" asChild title="Ver Paciente">
                      <Link href={`/patients/${patient.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    {/* Edit and Delete functionality can be added later */}
                    {/* <Button variant="ghost" size="icon" title="Editar Paciente">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Excluir Paciente" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button> */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

