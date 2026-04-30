import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    Camera,
    User,
    Mail,
    Phone,
    Lock,
    Edit3,
    Check,
    X,
    Eye,
    EyeOff,
    Shield,
    LogOut,
} from 'lucide-react';
import { adminAuthApi } from '@/api/admin-auth.api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/Toast';
import { useLocale } from '@/contexts/LocaleContext';
import { getApiErrorMessage, cn } from '@/utils';
import type { AdminUser } from '@/types';

// ── Copy ──────────────────────────────────────────────────────────────────────
function useCopy() {
    const { locale } = useLocale();
    return locale === 'ar'
        ? {
              pageTitle: 'حسابي',
              pageSubtitle: 'إدارة معلومات حسابك الشخصي (المشرف)',
              profilePhoto: 'صورة الملف الشخصي',
              changePhoto: 'تغيير الصورة',
              name: 'الاسم',
              email: 'البريد الإلكتروني',
              phone: 'رقم الهاتف',
              password: 'كلمة المرور',
              currentPassword: 'كلمة المرور الحالية',
              newPassword: 'كلمة المرور الجديدة',
              save: 'حفظ',
              cancel: 'إلغاء',
              edit: 'تعديل',
              updateSuccess: 'تم تحديث البيانات بنجاح',
              updateFail: 'فشل تحديث البيانات',
              personalInfo: 'المعلومات الشخصية',
              security: 'الأمان',
              passwordHidden: '••••••••',
              logoutFromAllDevices: 'تسجيل الخروج من جميع الأجهزة',
          }
        : {
              pageTitle: 'My Profile',
              pageSubtitle: 'Manage your admin account information',
              profilePhoto: 'Profile Photo',
              changePhoto: 'Change Photo',
              name: 'Name',
              email: 'Email',
              phone: 'Phone',
              password: 'Password',
              currentPassword: 'Current Password',
              newPassword: 'New Password',
              save: 'Save',
              cancel: 'Cancel',
              edit: 'Edit',
              updateSuccess: 'Profile updated successfully',
              updateFail: 'Failed to update profile',
              personalInfo: 'Personal Information',
              security: 'Security',
              passwordHidden: '••••••••',
              logoutFromAllDevices: 'Logout from all devices',
          };
}

// ── Helper: get profile image URL ─────────────────────────────────────────────
function getProfileImageUrl(user: AdminUser | null): string | null {
    if (!user?.profileImage) return null;
    const img = user.profileImage;
    return (img as { imageUrl?: string }).imageUrl ?? (img as { url?: string }).url ?? null;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');
}

