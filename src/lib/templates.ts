export interface RoutineTemplate {
  id: string;
  nameKey: string;
  descKey: string;
  questionIds: string[];
}

export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {
    id: 'fitness',
    nameKey: 'template.fitness',
    descKey: 'template.fitness.desc',
    questionIds: ['pre-6', 'pre-7', 'pre-8', 'pre-9', 'pre-10', 'pre-5'],
  },
  {
    id: 'study',
    nameKey: 'template.study',
    descKey: 'template.study.desc',
    questionIds: ['pre-31', 'pre-32', 'pre-33', 'pre-34', 'pre-22', 'pre-26'],
  },
  {
    id: 'mindset',
    nameKey: 'template.mindset',
    descKey: 'template.mindset.desc',
    questionIds: ['pre-16', 'pre-17', 'pre-18', 'pre-19', 'pre-20', 'pre-21'],
  },
  {
    id: 'sleep',
    nameKey: 'template.sleep',
    descKey: 'template.sleep.desc',
    questionIds: ['pre-2', 'pre-3', 'pre-44', 'pre-20', 'pre-41'],
  },
];
