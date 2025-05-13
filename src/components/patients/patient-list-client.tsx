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
            <CardContent className="py-10 flex flex-col items-center justify-center min-h-[200px] p-4 sm:p-6">
                <IconComponent className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground opacity-75 mb-4" />
                <p className="text-base sm:text-lg text-muted-foreground">{message}</p>
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
      <CardContent className="p-4 sm:p-6 pt-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden sm:table-cell">Idade</TableHead>
                <TableHead className="hidden md:table-cell">Gênero</TableHead>
                <TableHead>Registrado Em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium text-sm sm:text-base">{patient.name}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">{calculateAge(patient.dob)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={patient.gender === 'female' ? 'default' : patient.gender === 'male' ? 'secondary' : 'outline'} className="capitalize text-xs">
                      {patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Feminino' : 'Outro'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">{new Date(patient.registrationDate).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right space-x-1 sm:space-x-2">
                    <Button variant="ghost" size="icon" asChild title="Ver Paciente">
                      <Link href={`/patients/${patient.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
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

