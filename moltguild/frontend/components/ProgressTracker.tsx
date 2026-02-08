interface Step {
  label: string;
  status: "complete" | "active" | "pending";
  description?: string;
}

interface ProgressTrackerProps {
  steps: Step[];
  showDescriptions?: boolean;
}

export default function ProgressTracker({ steps, showDescriptions = false }: ProgressTrackerProps) {
  const completedSteps = steps.filter(s => s.status === "complete").length;
  const percentage = Math.round((completedSteps / steps.length) * 100);

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">Progress</span>
          <span className="text-sm text-gray-400">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-3">
            {/* Status Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {step.status === "complete" ? (
                <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : step.status === "active" ? (
                <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-white animate-pulse"></div>
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-gray-700"></div>
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1">
              <div
                className={`font-medium ${
                  step.status === "complete"
                    ? "text-green-400"
                    : step.status === "active"
                    ? "text-white"
                    : "text-gray-500"
                }`}
              >
                {step.label}
              </div>
              {showDescriptions && step.description && (
                <div className="text-sm text-gray-400 mt-1">{step.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
