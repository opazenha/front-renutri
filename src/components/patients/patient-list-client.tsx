"use client";

import type { Patient } from "@/types";
import { calculateAge } from "@/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Edit, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PatientListClientProps {
  patients: Patient[];
}

export function PatientListClient({ patients }: PatientListClientProps) {
  if (patients.length === 0) {
    return (
       <Card className="w-full max-w-md mx-auto text-center shadow-lg">
        <CardHeader>
          <UserPlus className="mx-auto h-16 w-16 text-primary opacity-50 mb-4" />
          <CardTitle className="text-2xl">No Patients Found</CardTitle>
          <CardDescription>Start by adding your first patient to manage their nutritional journey.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg">
            <Link href="/patients/new">
              <UserPlus className="mr-2 h-5 w-5" /> Add New Patient
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl text-primary">Patient Records</CardTitle>
          <CardDescription>Manage and view all registered patients.</CardDescription>
        </div>
        <Button asChild>
          <Link href="/patients/new">
            <UserPlus className="mr-2 h-4 w-4" /> Add New Patient
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Registered On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{calculateAge(patient.dob)}</TableCell>
                  <TableCell>
                    <Badge variant={patient.gender === 'female' ? 'default' : patient.gender === 'male' ? 'secondary' : 'outline'} className="capitalize">
                      {patient.gender}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(patient.registrationDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" asChild title="View Patient">
                      <Link href={`/patients/${patient.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    {/* Edit and Delete functionality can be added later */}
                    {/* <Button variant="ghost" size="icon" title="Edit Patient">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Delete Patient" className="text-destructive hover:text-destructive">
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
