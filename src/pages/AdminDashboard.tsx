import React, { useState, useEffect } from 'react';
import { 
  collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, setDoc, getDocs 
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { Donation, Staff, GalleryItem, Notice, NavratriDay, SiteSettings, AuditLog } from '../types';
import { 
  Shield, DollarSign, Users, Image as ImageIcon, Bell, Calendar, Settings, FileSpreadsheet, 
  CheckCircle, XCircle, Trash2, Search, Filter, Plus, Edit, LogOut, QrCode, Lock, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { ReceiptModal } from '../components/ReceiptModal';
import { ImageUpload } from '../components/ImageUpload';
import { StaffIdCardModal } from '../components/StaffIdCardModal';

interface AdminDashboardProps {
  onLogout: () => void;
  settings: SiteSettings;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, settings: initialSettings }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'donations' | 'staff' | 'gallery' | 'notices' | 'navratri' | 'upi' | 'cms' | 'audit'>('overview');
  
  const [donations, setDonations] = useState<Donation[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [navratriDays, setNavratriDays] = useState<NavratriDay[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const [receiptDonation, setReceiptDonation] = useState<Donation | null>(null);

  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffIdCode, setStaffIdCode] = useState('MJS-' + Math.floor(1000 + Math.random() * 9000));
  const [staffPassword, setStaffPassword] = useState('');
  const [staffMobile, setStaffMobile] = useState('');
  const [staffDesignation, setStaffDesignation] = useState('Temple Assistant');
  const [staffJoiningDate, setStaffJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [staffAddress, setStaffAddress] = useState('');
  const [staffPhotoUrl, setStaffPhotoUrl] = useState('');

  const [showAddNotice, setShowAddNotice] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticePriority, setNoticePriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');
  const [noticeExpiry, setNoticeExpiry] = useState('');
  const [selectedStaffForCard, setSelectedStaffForCard] = useState<Staff | null>(null);

  useEffect(() => {
    const unsubDonations = onSnapshot(query(collection(db, 'donations'), orderBy('createdAt', 'desc')), (snapshot) => {
      const list: Donation[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Donation));
      setDonations(list);
    });

    const unsubStaff = onSnapshot(collection(db, 'staff'), (snapshot) => {
      const list: Staff[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Staff));
      setStaffList(list);
    });

    const unsubGallery = onSnapshot(collection(db, 'gallery'), (snapshot) => {
      const list: GalleryItem[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as GalleryItem));
      setGalleryList(list);
    });

    const unsubNotices = onSnapshot(collection(db, 'notices'), (snapshot) => {
      const list: Notice[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Notice));
      setNotices(list);
    });

    const unsubNavratri = onSnapshot(collection(db, 'navratri'), (snapshot) => {
      const list: NavratriDay[] = [];
      snapshot.forEach((doc) => list.push(doc.data() as NavratriDay));
      list.sort((a, b) => a.dayNumber - b.dayNumber);
      setNavratriDays(list);
    });

    const unsubSettings = onSnapshot(doc(db, 'siteSettings', 'config'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as SiteSettings);
      }
    });

    const unsubAudit = onSnapshot(query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc')), (snapshot) => {
      const list: AuditLog[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as AuditLog));
      setAuditLogs(list);
    });

    return () => {
      unsubDonations();
      unsubStaff();
      unsubGallery();
      unsubNotices();
      unsubNavratri();
      unsubSettings();
      unsubAudit();
    };
  }, []);

  const logAudit = async (action: string, details: string, recordId?: string) => {
    try {
      await addDoc(collection(db, 'auditLogs'), {
        userId: auth.currentUser?.uid || 'admin',
        userEmail: auth.currentUser?.email || 'admin@maajagdamba.org',
        role: 'admin',
        action,
        details,
        recordId: recordId || '',
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.error('Audit log error:', e);
    }
  };

  const handleApproveDonation = async (d: Donation) => {
    try {
      let receiptNum = d.receiptNumber;
      if (!receiptNum || receiptNum.startsWith('REC-')) {
        const querySnapshot = await getDocs(collection(db, 'donations'));
        const nextSeq = querySnapshot.size;
        receiptNum = `MJS-${String(nextSeq).padStart(2, '0')}`;
      }
      await updateDoc(doc(db, 'donations', d.id), {
        status: 'Approved',
        receiptNumber: receiptNum,
        approvedAt: serverTimestamp(),
        approvedBy: auth.currentUser?.email || 'Admin',
        updatedAt: serverTimestamp()
      });
      await updateDoc(doc(db, 'onlineDonations', d.id), {
        status: 'Approved',
        receiptNumber: receiptNum,
        approvedAt: serverTimestamp(),
        approvedBy: auth.currentUser?.email || 'Admin',
        updatedAt: serverTimestamp()
      }).catch(() => {});

      await logAudit('APPROVE_DONATION', `Approved donation ${d.id} of ₹${d.amount} for ${d.donorName}`, d.id);
      alert('दान सफलतापूर्वक स्वीकृत कर दिया गया!');
    } catch (e: any) {
      console.error('Approve error:', e);
      alert('दान स्वीकृत करने में त्रुटि: ' + (e.message || e));
    }
  };

  const handleRejectDonation = async (d: Donation) => {
    try {
      await updateDoc(doc(db, 'donations', d.id), {
        status: 'Rejected',
        updatedAt: serverTimestamp()
      });
      await logAudit('REJECT_DONATION', `Rejected donation ${d.id} for ${d.donorName}`, d.id);
      alert('दान अस्वीकृत कर दिया गया।');
    } catch (e: any) {
      console.error('Reject error:', e);
      alert('त्रुटि: ' + (e.message || e));
    }
  };

  const handleDeleteDonation = async (id: string) => {
    if (window.confirm('क्या आप इस दान को हटाना चाहते हैं?')) {
      try {
        await deleteDoc(doc(db, 'donations', id));
        await logAudit('DELETE_DONATION', `Deleted donation ${id}`, id);
        alert('दान सफलतापूर्वक हटा दिया गया।');
      } catch (e: any) {
        console.error('Delete donation error:', e);
        alert('त्रुटि: ' + (e.message || e));
      }
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (window.confirm(`क्या आप स्टाफ सदस्य "${name}" को हटाना चाहते हैं?`)) {
      try {
        await deleteDoc(doc(db, 'staff', id));
        await logAudit('DELETE_STAFF', `Deleted staff member ${name} (${id})`, id);
        alert('स्टाफ सफलतापूर्वक हटा दिया गया।');
      } catch (e: any) {
        console.error('Delete staff error:', e);
        alert('त्रुटि: ' + (e.message || e));
      }
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    try {
      const code = staffIdCode.trim().toUpperCase() || ('MJS-' + Math.floor(1000 + Math.random() * 9000));
      const staffId = 'staff_' + Date.now();

      const staffPayload: Staff = {
        id: staffId,
        fullName: staffName.trim(),
        email: '',
        password: staffPassword.trim(),
        mobile: staffMobile.trim(),
        address: staffAddress.trim(),
        designation: staffDesignation,
        joiningDate: staffJoiningDate,
        staffIdCode: code,
        isActive: true,
        photoUrl: staffPhotoUrl.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'staff', staffId), staffPayload);
      await logAudit('CREATE_STAFF', `Created staff member ${staffName} (${code})`, staffId);
      
      // 1. Show success toast "सफलतापूर्वक सेव हो गया"
      alert('सफलतापूर्वक सेव हो गया');

      // 2. Immediately auto-clear all fields
      setStaffName('');
      setStaffMobile('');
      setStaffIdCode('MJS-' + Math.floor(1000 + Math.random() * 9000));
      setStaffPassword('');
      setStaffAddress('');
      setStaffPhotoUrl('');
      if (form && typeof form.reset === 'function') {
        form.reset();
      }

      // 4. Close the "नया स्टाफ सदस्य जोड़ें" popup automatically after 1 second
      setTimeout(() => {
        setShowAddStaff(false);
      }, 1000);

    } catch (err: any) {
      console.error('Create staff error:', err);
      alert('त्रुटि: ' + (err.message || err));
    }
  };

  const handleApproveGallery = async (id: string) => {
    try {
      await updateDoc(doc(db, 'gallery', id), { status: 'Approved' });
      await logAudit('APPROVE_GALLERY', `Approved gallery photo ${id}`, id);
      alert('तस्वीर स्वीकृत कर दी गई!');
    } catch (e: any) {
      console.error('Gallery approve error:', e);
      alert('त्रुटि: ' + (e.message || e));
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (window.confirm('इस तस्वीर को हटाना चाहते हैं?')) {
      try {
        await deleteDoc(doc(db, 'gallery', id));
        await logAudit('DELETE_GALLERY', `Deleted gallery photo ${id}`, id);
        alert('तस्वीर हटा दी गई।');
      } catch (e: any) {
        console.error('Gallery delete error:', e);
        alert('त्रुटि: ' + (e.message || e));
      }
    }
  };

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'notices'), {
        title: noticeTitle.trim(),
        content: noticeContent.trim(),
        priority: noticePriority,
        publishDate: new Date().toISOString().split('T')[0],
        expiryDate: noticeExpiry || '2030-12-31',
        isPinned: noticePriority === 'High',
        isActive: true,
        createdAt: serverTimestamp()
      });
      setShowAddNotice(false);
      setNoticeTitle('');
      setNoticeContent('');
      setNoticeExpiry('');
      await logAudit('ADD_NOTICE', `Added notice: ${noticeTitle}`);
      alert('सूचना सफलतापूर्वक प्रकाशित कर दी गई!');
    } catch (e: any) {
      console.error('Add notice error:', e);
      alert('त्रुटि: ' + (e.message || e));
    }
  };

  const handleDeleteNotice = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notices', id));
      await logAudit('DELETE_NOTICE', `Deleted notice ${id}`, id);
      alert('सूचना हटा दी गई।');
    } catch (e: any) {
      console.error('Delete notice error:', e);
      alert('त्रुटि: ' + (e.message || e));
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('siteSettings', JSON.stringify(settings));
      await setDoc(doc(db, 'siteSettings', 'config'), settings, { merge: true });
      await setDoc(doc(db, 'config', 'main'), settings, { merge: true });
      alert('सफलतापूर्वक सेव हो गया');
      await logAudit('UPDATE_SETTINGS', 'Updated site settings and UPI information');
    } catch (e: any) {
      console.error('Save settings error:', e);
      alert('सेटिंग्स सेव करने में त्रुटि: ' + (e.message || e));
    }
  };

  const exportToCSV = (filterType: string) => {
    let dataToExport = donations;
    if (filterType === 'Today') {
      const today = new Date().toDateString();
      dataToExport = donations.filter(d => new Date(d.createdAt?.toDate?.() || Date.now()).toDateString() === today);
    } else if (filterType === 'Month') {
      const thisMonth = new Date().getMonth();
      dataToExport = donations.filter(d => new Date(d.createdAt?.toDate?.() || Date.now()).getMonth() === thisMonth);
    } else if (filterType === 'Cash') {
      dataToExport = donations.filter(d => d.donationType === 'Cash');
    } else if (filterType === 'Online') {
      dataToExport = donations.filter(d => d.donationType === 'Online');
    }

    const headers = ['Donation ID', 'Date', 'Donor Name', 'Mobile', 'Amount', 'Type', 'Payment Method', 'Purpose', 'Status', 'Collected By', 'Receipt No'];
    const rows = dataToExport.map(d => [
      d.id,
      new Date(d.createdAt?.toDate?.() || Date.now()).toLocaleDateString(),
      `"${d.donorName}"`,
      d.mobile,
      d.amount,
      d.donationType,
      d.paymentMethod,
      `"${d.purpose}"`,
      d.status,
      d.staffName || 'Online Donor',
      d.receiptNumber || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Maa_Jagdamba_Donations_${filterType}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logAudit('EXPORT_CSV', `Exported donation report (${filterType})`);
  };

  const filteredDonations = donations.filter(d => {
    const matchesSearch = d.donorName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.mobile.includes(searchQuery) || 
                          d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (d.receiptNumber && d.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    const matchesType = typeFilter === 'All' || d.donationType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalAmount = donations.filter(d => d.status === 'Approved').reduce((s, d) => s + d.amount, 0);
  const pendingCount = donations.filter(d => d.status === 'Pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-amber-950 text-amber-50 rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-amber-500 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-14 h-14 rounded-full bg-amber-500 text-red-950 flex items-center justify-center font-bold text-2xl shadow">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif text-amber-200">एडमिन नियंत्रण कक्ष (Admin Dashboard)</h1>
            <p className="text-xs text-amber-300">माँ जगदंबा स्थान — पूर्ण प्रबंधन एवं रियल-टाइम नियंत्रण</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="bg-red-900 hover:bg-red-800 text-amber-200 px-4 py-2 rounded-xl text-sm font-semibold flex items-center space-x-2 border border-amber-400 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>लॉग आउट</span>
        </button>
      </div>

      <div className="flex flex-wrap border-b border-stone-200 gap-2 sm:gap-4">
        {[
          { id: 'overview', label: 'डैशबोर्ड (Overview)', icon: DollarSign },
          { id: 'donations', label: `दान सूची (${donations.length})`, icon: FileSpreadsheet },
          { id: 'staff', label: `स्टाफ (${staffList.length})`, icon: Users },
          { id: 'gallery', label: `गैलरी (${galleryList.length})`, icon: ImageIcon },
          { id: 'notices', label: `सूचनाएं (${notices.length})`, icon: Bell },
          { id: 'navratri', label: 'नवरात्रि 9 दिन', icon: Calendar },
          { id: 'upi', label: 'UPI & QR प्रबंध', icon: QrCode },
          { id: 'cms', label: 'वेबसाइट CMS', icon: Settings },
          { id: 'audit', label: 'ऑडिट लॉग्स', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 font-bold text-xs sm:text-sm flex items-center space-x-1.5 border-b-2 transition ${
                isActive
                  ? 'border-red-900 text-red-950 bg-amber-50/50 rounded-t-lg'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-amber-600 space-y-2">
              <p className="text-xs font-bold text-stone-500 uppercase">कुल स्वीकृत दान राशि</p>
              <h3 className="text-3xl font-bold font-serif text-emerald-700">₹{totalAmount.toLocaleString('en-IN')}</h3>
              <p className="text-xs text-stone-400">सभी ऑनलाइन व नकद दान</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-red-700 space-y-2">
              <p className="text-xs font-bold text-stone-500 uppercase">लंबित ऑनलाइन दान (Pending)</p>
              <h3 className="text-3xl font-bold font-serif text-red-900">{pendingCount}</h3>
              <p className="text-xs text-stone-400">सत्यापन की प्रतीक्षा में</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-amber-500 space-y-2">
              <p className="text-xs font-bold text-stone-500 uppercase">कुल स्टाफ सदस्य</p>
              <h3 className="text-3xl font-bold font-serif text-stone-900">{staffList.length}</h3>
              <p className="text-xs text-stone-400">सक्रिय कर्मचारी</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-indigo-600 space-y-2">
              <p className="text-xs font-bold text-stone-500 uppercase">गैलरी तस्वीरें</p>
              <h3 className="text-3xl font-bold font-serif text-stone-900">{galleryList.length}</h3>
              <p className="text-xs text-stone-400">({galleryList.filter(g => g.status === 'Pending').length} pending approval)</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl border border-amber-200 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold font-serif text-red-950 text-lg">वास्तविक समय एक्सेल / CSV निर्यात (Excel / CSV Export)</h3>
              <p className="text-xs text-stone-500">Firebase Firestore को मास्टर डेटाबेस मानकर सीधे रिपोर्ट डाउनलोड करें।</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => exportToCSV('All')} className="bg-amber-600 hover:bg-amber-700 text-red-950 font-bold px-4 py-2 rounded-xl text-xs shadow flex items-center space-x-1">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export All</span>
              </button>
              <button onClick={() => exportToCSV('Today')} className="bg-stone-700 hover:bg-stone-800 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow">
                Export Today
              </button>
              <button onClick={() => exportToCSV('Month')} className="bg-stone-700 hover:bg-stone-800 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow">
                Export This Month
              </button>
              <button onClick={() => exportToCSV('Cash')} className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow">
                Cash Donations
              </button>
              <button onClick={() => exportToCSV('Online')} className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow">
                Online Donations
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'donations' && (
        <div className="bg-white rounded-2xl shadow-xl border border-amber-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="font-bold font-serif text-red-950 text-xl">दान प्रबंधन एवं सत्यापन (Donations Management)</h3>
            
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="खोजें (नाम, मोबाईल, ID)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white"
              >
                <option value="All">स्थिति: सभी</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white"
              >
                <option value="All">प्रकार: सभी</option>
                <option value="Online">Online</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-100 text-stone-700 uppercase text-xs">
                <tr>
                  <th className="p-3">दाता विवरण</th>
                  <th className="p-3">राशि & प्रकार</th>
                  <th className="p-3">उद्देश्य व माध्यम</th>
                  <th className="p-3">भुगतान प्रमाण</th>
                  <th className="p-3">स्थिति</th>
                  <th className="p-3 text-right">कार्रवाई (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredDonations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-stone-500">कोई दान रिकॉर्ड नहीं मिला।</td>
                  </tr>
                ) : (
                  filteredDonations.map((d) => (
                    <tr key={d.id} className="hover:bg-amber-50/40">
                      <td className="p-3">
                        <p className="font-bold text-stone-900">{d.donorName}</p>
                        <p className="text-xs text-stone-500">मोबाईल: {d.mobile}</p>
                        <p className="text-[10px] font-mono text-stone-400">ID: {d.id}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-emerald-700 text-base">₹{d.amount.toLocaleString('en-IN')}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${d.donationType === 'Online' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {d.donationType}
                        </span>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-stone-800">{d.purpose}</p>
                        <p className="text-xs text-stone-500">माध्यम: {d.paymentMethod}</p>
                        {d.staffName && <p className="text-[10px] text-amber-800 font-bold">स्टाफ: {d.staffName}</p>}
                      </td>
                      <td className="p-3">
                        {d.paymentProofUrl ? (
                          <a href={d.paymentProofUrl} target="_blank" rel="noreferrer" className="text-xs text-amber-700 font-bold underline hover:text-amber-900">
                            स्क्रीनशॉट देखें
                          </a>
                        ) : (
                          <span className="text-xs text-stone-400">लागू नहीं (Cash)</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          d.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                          d.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2 whitespace-nowrap">
                        {d.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleApproveDonation(d)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded text-xs font-bold shadow"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4 inline" />
                            </button>
                            <button
                              onClick={() => handleRejectDonation(d)}
                              className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded text-xs font-bold shadow"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4 inline" />
                            </button>
                          </>
                        )}
                        {d.status === 'Approved' && (
                          <button
                            onClick={() => setReceiptDonation(d)}
                            className="bg-amber-600 hover:bg-amber-700 text-red-950 px-2.5 py-1 rounded text-xs font-bold shadow"
                          >
                            रसीद देखें
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteDonation(d.id)}
                          className="bg-stone-700 hover:bg-stone-800 text-white p-1.5 rounded text-xs shadow"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-xl border border-amber-200">
            <div>
              <h3 className="font-bold font-serif text-red-950 text-xl">स्टाफ प्रबंधन (Staff Management)</h3>
              <p className="text-xs text-stone-500">कर्मचारियों को जोड़ें, आईडी कार्ड जनरेट करें और एक्सेस प्रबंधित करें।</p>
            </div>
            <button
              onClick={() => setShowAddStaff(true)}
              className="bg-red-900 hover:bg-red-950 text-amber-200 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center space-x-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>नया स्टाफ जोड़ें (Add Staff)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staffList.map((st) => (
              <div key={st.id} className="bg-white rounded-2xl shadow-xl border border-amber-200 p-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-full bg-amber-100 overflow-hidden border-2 border-amber-400">
                    <img src={st.photoUrl} alt={st.fullName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-red-950">{st.fullName}</h4>
                    <p className="text-xs text-amber-800 font-semibold">{st.designation}</p>
                    <p className="text-[10px] font-mono text-stone-500">ID: {st.staffIdCode}</p>
                  </div>
                </div>
                <div className="text-xs text-stone-600 space-y-1 border-t pt-3 pb-2">
                  <p><span className="font-semibold">आईडी कोड:</span> <span className="font-mono font-bold text-red-900">{st.staffIdCode}</span></p>
                  <p><span className="font-semibold">मोबाईल:</span> {st.mobile}</p>
                  <p><span className="font-semibold">जोइनिंग:</span> {st.joiningDate}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setSelectedStaffForCard(st)}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-red-950 font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow"
                  >
                    <Shield className="w-4 h-4" />
                    <span>आईडी कार्ड देखें</span>
                  </button>
                  <button
                    onClick={() => handleDeleteStaff(st.id, st.fullName)}
                    className="bg-red-700 hover:bg-red-800 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center justify-center shadow"
                    title="स्टाफ हटाएं"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedStaffForCard && (
            <StaffIdCardModal staff={selectedStaffForCard} onClose={() => setSelectedStaffForCard(null)} />
          )}

          {showAddStaff && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-6 border-4 border-amber-500">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-bold font-serif text-red-950 text-xl">नया स्टाफ सदस्य जोड़ें</h3>
                  <button onClick={() => setShowAddStaff(false)} className="text-stone-400 hover:text-stone-700">✕</button>
                </div>
                <form onSubmit={handleCreateStaff} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700">पूरा नाम (Full Name) *</label>
                      <input type="text" required value={staffName} onChange={e => setStaffName(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700">मोबाईल *</label>
                      <input type="tel" required maxLength={10} value={staffMobile} onChange={e => setStaffMobile(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700">स्टाफ आईडी (Staff ID) *</label>
                      <input type="text" required value={staffIdCode} onChange={e => setStaffIdCode(e.target.value)} placeholder="MJS-001" className="w-full px-3 py-2 rounded-xl border text-sm font-mono uppercase" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700">पासवर्ड *</label>
                      <input type="password" required value={staffPassword} onChange={e => setStaffPassword(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700">पद (Designation)</label>
                      <input type="text" value={staffDesignation} onChange={e => setStaffDesignation(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700">जोइनिंग तिथि</label>
                      <input type="date" value={staffJoiningDate} onChange={e => setStaffJoiningDate(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-sm" />
                    </div>
                  </div>
                  <div>
                    <ImageUpload
                      value={staffPhotoUrl}
                      onChange={setStaffPhotoUrl}
                      label="स्टाफ फोटो अपलोड करें (Upload Staff Photo)"
                      enableCropAndAdjust={true}
                    />
                  </div>
                  <button type="submit" className="w-full bg-red-900 hover:bg-red-950 text-amber-200 font-bold py-3 rounded-xl shadow text-sm">
                    स्टाफ सेव करें (Create Staff)
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-xl border border-amber-200">
            <div>
              <h3 className="font-bold font-serif text-red-950 text-xl">गैलरी अनुमोदन एवं प्रबंधन (Gallery Management)</h3>
              <p className="text-xs text-stone-500">स्टाफ द्वारा अपलोड की गई तस्वीरें यहाँ 'Pending' रहती हैं। एडमिन अनुमोदन के बाद ही live होती हैं।</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {galleryList.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-xl border border-amber-200 overflow-hidden space-y-3 pb-4">
                <div className="relative h-48 bg-stone-100">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded ${item.status === 'Approved' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-red-950'}`}>
                    {item.status}
                  </span>
                </div>
                <div className="px-4 space-y-1">
                  <h4 className="font-bold text-stone-900 truncate">{item.title}</h4>
                  <p className="text-xs text-stone-500">श्रेणी: {item.category}</p>
                  <p className="text-[10px] text-stone-400">अपलोडर: {item.uploadedByName || 'Admin'}</p>
                </div>
                <div className="px-4 flex justify-between pt-2 border-t">
                  {item.status === 'Pending' && (
                    <button onClick={() => handleApproveGallery(item.id)} className="bg-emerald-600 text-white px-3 py-1 rounded text-xs font-bold">
                      Approve
                    </button>
                  )}
                  <button onClick={() => handleDeleteGallery(item.id)} className="bg-red-700 text-white px-3 py-1 rounded text-xs font-bold">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'notices' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-xl border border-amber-200">
            <div>
              <h3 className="font-bold font-serif text-red-950 text-xl">सूचना बोर्ड प्रबंधन (Notice Board)</h3>
              <p className="text-xs text-stone-500">होम पेज पर दिखने वाली महत्वपूर्ण सूचनाएं प्रबंधित करें।</p>
            </div>
            <button onClick={() => setShowAddNotice(true)} className="bg-red-900 text-amber-200 font-bold px-4 py-2.5 rounded-xl text-sm shadow">
              + नई सूचना जोड़ें
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {notices.map((n) => (
              <div key={n.id} className="bg-white p-6 rounded-2xl shadow-xl border border-amber-200 space-y-3 relative">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-red-900 text-lg">{n.title}</h4>
                  <button onClick={() => handleDeleteNotice(n.id)} className="text-red-700 hover:text-red-900">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-stone-700">{n.content}</p>
                <div className="text-xs text-stone-400 flex justify-between pt-2 border-t">
                  <span>दिनांक: {n.publishDate}</span>
                  <span className="font-bold text-amber-800">{n.priority} Priority</span>
                </div>
              </div>
            ))}
          </div>

          {showAddNotice && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border-4 border-amber-500">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-bold font-serif text-red-950 text-xl">नई सूचना जोड़ें</h3>
                  <button onClick={() => setShowAddNotice(false)}>✕</button>
                </div>
                <form onSubmit={handleAddNotice} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700">शीर्षक (Title) *</label>
                    <input type="text" required value={noticeTitle} onChange={e => setNoticeTitle(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700">विषय वस्तु (Content) *</label>
                    <textarea required rows={3} value={noticeContent} onChange={e => setNoticeContent(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700">प्राथमिकता (Priority)</label>
                      <select value={noticePriority} onChange={(e: any) => setNoticePriority(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-sm bg-white">
                        <option value="Normal">Normal</option>
                        <option value="High">High (Pinned)</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700">समाप्ति तिथि (Expiry Date)</label>
                      <input type="date" value={noticeExpiry} onChange={e => setNoticeExpiry(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-sm" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-red-900 text-amber-200 font-bold py-3 rounded-xl shadow text-sm">
                    सूचना प्रकाशित करें (Publish Notice)
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'navratri' && (
        <div className="bg-white rounded-2xl shadow-xl border border-amber-200 p-6 space-y-6">
          <h3 className="font-bold font-serif text-red-950 text-xl">नवरात्रि 9 दिन सामग्री प्रबंधन (Navratri CMS)</h3>
          <p className="text-xs text-stone-500">सभी 9 दिनों की देवी, पूजा विधि और समय सारणी यहाँ संपादित की जा सकती है।</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {navratriDays.map((day) => (
              <div key={day.dayNumber} className="border border-amber-200 rounded-xl p-4 space-y-2 bg-amber-50/30">
                <div className="flex justify-between items-center">
                  <span className="bg-red-900 text-amber-300 text-xs font-bold px-2.5 py-1 rounded">दिन {day.dayNumber}</span>
                  <span className="text-xs text-stone-500">{day.date}</span>
                </div>
                <h4 className="font-bold font-serif text-red-950 text-lg">{day.deviName}</h4>
                <p className="text-xs text-stone-600 line-clamp-2">{day.description}</p>
                <button
                  onClick={async () => {
                    const newDesc = prompt('नया विवरण दर्ज करें:', day.description);
                    if (newDesc) {
                      await setDoc(doc(db, 'navratri', `day_${day.dayNumber}`), { ...day, description: newDesc });
                      alert('अपडेट हो गया!');
                    }
                  }}
                  className="w-full bg-amber-600 text-red-950 font-bold py-1.5 rounded text-xs shadow"
                >
                  संपादित करें (Edit)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'upi' && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-amber-200 p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold font-serif text-red-950 text-xl">UPI ID एवं QR कोड प्रबंधन (UPI Management)</h3>
            <p className="text-xs text-stone-500">यहाँ किए गए बदलाव तुरंत ऑनलाइन दान पृष्ठ पर सभी connected devices पर live हो जाते हैं।</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700">UPI ID *</label>
              <input
                type="text"
                required
                value={settings.upiId}
                onChange={e => setSettings({ ...settings, upiId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700">UPI डिस्प्ले नाम (UPI Name) *</label>
              <input
                type="text"
                required
                value={settings.upiName}
                onChange={e => setSettings({ ...settings, upiName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
              />
            </div>
            <div>
              <ImageUpload
                value={settings.qrCodeUrl}
                onChange={(url) => setSettings({ ...settings, qrCodeUrl: url })}
                label="UPI QR कोड अपलोड करें (Upload UPI QR Code)"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700">दान निर्देश (Donation Instructions)</label>
              <textarea
                rows={3}
                value={settings.donationInstructions}
                onChange={e => setSettings({ ...settings, donationInstructions: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
              />
            </div>
            <button type="submit" className="w-full bg-red-900 hover:bg-red-950 text-amber-200 font-bold py-3 rounded-xl shadow text-sm">
              UPI सेटिंग्स सहेजें (Save & Sync Instantly)
            </button>
          </form>
        </div>
      )}

      {activeTab === 'cms' && (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-amber-200 p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold font-serif text-red-950 text-xl">वेबसाइट सामग्री प्रबंधन (Home CMS & Settings)</h3>
            <p className="text-xs text-stone-500">मंदिर का नाम, हीरो हेडिंग, पता और टिकर सेटिंग्स प्रबंधित करें।</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700">मंदिर का नाम</label>
                <input type="text" value={settings.templeName} onChange={e => setSettings({ ...settings, templeName: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700">संपर्क नंबर (Phone)</label>
                <input type="text" value={settings.contactNumber} onChange={e => setSettings({ ...settings, contactNumber: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700">ईमेल आईडी (Contact Email)</label>
              <input type="email" value={settings.email || ''} onChange={e => setSettings({ ...settings, email: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border text-sm" />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700">हीरो हेडिंग (Hero Heading)</label>
              <input type="text" value={settings.heroHeading} onChange={e => setSettings({ ...settings, heroHeading: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700">हीरो विवरण (Hero Description)</label>
              <textarea rows={2} value={settings.heroDescription} onChange={e => setSettings({ ...settings, heroDescription: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700">मंदिर परिचय (About Text)</label>
              <textarea rows={3} value={settings.aboutText} onChange={e => setSettings({ ...settings, aboutText: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700">मंदिर का पता (Address)</label>
              <input type="text" value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border text-sm" />
            </div>

            <div className="border-t border-stone-200 pt-4 space-y-3">
              <h4 className="text-xs font-bold uppercase text-stone-600 tracking-wider">सोशल मीडिया लिंक्स (Social Links)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600">Facebook URL</label>
                  <input type="text" value={settings.socialLinks?.facebook || ''} onChange={e => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, facebook: e.target.value } })} className="w-full px-3 py-1.5 rounded-xl border text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600">YouTube URL</label>
                  <input type="text" value={settings.socialLinks?.youtube || ''} onChange={e => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, youtube: e.target.value } })} className="w-full px-3 py-1.5 rounded-xl border text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600">Instagram URL</label>
                  <input type="text" value={settings.socialLinks?.instagram || ''} onChange={e => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, instagram: e.target.value } })} className="w-full px-3 py-1.5 rounded-xl border text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600">WhatsApp URL</label>
                  <input type="text" value={settings.socialLinks?.whatsapp || ''} onChange={e => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, whatsapp: e.target.value } })} className="w-full px-3 py-1.5 rounded-xl border text-xs" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700">फुटर कॉपीराइट टेक्स्ट (Footer Text)</label>
              <input type="text" value={settings.footerText || ''} onChange={e => setSettings({ ...settings, footerText: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border text-sm" />
            </div>

            <div className="flex items-center space-x-3 bg-amber-50 p-4 rounded-xl border border-amber-200">
              <input
                type="checkbox"
                id="showDonors"
                checked={settings.showDonorNamesPublicly}
                onChange={e => setSettings({ ...settings, showDonorNamesPublicly: e.target.checked })}
                className="w-5 h-5 text-red-900 rounded focus:ring-amber-500"
              />
              <label htmlFor="showDonors" className="text-sm font-bold text-stone-800">
                होम पेज टिकर पर दाताओं के नाम सार्वजनिक रूप से प्रदर्शित करें (Show Donor Names on Public Ticker)
              </label>
            </div>

            <button type="submit" className="w-full bg-red-900 hover:bg-red-950 text-amber-200 font-bold py-3 rounded-xl shadow text-sm">
              सभी बदलाव सहेजें (Save Website CMS)
            </button>
          </form>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl shadow-xl border border-amber-200 p-6 space-y-6">
          <h3 className="font-bold font-serif text-red-950 text-xl">एडमिन ऑडिट लॉग्स (Audit Logs)</h3>
          <p className="text-xs text-stone-500">महत्वपूर्ण प्रशासनिक कार्रवाइयों का स्वचालित रिकॉर्ड।</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-100 text-stone-700 uppercase text-xs">
                <tr>
                  <th className="p-3">कार्रवाई (Action)</th>
                  <th className="p-3">विवरण (Details)</th>
                  <th className="p-3">एडमिन ईमेल</th>
                  <th className="p-3">समय (Timestamp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-amber-50/40">
                    <td className="p-3 font-bold text-red-900">{log.action}</td>
                    <td className="p-3 text-stone-700">{log.details}</td>
                    <td className="p-3 text-xs text-stone-500">{log.userEmail}</td>
                    <td className="p-3 text-xs text-stone-400">
                      {log.timestamp?.toDate?.() ? new Date(log.timestamp.toDate()).toLocaleString('hi-IN') : 'Just now'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {receiptDonation && (
        <ReceiptModal
          donation={receiptDonation}
          settings={settings}
          onClose={() => setReceiptDonation(null)}
        />
      )}

    </div>
  );
};
