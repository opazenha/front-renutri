"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePatientContext } from "@/contexts/patient-context";
import type { Patient } from "@/types";
import { calculateAge } from "@/types";
import { Mail, User } from "lucide-react";
import Link from "next/link";

interface PatientOverviewCardProps {
  patient: Patient;
}

export function PatientOverviewCard({ patient }: PatientOverviewCardProps) {
  const { getUnreadMessagesCountForPatient, isLoading } = usePatientContext();
  const unreadCount = isLoading
    ? 0
    : getUnreadMessagesCountForPatient(patient.id);

  return (
    <Card className="shadow-lg">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <User className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            <div>
              <CardTitle className="text-xl sm:text-2xl text-primary">
                {patient.name}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Informações básicas do paciente.
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            asChild
            aria-label="Abrir mensagens do paciente"
            className="shrink-0 relative"
          >
            <Link href={`/messages?patientId=${patient.id}`}>
              <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center text-xs p-0.5"
                >
                  {unreadCount}
                </Badge>
              )}
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-xs sm:text-sm">
          <div>
            <strong>Idade:</strong> {calculateAge(patient.dob)} anos
          </div>
          <div>
            <strong>Gênero:</strong>{" "}
            <Badge variant="secondary" className="capitalize">
              {patient.gender === "male"
                ? "Masculino"
                : patient.gender === "female"
                ? "Feminino"
                : "Outro"}
            </Badge>
          </div>
          <div>
            <strong>Data de Nascimento:</strong>{" "}
            {new Date(patient.dob).toLocaleDateString("pt-BR")}
          </div>
          <div>
            <strong>Escolaridade:</strong> {patient.schooling || "N/A"}
          </div>
          <div>
            <strong>Estado Civil:</strong> {patient.maritalStatus || "N/A"}
          </div>
          <div>
            <strong>Profissão:</strong> {patient.profession || "N/A"}
          </div>
          <div>
            <strong>Registrado Em:</strong>{" "}
            {new Date(patient.registrationDate).toLocaleDateString("pt-BR")}
          </div>
          <div>
  <strong>Próxima consulta:</strong>{" "}
  {(() => {
    const now = new Date();
    const nextAppt = patient.appointments?.
      filter(appt => appt.status === "scheduled" && new Date(appt.date + 'T' + (appt.time || '00:00')) > now)
      .sort((a, b) => new Date(a.date + 'T' + (a.time || '00:00')).getTime() - new Date(b.date + 'T' + (b.time || '00:00')).getTime())[0];
    return nextAppt ? (
      <span className="text-primary font-medium">
        {new Date(nextAppt.date + 'T' + (nextAppt.time || '00:00')).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
        {nextAppt.time ? ` às ${nextAppt.time}` : ""}
      </span>
    ) : (
      <span className="text-muted-foreground">Não agendada</span>
    );
  })()}
</div>
          <div>
            <strong>Última consulta:</strong>{" "}
            <span className="text-muted-foreground">N/A</span>
          </div>
        </div>
        <div className="mt-4 sm:mt-6 border-t pt-3 sm:pt-4">
          <h4 className="font-semibold mb-2 text-primary text-sm sm:text-base">
            Resumo das Avaliações
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 text-xs sm:text-sm">
            <p>
              Avaliações Clínicas: {patient.clinicalAssessments?.length || 0}
            </p>
            <p>
              Avaliações Alimentares: {patient.foodAssessments?.length || 0}
            </p>
            <p>
              Avaliações Comportamentais:{" "}
              {patient.behavioralAssessments?.length || 0}
            </p>
            <p>
              Registros Antropométricos: {patient.anthropometricData.length}
            </p>
            <p>
              Avaliações Bioquímicas:{" "}
              {patient.biochemicalAssessments?.length || 0}
            </p>
            <p>
              Registros de Gasto Energético:{" "}
              {patient.energyExpenditureRecords?.length || 0}
            </p>
            <p>Macronutrientes: {patient.macronutrientPlans?.length || 0}</p>
            <p>
              Micronutrientes:{" "}
              {patient.micronutrientRecommendations?.length || 0}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
