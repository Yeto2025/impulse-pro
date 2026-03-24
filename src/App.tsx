import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Image as ImageIcon,
  History, 
  TrendingUp, 
  X, 
  Loader2,
  ChevronRight,
  PieChart as PieChartIcon,
  Settings,
  FileText,
  Download,
  Share2,
  Edit2,
  Trash2,
  Palette,
  Utensils,
  Car,
  HeartPulse,
  Home,
  Gamepad2,
  DollarSign,
  MoreHorizontal,
  LogOut,
  User as UserIcon,
  UserPlus,
  Crown,
  CreditCard,
  Phone,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Transaction } from './lib/gemini';
import { auth, signInWithGoogle, logout, db } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Mock initial data - Empty for clean start
const INITIAL_TRANSACTIONS: Transaction[] = [];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('impulse_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [savingsGoal, setSavingsGoal] = useState<number>(() => {
    const saved = localStorage.getItem('impulse_savings_goal');
    return saved ? parseFloat(saved) : 5000; // Default goal
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'invoices'>('dashboard');
  const [invoices, setInvoices] = useState<any[]>(() => {
    const saved = localStorage.getItem('impulse_invoices');
    return saved ? JSON.parse(saved) : [];
  });
  const [companyProfile, setCompanyProfile] = useState(() => {
    const saved = localStorage.getItem('impulse_company_profile');
    return saved ? JSON.parse(saved) : { companyName: '', nit: '', logoUrl: '' };
  });
  const [operatingExpenses, setOperatingExpenses] = useState<any[]>(() => {
    const saved = localStorage.getItem('impulse_operating_expenses');
    return saved ? JSON.parse(saved) : [];
  });
  const [isOpExpModalOpen, setIsOpExpModalOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        const fetchProfile = async () => {
          const docRef = doc(db, 'users', u.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data());
          }
        };
        fetchProfile();
      } else {
        setProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('impulse_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('impulse_operating_expenses', JSON.stringify(operatingExpenses));
  }, [operatingExpenses]);

  useEffect(() => {
    localStorage.setItem('impulse_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('impulse_company_profile', JSON.stringify(companyProfile));
  }, [companyProfile]);

  useEffect(() => {
    localStorage.setItem('impulse_savings_goal', savingsGoal.toString());
  }, [savingsGoal]);

  const totalBalance = transactions.reduce((acc, curr) => 
    curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0
  );

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...t, id: Math.random().toString(36).substr(2, 9) };
    setTransactions([newTransaction, ...transactions]);
    setIsModalOpen(false);
  };

  const updateTransaction = (id: string, updatedData: Omit<Transaction, 'id'>) => {
    setTransactions(transactions.map(t => t.id === id ? { ...updatedData, id } : t));
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleEditClick = (t: Transaction) => {
    setEditingTransaction(t);
    setIsModalOpen(true);
  };

  const resetData = () => {
    setTransactions([]);
    setInvoices([]);
    setOperatingExpenses([]);
    localStorage.removeItem('impulse_transactions');
    localStorage.removeItem('impulse_invoices');
    localStorage.removeItem('impulse_operating_expenses');
    setIsSettingsModalOpen(false);
  };

  return (
    <div className="min-h-screen w-full bg-premium-black relative overflow-hidden flex flex-col shadow-2xl">
      {/* Header */}
      <header className="px-6 md:px-12 pt-12 pb-6 flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-white/20 border border-white/5">
            <img 
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgn2on7GUzVrK26XTBTK9SMAElmdSsJ_jHIXHAZn7rIGtbDhYqfr4Q-5oTVo7zlfCLSSu37wZ7Fu7Dj7bOP35NthPBZH1gWtlPGRpddxNBj8Vbb9htG3tPn1uEXtMfkrrKVd5CngTzk7YfWfqoZ23d3NZRoexwit1RxhyhqfBorCR6FtGO_9mIpzHoSYKsu/s1758/SDFAFD12E21223R23223.png" 
              alt="Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2 tracking-normal">
              Impulse 
              {profile?.isSubscribed && (
                <span className="bg-apple-green/20 text-apple-green text-[8px] px-2 py-0.5 rounded-full border border-apple-green/30 uppercase font-black tracking-widest">
                  Premium
                </span>
              )}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSettingsModalOpen(true)}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-apple-green/10 transition-colors group"
            title="Configuración"
          >
            <Settings className="w-5 h-5 text-white/20 group-hover:text-apple-green transition-colors" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 md:px-12 pb-32 overflow-y-auto w-full">
        {activeTab === 'dashboard' ? (
          <Dashboard 
            balance={totalBalance} 
            income={totalIncome} 
            expenses={totalExpenses} 
            transactions={transactions}
            onEditTransaction={handleEditClick}
            savingsGoal={savingsGoal}
            onUpdateGoal={setSavingsGoal}
          />
        ) : activeTab === 'history' ? (
          <HistoryList transactions={transactions} onEditTransaction={handleEditClick} />
        ) : (
          <InvoiceList 
            invoices={invoices} 
            operatingExpenses={operatingExpenses}
            onNew={() => setIsInvoiceModalOpen(true)} 
            onNewOpExp={() => setIsOpExpModalOpen(true)}
            onEdit={(inv: any) => {
              setEditingInvoice(inv);
              setIsInvoiceModalOpen(true);
            }}
            onDelete={(id: string) => {
              setInvoices(invoices.filter(inv => inv.id !== id));
            }}
            onDeleteOpExp={(id: string) => {
              setOperatingExpenses(operatingExpenses.filter(e => e.id !== id));
            }}
            onUpdateInvoice={(updated: any) => {
              setInvoices(invoices.map(inv => inv.id === updated.id ? updated : inv));
            }}
          />
        )}
      </main>

      {/* Navigation */}
      <div className="fixed bottom-8 left-0 right-0 px-6 z-40 w-full pointer-events-none">
        <nav className="max-w-[380px] mx-auto h-16 glass-card bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[28px] flex justify-around items-center px-2 gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto relative overflow-hidden">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`relative flex-1 h-full flex flex-col items-center justify-center gap-1 transition-all duration-500 group ${activeTab === 'dashboard' ? 'text-white scale-110' : 'text-white/30 hover:text-white/60'}`}
          >
            <div className={`p-2 rounded-xl transition-colors duration-300 ${activeTab === 'dashboard' ? 'bg-white/10' : 'group-hover:bg-white/5'}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[7px] uppercase font-black tracking-[0.1em]">Resumen</span>
            {activeTab === 'dashboard' && (
              <motion.div layoutId="nav-indicator" className="absolute bottom-1 w-1 h-1 rounded-full bg-white shadow-[0_0_10px_#fff]" />
            )}
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 h-full flex flex-col items-center justify-center gap-1 text-white/30 hover:text-white/60 transition-all duration-500 group active:scale-90"
          >
            <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[7px] uppercase font-black tracking-[0.1em]">Nuevo</span>
          </button>

          <button 
            onClick={() => setActiveTab('history')}
            className={`relative flex-1 h-full flex flex-col items-center justify-center gap-1 transition-all duration-500 group ${activeTab === 'history' ? 'text-white scale-110' : 'text-white/30 hover:text-white/60'}`}
          >
            <div className={`p-2 rounded-xl transition-colors duration-300 ${activeTab === 'history' ? 'bg-white/10' : 'group-hover:bg-white/5'}`}>
              <History className="w-5 h-5" />
            </div>
            <span className="text-[7px] uppercase font-black tracking-[0.1em]">Historial</span>
            {activeTab === 'history' && (
              <motion.div layoutId="nav-indicator" className="absolute bottom-1 w-1 h-1 rounded-full bg-white shadow-[0_0_10px_#fff]" />
            )}
          </button>

          <button 
            onClick={() => setActiveTab('invoices')}
            className={`relative flex-1 h-full flex flex-col items-center justify-center gap-1 transition-all duration-500 group ${activeTab === 'invoices' ? 'text-white scale-110' : 'text-white/30 hover:text-white/60'}`}
          >
            <div className={`p-2 rounded-xl transition-colors duration-300 ${activeTab === 'invoices' ? 'bg-white/10' : 'group-hover:bg-white/5'}`}>
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[7px] uppercase font-black tracking-[0.1em]">Facturas</span>
            {activeTab === 'invoices' && (
              <motion.div layoutId="nav-indicator" className="absolute bottom-1 w-1 h-1 rounded-full bg-white shadow-[0_0_10px_#fff]" />
            )}
          </button>

          <button 
            onClick={() => setIsProfileModalOpen(true)}
            className="relative flex-1 h-full flex flex-col items-center justify-center gap-1 text-white/30 hover:text-white/60 transition-all duration-500 group active:scale-90"
          >
            <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
              <Crown className="w-5 h-5 text-apple-green" />
            </div>
            <span className="text-[7px] uppercase font-black tracking-[0.1em]">Premium</span>
          </button>
        </nav>
      </div>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <AddTransactionModal 
            onClose={() => {
              setIsModalOpen(false);
              setEditingTransaction(null);
            }} 
            onAdd={editingTransaction ? (data: any) => updateTransaction(editingTransaction.id, data) : addTransaction}
            initialData={editingTransaction}
          />
        )}
      </AnimatePresence>

      {/* Invoice Generator Modal */}
      <AnimatePresence>
        {isInvoiceModalOpen && (
          <InvoiceGeneratorModal 
            initialData={editingInvoice}
            companyProfile={companyProfile}
            onUpdateProfile={setCompanyProfile}
            onClose={() => {
              setIsInvoiceModalOpen(false);
              setEditingInvoice(null);
            }}
            onSave={(invoice: any) => {
              if (editingInvoice) {
                setInvoices(invoices.map(inv => inv.id === editingInvoice.id ? invoice : inv));
              } else {
                setInvoices([invoice, ...invoices]);
              }
              setIsInvoiceModalOpen(false);
              setEditingInvoice(null);
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isOpExpModalOpen && (
          <OperatingExpensesModal 
            onClose={() => setIsOpExpModalOpen(false)}
            onSave={(expense: any) => {
              setOperatingExpenses([{ ...expense, id: Math.random().toString(36).substr(2, 9) }, ...operatingExpenses]);
              setIsOpExpModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isProfileModalOpen && (
          <ProfileModal 
            user={user}
            onClose={() => setIsProfileModalOpen(false)}
            onLogin={signInWithGoogle}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isSettingsModalOpen && (
          <SettingsModal 
            user={user}
            onClose={() => setIsSettingsModalOpen(false)} 
            onConfirmReset={resetData}
            onLogin={signInWithGoogle}
            onLogout={logout}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Dashboard({ balance, income, expenses, transactions, onEditTransaction, savingsGoal, onUpdateGoal }: any) {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(savingsGoal.toString());

  const progress = Math.min(Math.max((balance / savingsGoal) * 100, 0), 100);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempGoal);
    if (!isNaN(val) && val > 0) {
      onUpdateGoal(val);
      setIsEditingGoal(false);
    }
  };

  // Calculate cumulative balance for the chart
  // We need to calculate the balance state at each point in time
  const getChartData = () => {
    if (transactions.length === 0) return [];
    
    // Sort transactions by date ascending for the chart
    const sorted = [...transactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let runningBalance = 0;
    return sorted.map((t: any) => {
      if (t.type === 'income') {
        runningBalance += t.amount;
      } else {
        runningBalance -= t.amount;
      }
      return {
        date: format(new Date(t.date), 'dd MMM HH:mm'),
        balance: runningBalance,
        amount: t.amount,
        type: t.type
      };
    }).slice(-10); // Show last 10 points
  };

  const chartData = getChartData();

  // Determine chart color based on the overall trend of the visible data
  const isUp = chartData.length > 0 
    ? chartData[chartData.length - 1].balance >= (chartData.length > 1 ? chartData[0].balance : 0)
    : true;
  const chartColor = isUp ? '#88d629' : '#ef4444';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Balance Card & Chart Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 premium-gradient relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -mr-16 -mt-16 transition-colors duration-500 ${isUp ? 'bg-white/10' : 'bg-red-500/10'}`} />
          
          <div className="flex items-center gap-6 relative z-10">
            {/* Savings Goal Progress - Smaller and on the left */}
            <button 
              onClick={() => {
                setTempGoal(savingsGoal.toString());
                setIsEditingGoal(true);
              }}
              className="relative flex flex-col items-center group active:scale-95 transition-transform"
            >
              <div className="relative w-16 h-16">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="5"
                    fill="transparent"
                    className="text-white/5"
                  />
                  <motion.circle
                    cx="32"
                    cy="32"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="5"
                    fill="transparent"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="text-white"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">{Math.round(progress)}%</span>
                </div>
              </div>
            </button>

            <div className="space-y-0.5">
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Balance Total</p>
              <h2 className="text-4xl font-bold tracking-tighter text-white">
                ${Math.round(balance).toLocaleString()}
              </h2>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Ingresos</p>
                <p className="font-bold text-sm text-white">+${Math.round(income).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Gastos</p>
                <p className="font-bold text-sm text-white/60">-${Math.round(expenses).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg tracking-tight">Evolución</h3>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isUp ? 'bg-apple-green' : 'bg-red-500'} animate-pulse`} />
              <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Hoy</span>
            </div>
          </div>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 8 }} 
                  axisLine={false} 
                  tickLine={false}
                  dy={10}
                />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="balance" stroke={chartColor} fillOpacity={1} fill="url(#colorBalance)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {transactions.length > 0 && (
            <div className="pt-2 flex gap-2 overflow-x-auto no-scrollbar">
              {transactions.slice(0, 5).map((t: any) => (
                <div key={t.id} className="flex-shrink-0 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
                  <p className="text-[8px] text-white/40 font-bold uppercase tracking-tighter">
                    {format(new Date(t.date), 'HH:mm')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Goal Edit Modal */}
      <AnimatePresence>
        {isEditingGoal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs glass-card p-8 space-y-6"
            >
              <div className="text-center">
                <h3 className="text-xl font-bold tracking-tight text-white">Meta de Ahorro</h3>
                <p className="text-white/40 text-xs uppercase tracking-widest mt-1">Establece tu objetivo</p>
              </div>
              <form onSubmit={handleGoalSubmit} className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-xl">$</span>
                  <input 
                    type="number" 
                    autoFocus
                    value={tempGoal}
                    onChange={e => setTempGoal(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-10 pr-6 text-2xl font-bold tracking-tighter focus:outline-none focus:border-apple-green/50 transition-colors text-white"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <button 
                    type="submit"
                    className="w-full py-4 apple-gradient rounded-2xl text-premium-black font-bold uppercase tracking-widest text-xs shadow-lg shadow-apple-green/20"
                  >
                    Guardar Meta
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsEditingGoal(false)}
                    className="w-full py-4 bg-white/5 rounded-2xl text-white/60 font-bold uppercase tracking-widest text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg tracking-tight">Recientes</h3>
          {transactions.length > 0 && (
            <button className="text-white/40 text-xs font-bold uppercase tracking-widest">Ver Todo</button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transactions.length > 0 ? (
            transactions.slice(0, 6).map((t: any) => (
              <TransactionItem key={t.id} transaction={t} onClick={() => onEditTransaction(t)} />
            ))
          ) : (
            <div className="col-span-full p-8 glass-card border-dashed border-white/10 flex flex-col items-center justify-center text-center">
              <p className="text-white/20 text-sm italic">No hay transacciones recientes</p>
              <p className="text-white/10 text-[10px] mt-1">Presiona + para agregar una</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function InvoiceList({ invoices, operatingExpenses, onNew, onNewOpExp, onEdit, onDelete, onDeleteOpExp, onUpdateInvoice }: any) {
  const [activeOptionsId, setActiveOptionsId] = useState<string | null>(null);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);
  const [showOpExp, setShowOpExp] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<any>(null);

  const totalOpExp = operatingExpenses.reduce((acc: number, curr: any) => acc + (parseFloat(curr.amount) || 0), 0);

  const stats = invoices.reduce((acc: any, inv: any) => {
    if (inv.type === 'invoice') {
      acc.invoices++;
      const profit = inv.items.reduce((pAcc: number, item: any) => {
        const unit = parseFloat(item.unitPrice) || 0;
        const cost = parseFloat(item.costPrice) || 0;
        return pAcc + (item.quantity * (unit - cost));
      }, 0);
      acc.earnings += profit;
      acc.abonos += (parseFloat(inv.abono) || 0);
      acc.remaining += (inv.total - (parseFloat(inv.abono) || 0));
    } else {
      acc.quotes++;
    }
    return acc;
  }, { invoices: 0, quotes: 0, earnings: 0, abonos: 0, remaining: 0 });

  // Subtract operating expenses from earnings
  stats.earnings -= totalOpExp;

  const getProfitChartData = () => {
    const invoiceProfits = invoices
      .filter(inv => inv.type === 'invoice')
      .map(inv => {
        const profit = inv.items.reduce((acc: number, item: any) => {
          const unit = parseFloat(item.unitPrice) || 0;
          const cost = parseFloat(item.costPrice) || 0;
          return acc + (item.quantity * (unit - cost));
        }, 0);
        return { date: new Date(inv.date), amount: profit };
      });

    const expenses = operatingExpenses.map(exp => ({
      date: new Date(exp.date),
      amount: -parseFloat(exp.amount) || 0
    }));

    const allEvents = [...invoiceProfits, ...expenses].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    let cumulativeProfit = 0;
    return allEvents.map(event => {
      cumulativeProfit += event.amount;
      return {
        date: format(event.date, 'dd/MM'),
        profit: cumulativeProfit
      };
    });
  };

  const profitData = getProfitChartData();

  const downloadInvoice = async (invoice: any) => {
    // Create a temporary container for the high-quality render
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);

    // Render the invoice in the container
    const root = document.createElement('div');
    container.appendChild(root);

    const gradient = invoice.gradientColors ? 
      `linear-gradient(135deg, ${invoice.gradientColors[0]} 0%, ${invoice.gradientColors[1]} 100%)` : 
      '#000';

    // We'll use a simplified version of the preview for the capture
    // but styled exactly like the reference image
    const textColor = invoice.textColor || '#ffffff';

    root.innerHTML = `
      <div id="capture-invoice" style="
        width: 800px;
        background: ${gradient};
        color: ${textColor};
        padding: 60px;
        font-family: 'Cerebri Sans', 'Inter', sans-serif;
        border-radius: 40px;
        display: flex;
        flex-direction: column;
        position: relative;
      ">
        <div style="text-align: center; margin-bottom: 40px;">
          <p style="font-size: 14px; font-weight: 900; letter-spacing: 0.2em; color: ${textColor}66; text-transform: uppercase;">
            ${format(new Date(invoice.date), "d 'DE' MMMM 'DE' yyyy", { locale: es }).toUpperCase()}
          </p>
        </div>

        <div style="display: flex; align-items: center; gap: 30px; margin-bottom: 50px;">
          <div style="width: 100px; height: 100px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden;">
            ${invoice.logoUrl ? 
              `<img src="${invoice.logoUrl}" style="width: 100%; height: 100%; object-fit: cover;" />` : 
              `<div style="width: 70px; height: 70px; border-radius: 50%; border: 6px solid #000; display: flex; align-items: center; justify-content: center;">
                <span style="color: #000; font-weight: 900; font-size: 40px; font-style: italic;">U</span>
              </div>`
            }
          </div>
          <div>
            <h3 style="font-weight: 900; font-size: 36px; margin: 0; text-transform: uppercase; color: ${textColor}b3;">${invoice.companyName}</h3>
            <p style="font-size: 14px; font-weight: 700; color: ${textColor}4d; margin-top: 5px;">NIT: ${invoice.nit}</p>
          </div>
        </div>

        <div style="margin-bottom: 50px;">
          <h2 style="font-size: 56px; font-weight: 900; letter-spacing: -0.04em; margin: 0; line-height: 1;">${invoice.clientName}</h2>
          ${invoice.clientPhone ? `<p style="font-size: 24px; font-weight: 700; color: ${textColor}66; margin-top: 10px;">${invoice.clientPhone}</p>` : ''}
        </div>

        <div style="flex: 1; margin-bottom: 40px;">
          ${invoice.items.map((item: any) => `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px;">
              <div style="display: flex; gap: 25px;">
                <span style="font-size: 28px; font-weight: 900; color: ${textColor}33;">${item.quantity}</span>
                <p style="font-size: 32px; font-weight: 600; margin: 0; line-height: 1.2;">${item.description}</p>
              </div>
              <div style="text-align: right;">
                <p style="font-size: 28px; font-weight: 700; margin: 0;">$${(parseFloat(item.unitPrice) || 0).toLocaleString()}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid ${textColor}1a; padding-top: 40px;">
          <div style="display: flex; flex-direction: column; gap: 40px;">
            <div>
              <p style="font-size: 12px; font-weight: 900; letter-spacing: 0.1em; color: ${textColor}33; text-transform: uppercase; margin-bottom: 10px;">Fecha Entrega</p>
              <p style="font-size: 24px; font-weight: 700; margin: 0;">${format(new Date(invoice.deliveryDate), "dd/MM/yyyy h:mma")}</p>
            </div>
            <div>
              <p style="font-size: 12px; font-weight: 900; letter-spacing: 0.1em; color: ${textColor}33; text-transform: uppercase; margin-bottom: 10px;">Estado</p>
              <p style="font-size: 32px; font-weight: 900; margin: 0; letter-spacing: 0.05em;">${invoice.status}</p>
            </div>
          </div>

          <div style="background: ${textColor}08; padding: 40px; border-radius: 32px; border: 1px solid ${textColor}0d; min-width: 250px;">
            <div style="text-align: right; margin-bottom: 30px;">
              <p style="font-size: 12px; font-weight: 900; letter-spacing: 0.1em; color: ${textColor}33; text-transform: uppercase; margin-bottom: 10px;">Total</p>
              <p style="font-size: 56px; font-weight: 900; margin: 0; letter-spacing: -0.04em;">$${invoice.total.toLocaleString()}</p>
            </div>
            <div style="text-align: right;">
              <p style="font-size: 12px; font-weight: 900; letter-spacing: 0.1em; color: ${textColor}33; text-transform: uppercase; margin-bottom: 10px;">Restante</p>
              <p style="font-size: 36px; font-weight: 900; margin: 0; color: ${textColor}99;">$${(invoice.status === 'ABONO' ? invoice.total / 2 : 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    try {
      const element = document.getElementById('capture-invoice');
      if (element) {
        const canvas = await html2canvas(element, {
          backgroundColor: null,
          scale: 2,
          logging: false,
          useCORS: true
        });
        const link = document.createElement('a');
        link.download = `Factura-${invoice.clientName}-${format(new Date(), 'yyyyMMdd')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } catch (err) {
      console.error('Error downloading invoice:', err);
    } finally {
      document.body.removeChild(container);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white">
            {showOpExp ? 'Gastos Operativos' : 'Facturas'}
          </h2>
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <button 
            onClick={() => setIsStatsModalOpen(true)}
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-apple-green/10 transition-colors group shrink-0"
            title="Ver Estadísticas"
          >
            <PieChartIcon className="w-5 h-5 text-white/20 group-hover:text-apple-green transition-colors" />
          </button>
          <button 
            onClick={() => setShowOpExp(!showOpExp)}
            className={`flex-1 md:flex-none px-4 py-2 md:py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border ${showOpExp ? 'bg-white/20 text-white border-white/20' : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10'}`}
          >
            {showOpExp ? 'Ver Facturas' : 'Gastos/Inversión'}
          </button>
          <button 
            onClick={showOpExp ? onNewOpExp : onNew}
            className="flex-1 md:flex-none px-4 py-2 md:py-3 bg-apple-green text-premium-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-apple-green/20"
          >
            {showOpExp ? 'Nuevo Gasto' : 'Nueva'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isStatsModalOpen && (
          <BillingStatsModal stats={stats} onClose={() => setIsStatsModalOpen(false)} />
        )}
        {previewInvoice && (
          <InvoicePreviewModal 
            invoice={previewInvoice} 
            onClose={() => setPreviewInvoice(null)} 
            onDownload={() => downloadInvoice(previewInvoice)}
            onUpdate={(updated: any) => {
              onUpdateInvoice(updated);
              setPreviewInvoice(updated);
            }}
          />
        )}
      </AnimatePresence>

      {!showOpExp ? (
        <>
          {/* Profit Chart */}
          {profitData.length > 1 && (
            <div className="glass-card p-6 bg-white/[0.02]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Crecimiento de Ganancias</h3>
                <TrendingUp className="w-4 h-4 text-apple-green" />
              </div>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={profitData}>
                    <defs>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#88d629" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#88d629" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="profit" stroke="#88d629" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {invoices.length > 0 ? (
              invoices.map((inv: any) => {
                const totalProfit = inv.items.reduce((acc: number, item: any) => {
                  const unit = parseFloat(item.unitPrice) || 0;
                  const cost = parseFloat(item.costPrice) || 0;
                  return acc + (item.quantity * (unit - cost));
                }, 0);

                const isExpanded = expandedInvoiceId === inv.id;

                return (
                  <div key={inv.id} className="relative">
                    <div className={`glass-card overflow-hidden transition-all duration-500 ${isExpanded ? 'ring-1 ring-apple-green/30 bg-white/[0.05]' : 'bg-white/[0.02] hover:bg-white/[0.05]'}`}>
                      <button 
                        onClick={() => setExpandedInvoiceId(isExpanded ? null : inv.id)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                            {inv.logoUrl ? (
                              <img src={inv.logoUrl} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <FileText className="w-5 h-5 text-apple-green" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold tracking-tight text-sm">{inv.clientName}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-[10px] text-white/40 uppercase tracking-wider">{inv.type === 'invoice' ? 'Factura' : 'Cotización'}</p>
                              <span className="text-[10px] text-apple-green/60 font-bold">• Ganancia: ${totalProfit.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold tracking-tighter text-white">${inv.total.toLocaleString()}</p>
                            <p className="text-[8px] text-white/20">{format(new Date(inv.date), 'dd/MM/yyyy')}</p>
                          </div>
                          <ChevronRight className={`w-4 h-4 text-white/20 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: "circOut" }}
                            className="border-t border-white/5 bg-black/20"
                          >
                            <div className="p-6 space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/20">Detalles de Items</h4>
                                  <div className="space-y-2">
                                    {inv.items.map((item: any, idx: number) => (
                                      <div key={idx} className="flex justify-between items-center text-xs">
                                        <span className="text-white/60">{item.quantity}x {item.description}</span>
                                        <span className="font-mono text-white/40">${(item.quantity * item.unitPrice).toLocaleString()}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/20">Resumen Financiero</h4>
                                  <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-white/40">Total Bruto:</span>
                                      <span className="text-white font-bold">${inv.total.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-white/40">Abonado:</span>
                                      <span className="text-green-500 font-bold">${(parseFloat(inv.abono) || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-white/40">Pendiente:</span>
                                      <span className="text-red-500 font-bold">${(inv.total - (parseFloat(inv.abono) || 0)).toLocaleString()}</span>
                                    </div>
                                    <div className="pt-2 border-t border-white/5 flex justify-between">
                                      <span className="text-apple-green font-bold">Ganancia Neta:</span>
                                      <span className="text-apple-green font-bold">${totalProfit.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 pt-4 border-t border-white/5 overflow-x-auto pb-2">
                                <button 
                                  onClick={() => setPreviewInvoice(inv)}
                                  className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white transition-colors shrink-0"
                                  title="Vista Previa"
                                >
                                  <ImageIcon className="w-3 h-3 text-apple-green" />
                                  <span className="hidden md:inline">Vista Previa</span>
                                </button>
                                <button 
                                  onClick={() => {
                                    const text = `Hola ${inv.clientName}, adjunto tu factura de ${inv.companyName}.`;
                                    const phone = inv.clientPhone ? inv.clientPhone.replace(/\D/g, '') : '';
                                    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
                                    window.open(url, '_blank');
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white transition-colors shrink-0"
                                  title="Compartir"
                                >
                                  <Share2 className="w-3 h-3 text-apple-green" />
                                  <span className="hidden md:inline">Compartir</span>
                                </button>
                                <button 
                                  onClick={() => onEdit(inv)}
                                  className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white transition-colors shrink-0"
                                  title="Editar"
                                >
                                  <Edit2 className="w-3 h-3 text-apple-green" />
                                  <span className="hidden md:inline">Editar</span>
                                </button>
                                <button 
                                  onClick={() => downloadInvoice(inv)}
                                  className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white transition-colors shrink-0"
                                  title="Descargar"
                                >
                                  <Download className="w-3 h-3 text-apple-green" />
                                  <span className="hidden md:inline">Descargar</span>
                                </button>
                                <button 
                                  onClick={() => {
                                    if (confirm('¿Eliminar esta factura?')) {
                                      onDelete(inv.id);
                                    }
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-red-500 transition-colors shrink-0"
                                  title="Borrar"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span className="hidden md:inline">Borrar</span>
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 glass-card border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                <FileText className="w-12 h-12 text-white/5 mb-4" />
                <p className="text-white/20 text-sm">No has generado facturas</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="glass-card p-6 bg-apple-green/5 border border-apple-green/10">
            <p className="text-[10px] text-apple-green uppercase tracking-widest mb-1">Inversión Total en Materiales</p>
            <p className="text-4xl font-bold tracking-tighter text-white">${totalOpExp.toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {operatingExpenses.length > 0 ? (
              operatingExpenses.map((exp: any) => (
                <div key={exp.id} className="glass-card p-4 flex justify-between items-center bg-white/[0.02]">
                  <div>
                    <p className="font-bold text-sm">{exp.description}</p>
                    <p className="text-[10px] text-white/20 uppercase tracking-widest">{format(new Date(exp.date), 'dd MMM yyyy')}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-white">${parseFloat(exp.amount).toLocaleString()}</p>
                    <button 
                      onClick={() => onDeleteOpExp(exp.id)}
                      className="p-2 hover:bg-red-500/10 rounded-full text-red-500/40 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 glass-card border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                <p className="text-white/20 text-sm">No hay gastos operativos registrados</p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function BillingStatsModal({ stats, onClose }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-premium-black/90 backdrop-blur-md p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-lg glass-card p-8 space-y-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-white">Estadísticas</h3>
            <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">Resumen de Facturación</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-6 bg-white/[0.02] space-y-1">
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Facturas</p>
            <p className="text-3xl font-bold tracking-tighter text-white">{stats.invoices}</p>
          </div>
          <div className="glass-card p-6 bg-white/[0.02] space-y-1">
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Cotizaciones</p>
            <p className="text-3xl font-bold tracking-tighter text-white">{stats.quotes}</p>
          </div>
          <div className="glass-card p-6 bg-apple-green/10 border border-apple-green/20 col-span-2 space-y-1">
            <p className="text-[10px] text-apple-green uppercase tracking-widest font-bold">Ganancias Netas</p>
            <p className="text-4xl font-bold tracking-tighter text-apple-green">${Math.round(stats.earnings).toLocaleString()}</p>
          </div>
          <div className="glass-card p-6 bg-white/[0.02] space-y-1">
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Abonos</p>
            <p className="text-3xl font-bold tracking-tighter text-green-500">${Math.round(stats.abonos).toLocaleString()}</p>
          </div>
          <div className="glass-card p-6 bg-white/[0.02] space-y-1">
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Por Cobrar</p>
            <p className="text-3xl font-bold tracking-tighter text-red-500">${Math.round(stats.remaining).toLocaleString()}</p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-white/5 rounded-2xl text-white font-bold uppercase tracking-widest text-xs"
        >
          Cerrar
        </button>
      </motion.div>
    </motion.div>
  );
}

function OperatingExpensesModal({ onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'Gasto Operativo', // Default type
    date: format(new Date(), 'yyyy-MM-dd')
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-premium-black/90 backdrop-blur-md p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-md glass-card p-8 space-y-6"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white">Gasto / Inversión</h3>
            <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">Materiales e Inversión</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          onSave(formData);
        }} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, type: 'Gasto Operativo' })}
                className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${formData.type === 'Gasto Operativo' ? 'bg-apple-green text-premium-black' : 'bg-white/5 text-white/40 border border-white/10'}`}
              >
                Gasto Operativo
              </button>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, type: 'Inversión' })}
                className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${formData.type === 'Inversión' ? 'bg-apple-green text-premium-black' : 'bg-white/5 text-white/40 border border-white/10'}`}
              >
                Inversión
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Descripción</label>
            <input 
              type="text"
              required
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-apple-green/50 transition-colors"
              placeholder="Ej: Compra de materia prima"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Monto</label>
            <input 
              type="number"
              required
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-apple-green/50 transition-colors"
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Fecha</label>
            <input 
              type="date"
              required
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-apple-green/50 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button 
              type="submit"
              className="w-full py-4 apple-gradient rounded-2xl text-premium-black font-bold uppercase tracking-widest text-xs shadow-lg shadow-apple-green/20"
            >
              Registrar {formData.type}
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="w-full py-4 bg-white/5 rounded-2xl text-white/60 font-bold uppercase tracking-widest text-xs"
            >
              Cancelar
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function InvoiceGeneratorModal({ onClose, onSave, initialData, companyProfile, onUpdateProfile }: any) {
  const [formData, setFormData] = useState(initialData || {
    companyName: companyProfile.companyName || '',
    nit: companyProfile.nit || '',
    clientName: '',
    clientPhone: '',
    type: 'invoice',
    items: [{ quantity: 1, description: '', unitPrice: '', costPrice: '' }],
    deliveryDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    status: 'PENDIENTE',
    abono: '',
    logoUrl: companyProfile.logoUrl || '',
    gradientColors: ['#080505', '#1a1a1a']
  });

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { quantity: 1, description: '', unitPrice: '', costPrice: '' }]
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const logoUrl = reader.result as string;
        setFormData({ ...formData, logoUrl });
        onUpdateProfile({ ...companyProfile, logoUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!formData.companyName || !formData.clientName) {
      alert("Por favor llena los campos obligatorios");
      return;
    }

    // Update company profile persistence
    onUpdateProfile({
      companyName: formData.companyName,
      nit: formData.nit,
      logoUrl: formData.logoUrl
    });

    const total = formData.items.reduce((acc, item: any) => acc + (item.quantity * (parseFloat(item.unitPrice as string) || 0)), 0);
    onSave({
      ...formData,
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      date: initialData?.date || new Date().toISOString(),
      total
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="w-full max-w-md md:max-w-2xl bg-premium-gray rounded-t-[40px] md:rounded-[40px] p-8 space-y-6 relative mt-20"
      >
        <button onClick={onClose} className="absolute top-6 right-8 text-white/40">
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          <h2 className="text-xl tracking-tight">{initialData ? 'Editar Documento' : 'Generador de Documentos'}</h2>
          <p className="text-white/40 text-xs uppercase tracking-widest mt-1">Facturas y Cotizaciones</p>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
          {/* Logo Upload */}
          <div className="flex flex-col items-center gap-4 p-6 glass-card bg-white/5 border-dashed border-white/10">
            {formData.logoUrl ? (
              <div className="relative w-20 h-20 group">
                <img src={formData.logoUrl} className="w-full h-full rounded-full object-cover border-2 border-apple-green" />
                <button 
                  onClick={() => {
                    setFormData({...formData, logoUrl: ''});
                    onUpdateProfile({ ...companyProfile, logoUrl: '' });
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-2 cursor-pointer">
                <ImageIcon className="w-8 h-8 text-apple-green" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">Subir Logo</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </label>
            )}
          </div>

          <div className="flex gap-2 p-1 bg-white/5 rounded-2xl">
            <button 
              onClick={() => setFormData({...formData, type: 'invoice'})}
              className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${formData.type === 'invoice' ? 'bg-white/10 text-white' : 'text-white/40'}`}
            >
              Factura
            </button>
            <button 
              onClick={() => setFormData({...formData, type: 'quote'})}
              className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${formData.type === 'quote' ? 'bg-white/10 text-white' : 'text-white/40'}`}
            >
              Cotización
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Empresa"
              value={formData.companyName}
              onChange={e => setFormData({...formData, companyName: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-apple-green/50"
            />
            <input 
              type="text" 
              placeholder="NIT"
              value={formData.nit}
              onChange={e => setFormData({...formData, nit: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-apple-green/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Nombre del Cliente"
              value={formData.clientName}
              onChange={e => setFormData({...formData, clientName: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-apple-green/50"
            />
            <input 
              type="text" 
              placeholder="Celular (WhatsApp)"
              value={formData.clientPhone}
              onChange={e => setFormData({...formData, clientPhone: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-apple-green/50"
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex justify-between items-center">
              <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">Productos / Servicios</p>
              <button onClick={addItem} className="text-apple-green text-[10px] font-bold uppercase tracking-widest">+ Agregar</button>
            </div>
            {formData.items.map((item: any, idx: number) => (
              <div key={idx} className="space-y-2 p-4 bg-white/5 rounded-2xl relative">
                <input 
                  type="text" 
                  placeholder="Descripción del producto"
                  value={item.description}
                  onChange={e => updateItem(idx, 'description', e.target.value)}
                  className="w-full bg-transparent border-b border-white/10 py-1 text-xs focus:outline-none focus:border-apple-green/50"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input 
                    type="number" 
                    placeholder="Cant"
                    value={item.quantity}
                    onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                    className="bg-transparent border-b border-white/10 py-1 text-xs focus:outline-none"
                  />
                  <input 
                    type="number" 
                    placeholder="P. Unit"
                    value={item.unitPrice}
                    onChange={e => updateItem(idx, 'unitPrice', e.target.value)}
                    className="bg-transparent border-b border-white/10 py-1 text-xs focus:outline-none"
                  />
                  <input 
                    type="number" 
                    placeholder="Costo (Oculto)"
                    value={item.costPrice}
                    onChange={e => updateItem(idx, 'costPrice', e.target.value)}
                    className="bg-transparent border-b border-white/10 py-1 text-[8px] text-apple-green/40 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-bold tracking-widest text-white/40 ml-2">Entrega</label>
              <input 
                type="datetime-local" 
                value={formData.deliveryDate}
                onChange={e => setFormData({...formData, deliveryDate: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[10px] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-bold tracking-widest text-white/40 ml-2">Monto Abonado</label>
              <input 
                type="number" 
                placeholder="0.00"
                value={formData.abono}
                onChange={e => setFormData({...formData, abono: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[10px] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[8px] uppercase font-bold tracking-widest text-white/40 ml-2">Estado</label>
            <select 
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[10px] focus:outline-none text-white"
            >
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="ABONO">ABONO</option>
              <option value="PAGADO">PAGADO</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full py-5 apple-gradient rounded-2xl text-premium-black font-bold uppercase tracking-widest shadow-lg shadow-apple-green/20"
        >
          {initialData ? 'Guardar Cambios' : 'Generar Documento'}
        </button>
      </motion.div>
    </motion.div>
  );
}

function InvoicePreviewModal({ invoice, onClose, onDownload, onUpdate }: any) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleWhatsAppShare = () => {
    const text = `Hola ${invoice.clientName}, adjunto tu factura de ${invoice.companyName}.`;
    const phone = invoice.clientPhone ? invoice.clientPhone.replace(/\D/g, '') : '';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const gradient = invoice.gradientColors ? 
    `linear-gradient(135deg, ${invoice.gradientColors[0]} 0%, ${invoice.gradientColors[1]} 100%)` : 
    '#080505';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 p-2 md:p-4 overflow-y-auto"
    >
      <div className="w-full max-w-sm md:max-w-xs space-y-4 md:space-y-6 my-4">
        <div className="flex justify-between items-center px-2">
          <button onClick={onClose} className="text-white/40 flex items-center gap-2 text-[10px] md:text-xs uppercase font-bold tracking-widest">
            <ChevronRight className="w-4 h-4 rotate-180" /> Volver
          </button>
          <div className="flex gap-2 md:gap-4">
            <button 
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="text-apple-green flex items-center gap-1 md:gap-2 text-[8px] md:text-[10px] font-bold uppercase tracking-widest"
            >
              <Palette className="w-4 h-4 md:w-5 md:h-5" /> <span className="hidden xs:inline">Color</span>
            </button>
            <button onClick={handleWhatsAppShare} className="text-apple-green"><Share2 className="w-4 h-4 md:w-5 md:h-5" /></button>
            <button onClick={onDownload} className="text-apple-green"><Download className="w-4 h-4 md:w-5 md:h-5" /></button>
          </div>
        </div>

        {showColorPicker && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="glass-card p-4 md:p-6 bg-white/[0.02] border border-white/10 rounded-2xl md:rounded-3xl space-y-3 md:space-y-4"
          >
            <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-white/40">Personalización</p>
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              <div className="space-y-1">
                <label className="text-[7px] md:text-[8px] text-white/20 uppercase font-bold block">Fondo 1</label>
                <input 
                  type="color" 
                  value={invoice.gradientColors?.[0] || '#080505'} 
                  onChange={(e) => onUpdate({
                    ...invoice,
                    gradientColors: [e.target.value, invoice.gradientColors?.[1] || '#080505']
                  })}
                  className="w-full h-8 md:h-10 rounded-lg bg-transparent border border-white/10 cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[7px] md:text-[8px] text-white/20 uppercase font-bold block">Fondo 2</label>
                <input 
                  type="color" 
                  value={invoice.gradientColors?.[1] || '#080505'} 
                  onChange={(e) => onUpdate({
                    ...invoice,
                    gradientColors: [invoice.gradientColors?.[0] || '#080505', e.target.value]
                  })}
                  className="w-full h-8 md:h-10 rounded-lg bg-transparent border border-white/10 cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[7px] md:text-[8px] text-white/20 uppercase font-bold block">Texto</label>
                <input 
                  type="color" 
                  value={invoice.textColor || '#FFFFFF'} 
                  onChange={(e) => onUpdate({
                    ...invoice,
                    textColor: e.target.value
                  })}
                  className="w-full h-8 md:h-10 rounded-lg bg-transparent border border-white/10 cursor-pointer"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Invoice Card - Styled like the image */}
        <div 
          style={{ 
            background: gradient,
            color: invoice.textColor || '#FFFFFF'
          }}
          className="aspect-[4/5] w-full rounded-[24px] md:rounded-[40px] p-6 md:p-10 flex flex-col relative overflow-hidden border border-white/5 shadow-2xl scale-[0.9] md:scale-100 origin-top"
        >
          {/* Header Date */}
          <div className="text-center mb-6 md:mb-10">
            <p 
              style={{ color: (invoice.textColor || '#FFFFFF') + '66' }}
              className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold"
            >
              {format(new Date(invoice.date), "d 'DE' MMMM 'DE' yyyy", { locale: es }).toUpperCase()}
            </p>
          </div>

          <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12">
            {/* Logo Placeholder */}
            <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center shadow-xl overflow-hidden">
              {invoice.logoUrl ? (
                <img src={invoice.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-8 h-8 md:w-14 md:h-14 rounded-full border-2 md:border-4 border-black flex items-center justify-center">
                  <span className="text-black font-black text-xl md:text-3xl italic">U</span>
                </div>
              )}
            </div>
            <div>
              <h3 
                style={{ color: (invoice.textColor || '#FFFFFF') + '99' }}
                className="font-black text-sm md:text-xl tracking-tight leading-none uppercase"
              >
                {invoice.companyName}
              </h3>
              <p 
                style={{ color: (invoice.textColor || '#FFFFFF') + '33' }}
                className="text-[8px] md:text-[10px] font-bold tracking-widest mt-1"
              >
                NIT: {invoice.nit}
              </p>
            </div>
          </div>

          <div className="mb-8 md:mb-12">
            <h2 
              style={{ color: invoice.textColor || '#FFFFFF' }}
              className="text-2xl md:text-5xl font-black tracking-tighter leading-tight"
            >
              {invoice.clientName}
            </h2>
            {invoice.clientPhone && (
              <p 
                style={{ color: (invoice.textColor || '#FFFFFF') + '66' }}
                className="text-sm md:text-xl font-bold tracking-tight mt-1 md:mt-2"
              >
                {invoice.clientPhone}
              </p>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 space-y-4 md:space-y-6 overflow-y-auto pr-2">
            {invoice.items.map((item: any, idx: number) => (
              <div key={idx} className="flex items-start justify-between gap-2 md:gap-4">
                <div className="flex items-start gap-2 md:gap-4">
                  <span 
                    style={{ color: (invoice.textColor || '#FFFFFF') + '33' }}
                    className="font-black text-sm md:text-xl mt-1"
                  >
                    {item.quantity}
                  </span>
                  <p 
                    style={{ color: invoice.textColor || '#FFFFFF' }}
                    className="text-sm md:text-2xl font-medium tracking-tight leading-snug"
                  >
                    {item.description}
                  </p>
                </div>
                <div className="text-right">
                  <p 
                    style={{ color: invoice.textColor || '#FFFFFF' }}
                    className="text-sm md:text-xl font-bold tracking-tighter"
                  >
                    ${(parseFloat(item.unitPrice) || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 md:pt-8 border-t border-white/10 flex justify-between items-end">
            <div className="space-y-4 md:space-y-6">
              <div>
                <p 
                  style={{ color: (invoice.textColor || '#FFFFFF') + '33' }}
                  className="text-[8px] md:text-[10px] uppercase font-black tracking-widest mb-1 md:mb-2"
                >
                  Fecha Entrega
                </p>
                <p 
                  style={{ color: invoice.textColor || '#FFFFFF' }}
                  className="text-sm md:text-xl font-bold tracking-tight"
                >
                  {format(new Date(invoice.deliveryDate), "dd/MM/yyyy h:mma")}
                </p>
              </div>
              <div>
                <p 
                  style={{ color: (invoice.textColor || '#FFFFFF') + '33' }}
                  className="text-[8px] md:text-[10px] uppercase font-black tracking-widest mb-1 md:mb-2"
                >
                  Estado
                </p>
                <p 
                  style={{ color: invoice.textColor || '#FFFFFF' }}
                  className="text-sm md:text-2xl font-black tracking-widest uppercase"
                >
                  {invoice.status}
                </p>
              </div>
            </div>

            <div className="bg-white/[0.03] p-4 md:p-8 rounded-[20px] md:rounded-[32px] border border-white/5 min-w-[120px] md:min-w-[160px]">
              <div className="text-right mb-3 md:mb-6">
                <p 
                  style={{ color: (invoice.textColor || '#FFFFFF') + '33' }}
                  className="text-[8px] md:text-[10px] uppercase font-black tracking-widest mb-1 md:mb-2"
                >
                  Total
                </p>
                <p 
                  style={{ color: invoice.textColor || '#FFFFFF' }}
                  className="text-xl md:text-4xl font-black tracking-tighter"
                >
                  ${invoice.total.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p 
                  style={{ color: (invoice.textColor || '#FFFFFF') + '33' }}
                  className="text-[8px] md:text-[10px] uppercase font-black tracking-widest mb-1 md:mb-2"
                >
                  Restante
                </p>
                <p 
                  style={{ color: (invoice.textColor || '#FFFFFF') + '99' }}
                  className="text-sm md:text-2xl font-black tracking-tighter"
                >
                  ${(invoice.status === 'ABONO' ? invoice.total / 2 : 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TransactionItem({ transaction, showDate, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 glass-card bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-left"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 flex items-center justify-center">
          {transaction.type === 'income' ? (
            <ArrowUpRight className="w-7 h-7 text-green-500" />
          ) : (
            <ArrowDownLeft className="w-7 h-7 text-red-500" />
          )}
        </div>
        <div>
          <p className="font-bold tracking-tight text-sm">{transaction.description}</p>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">{transaction.category}</p>
          <p className="text-[10px] text-white/20 mt-0.5">{format(new Date(transaction.date), "dd MMM, HH:mm", { locale: es })}</p>
        </div>
      </div>
      <p className={`font-bold tracking-tighter ${
        transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
      }`}>
        {transaction.type === 'income' ? '+' : '-'}${Math.round(transaction.amount).toLocaleString()}
      </p>
    </button>
  );
}

function ProfileModal({ user, onClose, onLogin }: any) {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    isSubscribed: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as any);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
        setLoading(false);
      };
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
      alert('Perfil actualizado correctamente');
    } catch (error) {
      console.error(error);
      alert('Error al guardar el perfil');
    }
    setSaving(false);
  };

  const handleSubscribe = async () => {
    if (!user) return;
    if (!profile.firstName || !profile.lastName || !profile.phone) {
      alert('Por favor completa tus datos antes de suscribirte');
      return;
    }
    setSaving(true);
    try {
      const updatedProfile = { ...profile, isSubscribed: true };
      await setDoc(doc(db, 'users', user.uid), updatedProfile, { merge: true });
      setProfile(updatedProfile);
      alert('¡Suscripción activada con éxito!');
    } catch (error) {
      console.error(error);
      alert('Error al procesar la suscripción');
    }
    setSaving(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-md glass-card p-8 space-y-8 relative overflow-hidden"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-white">Premium</h3>
            <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">Suscripción y Perfil</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!user ? (
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 bg-apple-green/10 rounded-full flex items-center justify-center mx-auto">
              <Crown className="w-10 h-10 text-apple-green" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-white">Únete a Impulse Premium</h4>
              <p className="text-white/40 text-sm">Inicia sesión para registrarte y obtener acceso a todas las funciones.</p>
            </div>
            <button 
              onClick={onLogin}
              className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3"
            >
              <UserPlus className="w-5 h-5 text-apple-green" />
              Registrarse / Iniciar Sesión
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-apple-green animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Profile Form */}
            <form onSubmit={handleSave} className="space-y-4">
              <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">Datos del Usuario</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Nombre</label>
                  <input 
                    type="text"
                    required
                    value={profile.firstName}
                    onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-apple-green/50 transition-colors"
                    placeholder="Nombre"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Apellido</label>
                  <input 
                    type="text"
                    required
                    value={profile.lastName}
                    onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-apple-green/50 transition-colors"
                    placeholder="Apellido"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Número Celular</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input 
                    type="tel"
                    required
                    value={profile.phone}
                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs text-white focus:outline-none focus:border-apple-green/50 transition-colors"
                    placeholder="Ej: +57 300 123 4567"
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 font-bold uppercase tracking-widest text-[10px] transition-all"
              >
                {saving ? 'Guardando...' : 'Actualizar Datos'}
              </button>
            </form>

            {/* Subscription Section */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">Suscripción</p>
              
              {profile.isSubscribed ? (
                <div className="p-6 bg-apple-green/10 border border-apple-green/20 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-apple-green rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-premium-black" />
                  </div>
                  <div>
                    <h4 className="text-apple-green font-bold">Plan Premium Activo</h4>
                    <p className="text-[10px] text-apple-green/60 uppercase font-bold tracking-widest">Suscripción Mensual</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-bold">Plan Mensual</h4>
                      <p className="text-white/40 text-xs">Acceso ilimitado a todas las herramientas</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-white">$9.99</p>
                      <p className="text-[8px] text-white/40 uppercase font-bold tracking-widest">Al mes</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {['Facturación Ilimitada', 'Estadísticas Avanzadas', 'Soporte Prioritario'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-[10px] text-white/60">
                        <CheckCircle2 className="w-3 h-3 text-apple-green" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={handleSubscribe}
                    disabled={saving}
                    className="w-full py-4 apple-gradient rounded-xl text-premium-black font-bold uppercase tracking-widest text-xs shadow-lg shadow-apple-green/20 flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    {saving ? 'Procesando...' : 'Comprar Suscripción'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <button 
          onClick={onClose}
          className="w-full py-4 bg-white/5 rounded-2xl text-white/60 font-bold uppercase tracking-widest text-xs"
        >
          Cerrar
        </button>
      </motion.div>
    </motion.div>
  );
}

function SettingsModal({ user, onClose, onConfirmReset, onLogin, onLogout }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm glass-card p-8 space-y-8"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-tight text-white">Configuración</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Section */}
        <div className="space-y-4">
          <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">Usuario</p>
          {user ? (
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-apple-green/20 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-apple-green" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-white">{user.displayName || 'Usuario'}</p>
                  <p className="text-[10px] text-white/40">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={onLogout}
                className="p-2 hover:bg-red-500/10 rounded-xl text-red-500 transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={onLogin}
              className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-bold uppercase tracking-widest text-[10px] transition-all"
            >
              <UserPlus className="w-5 h-5 text-apple-green" />
              Registrarse / Iniciar Sesión
            </button>
          )}
        </div>

        {/* Data Section */}
        <div className="space-y-4">
          <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">Datos y Privacidad</p>
          <button 
            onClick={() => {
              if (confirm('¿Estás seguro de que deseas borrar todo el historial? Esta acción no se puede deshacer.')) {
                onConfirmReset();
              }
            }}
            className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl text-red-500 font-bold uppercase tracking-widest text-[10px] transition-all"
          >
            <Trash2 className="w-5 h-5" />
            Borrar Todo el Historial
          </button>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-white/5 rounded-2xl text-white/60 font-bold uppercase tracking-widest text-xs"
        >
          Cerrar
        </button>
      </motion.div>
    </motion.div>
  );
}

function AddTransactionModal({ onClose, onAdd, initialData }: any) {
  const [amount, setAmount] = useState(initialData ? initialData.amount.toString() : '');
  const [desc, setDesc] = useState(initialData ? initialData.description : '');
  const [type, setType] = useState<'income' | 'expense'>(initialData ? initialData.type : 'expense');
  const [category, setCategory] = useState(initialData ? initialData.category : 'General');

  const categories = [
    { name: 'General', icon: FileText },
    { name: 'Comida', icon: Utensils },
    { name: 'Transporte', icon: Car },
    { name: 'Salud', icon: HeartPulse },
    { name: 'Vivienda', icon: Home },
    { name: 'Ocio', icon: Gamepad2 },
    { name: 'Salario', icon: DollarSign },
    { name: 'Otros', icon: MoreHorizontal }
  ];

  const handleAdd = () => {
    const parsedAmount = parseFloat(amount);
    if (!isNaN(parsedAmount) && parsedAmount > 0) {
      onAdd({
        amount: parsedAmount,
        type,
        category,
        description: desc || (type === 'income' ? 'Ingreso' : 'Gasto'),
        date: new Date().toISOString()
      });
    } else {
      alert("Por favor ingresa un monto válido");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="w-full max-w-md md:max-w-lg bg-premium-gray rounded-t-[40px] md:rounded-[40px] p-8 space-y-6 relative"
      >
        <button onClick={onClose} className="absolute top-6 right-8 text-white/40">
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          <h2 className="text-xl tracking-tight">{initialData ? 'Editar Transacción' : 'Nueva Transacción'}</h2>
          <p className="text-white/40 text-xs uppercase tracking-widest mt-1">
            {initialData ? 'Ajusta los detalles' : 'Ingreso Manual'}
          </p>
        </div>

        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl">
              <button 
                onClick={() => setType('expense')}
                className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${type === 'expense' ? 'bg-white/10 text-white' : 'text-white/40'}`}
              >
                Gasto
              </button>
              <button 
                onClick={() => setType('income')}
                className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${type === 'income' ? 'bg-white/10 text-white' : 'text-white/40'}`}
              >
                Ingreso
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-2xl">$</span>
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-10 pr-6 text-4xl font-bold tracking-tighter focus:outline-none focus:border-apple-green/50 transition-colors"
                />
              </div>
              <input 
                type="text" 
                placeholder="Descripción (opcional)"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-apple-green/50 transition-colors"
              />
              
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => setCategory(cat.name)}
                    className={`px-4 py-2 rounded-xl text-[10px] uppercase font-bold tracking-widest whitespace-nowrap transition-all border flex items-center gap-2 ${
                      category === cat.name ? 'bg-apple-green text-premium-black border-apple-green' : 'bg-white/5 text-white/40 border-white/10'
                    }`}
                  >
                    <cat.icon className="w-3 h-3" />
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleAdd}
              className="w-full py-5 apple-gradient rounded-2xl text-premium-black font-bold uppercase tracking-widest shadow-lg shadow-apple-green/20"
            >
              {initialData ? 'Guardar Cambios' : 'Confirmar Transacción'}
            </button>
      </motion.div>
    </motion.div>
  );
}

function HistoryList({ transactions, onEditTransaction }: { transactions: Transaction[], onEditTransaction: (t: Transaction) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <h2 className="text-2xl tracking-tight">Historial de Transacciones</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {transactions.length > 0 ? (
          transactions.map((t) => (
            <TransactionItem key={t.id} transaction={t} showDate onClick={() => onEditTransaction(t)} />
          ))
        ) : (
          <div className="col-span-full p-12 glass-card border-dashed border-white/10 flex flex-col items-center justify-center text-center">
            <History className="w-12 h-12 text-white/5 mb-4" />
            <p className="text-white/20 text-sm">Tu historial está vacío</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
