import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  Crown,
  Star,
} from "lucide-react";

interface Step {
  id: string;
  name: string;
  status: "pending" | "active" | "completed" | "error";
  description?: string;
  duration?: number;
}

interface ProgressIndicatorsProps {
  steps: Step[];
  currentStep: number;
  title?: string;
  showProgress?: boolean;
  showTime?: boolean;
}

export const ProgressIndicators = ({
  steps,
  currentStep,
  title = "Progresso",
  showProgress = true,
  showTime = false,
}: ProgressIndicatorsProps) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (showTime) {
      const interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showTime]);

  const getStepIcon = (step: Step, index: number) => {
    if (step.status === "completed") {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (step.status === "error") {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    } else if (index === currentStep) {
      return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
    } else {
      return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepColor = (step: Step, index: number) => {
    if (step.status === "completed") {
      return "text-green-600 bg-green-50 border-green-200";
    } else if (step.status === "error") {
      return "text-red-600 bg-red-50 border-red-200";
    } else if (index === currentStep) {
      return "text-blue-600 bg-blue-50 border-blue-200";
    } else {
      return "text-gray-400 bg-gray-50 border-gray-200";
    }
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {showTime && (
              <Badge variant="outline" className="text-sm">
                {Math.floor(elapsedTime / 60)}:
                {(elapsedTime % 60).toString().padStart(2, "0")}
              </Badge>
            )}
          </div>

          {/* Progress Bar */}
          {showProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Etapa {currentStep} de {steps.length}
                </span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border ${getStepColor(
                  step,
                  index
                )}`}>
                {getStepIcon(step, index)}
                <div className="flex-1">
                  <h4 className="font-medium">{step.name}</h4>
                  {step.description && (
                    <p className="text-sm opacity-75">{step.description}</p>
                  )}
                </div>
                {step.duration && (
                  <Badge variant="secondary" className="text-xs">
                    {step.duration}s
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente específico para IA
export const AIProgressIndicator = ({
  stage,
  progress,
  estimatedTime,
}: {
  stage: string;
  progress: number;
  estimatedTime?: number;
}) => {
  const [timeLeft, setTimeLeft] = useState(estimatedTime || 0);

  useEffect(() => {
    if (estimatedTime) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [estimatedTime]);

  const stages = [
    "Inicializando IA...",
    "Analisando dados...",
    "Processando fatos...",
    "Aplicando fundamentação...",
    "Gerando texto...",
    "Revisando conteúdo...",
    "Finalizando...",
  ];

  const currentStageIndex = stages.findIndex((s) => s.includes(stage)) || 0;

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="font-medium text-blue-800">{stage}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-blue-600">
                {Math.round(progress)}%
              </span>
              {timeLeft > 0 && (
                <Badge variant="secondary" className="text-xs">
                  ~{timeLeft}s
                </Badge>
              )}
            </div>
          </div>
          <Progress value={progress} className="h-2" />

          {/* Stage indicators */}
          <div className="flex space-x-1">
            {stages.map((s, index) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full ${
                  index <= currentStageIndex ? "bg-blue-500" : "bg-blue-200"
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para status de assinatura
export const SubscriptionStatus = ({
  plan,
  usage,
  limit,
}: {
  plan: string;
  usage: number;
  limit: number;
}) => {
  const percentage = (usage / limit) * 100;
  const isUnlimited = limit === -1;

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {plan === "pro" ? (
              <Crown className="w-5 h-5 text-purple-600" />
            ) : plan === "basic" ? (
              <Zap className="w-5 h-5 text-blue-600" />
            ) : (
              <Star className="w-5 h-5 text-gray-600" />
            )}
            <span className="font-medium text-gray-900">
              Plano {plan.toUpperCase()}
            </span>
          </div>
          <Badge variant="secondary">
            {isUnlimited ? "Ilimitado" : `${usage}/${limit}`}
          </Badge>
        </div>

        {!isUnlimited && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Uso atual</span>
              <span>{Math.round(percentage)}%</span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
