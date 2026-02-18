import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, X, Trash2, Pencil, Search, GripVertical, Library, Package, ChevronRight, Check } from 'lucide-react';
import { Question, PREDEFINED_QUESTIONS, CATEGORIES, QuestionType } from '@/lib/questions';
import { useI18n } from '@/lib/i18n';
import { ROUTINE_TEMPLATES } from '@/lib/templates';
import {
  getUserQuestions, addUserQuestion, removeUserQuestion,
  getCustomQuestions, addCustomQuestion, removeCustomQuestion,
  reorderUserQuestions, updateCustomQuestion,
} from '@/lib/store';

const ManageQuestions = () => {
  const navigate = useNavigate();
  const { t, tQuestion, tCategory } = useI18n();
  const [userQuestions, setUserQuestions] = useState(getUserQuestions());
  const [customQuestions, setCustomQuestions] = useState(getCustomQuestions());
  const [showLibrary, setShowLibrary] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newText, setNewText] = useState('');
  const [newType, setNewType] = useState<QuestionType>('yesno');
  const [newCategory, setNewCategory] = useState<string>(CATEGORIES[0]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editText, setEditText] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const allQuestions = [...PREDEFINED_QUESTIONS, ...customQuestions];
  const selectedIds = new Set(userQuestions.map(q => q.questionId));
  const activeQuestions = userQuestions.map(uq => allQuestions.find(q => q.id === uq.questionId)).filter(Boolean) as Question[];
  const libraryQuestions = allQuestions.filter(q => {
    if (selectedIds.has(q.id)) return false;
    if (!searchQuery) return true;
    const text = tQuestion(q.id, q.text);
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleRemove = (questionId: string) => {
    removeUserQuestion(questionId);
    if (customQuestions.find(q => q.id === questionId)) {
      removeCustomQuestion(questionId);
      setCustomQuestions(getCustomQuestions());
    }
    setUserQuestions(getUserQuestions());
  };

  const handleAddFromLibrary = (questionId: string) => {
    addUserQuestion(questionId);
    setUserQuestions(getUserQuestions());
  };

  const handleCreate = () => {
    if (!newText.trim()) return;
    const question: Question = {
      id: `custom-${Date.now()}`, text: newText.trim(), type: newType,
      category: newCategory, emoji: '📝', isCustom: true,
      ...(newType === 'scale' ? { scaleMin: 1, scaleMax: 10 } : {}),
    };
    addCustomQuestion(question);
    addUserQuestion(question.id);
    setCustomQuestions(getCustomQuestions());
    setUserQuestions(getUserQuestions());
    setNewText('');
    setShowCreate(false);
  };

  const handleEdit = (q: Question) => {
    setEditingQuestion(q);
    setEditText(q.text);
  };

  const handleSaveEdit = () => {
    if (!editingQuestion || !editText.trim()) return;
    if (editingQuestion.isCustom) {
      updateCustomQuestion(editingQuestion.id, { text: editText.trim() });
      setCustomQuestions(getCustomQuestions());
    }
    setEditingQuestion(null);
  };

  const handleApplyTemplate = (template: typeof ROUTINE_TEMPLATES[0]) => {
    template.questionIds.forEach(id => {
      if (!selectedIds.has(id)) {
        addUserQuestion(id);
      }
    });
    setUserQuestions(getUserQuestions());
    setShowTemplates(false);
  };

  // Drag handlers
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex !== null && dragIndex !== index) {
      reorderUserQuestions(dragIndex, index);
      setUserQuestions(getUserQuestions());
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // Touch drag
  const touchStartY = useRef(0);
  const touchStartIndex = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartIndex.current = index;
  };

  const handleTouchEnd = (e: React.TouchEvent, index: number) => {
    if (touchStartIndex.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    const threshold = 50;
    if (Math.abs(deltaY) > threshold) {
      const direction = deltaY > 0 ? 1 : -1;
      const newIndex = Math.max(0, Math.min(activeQuestions.length - 1, touchStartIndex.current + direction));
      if (newIndex !== touchStartIndex.current) {
        reorderUserQuestions(touchStartIndex.current, newIndex);
        setUserQuestions(getUserQuestions());
      }
    }
    touchStartIndex.current = null;
  };

  const getTypeLabel = (type: QuestionType) => t(`type.${type}` as any);

  return (
    <div className="min-h-screen bg-background">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('myQuestions')}</h1>
            <p className="text-sm text-muted-foreground">{t('myQuestions.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Templates button */}
      <div className="px-5 mb-4">
        <button onClick={() => setShowTemplates(true)} className="w-full p-4 rounded-2xl gradient-primary text-primary-foreground flex items-center gap-3 shadow-lg hover:opacity-90 transition-opacity">
          <Package className="w-6 h-6" />
          <div className="flex-1 text-left">
            <p className="font-bold text-sm">{t('templates')}</p>
            <p className="text-xs opacity-80">{t('templates.subtitle')}</p>
          </div>
          <ChevronRight className="w-5 h-5 opacity-60" />
        </button>
      </div>

      <div className="px-5 space-y-2 pb-4">
        {activeQuestions.map((q, index) => (
          <div
            key={q.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
            onTouchStart={(e) => handleTouchStart(e, index)}
            onTouchEnd={(e) => handleTouchEnd(e, index)}
            className={`bg-card rounded-xl shadow-card p-3.5 flex items-center gap-3 border transition-all duration-200 ${
              dragOverIndex === index ? 'border-primary scale-[1.02] shadow-card-hover' : 'border-border/50'
            } ${dragIndex === index ? 'opacity-50' : ''}`}
          >
            <GripVertical className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 cursor-grab active:cursor-grabbing" />
            <span className="text-xl flex-shrink-0">{q.emoji || '📝'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{tQuestion(q.id, q.text)}</p>
              <p className="text-xs text-muted-foreground">{getTypeLabel(q.type)}</p>
            </div>
            <button onClick={() => handleEdit(q)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <Pencil className="w-4 h-4 text-muted-foreground" />
            </button>
            <button onClick={() => handleRemove(q.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
              <Trash2 className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        ))}
        {activeQuestions.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">{t('noQuestionsAdded')}</div>}
      </div>

      <div className="px-5 pb-8 space-y-3">
        <button onClick={() => setShowLibrary(true)} className="w-full p-3.5 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 flex items-center justify-center gap-2 text-primary font-semibold text-sm hover:bg-primary/10 transition-colors">
          <Library className="w-4 h-4" />{t('fromLibrary')}
        </button>
        <button onClick={() => setShowCreate(true)} className="w-full p-3.5 rounded-xl border-2 border-dashed border-border flex items-center justify-center gap-2 text-muted-foreground font-semibold text-sm hover:bg-secondary transition-colors">
          <Plus className="w-4 h-4" />{t('createOwn')}
        </button>
      </div>

      {/* Edit Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-foreground/40 z-50 flex items-end">
          <div className="bg-card w-full rounded-t-2xl p-6 animate-slide-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">{t('editQuestion')}</h2>
              <button onClick={() => setEditingQuestion(null)} className="p-1"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)}
              className="w-full p-3 rounded-xl bg-secondary text-foreground border-0 focus:outline-none focus:ring-2 focus:ring-primary mb-4 text-sm" />
            {!editingQuestion.isCustom && (
              <p className="text-xs text-muted-foreground mb-4">⚠️ Vordefinierte Fragen können nicht bearbeitet werden</p>
            )}
            <button onClick={handleSaveEdit} disabled={!editingQuestion.isCustom || !editText.trim()}
              className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold disabled:opacity-50 transition-all">
              {t('save')}
            </button>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-foreground/40 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-card w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col animate-slide-in">
            <div className="flex items-center justify-between p-5 pb-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">{t('templates.title')}</h2>
                <p className="text-xs text-muted-foreground">{t('templates.subtitle')}</p>
              </div>
              <button onClick={() => setShowTemplates(false)} className="p-1"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-3">
              {ROUTINE_TEMPLATES.map((tmpl) => {
                const allAdded = tmpl.questionIds.every(id => selectedIds.has(id));
                return (
                  <button key={tmpl.id} onClick={() => !allAdded && handleApplyTemplate(tmpl)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      allAdded ? 'border-primary/30 bg-primary/5 opacity-60' : 'border-border hover:border-primary/40 hover:bg-primary/5'
                    }`}>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-foreground">{t(tmpl.nameKey as any)}</p>
                      {allAdded ? <Check className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{t(tmpl.descKey as any)}</p>
                    <p className="text-[10px] text-muted-foreground mt-2">{tmpl.questionIds.length} Fragen</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 bg-foreground/40 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-card w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col animate-slide-in">
            <div className="flex items-center justify-between p-5 pb-3">
              <h2 className="text-lg font-bold text-foreground">{t('questionLibrary')}</h2>
              <button onClick={() => { setShowLibrary(false); setSearchQuery(''); }} className="p-1"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="px-5 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder={t('searchQuestion')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2">
              {libraryQuestions.map((q) => (
                <div key={q.id} className="bg-card border border-border rounded-xl p-3.5 flex items-center gap-3">
                  <span className="text-xl flex-shrink-0">{q.emoji || '📝'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{tQuestion(q.id, q.text)}</p>
                    <p className="text-xs text-muted-foreground">{getTypeLabel(q.type)}</p>
                  </div>
                  <button onClick={() => handleAddFromLibrary(q.id)} className="p-2 rounded-lg hover:bg-primary/10 transition-colors text-primary"><Plus className="w-5 h-5" /></button>
                </div>
              ))}
              {libraryQuestions.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">{t('noMoreQuestions')}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-foreground/40 z-50 flex items-end">
          <div className="bg-card w-full rounded-t-2xl p-6 animate-slide-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">{t('newQuestion')}</h2>
              <button onClick={() => setShowCreate(false)} className="p-1"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <input type="text" placeholder={t('yourQuestion')} value={newText} onChange={(e) => setNewText(e.target.value)}
              className="w-full p-3 rounded-xl bg-secondary text-foreground border-0 focus:outline-none focus:ring-2 focus:ring-primary mb-3 text-sm" />
            <div className="flex gap-2 mb-3">
              {(['yesno', 'scale', 'freetext'] as QuestionType[]).map(type => (
                <button key={type} onClick={() => setNewType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${newType === type ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                  {getTypeLabel(type)}
                </button>
              ))}
            </div>
            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
              className="w-full p-3 rounded-xl bg-secondary text-foreground border-0 focus:outline-none mb-4 text-sm">
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{tCategory(cat)}</option>)}
            </select>
            <button onClick={handleCreate} disabled={!newText.trim()}
              className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold disabled:opacity-50 transition-all">
              {t('createAndAdd')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageQuestions;
