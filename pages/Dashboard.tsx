
import React, { useState, useEffect } from 'react';
import { UserStats, PrayerKey, DailyChallenge, PrayerDetail } from '../types';
import { PRAYERS } from '../constants';
import { 
  CheckCircle2, Circle, Flame, Sparkles, BookOpen, 
  Plus, Minus, Check, Trophy, ChevronDown, 
  ChevronUp, Users, Heart, Coins, Utensils 
} from 'lucide-react';
import { getDailyInspiration } from '../services/geminiService';

interface DashboardProps {
  stats: UserStats;
  updateDetailedPrayer: (key: PrayerKey, completed: boolean, isJamaah: boolean) => void;
  updateAdhkarAfterPrayer: (key: PrayerKey) => void;
  updateQiyam: (rakats: number, witr: boolean) => void;
  updateNawafil: (rakats: number) => void;
  updateGoodDeed: (key: keyof UserStats['goodDeeds']) => void;
  updateQuran: (pages: number) => void;
  updateQuranJuz: (juz: number) => void;
  challenge: DailyChallenge | null;
  completeChallenge: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  stats, updateDetailedPrayer, updateAdhkarAfterPrayer, updateQiyam, 
  updateNawafil, updateGoodDeed, updateQuran, updateQuranJuz, 
  challenge, completeChallenge 
}) => {
  const [inspiration, setInspiration] = useState('جارٍ استحضار السكينة...');
  const [isEditingQuran, setIsEditingQuran] = useState(false);
  const [editMode, setEditMode] = useState<'pages' | 'juz'>('pages');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  useEffect(() => {
    getDailyInspiration().then(setInspiration);
  }, []);

  const progress = ((Object.values(stats.detailedPrayers) as PrayerDetail[]).filter(p => p.completed).length / 5) * 100;

  const toggleGroup = (group: string) => {
    setExpandedGroup(expandedGroup === group ? null : group);
  };

  const dailyDeedPoints = () => {
    let pts = 0;
    Object.keys(stats.detailedPrayers).forEach(k => {
      const p = stats.detailedPrayers[k as PrayerKey];
      if (p.completed) pts += (p.isJamaah ? 135 : 5);
      if (stats.adhkarAfterPrayer[k as PrayerKey]) pts += 15;
    });
    pts += (stats.qiyamRakats / 2) * 8 + (stats.witrCompleted ? 10 : 0);
    pts += (stats.nawafilRakats / 2) * 10;
    if (stats.goodDeeds.iftar) pts += 200;
    if (stats.goodDeeds.sadaqah) pts += 100;
    if (stats.goodDeeds.general) pts += 50;
    
    // Add points from individual adhkar completions
    const individualAdhkarPts = Object.values(stats.completedAdhkarIds || {}).filter(Boolean).length * 5;
    pts += individualAdhkarPts;

    // Add category completion bonuses
    Object.values(stats.adhkar).forEach(v => { if (v) pts += 50; });
    
    // Add challenge points if completed
    if (challenge?.completed) pts += challenge.points;

    return pts;
  };

  return (
    <div className="p-4 space-y-6">
      {/* Status Card */}
      <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-200 dark:shadow-emerald-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles size={120} />
        </div>
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-emerald-100 text-sm font-medium">مستوى الالتزام</p>
            <h2 className="text-3xl font-bold">{stats.level}</h2>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
              <span className="font-bold">{stats.streak} أيام</span>
            </div>
            <div className="bg-emerald-500/50 border border-white/20 px-3 py-1 rounded-full backdrop-blur-sm text-[10px] font-bold">
              {dailyDeedPoints()} حسنة اليوم ✨
            </div>
          </div>
        </div>
        
        <div className="mt-8 relative z-10">
          <div className="flex justify-between items-end mb-2">
            <span className="text-emerald-100 text-sm font-medium">إجمالي النقاط: {stats.points}</span>
            <span className="text-white font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-white/80 via-white to-white/90 transition-all duration-1000 cubic-bezier(0.65, 0, 0.35, 1) relative" 
              style={{ width: `${progress}%` }} 
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-100/30 to-transparent w-full h-full -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Deeds Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <CheckCircle2 className="text-emerald-500 w-5 h-5" /> الأعمال اليومية بالنقاط
          </h3>
          <span className="text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full">
            مجموع اليوم: {dailyDeedPoints()} ن
          </span>
        </div>

        {/* Group 1: Detailed Prayers */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <button 
            onClick={() => toggleGroup('prayers')}
            className="w-full p-4 flex items-center justify-between text-right"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-500">
                <Users size={18} />
              </div>
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">الصلوات الخمس (جماعة / فرد)</span>
            </div>
            {expandedGroup === 'prayers' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {expandedGroup === 'prayers' && (
            <div className="px-4 pb-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
              {PRAYERS.map(p => (
                <div key={p.key} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <span className="text-sm font-bold dark:text-slate-200">{p.label}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => updateDetailedPrayer(p.key, !stats.detailedPrayers[p.key].completed || stats.detailedPrayers[p.key].isJamaah, false)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${stats.detailedPrayers[p.key].completed && !stats.detailedPrayers[p.key].isJamaah ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-600 text-slate-400'}`}
                    >فرد</button>
                    <button 
                      onClick={() => updateDetailedPrayer(p.key, !stats.detailedPrayers[p.key].completed || !stats.detailedPrayers[p.key].isJamaah, true)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${stats.detailedPrayers[p.key].completed && stats.detailedPrayers[p.key].isJamaah ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-600 text-slate-400'}`}
                    >جماعة</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Group 2: Adhkar After Prayer */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <button 
            onClick={() => toggleGroup('adhkar')}
            className="w-full p-4 flex items-center justify-between text-right"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center text-amber-500">
                <Sparkles size={18} />
              </div>
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">أذكار بعد الصلاة</span>
            </div>
            {expandedGroup === 'adhkar' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {expandedGroup === 'adhkar' && (
            <div className="px-4 pb-4 grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-200">
              {PRAYERS.map(p => (
                <button 
                  key={p.key}
                  onClick={() => updateAdhkarAfterPrayer(p.key)}
                  className={`p-3 rounded-xl flex items-center justify-between transition-all ${stats.adhkarAfterPrayer[p.key] ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-700/50 border-transparent'} border`}
                >
                  <span className="text-xs font-bold dark:text-slate-200">{p.label}</span>
                  {stats.adhkarAfterPrayer[p.key] ? <Check size={14} className="text-emerald-500" /> : <Circle size={14} className="text-slate-300" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Group 3: Qiyam */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <button 
            onClick={() => toggleGroup('qiyam')}
            className="w-full p-4 flex items-center justify-between text-right"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-500">
                <Sparkles size={18} />
              </div>
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">صلاة القيام</span>
            </div>
            {expandedGroup === 'qiyam' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {expandedGroup === 'qiyam' && (
            <div className="px-4 pb-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold dark:text-slate-300">عدد الركعات (2 ركعة = 8 درجات)</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQiyam(Math.max(0, stats.qiyamRakats - 2), stats.witrCompleted)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center"><Minus size={14} /></button>
                  <span className="w-6 text-center font-bold">{stats.qiyamRakats}</span>
                  <button onClick={() => updateQiyam(stats.qiyamRakats + 2, stats.witrCompleted)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center"><Plus size={14} /></button>
                </div>
              </div>
              <button 
                onClick={() => updateQiyam(stats.qiyamRakats, !stats.witrCompleted)}
                className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${stats.witrCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-50 dark:bg-slate-700/50 text-slate-500'}`}
              >
                <span className="text-xs font-bold">صلاة الوتر (10 درجات)</span>
                {stats.witrCompleted && <Check size={14} />}
              </button>
            </div>
          )}
        </div>

        {/* Group 4: Nawafil */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <button 
            onClick={() => toggleGroup('nawafil')}
            className="w-full p-4 flex items-center justify-between text-right"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center text-purple-500">
                <Sparkles size={18} />
              </div>
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">النوافل</span>
            </div>
            {expandedGroup === 'nawafil' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {expandedGroup === 'nawafil' && (
            <div className="px-4 pb-4 flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
              <span className="text-xs font-bold dark:text-slate-300">عدد الركعات (2 ركعة = 10 درجات)</span>
              <div className="flex items-center gap-2">
                <button onClick={() => updateNawafil(Math.max(0, stats.nawafilRakats - 2))} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center"><Minus size={14} /></button>
                <span className="w-6 text-center font-bold">{stats.nawafilRakats}</span>
                <button onClick={() => updateNawafil(stats.nawafilRakats + 2)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center"><Plus size={14} /></button>
              </div>
            </div>
          )}
        </div>

        {/* Group 5: Good Deeds */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <button 
            onClick={() => toggleGroup('charity')}
            className="w-full p-4 flex items-center justify-between text-right"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-red-500">
                <Heart size={18} />
              </div>
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">سرور تدخله على مسلم</span>
            </div>
            {expandedGroup === 'charity' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {expandedGroup === 'charity' && (
            <div className="px-4 pb-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
              <button 
                onClick={() => updateGoodDeed('iftar')}
                className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${stats.goodDeeds.iftar ? 'bg-orange-500 text-white' : 'bg-slate-50 dark:bg-slate-700/50 text-slate-500'}`}
              >
                <div className="flex items-center gap-2"><Utensils size={14} /> <span className="text-xs font-bold">إفطار صائم</span></div>
                {stats.goodDeeds.iftar && <Check size={14} />}
              </button>
              <button 
                onClick={() => updateGoodDeed('sadaqah')}
                className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${stats.goodDeeds.sadaqah ? 'bg-emerald-500 text-white' : 'bg-slate-50 dark:bg-slate-700/50 text-slate-500'}`}
              >
                <div className="flex items-center gap-2"><Coins size={14} /> <span className="text-xs font-bold">صدقة</span></div>
                {stats.goodDeeds.sadaqah && <Check size={14} />}
              </button>
              <button 
                onClick={() => updateGoodDeed('general')}
                className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${stats.goodDeeds.general ? 'bg-blue-500 text-white' : 'bg-slate-50 dark:bg-slate-700/50 text-slate-500'}`}
              >
                <div className="flex items-center gap-2"><Heart size={14} /> <span className="text-xs font-bold">عمل خير عام</span></div>
                {stats.goodDeeds.general && <Check size={14} />}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Daily Challenge Section */}
      {challenge && (
        <div className={`p-5 rounded-3xl relative overflow-hidden transition-all duration-300 ${challenge.completed ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg'}`}>
          {!challenge.completed && <div className="absolute top-0 right-0 p-4 opacity-10"><Trophy size={80} /></div>}
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
              <h3 className={`font-bold flex items-center gap-2 ${challenge.completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-white'}`}>
                {challenge.completed ? <CheckCircle2 size={18} /> : <Sparkles size={18} />}
                تحدي اليوم
              </h3>
              {!challenge.completed && <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold">+{challenge.points} ن</span>}
            </div>
            <h4 className={`text-lg font-bold mb-1 ${challenge.completed ? 'text-slate-800 dark:text-slate-200' : 'text-white'}`}>{challenge.title}</h4>
            <p className={`text-sm mb-4 leading-relaxed ${challenge.completed ? 'text-slate-500 dark:text-slate-400' : 'text-indigo-100'}`}>
              {challenge.description}
            </p>
            {!challenge.completed ? (
              <button 
                onClick={completeChallenge}
                className="w-full bg-white text-indigo-600 py-3 rounded-2xl font-bold shadow-md hover:bg-slate-50 active:scale-95 transition-all"
              >
                تم الإنجاز بنجاح
              </button>
            ) : (
              <div className="text-center font-bold text-emerald-600 dark:text-emerald-400 text-sm">أحسنت! تم الحصول على {challenge.points} نقطة</div>
            )}
          </div>
        </div>
      )}

      {/* Daily Inspiration */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm leading-relaxed">
        <h3 className="text-slate-400 text-xs font-bold mb-2 flex items-center gap-1">
          <Sparkles size={14} className="text-amber-400" /> حكمة اليوم
        </h3>
        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{inspiration}</p>
      </div>

      {/* Quran Card */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-500 dark:text-indigo-400">
              <BookOpen size={28} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200">ورد القرآن الكريم</h4>
              <p className="text-xs text-slate-400">
                {stats.quranPages > 0 && `${stats.quranPages} صفحة`}
                {stats.quranPages > 0 && stats.quranJuz > 0 && ' و '}
                {stats.quranJuz > 0 && `${stats.quranJuz} جزء`}
                {stats.quranPages === 0 && stats.quranJuz === 0 && 'ابدأ وردك اليوم'}
              </p>
            </div>
          </div>
          
          {!isEditingQuran ? (
            <button 
              onClick={() => setIsEditingQuran(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-2xl font-bold text-sm transition-all shadow-md active:scale-95"
            >
              تعديل
            </button>
          ) : (
            <div className="flex flex-col items-end gap-2">
              <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl text-[10px] font-bold">
                <button 
                  onClick={() => setEditMode('pages')}
                  className={`px-2 py-1 rounded-lg transition-all ${editMode === 'pages' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
                >صفحات</button>
                <button 
                  onClick={() => setEditMode('juz')}
                  className={`px-2 py-1 rounded-lg transition-all ${editMode === 'juz' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
                >أجزاء</button>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 p-1 rounded-2xl border border-slate-200 dark:border-slate-600">
                <button 
                  onClick={() => editMode === 'pages' ? updateQuran(Math.max(0, stats.quranPages - 1)) : updateQuranJuz(Math.max(0, stats.quranJuz - 1))}
                  className="w-8 h-8 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-bold text-slate-800 dark:text-slate-200">
                  {editMode === 'pages' ? stats.quranPages : stats.quranJuz}
                </span>
                <button 
                  onClick={() => editMode === 'pages' ? updateQuran(stats.quranPages + 1) : updateQuranJuz(stats.quranJuz + 1)}
                  className="w-8 h-8 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm"
                >
                  <Plus size={16} />
                </button>
                <button 
                  onClick={() => setIsEditingQuran(false)}
                  className="ml-1 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-100"
                >
                  <Check size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
