'use client';

import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useBackup, useImport } from '@/hooks/mutations/useBackupImportMutations';
import { User, Mail, Save, Download, Upload, Image as ImageIcon, AlertTriangle, ShieldCheck, Edit2, X, Store } from 'lucide-react';
import { CldUploadButton } from 'next-cloudinary';
import type { CloudinaryUploadWidgetResults } from 'next-cloudinary';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const backupMutation = useBackup();
  const importMutation = useImport();

  const [isEditing, setIsEditing] = useState(false);
  const [isImportLoading, setIsImportLoading] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    avatarUrl: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        businessName: (user as any).businessName || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

  const handleUploadSuccess = (result: CloudinaryUploadWidgetResults) => {
    const info = result.info as { secure_url: string };
    if (info && info.secure_url) {
      setFormData({ ...formData, avatarUrl: info.secure_url });
      toast({
        title: 'Gambar Diunggah',
        description: 'Klik "Simpan Perubahan" untuk menerapkan avatar baru Anda.',
      });
      setIsEditing(true);
    }
  };

  const displayName = formData.businessName || formData.fullName;

  const handleSave = async () => {
    if (!formData.fullName) {
      toast({ title: 'Gagal', description: 'Nama wajib diisi', variant: 'destructive' });
      return;
    }

    try {
        const success = await updateProfile({
            fullName: formData.fullName,
            businessName: formData.businessName || null,
            avatarUrl: formData.avatarUrl || null, 
        });

        if (success) {
            toast({ title: 'Berhasil', description: 'Profil berhasil diperbarui' });
            setIsEditing(false);
        } else {
            toast({ title: 'Gagal', description: 'Gagal memperbarui profil.', variant: 'destructive' });
        }
    } catch(e) {
        toast({ title: 'Gagal', description: 'Gagal terhubung ke server.', variant: 'destructive' });
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        businessName: (user as any).businessName || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
    setIsEditing(false);
  };
  
  const handleBackup = async () => {
    try {
        toast({ title: 'Cadangan dimulai', description: 'Mempersiapkan data untuk diunduh...', duration: 2000 });
        const blob = await backupMutation.mutateAsync();

        let filename = 'catu_backup.json';
        // The mutation doesn't expose headers, so we use a default filename.

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;

        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 200);

        toast({ title: 'Cadangan Berhasil', description: 'Cadangan Anda telah mulai diunduh.' });
    } catch (e) {
        toast({ title: 'Cadangan Gagal', description: 'Tidak dapat terhubung ke server.', variant: 'destructive' });
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsImportLoading(true);
    try {
        await importMutation.mutateAsync(file);
        toast({ title: 'Impor Berhasil', description: 'Data berhasil dipulihkan. Memuat ulang...' });
        await queryClient.invalidateQueries();
    } catch (e: any) {
        toast({ title: 'Impor Gagal', description: e.message || 'Kesalahan memproses file.', variant: 'destructive' });
    } finally {
        setIsImportLoading(false);
        if (importInputRef.current) {
            importInputRef.current.value = '';
        }
    }
  };

  if (!user) return null;

  const userInitials = user?.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'US';

  return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Profil</h1>
            <p className="text-muted-foreground mt-2">Kelola pengaturan dan data akun Anda</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Avatar & Status */}
            <div className="space-y-6">
                <Card className="border-border shadow-sm rounded-2xl overflow-hidden bg-white text-center">
                    <CardContent className="pt-10 pb-8 px-6">
                        <div className="relative inline-block">
                             <Avatar className="w-32 h-32 mb-4 border-4 border-background shadow-sm">
                                <AvatarImage src={formData.avatarUrl || undefined} alt={formData.fullName} className="object-cover" />
                                <AvatarFallback className="bg-primary/10 text-primary text-3xl font-semibold">
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>
                             {/* Badge */}
                             <div className="absolute bottom-2 right-0 bg-accent text-accent-foreground text-[10px] font-semibold px-2 py-1 rounded-full border-2 border-white shadow-sm">
                                 PRO
                             </div>
                        </div>

                        <h2 className="text-xl font-semibold mt-2">{displayName}</h2>
                        <p className="text-muted-foreground text-sm mb-6">{user.email}</p>

                        <CldUploadButton
                            options={{
                            sources: ['local', 'url', 'camera'],
                            multiple: false,
                            maxFiles: 1,
                            cropping: true,
                            croppingAspectRatio: 1,
                            }}
                            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                            onSuccess={handleUploadSuccess}
                            className="w-full h-10 rounded-full border border-border bg-white hover:bg-muted text-foreground font-medium transition-all duration-base ease-in-out inline-flex items-center justify-center"
                        >
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Ubah Avatar
                        </CldUploadButton>
                    </CardContent>
                </Card>

                <div className="bg-primary/5 border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                     <div className="bg-primary p-3 rounded-full text-primary-foreground shadow-sm">
                         <ShieldCheck className="w-6 h-6" />
                     </div>
                     <div>
                          <p className="font-semibold text-lg leading-tight text-foreground">Status Akun</p>
                          <p className="text-sm text-muted-foreground">Aktif & Aman</p>
                     </div>
                </div>
            </div>

            {/* Right Column: Edit Form & Data Management */}
            <div className="lg:col-span-2 space-y-6">

                {/* Edit Profile Form */}
                <Card className="border-border shadow-sm rounded-2xl bg-white">
                    <CardHeader className="px-8 pt-8 pb-4 border-b border-border/50 flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-semibold">Informasi Pribadi</CardTitle>
                        {!isEditing && (
                            <Button
                                onClick={() => setIsEditing(true)}
                                size="sm"
                                variant="ghost"
                                className="h-10 w-10 rounded-full hover:bg-muted text-foreground"
                            >
                                <Edit2 className="w-4 h-4" />
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="font-medium text-foreground flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-muted-foreground" /> Nama Lengkap
                                </Label>
                                <Input
                                id="fullName"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                disabled={!isEditing}
                                className="h-12 rounded-xl font-medium disabled:bg-muted disabled:border-muted-foreground/20 disabled:text-muted-foreground"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="businessName" className="font-medium text-foreground flex items-center gap-2 text-sm">
                                <Store className="w-4 h-4 text-muted-foreground" /> Nama Bisnis
                                </Label>
                                <Input
                                id="businessName"
                                value={formData.businessName}
                                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                disabled={!isEditing}
                                placeholder="cth. Warung Sejahtera"
                                className="h-12 rounded-xl font-medium disabled:bg-muted disabled:border-muted-foreground/20 disabled:text-muted-foreground"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-medium text-foreground flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-muted-foreground" /> Alamat Email
                                </Label>
                                <Input
                                id="email"
                                type="email"
                                value={user.email}
                                disabled
                                className="h-12 bg-muted rounded-xl text-muted-foreground font-medium cursor-not-allowed"
                                />
                            </div>

                            {isEditing && (
                                <div className="flex gap-3 pt-4">
                                <Button
                                    onClick={handleSave}
                                    className="flex-1 h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-all duration-base ease-in-out"
                                >
                                    <Save className="w-4 h-4 mr-2" /> Simpan Perubahan
                                </Button>
                                <Button
                                    onClick={handleCancel}
                                    variant="outline"
                                    className="flex-1 h-12 rounded-full border-border text-foreground hover:bg-muted hover:text-foreground font-medium transition-all duration-base ease-in-out"
                                >
                                    <X className="w-4 h-4 mr-2" /> Batal
                                </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Data Management */}
                <Card className="border-border shadow-sm rounded-2xl bg-white overflow-hidden">
                    <CardHeader className="px-8 pt-8 pb-4 bg-muted/50 border-b border-border/50">
                        <CardTitle className="text-lg font-semibold">Manajemen Data</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        {/* Backup */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 border border-border rounded-2xl hover:bg-muted/30 transition-all duration-base ease-in-out group bg-white">
                            <div className="space-y-1">
                                <p className="font-semibold text-foreground flex items-center gap-2"><Download className="w-5 h-5 text-primary" /> Cadangkan Data</p>
                                <p className="text-xs text-muted-foreground max-w-xs">
                                    Unduh salinan JSON dari semua data keuangan Anda.
                                </p>
                            </div>
                            <Button
                                onClick={handleBackup}
                                disabled={backupMutation.isPending}
                                variant="outline"
                                className="h-10 px-6 rounded-full border-border text-foreground font-medium hover:bg-muted hover:text-foreground transition-all duration-base ease-in-out shrink-0"
                            >
                                {backupMutation.isPending ? 'Mengekspor...' : 'Ekspor'}
                            </Button>
                        </div>

                        {/* Import */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 bg-destructive/5 border border-destructive/20 rounded-2xl">
                             <div className="space-y-1">
                                <p className="font-semibold text-destructive flex items-center gap-2"><Upload className="w-5 h-5" /> Pulihkan Data</p>
                                <p className="text-xs text-destructive/80 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Peringatan: Menimpa data yang ada.
                                </p>
                            </div>
                            <label htmlFor="file-upload" className="cursor-pointer shrink-0">
                                <div className="h-10 px-6 rounded-full bg-destructive text-destructive-foreground font-medium flex items-center justify-center hover:bg-destructive/90 transition-all duration-base ease-in-out shadow-sm">
                                    {isImportLoading ? (
                                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        "Impor File"
                                    )}
                                </div>
                                <Input
                                    id="file-upload"
                                    ref={importInputRef}
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={isImportLoading}
                                />
                            </label>
                        </div>
                    </CardContent>
                </Card>
            </div>

          </div>
        </div>
      </div>
  );
}