// ── Editable Field Component ──────────────────────────────────────────────────
function EditableField({
    icon: Icon,
    label,
    value,
    fieldKey,
    type = 'text',
    copy,
    onSave,
    isSaving,
}: {
    icon: typeof User;
    label: string;
    value: string;
    fieldKey: string;
    type?: string;
    copy: ReturnType<typeof useCopy>;
    onSave: (key: string, value: string, extra?: Record<string, string>) => void;
    isSaving: boolean;
}) {
    const [editing, setEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const [currentPassword, setCurrentPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [logoutAll, setLogoutAll] = useState(false);
    const isPassword = fieldKey === 'newPassword';

    const handleSave = () => {
        if (!inputValue.trim()) return;
        if (isPassword) {
            onSave(fieldKey, inputValue, { currentPassword, loggedOut: logoutAll ? 'true' : 'false' });
        } else {
            onSave(fieldKey, inputValue);
        }
        setEditing(false);
        setCurrentPassword('');
    };

    const handleCancel = () => {
        setEditing(false);
        setInputValue(value);
        setCurrentPassword('');
    };

    return (
        <div className="group relative">
            <div className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 hover:border-brand-100 hover:shadow-sm transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center shrink-0 shadow-sm">
                    <Icon className="w-5 h-5 text-brand-600" />
                </div>

                {!editing ? (
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                            {label}
                        </p>
                        <p className="text-sm font-semibold text-slate-800 truncate">
                            {isPassword ? copy.passwordHidden : value || '—'}
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 min-w-0 space-y-2">
                        <p className="text-[11px] font-bold text-brand-500 uppercase tracking-widest">
                            {label}
                        </p>
                        {isPassword && (
                            <div className="relative">
                                <input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder={copy.currentPassword}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all pe-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword((v) => !v)}
                                    className="absolute top-1/2 -translate-y-1/2 end-3 text-slate-400 hover:text-slate-600"
                                >
                                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        )}
                        <div className="relative">
                            <input
                                type={isPassword ? (showPassword ? 'text' : 'password') : type}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={isPassword ? copy.newPassword : label}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all pe-10"
                                autoFocus
                            />
                            {isPassword && (
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute top-1/2 -translate-y-1/2 end-3 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            )}
                        </div>
                        {isPassword && (
                            <label className="flex items-center gap-2 mt-2 cursor-pointer group/chk">
                                <div className="relative flex items-center justify-center w-4 h-4 rounded border border-slate-300 bg-white group-hover/chk:border-brand-500 transition-colors">
                                    <input 
                                        type="checkbox" 
                                        checked={logoutAll}
                                        onChange={(e) => setLogoutAll(e.target.checked)}
                                        className="peer absolute opacity-0 w-full h-full cursor-pointer"
                                    />
                                    <Check size={12} className={cn("text-brand-600 opacity-0 peer-checked:opacity-100 transition-opacity")} />
                                </div>
                                <span className="text-xs font-semibold text-slate-600 select-none group-hover/chk:text-slate-900 transition-colors flex items-center gap-1.5">
                                    <LogOut size={12} /> {copy.logoutFromAllDevices}
                                </span>
                            </label>
                        )}
                    </div>
                )}

                {!editing ? (
                    <button
                        onClick={() => {
                            setEditing(true);
                            setInputValue(isPassword ? '' : value);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                        <Edit3 size={16} />
                    </button>
                ) : (
                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            onClick={handleCancel}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                            <X size={16} />
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !inputValue.trim() || (isPassword && !currentPassword.trim())}
                            className="p-2 rounded-xl text-white bg-brand-600 hover:bg-brand-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {isSaving ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Check size={16} />
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Main Profile Page ─────────────────────────────────────────────────────────
export function AdminProfilePage() {
    const { admin, isAuthenticated, updateAdmin } = useAuth();
    const { toast } = useToast();
    const copy = useCopy();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const updateMutation = useMutation({
        mutationFn: (formData: FormData) => adminAuthApi.updateMyInfo(formData),
        onSuccess: async (data) => {
            toast(data.message || copy.updateSuccess, 'success');
            // Refresh admin data
            const meRes = await adminAuthApi.getMe();
            updateAdmin(meRes.user);
            setImagePreview(null);
        },
        onError: (err: unknown) => {
            toast(getApiErrorMessage(err, copy.updateFail), 'error');
        },
    });

    const handleFieldSave = (key: string, value: string, extra?: Record<string, string>) => {
        const fd = new FormData();
        fd.append(key, value);
        if (extra) {
            Object.entries(extra).forEach(([k, v]) => fd.append(k, v));
        }
        updateMutation.mutate(fd);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Show preview
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
        // Upload immediately
        const fd = new FormData();
        fd.append('profileImage', file);
        updateMutation.mutate(fd);
    };

    const profileImageUrl = imagePreview || getProfileImageUrl(admin);

    if (!isAuthenticated || !admin) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fade-in">
            {/* ── Header ────────────────────────────────────────────────── */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{copy.pageTitle}</h1>
                <p className="text-slate-500 mt-1">{copy.pageSubtitle}</p>
            </div>

            {/* ── Avatar Card ───────────────────────────────────────────── */}
            <div className="flex flex-col items-center py-8 px-6 rounded-3xl bg-gradient-to-br from-white via-brand-50/30 to-white border border-slate-100 shadow-sm">
                <div className="relative group">
                    <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-white shadow-xl bg-slate-50">
                        {profileImageUrl ? (
                            <img
                                src={profileImageUrl}
                                alt={admin.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                                <span className="text-5xl font-extrabold text-white">
                                    {getInitials(admin.name)}
                                </span>
                            </div>
                        )}
                    </div>
                    {/* Camera overlay */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={updateMutation.isPending}
                        className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all duration-300 cursor-pointer"
                    >
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-1">
                            {updateMutation.isPending ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Camera className="w-5 h-5 text-white" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                                        {copy.changePhoto}
                                    </span>
                                </>
                            )}
                        </div>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                    />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mt-4">{admin.name}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{admin.email}</p>
                <span className="mt-2 px-3 py-1 bg-brand-100 text-brand-700 text-xs font-bold rounded-full capitalize">{admin.role}</span>
            </div>

            {/* ── Personal Info ──────────────────────────────────────────── */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1 mb-1">
                    <User className="w-4 h-4 text-brand-600" />
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                        {copy.personalInfo}
                    </h3>
                </div>
                <EditableField
                    icon={User}
                    label={copy.name}
                    value={admin.name}
                    fieldKey="name"
                    copy={copy}
                    onSave={handleFieldSave}
                    isSaving={updateMutation.isPending}
                />
                <EditableField
                    icon={Mail}
                    label={copy.email}
                    value={admin.email}
                    fieldKey="email"
                    type="email"
                    copy={copy}
                    onSave={handleFieldSave}
                    isSaving={updateMutation.isPending}
                />
                <EditableField
                    icon={Phone}
                    label={copy.phone}
                    value={admin.mobilePhone || ''}
                    fieldKey="mobilePhone"
                    type="tel"
                    copy={copy}
                    onSave={handleFieldSave}
                    isSaving={updateMutation.isPending}
                />
            </div>

            {/* ── Security ──────────────────────────────────────────────── */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1 mb-1">
                    <Shield className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                        {copy.security}
                    </h3>
                </div>
                <EditableField
                    icon={Lock}
                    label={copy.password}
                    value=""
                    fieldKey="newPassword"
                    type="password"
                    copy={copy}
                    onSave={handleFieldSave}
                    isSaving={updateMutation.isPending}
                />
            </div>
        </div>
    );
}
