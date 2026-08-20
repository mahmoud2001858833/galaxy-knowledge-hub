import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

export interface SimQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface SimQuizProps {
  questions: SimQuizQuestion[];
  title?: string;
}

/** Short comprehension quiz tied to the experiment. */
export const SimQuiz = ({ questions, title = 'اختبار قصير' }: SimQuizProps) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = questions.reduce(
    (acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0),
    0
  );

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((q, qi) => (
          <div key={qi} className="space-y-2">
            <p className="font-semibold text-sm">
              {qi + 1}. {q.question}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {q.options.map((opt, oi) => {
                const selected = answers[qi] === oi;
                const isCorrect = oi === q.correctIndex;
                let variant: 'default' | 'outline' | 'secondary' = selected ? 'default' : 'outline';
                let extra = '';
                if (submitted) {
                  if (isCorrect) extra = 'border-emerald-500 text-emerald-600';
                  else if (selected) extra = 'border-destructive text-destructive';
                  variant = 'outline';
                }
                return (
                  <Button
                    key={oi}
                    variant={variant}
                    className={`justify-start h-auto whitespace-normal py-2 text-right text-xs ${extra}`}
                    onClick={() => !submitted && setAnswers({ ...answers, [qi]: oi })}
                  >
                    {submitted && isCorrect && <CheckCircle2 className="ml-2 h-4 w-4 shrink-0" />}
                    {submitted && selected && !isCorrect && <XCircle className="ml-2 h-4 w-4 shrink-0" />}
                    {opt}
                  </Button>
                );
              })}
            </div>
            {submitted && q.explanation && (
              <p className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">{q.explanation}</p>
            )}
          </div>
        ))}

        <div className="flex items-center gap-3">
          {!submitted ? (
            <Button
              onClick={() => setSubmitted(true)}
              disabled={Object.keys(answers).length < questions.length}
            >
              تحقق من الإجابات
            </Button>
          ) : (
            <>
              <span className="font-bold text-sm">
                النتيجة: {score} / {questions.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAnswers({});
                  setSubmitted(false);
                }}
              >
                <RotateCcw className="ml-2 h-4 w-4" />
                إعادة
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
