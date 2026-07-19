'use client';

interface ClassSelectorProps {
  classes: string[];
  selectedClass: string;
  onChange: (classCode: string) => void;
}

export function ClassSelector({
  classes,
  selectedClass,
  onChange,
}: ClassSelectorProps) {
  // Group classes by level
  const groupedClasses = classes.reduce(
    (acc, classCode) => {
      const level = classCode.match(/\d+/)?.[0] || 'Other';
      if (!acc[level]) acc[level] = [];
      acc[level].push(classCode);
      return acc;
    },
    {} as Record<string, string[]>
  );

  const levels = Object.keys(groupedClasses).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Select Class</h3>
      <div className="space-y-3">
        {levels.map((level) => (
          <div key={level}>
            <div className="text-sm font-semibold text-muted-foreground mb-2">
              Class {level}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {groupedClasses[level].map((classCode) => (
                <button
                  key={classCode}
                  onClick={() => onChange(classCode)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedClass === classCode
                      ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                      : 'bg-muted hover:bg-muted/80 text-foreground'
                  }`}
                >
                  {classCode}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
