import React, { useState, useMemo, useEffect } from 'react';
import { Plus, BookOpen, Trophy, Target, DownloadCloud } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { CourseCard } from './components/CourseCard';
import { AddCourseModal } from './components/AddCourseModal';

function App() {
  const [courses, setCourses] = useLocalStorage('antigravity_courses', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    }
  };

  const handleAddCourse = (newCourse) => {
    setCourses([...courses, { ...newCourse, id: crypto.randomUUID(), completedModules: 0 }]);
  };

  const handleIncrement = (id) => {
    setCourses(courses.map(course => {
      if (course.id === id && course.completedModules < course.totalModules) {
        return { ...course, completedModules: course.completedModules + 1 };
      }
      return course;
    }));
  };

  const stats = useMemo(() => {
    const totalCourses = courses.length;
    let totalModules = 0;
    let completedModules = 0;

    courses.forEach(c => {
      totalModules += c.totalModules;
      completedModules += c.completedModules;
    });

    const completionPercentage = totalModules === 0 
      ? 0 
      : Math.round((completedModules / totalModules) * 100);

    const activeCourses = courses.filter(c => c.completedModules < c.totalModules).length;
    const completedCourses = totalCourses - activeCourses;

    return { totalCourses, activeCourses, completedCourses, completionPercentage };
  }, [courses]);

  return (
    <div className="relative min-h-screen pb-20">
      {/* Navbar / Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-black/40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform duration-500">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white glow-text">
              Levellabs<span className="text-purple-400">.</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 border border-white/20 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-medium transition-all hover:-translate-y-1 active:scale-95 shadow-[0_0_20px_rgba(168,85,247,0.4)] animate-in fade-in"
              >
                <DownloadCloud className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Install App</span>
                <span className="sm:hidden">Install</span>
              </button>
            )}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-medium transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(168,85,247,0.3)]"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Add Course</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
        {/* Dashboard Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-in slide-in-from-bottom-8 duration-700 ease-out">
          {/* Main Stat */}
          <div className="glass rounded-3xl p-6 md:p-8 relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-pink-500/20 blur-3xl rounded-full group-hover:bg-pink-500/30 transition-colors duration-500" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-slate-400 font-medium mb-1">Total Progress</p>
                <div className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-2">
                  {stats.completionPercentage}%
                </div>
                <p className="text-sm text-slate-500">Across all active courses</p>
              </div>
              <div className="p-3 glass rounded-2xl bg-white/5">
                <Target className="w-6 h-6 text-pink-400" />
              </div>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 md:p-8 relative overflow-hidden group">
             <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/20 blur-3xl rounded-full group-hover:bg-purple-500/30 transition-colors duration-500" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-slate-400 font-medium mb-1">Active Courses</p>
                <div className="text-4xl font-black text-white mb-2">{stats.activeCourses}</div>
                <p className="text-sm text-slate-500">Currently in progress</p>
              </div>
              <div className="p-3 glass rounded-2xl bg-white/5">
                <BookOpen className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 md:p-8 relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-green-500/10 blur-3xl rounded-full group-hover:bg-green-500/20 transition-colors duration-500" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-slate-400 font-medium mb-1">Completed</p>
                <div className="text-4xl font-black text-white mb-2">{stats.completedCourses}</div>
                <p className="text-sm text-slate-500">Fully mastered courses</p>
              </div>
              <div className="p-3 glass rounded-2xl bg-white/5">
                <Trophy className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              Your Library
              <div className="h-px bg-white/10 flex-1 ml-4" />
            </h2>
          </div>

          {courses.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center border-dashed border-2 border-white/10">
              <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                <BookOpen className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No courses yet</h3>
              <p className="text-slate-400 max-w-sm mx-auto mb-6">
                Start your journey by adding a new course to track your progression and mastery.
              </p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-medium transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]"
              >
                Launch First Course
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-1000 slide-in-from-bottom-4">
              {courses.map(course => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  onIncrement={handleIncrement} 
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <AddCourseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddCourse}
      />
    </div>
  );
}

export default App;
