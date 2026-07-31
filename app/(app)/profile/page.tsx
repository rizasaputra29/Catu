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
import { User, Mail, Save, Download, Upload, Image as ImageIcon, AlertTriangle, ShieldCheck, Edit2, X, Store, Loader2 } from 'lucide-react';
import { getCloudinaryAvatarUrl } from '@/lib/cloudinary';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const backupMutation = useBackup();
  const importMutation = useImport();

  const [isEditing, setIsEditing] = useState(false);
  const [isImportLoading, setIsImportLoading] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

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

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Gagal',
        description: 'Hanya file gambar yang diizinkan.',
        variant: 'destructive',
      });
      return;
    }

    const MAX_SIZE_MB = 2;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast({
        title: 'Gagal',
        description: `Ukuran gambar maksimal ${MAX_SIZE_MB}MB.`,
        variant: 'destructive',
      });
      return;
    }

    setIsAvatarUploading(true);
    try {
      const signatureRes = await fetch('/api/cloudinary-signature');
      if (!signatureRes.ok) {
        throw new Error('Gagal mendapatkan signature upload.');
      }
      const {
        cloudName,
        apiKey,
        uploadPreset,
        folder,
        timestamp,
        signature,
      } = await signatureRes.json();

      const formDataCloud = new FormData();
      formDataCloud.append('file', file);
      formDataCloud.append('upload_preset', uploadPreset);
      formDataCloud.append('folder', folder);
      formDataCloud.append('api_key', apiKey);
      formDataCloud.append('timestamp', String(timestamp));
      formDataCloud.append('signature', signature);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formDataCloud,
        }
      );

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || 'Upload ke Cloudinary gagal.'
        );
      }

      const uploadResult = await uploadRes.json();
      const secureUrl: string = uploadResult.secure_url;

      if (secureUrl) {
        setFormData((prev) => ({ ...prev, avatarUrl: secureUrl }));
        toast({
          title: 'Gambar Diunggah',
          description: 'Klik "Simpan Perubahan" untuk menerapkan avatar baru Anda.',
        });
        setIsEditing(true);
      }
    } catch (err: any) {
      toast({
        title: 'Upload Gagal',
        description: err.message || 'Terjadi kesalahan saat mengunggah avatar.',
        variant: 'destructive',
      });
    } finally {
      setIsAvatarUploading(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
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
                                <AvatarImage src={getCloudinaryAvatarUrl(formData.avatarUrl) || undefined} alt={formData.fullName} className="object-cover" />
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

                        <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                            disabled={isAvatarUploading}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isAvatarUploading}
                            onClick={() => avatarInputRef.current?.click()}
                            className="w-full h-10 rounded-full border-border bg-white hover:bg-muted text-foreground font-medium transition-all duration-base ease-in-out"
                        >
                            {isAvatarUploading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <ImageIcon className="w-4 h-4 mr-2" />
                            )}
                            {isAvatarUploading ? 'Mengunggah...' : 'Ubah Avatar'}
                        </Button>
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
