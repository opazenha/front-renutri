"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { usePatientContext } from "@/contexts/patient-context";
import type { Message, Patient } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Users, MessageSquare, RefreshCcw, CheckCircle2 } from "lucide-react";
import { format, parseISO, formatDistanceToNowStrict } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function MessagesClient() {
  const { 
    patients, 
    getAllMessages, 
    getMessagesByPatientId, 
    markMessageAsRead, 
    isLoading: isPatientContextLoading 
  } = usePatientContext();
  
  const searchParams = useSearchParams();
  const patientIdFromQuery = searchParams.get("patientId");

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patientIdFromQuery);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);

  useEffect(() => {
    setSelectedPatientId(patientIdFromQuery);
  }, [patientIdFromQuery]);

  useEffect(() => {
    if (!isPatientContextLoading) {
      setIsLoadingMessages(true);
      let messagesToDisplay: Message[] = [];
      if (selectedPatientId) {
        messagesToDisplay = getMessagesByPatientId(selectedPatientId);
      } else {
        messagesToDisplay = getAllMessages();
      }
      setDisplayedMessages(messagesToDisplay.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setIsLoadingMessages(false);
    }
  }, [selectedPatientId, getAllMessages, getMessagesByPatientId, isPatientContextLoading, patients]); // patients dependency to re-fetch if mock data changes

  const handlePatientFilterChange = (patientId: string) => {
    setSelectedPatientId(patientId === "all" ? null : patientId);
  };

  const handleMarkAsRead = (messageId: string, msgPatientId: string) => {
    markMessageAsRead(messageId, msgPatientId);
    // Optimistically update UI or rely on useEffect re-fetch
    setDisplayedMessages(prev => prev.map(msg => msg.id === messageId ? {...msg, isRead: true} : msg));
  };
  
  const selectedPatient = useMemo(() => {
    return selectedPatientId ? patients.find(p => p.id === selectedPatientId) : null;
  }, [selectedPatientId, patients]);


  if (isPatientContextLoading || isLoadingMessages) {
    return <p className="text-center py-10 text-muted-foreground">Carregando mensagens...</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(250px,300px)_1fr] gap-6 h-full">
      {/* Patient List / Filter */}
      <Card className="shadow-md h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary" />
            Filtrar por Paciente
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto pt-0">
          <Select 
            value={selectedPatientId || "all"} 
            onValueChange={handlePatientFilterChange}
          >
            <SelectTrigger className="w-full mb-4">
              <SelectValue placeholder="Todos os Pacientes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Pacientes</SelectItem>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedPatient && (
            <div className="text-sm p-3 border rounded-md bg-muted/50">
              <p className="font-semibold text-primary">{selectedPatient.name}</p>
              <p className="text-xs text-muted-foreground">Visualizando mensagens deste paciente.</p>
              <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-1" asChild>
                <Link href={`/patients/${selectedPatient.id}`}>Ver Perfil</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card className="shadow-md h-full flex flex-col">
        <CardHeader className="pb-3 flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-lg flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-primary" />
              Mensagens Recebidas
            </CardTitle>
            <CardDescription className="text-xs">
              {selectedPatient ? `Mensagens de ${selectedPatient.name}` : "Todas as mensagens"}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsLoadingMessages(true)} disabled={isLoadingMessages}> 
            <RefreshCcw className={cn("mr-2 h-4 w-4", isLoadingMessages && "animate-spin")} />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden p-0">
          <ScrollArea className="h-full">
            {displayedMessages.length > 0 ? (
              <ul className="divide-y">
                {displayedMessages.map((msg) => (
                  <li 
                    key={msg.id} 
                    className={cn(
                      "p-3 sm:p-4 hover:bg-muted/50 transition-colors",
                      !msg.isRead && "bg-primary/5 border-l-4 border-primary"
                    )}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                           {!selectedPatientId && msg.patientName && (
                            <Badge variant="secondary" className="text-xs">{msg.patientName}</Badge>
                          )}
                          <Badge variant={msg.source === 'whatsapp' ? 'default' : 'outline'} className="text-xs">
                            {msg.source === 'whatsapp' ? 'WhatsApp' : 'Gmail'}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-medium">{msg.sender}</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{msg.content}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground" title={format(parseISO(msg.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}>
                          {formatDistanceToNowStrict(parseISO(msg.timestamp), { addSuffix: true, locale: ptBR })}
                        </p>
                        {!msg.isRead && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-1 h-auto p-1 text-xs text-primary hover:text-primary/80"
                            onClick={() => handleMarkAsRead(msg.id, msg.patientId)}
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3"/> Marcar como lida
                          </Button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center py-10 text-muted-foreground">
                {selectedPatientId 
                  ? "Nenhuma mensagem encontrada para este paciente." 
                  : "Nenhuma mensagem encontrada."}
              </p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}