"use client";

import type { Patient } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnthropometrySection } from "@/components/anthropometry/anthropometry-section";
import { FoodAssessmentSection } from "@/components/food/food-assessment-section";
import { RecommendationsSection } from "@/components/recommendations/recommendations-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Scale, Utensils, Brain, CalendarDays } from "lucide-react";
import { calculateAge } from "@/types";
import { Badge } from "@/components/ui/badge";

interface PatientDetailClientProps {
  patient: Patient;
}

export function PatientDetailClient({ patient }: PatientDetailClientProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
        <TabsTrigger value="overview"><User className="mr-2 h-4 w-4 sm:inline hidden" />Overview</TabsTrigger>
        <TabsTrigger value="anthropometry"><Scale className="mr-2 h-4 w-4 sm:inline hidden" />Anthropometry</TabsTrigger>
        <TabsTrigger value="food-assessment"><Utensils className="mr-2 h-4 w-4 sm:inline hidden" />Food Assessment</TabsTrigger>
        <TabsTrigger value="recommendations"><Brain className="mr-2 h-4 w-4 sm:inline hidden" />Recommendations</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <User className="h-10 w-10 text-primary" />
              <div>
                <CardTitle className="text-2xl text-primary">{patient.name}</CardTitle>
                <CardDescription>Patient Overview and Basic Information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong>Age:</strong> {calculateAge(patient.dob)} years</div>
              <div><strong>Date of Birth:</strong> {new Date(patient.dob).toLocaleDateString()}</div>
              <div><strong>Gender:</strong> <Badge variant="secondary" className="capitalize">{patient.gender}</Badge></div>
              <div><strong>Registered On:</strong> {new Date(patient.registrationDate).toLocaleDateString()}</div>
            </div>
             <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold mb-2 text-primary">Summary Data</h4>
                <p>Anthropometric Records: {patient.anthropometricData.length}</p>
                <p>Nutritional Recommendations: {patient.recommendations.length}</p>
                {patient.foodAssessment?.lastUpdated && <p>Food Assessment Last Updated: {new Date(patient.foodAssessment.lastUpdated).toLocaleDateString()}</p>}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="anthropometry">
        <AnthropometrySection patient={patient} />
      </TabsContent>

      <TabsContent value="food-assessment">
        <FoodAssessmentSection patient={patient} />
      </TabsContent>

      <TabsContent value="recommendations">
        <RecommendationsSection patient={patient} />
      </TabsContent>
    </Tabs>
  );
}
