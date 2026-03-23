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
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Transaction } from './lib/gemini';

// Mock initial data - Empty for clean start
const INITIAL_TRANSACTIONS: Transaction[] = [];

export default function App() {
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
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
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

  useEffect(() => {
    localStorage.setItem('impulse_transactions', JSON.stringify(transactions));
  }, [transactions]);

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
    localStorage.removeItem('impulse_transactions');
    setIsResetModalOpen(false);
  };

  return (
    <div className="min-h-screen w-full max-w-7xl mx-auto bg-premium-black relative overflow-hidden flex flex-col shadow-2xl">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex justify-between items-center max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-apple-green/10 border border-white/5">
            <img 
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgn2on7GUzVrK26XTBTK9SMAElmdSsJ_jHIXHAZn7rIGtbDhYqfr4Q-5oTVo7zlfCLSSu37wZ7Fu7Dj7bOP35NthPBZH1gWtlPGRpddxNBj8Vbb9htG3tPn1uEXtMfkrrKVd5CngTzk7YfWfqoZ23d3NZRoexwit1RxhyhqfBorCR6FtGO_9mIpzHoSYKsu/s1758/SDFAFD12E21223R23223.png" 
              alt="Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-3xl tracking-tighter text-white">Impulse</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsResetModalOpen(true)}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-apple-green/10 transition-colors group"
            title="Configuración / Reiniciar"
          >
            <Settings className="w-5 h-5 text-white/20 group-hover:text-apple-green transition-colors" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 pb-32 overflow-y-auto max-w-4xl mx-auto w-full">
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
            onNew={() => setIsInvoiceModalOpen(true)} 
            onEdit={(inv: any) => {
              setEditingInvoice(inv);
              setIsInvoiceModalOpen(true);
            }}
            onDelete={(id: string) => {
              setInvoices(invoices.filter(inv => inv.id !== id));
            }}
          />
        )}
      </main>

      {/* Navigation */}
      <div className="fixed bottom-6 left-0 right-0 px-4 z-40">
        <nav className="max-w-[360px] md:max-w-md mx-auto h-16 glass-card bg-white/[0.05] border border-white/10 rounded-[24px] flex justify-around items-center px-1 shadow-2xl shadow-black/50">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`relative flex flex-col items-center gap-0.5 transition-all duration-300 ${activeTab === 'dashboard' ? 'text-apple-green scale-105' : 'text-white/30 hover:text-white/50'}`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[8px] uppercase font-bold tracking-tighter">Resumen</span>
            {activeTab === 'dashboard' && (
              <motion.div layoutId="nav-glow" className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-apple-green shadow-[0_0_8px_#88d629]" />
            )}
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex flex-col items-center gap-0.5 text-white/30 hover:text-white/50 transition-all duration-300 active:scale-90"
          >
            <Plus className="w-5 h-5" />
            <span className="text-[8px] uppercase font-bold tracking-tighter">Nuevo</span>
          </button>

          <button 
            onClick={() => setActiveTab('history')}
            className={`relative flex flex-col items-center gap-0.5 transition-all duration-300 ${activeTab === 'history' ? 'text-apple-green scale-105' : 'text-white/30 hover:text-white/50'}`}
          >
            <History className="w-5 h-5" />
            <span className="text-[8px] uppercase font-bold tracking-tighter">Historial</span>
            {activeTab === 'history' && (
              <motion.div layoutId="nav-glow" className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-apple-green shadow-[0_0_8px_#88d629]" />
            )}
          </button>

          <button 
            onClick={() => setActiveTab('invoices')}
            className={`relative flex flex-col items-center gap-0.5 transition-all duration-300 ${activeTab === 'invoices' ? 'text-apple-green scale-105' : 'text-white/30 hover:text-white/50'}`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[8px] uppercase font-bold tracking-tighter">Facturas</span>
            {activeTab === 'invoices' && (
              <motion.div layoutId="nav-glow" className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-apple-green shadow-[0_0_8px_#88d629]" />
            )}
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
        {isResetModalOpen && (
          <ResetConfirmationModal 
            onClose={() => setIsResetModalOpen(false)} 
            onConfirm={resetData}
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
          <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -mr-16 -mt-16 transition-colors duration-500 ${isUp ? 'bg-apple-green/10' : 'bg-red-500/10'}`} />
          
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
                    className="text-apple-green"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">{Math.round(progress)}%</span>
                </div>
              </div>
            </button>

            <div className="space-y-0.5">
              <p className="text-white/40 text-[10px] uppercase tracking-widest">Balance Total</p>
              <h2 className="text-4xl font-bold tracking-tighter">
                ${Math.round(balance).toLocaleString()}
              </h2>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Ingresos</p>
                <p className="font-bold text-sm text-green-500">+${Math.round(income).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Gastos</p>
                <p className="font-bold text-sm text-red-500">-${Math.round(expenses).toLocaleString()}</p>
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
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="balance" stroke={chartColor} fillOpacity={1} fill="url(#colorBalance)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
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

function InvoiceList({ invoices, onNew, onEdit, onDelete }: any) {
  const [activeOptionsId, setActiveOptionsId] = useState<string | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

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

    // We'll use a simplified version of the preview for the capture
    // but styled exactly like the reference image
    root.innerHTML = `
      <div id="capture-invoice" style="
        width: 800px;
        background: #000;
        color: #fff;
        padding: 60px;
        font-family: 'Inter', sans-serif;
        border-radius: 40px;
        display: flex;
        flex-direction: column;
        position: relative;
      ">
        <div style="text-align: center; margin-bottom: 40px;">
          <p style="font-size: 14px; font-weight: 900; letter-spacing: 0.2em; color: rgba(255,255,255,0.4); text-transform: uppercase;">
            ${format(new Date(invoice.date), "d 'DE' MMMM 'DE' yyyy").toUpperCase()}
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
            <h3 style="font-weight: 900; font-size: 28px; margin: 0; text-transform: uppercase; color: rgba(255,255,255,0.7);">${invoice.companyName}</h3>
            <p style="font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.3); margin-top: 5px;">NIT: ${invoice.nit}</p>
          </div>
        </div>

        <h2 style="font-size: 72px; font-weight: 900; letter-spacing: -0.04em; margin: 0 0 50px 0; line-height: 1;">${invoice.clientName}</h2>

        <div style="flex: 1; margin-bottom: 40px;">
          ${invoice.items.map((item: any) => `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px;">
              <div style="display: flex; gap: 25px;">
                <span style="font-size: 28px; font-weight: 900; color: rgba(255,255,255,0.2);">${item.quantity}</span>
                <p style="font-size: 32px; font-weight: 600; margin: 0; line-height: 1.2;">${item.description}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 40px;">
          <div style="display: flex; flex-direction: column; gap: 40px;">
            <div>
              <p style="font-size: 12px; font-weight: 900; letter-spacing: 0.1em; color: rgba(255,255,255,0.2); text-transform: uppercase; margin-bottom: 10px;">Fecha Entrega</p>
              <p style="font-size: 24px; font-weight: 700; margin: 0;">${format(new Date(invoice.deliveryDate), "dd/MM/yyyy h:mma")}</p>
            </div>
            <div>
              <p style="font-size: 12px; font-weight: 900; letter-spacing: 0.1em; color: rgba(255,255,255,0.2); text-transform: uppercase; margin-bottom: 10px;">Estado</p>
              <p style="font-size: 32px; font-weight: 900; margin: 0; letter-spacing: 0.05em;">${invoice.status}</p>
            </div>
          </div>

          <div style="background: rgba(255,255,255,0.03); padding: 40px; border-radius: 32px; border: 1px solid rgba(255,255,255,0.05); min-width: 250px;">
            <div style="text-align: right; margin-bottom: 30px;">
              <p style="font-size: 12px; font-weight: 900; letter-spacing: 0.1em; color: rgba(255,255,255,0.2); text-transform: uppercase; margin-bottom: 10px;">Total</p>
              <p style="font-size: 56px; font-weight: 900; margin: 0; letter-spacing: -0.04em;">$${invoice.total.toLocaleString()}</p>
            </div>
            <div style="text-align: right;">
              <p style="font-size: 12px; font-weight: 900; letter-spacing: 0.1em; color: rgba(255,255,255,0.2); text-transform: uppercase; margin-bottom: 10px;">Restante</p>
              <p style="font-size: 36px; font-weight: 900; margin: 0; color: rgba(255,255,255,0.6);">$${(invoice.total - (parseFloat(invoice.abono) || 0)).toLocaleString()}</p>
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl tracking-tight">Facturas</h2>
        <button 
          onClick={onNew}
          className="px-4 py-2 bg-apple-green text-premium-black rounded-xl text-[10px] font-bold uppercase tracking-widest"
        >
          Nueva
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {invoices.length > 0 ? (
          invoices.map((inv: any) => {
            const totalProfit = inv.items.reduce((acc: number, item: any) => {
              const unit = parseFloat(item.unitPrice) || 0;
              const cost = parseFloat(item.costPrice) || 0;
              return acc + (item.quantity * (unit - cost));
            }, 0);

            return (
              <div key={inv.id} className="relative">
                <button 
                  onClick={() => setActiveOptionsId(activeOptionsId === inv.id ? null : inv.id)}
                  className={`w-full flex items-center justify-between p-4 glass-card transition-all text-left ${activeOptionsId === inv.id ? 'bg-white/10 ring-1 ring-apple-green/30' : 'bg-white/[0.02] hover:bg-white/[0.05]'}`}
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
                  <div className="text-right">
                    <p className="font-bold tracking-tighter text-white">${inv.total.toLocaleString()}</p>
                    <p className="text-[8px] text-white/20">{format(new Date(inv.date), 'dd/MM/yyyy')}</p>
                  </div>
                </button>

                <AnimatePresence>
                  {activeOptionsId === inv.id && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-4 top-[100%] mt-2 z-20 flex gap-2 p-2 glass-card bg-premium-gray border border-white/10 shadow-2xl"
                    >
                      <button 
                        onClick={() => {
                          onEdit(inv);
                          setActiveOptionsId(null);
                        }}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white transition-colors"
                      >
                        <Edit2 className="w-3 h-3 text-apple-green" />
                        Editar
                      </button>
                      <button 
                        onClick={() => {
                          downloadInvoice(inv);
                          setActiveOptionsId(null);
                        }}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white transition-colors"
                      >
                        <Download className="w-3 h-3 text-apple-green" />
                        Imagen
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm('¿Eliminar esta factura?')) {
                            onDelete(inv.id);
                          }
                          setActiveOptionsId(null);
                        }}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Borrar
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
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
    </motion.div>
  );
}

function InvoiceGeneratorModal({ onClose, onSave, initialData, companyProfile, onUpdateProfile }: any) {
  const [formData, setFormData] = useState(initialData || {
    companyName: companyProfile.companyName || '',
    nit: companyProfile.nit || '',
    clientName: '',
    type: 'invoice',
    items: [{ quantity: 1, description: '', unitPrice: '', costPrice: '' }],
    deliveryDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    status: 'PENDIENTE',
    abono: '',
    logoUrl: companyProfile.logoUrl || ''
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

          <input 
            type="text" 
            placeholder="Nombre del Cliente"
            value={formData.clientName}
            onChange={e => setFormData({...formData, clientName: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-apple-green/50"
          />

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

function InvoicePreviewModal({ invoice, onClose }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 p-4 overflow-y-auto"
    >
      <div className="w-full max-w-md md:max-w-2xl space-y-6 my-8">
        <div className="flex justify-between items-center px-2">
          <button onClick={onClose} className="text-white/40 flex items-center gap-2 text-xs uppercase font-bold tracking-widest">
            <ChevronRight className="w-4 h-4 rotate-180" /> Volver
          </button>
          <div className="flex gap-4">
            <button className="text-apple-green"><Share2 className="w-5 h-5" /></button>
            <button className="text-apple-green"><Download className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Invoice Card - Styled like the image */}
        <div className="aspect-[4/5] w-full bg-[#080505] rounded-[40px] p-10 flex flex-col relative overflow-hidden border border-white/5 shadow-2xl">
          {/* Header Date */}
          <div className="text-center mb-10">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">
              {format(new Date(invoice.date), "d 'DE' MMMM 'DE' yyyy").toUpperCase()}
            </p>
          </div>

          <div className="flex items-center gap-6 mb-12">
            {/* Logo Placeholder */}
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl">
              <div className="w-14 h-14 rounded-full border-4 border-black flex items-center justify-center">
                <span className="text-black font-black text-3xl italic">U</span>
              </div>
            </div>
            <div>
              <h3 className="text-white/60 font-black text-xl tracking-tight leading-none uppercase">{invoice.companyName}</h3>
              <p className="text-white/20 text-[10px] font-bold tracking-widest mt-1">NIT: {invoice.nit}</p>
            </div>
          </div>

          <h2 className="text-white text-5xl font-black tracking-tighter mb-12 leading-tight">
            {invoice.clientName}
          </h2>

          {/* Items List */}
          <div className="flex-1 space-y-6">
            {invoice.items.map((item: any, idx: number) => (
              <div key={idx} className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span className="text-white/20 font-black text-xl mt-1">{item.quantity}</span>
                  <p className="text-white text-2xl font-medium tracking-tight leading-snug">{item.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-white text-xl font-bold tracking-tighter">${(parseFloat(item.unitPrice) || 0).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/10 flex justify-between items-end">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-white/20 mb-2">Fecha Entrega</p>
                <p className="text-white text-xl font-bold tracking-tight">
                  {format(new Date(invoice.deliveryDate), "dd/MM/yyyy h:mma")}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-white/20 mb-2">Estado</p>
                <p className="text-white text-2xl font-black tracking-widest">{invoice.status}</p>
              </div>
            </div>

            <div className="bg-white/[0.03] p-8 rounded-[32px] border border-white/5 min-w-[160px]">
              <div className="text-right mb-6">
                <p className="text-[10px] uppercase font-black tracking-widest text-white/20 mb-2">Total</p>
                <p className="text-white text-4xl font-black tracking-tighter">${invoice.total.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-black tracking-widest text-white/20 mb-2">Restante</p>
                <p className="text-white/60 text-2xl font-black tracking-tighter">${(invoice.status === 'ABONO' ? invoice.total / 2 : 0).toLocaleString()}</p>
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
          <p className="text-[10px] text-white/20 mt-0.5">{format(new Date(transaction.date), 'dd MMM, HH:mm')}</p>
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

function ResetConfirmationModal({ onClose, onConfirm }: { onClose: () => void, onConfirm: () => void }) {
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
        className="w-full max-w-xs glass-card p-8 text-center space-y-6 border-red-500/20"
      >
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
          <X className="w-8 h-8 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-white">¿Borrar todo?</h2>
          <p className="text-white/40 text-sm">Esta acción eliminará permanentemente todas tus transacciones y reiniciará el balance a $0.00.</p>
        </div>
        <div className="flex flex-col gap-3">
          <button 
            onClick={onConfirm}
            className="w-full py-4 bg-red-500 rounded-2xl text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-red-500/20"
          >
            Sí, borrar todo
          </button>
          <button 
            onClick={onClose}
            className="w-full py-4 bg-white/5 rounded-2xl text-white/60 font-bold uppercase tracking-widest text-xs"
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AddTransactionModal({ onClose, onAdd, initialData }: any) {
  const [amount, setAmount] = useState(initialData ? initialData.amount.toString() : '');
  const [desc, setDesc] = useState(initialData ? initialData.description : '');
  const [type, setType] = useState<'income' | 'expense'>(initialData ? initialData.type : 'expense');
  const [category, setCategory] = useState(initialData ? initialData.category : 'General');

  const categories = ['General', 'Comida', 'Transporte', 'Salud', 'Vivienda', 'Ocio', 'Salario', 'Otros'];

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
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-[10px] uppercase font-bold tracking-widest whitespace-nowrap transition-all border ${
                      category === cat ? 'bg-apple-green text-premium-black border-apple-green' : 'bg-white/5 text-white/40 border-white/10'
                    }`}
                  >
                    {cat}
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
