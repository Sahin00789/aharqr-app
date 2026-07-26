import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  ChefHat, 
  UserCheck, 
  UserPlus,
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Phone,
  Filter,
  Clock,
  DollarSign,
  Briefcase,
  Coins,
  ArrowLeft,
  X,
  LayoutDashboard
} from 'lucide-react';
import { api } from '../../api/client';
import CreateStaffModal from './modals/CreateStaffModal';
import AssignShiftSalaryModal from './modals/AssignShiftSalaryModal';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  kitchenStation?: string;
  status: string;
  createdAt: string;
  employeeCode?: string;
  assignedShift?: string;
  salaryStructure?: string;
  otRate?: string;
}

interface StaffMemberWithRole extends StaffMember {
  role: 'CAPTAIN' | 'CHEF';
}

export default function StaffRosterPage() {
  const navigate = useNavigate();
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CAPTAIN' | 'CHEF'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialRole, setModalInitialRole] = useState<'CAPTAIN' | 'CHEF'>('CAPTAIN');

  // Unified Assign Shift & Config Salary Modal State
  const [unifiedModalStaff, setUnifiedModalStaff] = useState<StaffMemberWithRole | null>(null);

  // Default Fallback Roster with Full Details
  const defaultCaptains: StaffMember[] = [
    { 
      id: 'cap-1', 
      name: 'Rajesh Kumar', 
      email: 'rajesh.captain@aharqr.com', 
      phone: '+91 98765 43210', 
      employeeCode: 'CAP-101', 
      status: 'ACTIVE', 
      createdAt: new Date().toISOString(),
      assignedShift: 'Mon-Sat (Morning 09:00 - 17:00)',
      salaryStructure: 'Present: ₹600 • Off-Day: ₹750 • Holiday: ₹1000'
    },
    { 
      id: 'cap-2', 
      name: 'Anita Roy', 
      email: 'anita.captain@aharqr.com', 
      phone: '+91 98765 43211', 
      employeeCode: 'CAP-102', 
      status: 'ACTIVE', 
      createdAt: new Date().toISOString(),
      assignedShift: 'Mon-Sat (Lunch 11:00 - 19:00)',
      salaryStructure: 'Present: ₹650 • Off-Day: ₹800 • Holiday: ₹1100'
    }
  ];

  const defaultChefs: StaffMember[] = [
    { 
      id: 'chef-1', 
      name: 'Vikram Singh', 
      email: 'vikram.chef@aharqr.com', 
      phone: '+91 98765 43212', 
      kitchenStation: 'Main Tandoor & Grill', 
      employeeCode: 'CHF-201', 
      status: 'ACTIVE', 
      createdAt: new Date().toISOString(),
      assignedShift: 'Mon-Sat (Night 17:00 - 01:00)',
      salaryStructure: 'Present: ₹800 • Off-Day: ₹1000 • Holiday: ₹1300'
    },
    { 
      id: 'chef-2', 
      name: 'Sanjay Sharma', 
      email: 'sanjay.chef@aharqr.com', 
      phone: '+91 98765 43213', 
      kitchenStation: 'Curry & Main Course', 
      employeeCode: 'CHF-202', 
      status: 'ACTIVE', 
      createdAt: new Date().toISOString(),
      assignedShift: 'Mon-Sat (Morning 09:00 - 17:00)',
      salaryStructure: 'Present: ₹750 • Off-Day: ₹950 • Holiday: ₹1200'
    }
  ];

  const [captains, setCaptains] = useState<StaffMember[]>(defaultCaptains);
  const [chefs, setChefs] = useState<StaffMember[]>(defaultChefs);
  const [searchQuery, setSearchQuery] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchStaff = async () => {
    try {
      const { data } = await api.get('/restaurant/staff');
      if (data.success && (data.captains?.length || data.chefs?.length)) {
        setCaptains(data.captains);
        setChefs(data.chefs);
      }
    } catch (err: any) {
      console.error('Fetch staff error:', err);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openCreateModal = (role: 'CAPTAIN' | 'CHEF' = 'CAPTAIN') => {
    setModalInitialRole(role);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    setSuccessMsg('Staff member account created successfully!');
    fetchStaff();
  };

  const handleUnifiedSuccess = (data: { staffName: string }) => {
    setSuccessMsg(`Shifts and salary structure updated for ${data.staffName}!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const captainsWithRole: StaffMemberWithRole[] = captains.map((c) => ({ ...c, role: 'CAPTAIN' }));
  const chefsWithRole: StaffMemberWithRole[] = chefs.map((c) => ({ ...c, role: 'CHEF' }));
  const allStaff: StaffMemberWithRole[] = [...captainsWithRole, ...chefsWithRole];

  const filteredStaff = allStaff.filter((s) => {
    const matchesRole = roleFilter === 'ALL' || s.role === roleFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !query ||
      s.name.toLowerCase().includes(query) || 
      s.email.toLowerCase().includes(query) ||
      (s.phone && s.phone.includes(query)) ||
      (s.employeeCode && s.employeeCode.toLowerCase().includes(query));
    return matchesRole && matchesSearch;
  });

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-200 font-sans flex flex-col">
      
      {/* STANDALONE TOP HEADER BAR WITH BACK TO PROFILE MENU & CLOSE (X) BUTTON */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/90 px-4 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/account/menu')}
            className="p-2 px-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-all flex items-center gap-2 text-xs font-extrabold active:scale-95 shadow-md group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Profile Menu</span>
          </button>

          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all hidden sm:flex items-center gap-2 text-xs font-bold active:scale-95 shadow-md"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700/60 hidden sm:inline-block">
            Staff Member Roster
          </span>
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/70 transition-all active:scale-95 flex items-center justify-center shadow-md"
            title="Close Roster"
            aria-label="Close Roster"
          >
            <X className="w-5 h-5 text-slate-300 hover:text-white" />
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-6">

        {/* PAGE TITLE BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 flex items-center gap-3">
              <Users className="w-7 h-7 text-blue-500" />
              Staff Roster & Accounts
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Create and manage captain and chef accounts, assign shifts, and configure daily pay rates.
            </p>
          </div>

          <button
            onClick={() => openCreateModal('CAPTAIN')}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" /> + Add Staff Member
          </button>
        </div>

        {/* FEEDBACK BANNERS */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300 font-medium">{error}</p>
              </div>
            </motion.div>
          )}

          {successMsg && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-300 font-medium">{successMsg}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEARCH BAR & THREE FILTER TOGGLES */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-3.5 sm:p-4 rounded-3xl">
            
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff by name, email, or ID..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="inline-flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setRoleFilter('ALL')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border whitespace-nowrap ${
                  roleFilter === 'ALL'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>All</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  roleFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  {allStaff.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRoleFilter('CAPTAIN')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border whitespace-nowrap ${
                  roleFilter === 'CAPTAIN'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Captain</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  roleFilter === 'CAPTAIN' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  {captains.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRoleFilter('CHEF')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border whitespace-nowrap ${
                  roleFilter === 'CHEF'
                    ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                <span>Chef</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  roleFilter === 'CHEF' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  {chefs.length}
                </span>
              </button>
            </div>
          </div>

          {/* ROSTER SECTION TITLE */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-400" />
              {roleFilter === 'ALL' && `All Staff Profiles (${filteredStaff.length})`}
              {roleFilter === 'CAPTAIN' && `Captains (${filteredStaff.length})`}
              {roleFilter === 'CHEF' && `Chefs (${filteredStaff.length})`}
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Showing {filteredStaff.length} of {allStaff.length} members
            </span>
          </div>

          {/* STAFF ROSTER CARDS WITH ALL DETAILS & SINGLE UNIFIED BUTTON */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((staff) => {
              const isCaptain = staff.role === 'CAPTAIN';
              return (
                <div 
                  key={`${staff.role}-${staff.id}`} 
                  className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between shadow-xl group"
                >
                  {/* Header with Name, Email & Role */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-12 h-12 rounded-2xl font-black text-xs flex items-center justify-center border shrink-0 shadow-md ${
                        isCaptain 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {staff.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base font-extrabold text-white truncate group-hover:text-blue-400 transition-colors">
                          {staff.name}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">
                          {staff.email}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-xl border shrink-0 flex items-center gap-1 ${
                      isCaptain 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {isCaptain ? <UserCheck className="w-3 h-3" /> : <ChefHat className="w-3 h-3" />}
                      {staff.role}
                    </span>
                  </div>

                  {/* FULL DETAILS ON CARD */}
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-2.5 text-xs">
                    {/* Phone & Emp ID */}
                    <div className="flex items-center justify-between text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{staff.phone || '+91 98765 00000'}</span>
                      </div>
                      <span className="font-mono text-blue-400 font-bold bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-lg text-[11px]">
                        {staff.employeeCode || 'EMP-100'}
                      </span>
                    </div>

                    {/* Department / Station */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-slate-400" /> Station:
                      </span>
                      <span className="text-slate-300 font-semibold truncate max-w-[150px]">
                        {isCaptain ? 'Floor & Table Service' : (staff.kitchenStation || 'Main Kitchen')}
                      </span>
                    </div>

                    {/* Assigned Shift Summary */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-400" /> Shift:
                      </span>
                      <span className="text-blue-400 font-bold truncate max-w-[150px]">
                        {staff.assignedShift || 'Mon-Sat (Morning 09:00 - 17:00)'}
                      </span>
                    </div>

                    {/* Configured Pay Breakdown */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-400" /> Pay Rates:
                      </span>
                      <span className="text-emerald-400 font-bold truncate max-w-[150px]">
                        {staff.salaryStructure || 'Present: ₹600 • Off-Day: ₹750'}
                      </span>
                    </div>
                  </div>

                  {/* SINGLE UNIFIED BUTTON: ASSIGN SHIFT & CONFIG SALARY */}
                  <button
                    type="button"
                    onClick={() => setUnifiedModalStaff(staff)}
                    className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
                  >
                    <Coins className="w-4 h-4" /> Assign Shift & Config Salary
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* CREATE STAFF MODAL OVERLAY */}
      <CreateStaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        initialRole={modalInitialRole}
      />

      {/* UNIFIED ASSIGN SHIFT & CONFIG SALARY MODAL OVERLAY */}
      {unifiedModalStaff && (
        <AssignShiftSalaryModal
          isOpen={!!unifiedModalStaff}
          onClose={() => setUnifiedModalStaff(null)}
          onSuccess={handleUnifiedSuccess}
          staffName={unifiedModalStaff.name}
          staffRole={unifiedModalStaff.role}
        />
      )}

    </div>
  );
}
